import {readFile,stat,readdir} from 'node:fs/promises';
import {join,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
let failed=false;
const ok=x=>console.log('OK',x),bad=(x,e='')=>{console.error('FAIL',x,e);failed=true};
const required=[
 'index.html','config.js','manifest.webmanifest','sw.js','offline.html','assets/suite.css',
 'modules/collab-client.js','modules/p2p-collab.js','modules/webllm-adapter.js','modules/webllm-worker.js','modules/suite-enhancements.js','modules/advanced-suite.js',
 'data/source-registry.json','data/texas-health-reference-2026.json','data/cross-domain-system.json',
 'schemas/backup.schema.json','schemas/workspace.schema.json','schemas/sync-conflict.schema.json',
 'docs/MULTIPLAYER.md','docs/WEBLLM.md','docs/SIMPLIFIED-ADVANCED-GUIDES.md','docs/DEPLOYMENT.md','docs/TESTING.md',
 'tools/static-server.mjs','legacy/http-sync/server.mjs','legacy/ws-relay/server.mjs'
];
for(const f of required){try{await stat(join(root,f));ok('file '+f)}catch(e){bad('missing '+f,e.message)}}

const jsonFiles=['manifest.webmanifest','data/source-registry.json','data/texas-health-reference-2026.json','data/cross-domain-system.json','schemas/backup.schema.json','schemas/workspace.schema.json','schemas/sync-conflict.schema.json','package.json','legacy/http-sync/package.json','legacy/ws-relay/package.json'];
for(const f of jsonFiles){try{JSON.parse(await readFile(join(root,f),'utf8'));ok('JSON '+f)}catch(e){bad('JSON '+f,e.message)}}

const manifest=JSON.parse(await readFile(join(root,'manifest.webmanifest'),'utf8'));
for(const k of ['name','short_name','start_url','scope','icons'])if(!manifest[k])bad('manifest field '+k);else ok('manifest field '+k);
if(manifest.version!=='4.0.0')bad('manifest version');else ok('manifest v4.0.0');

const html=await readFile(join(root,'index.html'),'utf8');
for(const s of ['manifest.webmanifest','modules/p2p-collab.js','modules/advanced-suite.js','Texas Health Access Navigator OS'])html.includes(s)?ok('index reference '+s):bad('index reference '+s);

const config=await readFile(join(root,'config.js'),'utf8');
config.includes('modules/webllm-worker.js')?ok('config reference modules/webllm-worker.js'):bad('config reference modules/webllm-worker.js');

for(const match of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)){try{new vm.Script(match[1]);ok('inline script compiles')}catch(e){bad('inline script compile',e.message)}}

const p2p=await readFile(join(root,'modules/p2p-collab.js'),'utf8');
for(const s of ["0.25.3","trystero@${VERSION}","@trystero-p2p/mqtt","@trystero-p2p/torrent","@trystero-p2p/ipfs","makeAction('presence')","makeAction('snapshot')",'BroadcastChannel','turnConfig','password','onJoinError','onPeerJoin','sendSnapshot(peerId)'])p2p.includes(s)?ok('P2P marker '+s):bad('P2P marker '+s);

const adv=await readFile(join(root,'modules/advanced-suite.js'),'utf8');
for(const s of ['splashConnectivity','splashEvidence','splashCollaboration','splashEnter','Simplified Advanced Guides','Texas broadband + health access status','Mapping health-access challenges','Multidisciplinary project design','Evidence + provenance','publicLobbyToggle'])adv.includes(s)?ok('advanced UI marker '+s):bad('advanced UI marker '+s);
const css=await readFile(join(root,'assets/suite.css'),'utf8');
css.includes('prefers-reduced-motion')?ok('reduced-motion CSS'):bad('reduced-motion CSS');

const ai=await readFile(join(root,'modules/webllm-adapter.js'),'utf8');
const worker=await readFile(join(root,'modules/webllm-worker.js'),'utf8');
for(const s of ['CreateWebWorkerMLCEngine','cacheBackend:\'indexeddb\'','deterministicPlan'])ai.includes(s)?ok('WebLLM marker '+s):bad('WebLLM marker '+s);
worker.includes('WebWorkerMLCEngineHandler')?ok('WebLLM worker handler'):bad('WebLLM worker handler');

const sw=await readFile(join(root,'sw.js'),'utf8');
sw.includes('tx-health-os-v4.0.0')?ok('service worker version'):bad('service worker version');
const precache=[...sw.matchAll(/'\.\/([^']+)'/g)].map(m=>m[1]).filter(x=>x&&x!=='');
for(const f of new Set(precache)){try{await stat(join(root,f));ok('precache path '+f)}catch{bad('precache path '+f)}}

const sources=JSON.parse(await readFile(join(root,'data/source-registry.json'),'utf8')).sources;
const ids=new Set(sources.map(x=>x.id));
for(const id of ['tx-bdo-bead','hhsc-rural-peds-teleconnect','trystero-0253','webllm-worker-docs','cms-bill-rights','tx-hicap'])ids.has(id)?ok('source '+id):bad('source '+id);

const versionFiles=['README.md','CHANGELOG.md','config.js','sw.js'];
for(const f of versionFiles){const t=await readFile(join(root,f),'utf8');t.includes('4.0.0')?ok('v4 marker '+f):bad('v4 marker '+f)}

if(failed)process.exit(1);
console.log('Static validation complete.');
