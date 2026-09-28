import http from 'node:http';
import {createHash,timingSafeEqual,randomUUID} from 'node:crypto';
import {readFile,writeFile,rename,stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {dirname,extname,join,normalize,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../..');
const dbFile=join(here,'data','workspaces.json');
const PORT=Number(process.env.PORT||8787);
const HOST=process.env.HOST||'127.0.0.1';
const MAX=1_000_000;
const roomRe=/^[A-Za-z0-9_-]{3,64}$/;
const allowedPayloadKeys=new Set(['workspace','tasks','comments','decisions','evidence']);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png','.md':'text/markdown; charset=utf-8','.txt':'text/plain; charset=utf-8'};
let writeChain=Promise.resolve();

function hash(x){return createHash('sha256').update(String(x)).digest('hex')}
function equalHash(a,b){try{const A=Buffer.from(a,'hex'),B=Buffer.from(b,'hex');return A.length===B.length&&timingSafeEqual(A,B)}catch{return false}}
async function loadDb(){try{return JSON.parse(await readFile(dbFile,'utf8'))}catch{return {}}}
function saveDb(data){writeChain=writeChain.then(async()=>{const tmp=dbFile+'.tmp-'+randomUUID();await writeFile(tmp,JSON.stringify(data,null,2));await rename(tmp,dbFile)});return writeChain}
function headers(extra={}){return {'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Permissions-Policy':'geolocation=(), camera=(), microphone=()','Cross-Origin-Opener-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://esm.run https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https: wss:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",...extra}}
function json(res,status,obj){const b=JSON.stringify(obj);res.writeHead(status,headers({'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Content-Length':Buffer.byteLength(b)}));res.end(b)}
async function body(req){let n=0,chunks=[];for await(const c of req){n+=c.length;if(n>MAX)throw Object.assign(new Error('payload too large'),{status:413});chunks.push(c)}const raw=Buffer.concat(chunks).toString('utf8');return raw?JSON.parse(raw):{}}
function validateShared(p){if(!p||typeof p!=='object'||Array.isArray(p))throw new Error('workspace payload must be an object');for(const k of Object.keys(p))if(!allowedPayloadKeys.has(k))throw new Error('unsupported shared field: '+k);for(const k of ['tasks','comments','decisions','evidence'])if(!Array.isArray(p[k]||[]))throw new Error(k+' must be an array');return p}
function bearer(req){const h=req.headers.authorization||'';return h.startsWith('Bearer ')?h.slice(7):''}
async function authorize(req,rec){const k=bearer(req);return k&&equalHash(hash(k),rec.keyHash)}
async function api(req,res,url){
  if(url.pathname==='/api/health'&&req.method==='GET')return json(res,200,{ok:true,service:'Texas Health OS collaboration server',version:'4.0.0-legacy-http'});
  if(url.pathname==='/api/rooms'&&req.method==='POST'){
    const b=await body(req),roomId=String(b.roomId||''),key=String(b.accessKey||'');if(!roomRe.test(roomId))return json(res,400,{error:'invalid room id'});if(key.length<12)return json(res,400,{error:'access key must be at least 12 characters'});const db=await loadDb();if(db[roomId])return json(res,409,{error:'room already exists'});const workspace=validateShared(b.workspace||{workspace:null,tasks:[],comments:[],decisions:[],evidence:[]});db[roomId]={keyHash:hash(key),revision:1,workspace,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};await saveDb(db);return json(res,201,{roomId,revision:1,updatedAt:db[roomId].updatedAt});
  }
  const m=url.pathname.match(/^\/api\/rooms\/([A-Za-z0-9_-]{3,64})$/);if(m){const roomId=m[1],db=await loadDb(),rec=db[roomId];if(!rec)return json(res,404,{error:'room not found'});if(!(await authorize(req,rec)))return json(res,401,{error:'unauthorized'});
    if(req.method==='GET')return json(res,200,{roomId,revision:rec.revision,workspace:rec.workspace,updatedAt:rec.updatedAt});
    if(req.method==='PUT'){const expected=Number(req.headers['if-match']);if(!Number.isFinite(expected)||expected!==rec.revision)return json(res,409,{roomId,revision:rec.revision,workspace:rec.workspace,updatedAt:rec.updatedAt,error:'revision conflict'});const b=await body(req),workspace=validateShared(b.workspace);rec.workspace=workspace;rec.revision+=1;rec.updatedAt=new Date().toISOString();db[roomId]=rec;await saveDb(db);return json(res,200,{roomId,revision:rec.revision,updatedAt:rec.updatedAt});}
    return json(res,405,{error:'method not allowed'});
  }
  return false;
}
async function staticFile(req,res,url){if(req.method!=='GET'&&req.method!=='HEAD'){json(res,405,{error:'method not allowed'});return}let pathname=decodeURIComponent(url.pathname);if(pathname==='/'||pathname==='')pathname='/index.html';const rel=normalize(pathname).replace(/^([/\\])+/, '');if(rel.startsWith('legacy/http-sync/')||rel.includes('..')){json(res,403,{error:'forbidden'});return}const file=resolve(root,rel);if(!file.startsWith(root)){json(res,403,{error:'forbidden'});return}try{const s=await stat(file);if(!s.isFile())throw new Error();res.writeHead(200,headers({'Content-Type':mime[extname(file)]||'application/octet-stream','Content-Length':s.size,'Cache-Control':extname(file)==='.html'?'no-cache':'public, max-age=3600'}));if(req.method==='HEAD')return res.end();createReadStream(file).pipe(res)}catch{const f=join(root,'offline.html');try{const s=await stat(f);res.writeHead(404,headers({'Content-Type':'text/html; charset=utf-8','Content-Length':s.size}));createReadStream(f).pipe(res)}catch{json(res,404,{error:'not found'})}}
}
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname.startsWith('/api/')){const handled=await api(req,res,url);if(handled!==false)return}await staticFile(req,res,url)}catch(e){json(res,e.status||400,{error:e.message||'request failed'})}});
server.listen(PORT,HOST,()=>console.log(`Texas Health OS legacy HTTP sync adapter: http://${HOST}:${PORT}`));
