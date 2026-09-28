import {BroadcastChannel} from 'node:worker_threads';
const name=`txh-smoke-${process.pid}-${Date.now()}`;
const a=new BroadcastChannel(name),b=new BroadcastChannel(name);
const got=new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('BroadcastChannel timeout')),1500);b.onmessage=e=>{clearTimeout(t);resolve(e.data)}});
a.postMessage({type:'presence',sender:'test-a',workspaceId:'ws-test'});
const data=await got;
if(data?.type!=='presence'||data?.workspaceId!=='ws-test')throw new Error('Unexpected BroadcastChannel payload');
a.close();b.close();
console.log('OK BroadcastChannel same-device transport smoke');
