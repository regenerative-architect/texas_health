(function(){
'use strict';
const VERSION=window.TXH_CONFIG?.trysteroVersion||'0.25.3';
const APP_ID=window.TXH_CONFIG?.trysteroAppId||'texas-health-navigator-os-v4';
const STRATEGY_URLS={
  nostr:`https://esm.run/trystero@${VERSION}`,
  mqtt:`https://esm.run/@trystero-p2p/mqtt@${VERSION}`,
  torrent:`https://esm.run/@trystero-p2p/torrent@${VERSION}`,
  ipfs:`https://esm.run/@trystero-p2p/ipfs@${VERSION}`
};
const peers=new Map();
let publicRoom=null,publicPresence=null,workspaceRoom=null,workspaceActions=null,workspaceCfg=null,workspaceBC=null,sendTimer=null;
const instanceId=sessionStorage.getItem('txh-p2p-instance')||crypto.randomUUID();
sessionStorage.setItem('txh-p2p-instance',instanceId);
function emit(name,detail){window.dispatchEvent(new CustomEvent(name,{detail}))}
function now(){return new Date().toISOString()}
function localProfile(){return {instanceId,alias:localStorage.getItem('txh-peer-alias')||'Texas participant',role:localStorage.getItem('txh-peer-role')||'Unspecified participant',organization:localStorage.getItem('txh-peer-org')||'',verified:false,updatedAt:now()}}
function assertRoomId(roomId){if(!/^[A-Za-z0-9_-]{3,80}$/.test(String(roomId||'')))throw new Error('Room ID must be 3–80 letters, numbers, underscores or hyphens.');}
async function strategyModule(strategy='nostr'){const url=STRATEGY_URLS[strategy];if(!url)throw new Error('Unsupported Trystero discovery strategy.');return import(url)}
async function channelName(roomId,password=''){const bytes=new TextEncoder().encode(`${roomId}\0${password}`);const digest=await crypto.subtle.digest('SHA-256',bytes);return 'txh-p2p-'+[...new Uint8Array(digest)].slice(0,8).map(x=>x.toString(16).padStart(2,'0')).join('')}
function safeSize(value){try{return new Blob([JSON.stringify(value)]).size}catch{return Infinity}}
async function recordsFor(store,wid){try{return (await idbAll(store)).filter(x=>x&&x.workspaceId===wid)}catch{return []}}
async function workspaceSnapshot(){
  const wid=localStorage.getItem('txh-active-workspace')||'';
  if(!wid)return null;
  const workspace=await idbGet('workspaces',wid).catch(()=>null);
  if(!workspace)return null;
  return {schemaVersion:2,workspace,projects:await recordsFor('projects',wid),tasks:await recordsFor('tasks',wid),comments:await recordsFor('comments',wid),decisions:await recordsFor('decisions',wid),evidence:await recordsFor('evidenceItems',wid),meta:{workspaceId:wid,generatedAt:now(),sender:instanceId}};
}
function stamp(x){return String(x?.updatedAt||x?.createdAt||'')}
async function recordConflict(store,local,incoming,peerId){
  try{await idbPut('syncConflicts',{id:`conflict-${Date.now()}-${Math.random().toString(36).slice(2)}`,store,recordId:String(incoming?.id||''),workspaceId:incoming?.workspaceId||local?.workspaceId||'',local,incoming,peerId,createdAt:now(),status:'unresolved'})}catch{}
}
async function mergeRecord(store,incoming,peerId){
  if(!incoming||incoming.id===undefined||incoming.id===null)return false;
  const local=await idbGet(store,incoming.id).catch(()=>null);
  if(!local){await idbPut(store,incoming);return true}
  const a=stamp(local),b=stamp(incoming);
  if(b>a){await idbPut(store,incoming);return true}
  if(a===b&&JSON.stringify(local)!==JSON.stringify(incoming)){
    await recordConflict(store,local,incoming,peerId);
    const winner=JSON.stringify(incoming)>JSON.stringify(local)?incoming:local;
    if(winner===incoming){await idbPut(store,incoming);return true}
  }
  return false;
}
async function mergeSnapshot(payload,peerId='same-device'){
  if(!payload||payload.schemaVersion>2)return {changed:false,reason:'unsupported-schema'};
  if(safeSize(payload)>(window.TXH_CONFIG?.maxSharedPayloadBytes||1500000))throw new Error('Incoming shared snapshot exceeds configured size limit.');
  let changed=false;
  if(payload.workspace)changed=(await mergeRecord('workspaces',payload.workspace,peerId))||changed;
  for(const [key,store] of [['projects','projects'],['tasks','tasks'],['comments','comments'],['decisions','decisions'],['evidence','evidenceItems']])for(const r of payload[key]||[])changed=(await mergeRecord(store,r,peerId))||changed;
  if(payload.workspace?.id)localStorage.setItem('txh-active-workspace',payload.workspace.id);
  if(changed){window.TXHCollab?.announce?.({type:'p2p-merged',workspaceId:payload.workspace?.id||payload.meta?.workspaceId||''});emit('txh:p2p-merged',{peerId,workspaceId:payload.workspace?.id||payload.meta?.workspaceId||''})}
  return {changed};
}
function rememberPeer(peerId,profile,channel='workspace'){
  peers.set(peerId,{peerId,channel,lastSeen:Date.now(),...(profile||{}),verified:false});emit('txh:p2p-peers',{peers:[...peers.values()]});
}
function forgetPeer(peerId){peers.delete(peerId);emit('txh:p2p-peers',{peers:[...peers.values()]})}
async function sendSnapshot(target=null){
  const payload=await workspaceSnapshot();if(!payload)return false;
  if(safeSize(payload)>(window.TXH_CONFIG?.maxSharedPayloadBytes||1500000))throw new Error('Shared workspace exceeds configured size limit. Export/archive older records before synchronizing.');
  if(workspaceActions?.snapshot){await workspaceActions.snapshot.send(payload,target?{target}:{})}
  workspaceBC?.postMessage({type:'snapshot',sender:instanceId,payload});
  emit('txh:p2p-status',{state:'synced',message:'Workspace snapshot sent peer-to-peer.',at:now()});return true;
}
function queueSnapshot(){clearTimeout(sendTimer);sendTimer=setTimeout(()=>sendSnapshot().catch(e=>emit('txh:p2p-status',{state:'error',message:e.message})),180)}
async function joinWorkspace({roomId,strategy='nostr',password='',alias='',role='',organization=''}={}){
  assertRoomId(roomId);
  await leaveWorkspace();
  if(alias)localStorage.setItem('txh-peer-alias',alias);if(role)localStorage.setItem('txh-peer-role',role);if(organization)localStorage.setItem('txh-peer-org',organization);
  workspaceCfg={roomId,strategy,password:password||'',joinedAt:now()};
  localStorage.setItem('txh-p2p-room',roomId);localStorage.setItem('txh-p2p-strategy',strategy);sessionStorage.setItem('txh-p2p-password',password||'');
  const bcName=await channelName(roomId,password||'');
  if('BroadcastChannel'in self){workspaceBC=new BroadcastChannel(bcName);workspaceBC.onmessage=async e=>{const m=e.data||{};if(m.sender===instanceId)return;if(m.type==='presence')rememberPeer('local:'+m.sender,m.profile,'same-device');if(m.type==='leave')forgetPeer('local:'+m.sender);if(m.type==='snapshot')await mergeSnapshot(m.payload,'local:'+m.sender)}}
  workspaceBC?.postMessage({type:'presence',sender:instanceId,profile:localProfile()});
  emit('txh:p2p-status',{state:'local',message:'Same-device room active. Connecting decentralized discovery…'});
  if(!navigator.onLine){emit('txh:p2p-status',{state:'offline',message:'Offline: same-device BroadcastChannel room remains active; internet peer discovery is unavailable.'});return {mode:'same-device'}}
  try{
    const mod=await strategyModule(strategy);const config={appId:APP_ID};if(password)config.password=password;if(Array.isArray(window.TXH_CONFIG?.turnConfig)&&window.TXH_CONFIG.turnConfig.length)config.turnConfig=window.TXH_CONFIG.turnConfig;
    workspaceRoom=mod.joinRoom(config,roomId,{onJoinError:d=>emit('txh:p2p-status',{state:'warn',message:`Peer connection failed${d?.peerId?' for '+d.peerId.slice(0,8):''}. Direct WebRTC may be blocked; configure TURN only when needed.`})});
    const presence=workspaceRoom.makeAction('presence');const snapshot=workspaceRoom.makeAction('snapshot');const notice=workspaceRoom.makeAction('notice');
    workspaceActions={presence,snapshot,notice};
    presence.onMessage=(profile,{peerId})=>rememberPeer(peerId,profile,'webrtc');
    snapshot.onMessage=async(payload,{peerId})=>{rememberPeer(peerId,null,'webrtc');await mergeSnapshot(payload,peerId)};
    notice.onMessage=(data,{peerId})=>emit('txh:p2p-notice',{peerId,data});
    workspaceRoom.onPeerJoin=peerId=>{rememberPeer(peerId,null,'webrtc');presence.send(localProfile(),{target:peerId}).catch(()=>{});sendSnapshot(peerId).catch(()=>{})};
    workspaceRoom.onPeerLeave=peerId=>forgetPeer(peerId);
    presence.send(localProfile()).catch(()=>{});
    emit('txh:p2p-status',{state:'connected',message:`Trystero ${VERSION} room active via ${strategy.toUpperCase()} discovery; workspace traffic uses WebRTC data channels.`});
    return {mode:'webrtc',strategy,roomId,selfId:mod.selfId||''};
  }catch(e){emit('txh:p2p-status',{state:'fallback',message:`Trystero connection unavailable: ${e.message}. Same-device collaboration remains active.`});return {mode:'same-device',error:e.message}}
}
async function leaveWorkspace(){
  clearTimeout(sendTimer);sendTimer=null;
  try{workspaceBC?.postMessage({type:'leave',sender:instanceId})}catch{};try{workspaceBC?.close()}catch{};workspaceBC=null;
  try{workspaceRoom?.leave()}catch{};workspaceRoom=null;workspaceActions=null;workspaceCfg=null;
  [...peers.keys()].filter(k=>peers.get(k)?.channel!=='public').forEach(forgetPeer);
  emit('txh:p2p-status',{state:'idle',message:'Workspace peer room left.'});
}
function handleLocalChange(detail={}){if(!workspaceCfg)return;const wid=localStorage.getItem('txh-active-workspace')||'';if(detail.workspaceId&&detail.workspaceId!==wid)return;queueSnapshot()}
async function joinPublicLobby(){
  if(window.TXH_CONFIG?.publicRoomAutoJoin===false||localStorage.getItem('txh-disable-public-lobby')==='true')return {disabled:true};
  const roomId=window.TXH_CONFIG?.publicRoomId||'texas-health-commons-public-v1';
  const publicBC='BroadcastChannel'in self?new BroadcastChannel('txh-public-lobby-v4'):null;
  publicBC?.addEventListener('message',e=>{const m=e.data||{};if(m.sender!==instanceId&&m.type==='presence')rememberPeer('public-local:'+m.sender,m.profile,'public')});
  publicBC?.postMessage({type:'presence',sender:instanceId,profile:localProfile()});
  if(!navigator.onLine)return {mode:'same-device-public'};
  try{const mod=await strategyModule('nostr');publicRoom=mod.joinRoom({appId:APP_ID},roomId);publicPresence=publicRoom.makeAction('presence');publicPresence.onMessage=(profile,{peerId})=>rememberPeer('public:'+peerId,profile,'public');publicRoom.onPeerJoin=peerId=>{rememberPeer('public:'+peerId,null,'public');publicPresence.send(localProfile(),{target:peerId}).catch(()=>{})};publicRoom.onPeerLeave=peerId=>forgetPeer('public:'+peerId);publicPresence.send(localProfile()).catch(()=>{});emit('txh:p2p-public',{state:'connected',message:'Public Texas Health Commons lobby joined through Nostr discovery. Presence identities are self-asserted, not verified.'});return {mode:'webrtc-public'}}catch(e){emit('txh:p2p-public',{state:'fallback',message:'Public internet lobby unavailable; same-device presence remains available.',error:e.message});return {mode:'same-device-public',error:e.message}}
}
function publicEnabled(v){localStorage.setItem('txh-disable-public-lobby',v?'false':'true');if(!v){try{publicRoom?.leave()}catch{};publicRoom=null;publicPresence=null;emit('txh:p2p-public',{state:'disabled',message:'Public lobby disabled on this device.'})}else if(!publicRoom)joinPublicLobby()}
function status(){return {version:VERSION,workspace:workspaceCfg,peerCount:[...peers.values()].filter(p=>p.channel!=='public').length,publicPeerCount:[...peers.values()].filter(p=>p.channel==='public').length,peers:[...peers.values()]}}
window.TXHP2P={version:VERSION,joinWorkspace,leaveWorkspace,sendSnapshot,mergeSnapshot,workspaceSnapshot,handleLocalChange,joinPublicLobby,publicEnabled,status,localProfile};
})();
