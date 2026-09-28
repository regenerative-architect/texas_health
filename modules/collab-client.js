(function(){
'use strict';
const channel = 'BroadcastChannel' in self ? new BroadcastChannel('txh-health-collaboration-v4') : null;
let autoTimer=null;
function apiBase(){return String(sessionStorage.getItem('txh-collab-api')||window.TXH_CONFIG?.collaborationApi||'').replace(/\/$/,'')}
function auth(key){return {'Authorization':'Bearer '+key,'Content-Type':'application/json'}}
function validateRoom(room){if(!/^[A-Za-z0-9_-]{3,64}$/.test(room))throw new Error('Room ID must be 3–64 letters, numbers, underscores or hyphens.');}
function validateKey(key){if(String(key||'').length<12)throw new Error('Access key must be at least 12 characters.');}
async function createRoom(room,key,workspace){validateRoom(room);validateKey(key);const base=apiBase();if(!base)throw new Error('Collaboration server is unavailable in this context.');const r=await fetch(base+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({roomId:room,accessKey:key,workspace})});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||('HTTP '+r.status));return j}
async function pull(room,key){validateRoom(room);validateKey(key);const r=await fetch(apiBase()+'/api/rooms/'+encodeURIComponent(room),{headers:auth(key),cache:'no-store'});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||('HTTP '+r.status));return j}
async function push(room,key,workspace,revision){validateRoom(room);validateKey(key);const headers=auth(key);headers['If-Match']=String(revision??0);const r=await fetch(apiBase()+'/api/rooms/'+encodeURIComponent(room),{method:'PUT',headers,body:JSON.stringify({workspace})});const j=await r.json().catch(()=>({}));if(r.status===409){const e=new Error('revision-conflict');e.current=j;e.status=409;throw e}if(!r.ok)throw new Error(j.error||('HTTP '+r.status));return j}
function mergeRecords(a=[],b=[]){const m=new Map();for(const x of [...a,...b]){if(!x||!x.id)continue;const p=m.get(x.id);if(!p||String(x.updatedAt||x.createdAt||'')>String(p.updatedAt||p.createdAt||''))m.set(x.id,x)}return [...m.values()]}
function mergePayload(local,remote){const L=local||{},R=remote||{};const lw=String(L.workspace?.updatedAt||''),rw=String(R.workspace?.updatedAt||'');return {workspace:rw>lw?R.workspace:L.workspace||R.workspace||null,tasks:mergeRecords(L.tasks,R.tasks),comments:mergeRecords(L.comments,R.comments),decisions:mergeRecords(L.decisions,R.decisions),evidence:mergeRecords(L.evidence,R.evidence)}}
async function sync(room,key,getLocal,applyMerged){const local=await getLocal();let remote=await pull(room,key);let merged=mergePayload(local,remote.workspace);await applyMerged(merged);try{return await push(room,key,merged,remote.revision)}catch(e){if(e.status!==409)throw e;remote=e.current;merged=mergePayload(merged,remote.workspace);await applyMerged(merged);return push(room,key,merged,remote.revision)}}
function startAuto(opts){stopAuto();const tick=async()=>{try{const r=await sync(opts.room,opts.key,opts.getLocal,opts.applyMerged);opts.onStatus?.({ok:true,revision:r.revision,updatedAt:r.updatedAt})}catch(e){opts.onStatus?.({ok:false,error:e.message})}};tick();autoTimer=setInterval(tick,Math.max(3000,window.TXH_CONFIG?.syncIntervalMs||5000))}
function stopAuto(){if(autoTimer){clearInterval(autoTimer);autoTimer=null}}
function announce(detail){channel?.postMessage(detail)}
function onChange(fn){channel?.addEventListener('message',e=>fn(e.data))}
window.TXHCollab={createRoom,pull,push,sync,startAuto,stopAuto,mergePayload,announce,onChange,serverAvailable:()=>!!apiBase()};
})();
