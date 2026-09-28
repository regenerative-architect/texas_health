'use strict';
const VERSION='tx-health-os-v4.0.0';
const STATIC_CACHE=VERSION+'-static';
const RUNTIME_CACHE=VERSION+'-runtime';
const PRECACHE=[
  './','./index.html','./offline.html','./manifest.webmanifest','./config.js',
  './assets/suite.css','./modules/collab-client.js','./modules/p2p-collab.js','./modules/webllm-adapter.js','./modules/webllm-worker.js','./modules/suite-enhancements.js','./modules/advanced-suite.js',
  './icons/icon-192.png','./icons/icon-512.png',
  './data/source-registry.json','./data/texas-health-facts.json','./data/texas-health-reference-2026.json','./data/cross-domain-system.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(STATIC_CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tx-health-os-')&&!k.startsWith(VERSION)).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  if(u.pathname.startsWith('/api/'))return; // Never cache legacy collaboration API state.
  if(u.origin!==self.location.origin)return; // Trystero/WebLLM cross-origin modules and model artifacts manage their own network/cache behavior.
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const copy=res.clone();caches.open(RUNTIME_CACHE).then(c=>c.put('./index.html',copy));return res}).catch(()=>caches.match('./index.html').then(x=>x||caches.match('./offline.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(RUNTIME_CACHE).then(c=>c.put(r,copy))}return res}).catch(()=>caches.match('./offline.html'))));
});
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
