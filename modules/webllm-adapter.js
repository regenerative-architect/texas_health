(function(){
'use strict';
let pkg=null,engine=null,worker=null,currentModel='';
async function loadPackage(){if(pkg)return pkg;const url=window.TXH_CONFIG?.webllmModuleUrl||'https://esm.run/@mlc-ai/web-llm@0.2.85';pkg=await import(url);return pkg}
function capability(){return {webgpu:!!navigator.gpu,worker:'Worker'in self,secureContext:self.isSecureContext,online:navigator.onLine,userAgent:navigator.userAgent}}
async function models(){const w=await loadPackage();return (w.prebuiltAppConfig?.model_list||[]).map(x=>({id:x.model_id||x.model||'',model:x})).filter(x=>x.id)}
async function load(modelId,onProgress){
  if(!navigator.gpu)throw new Error('WebGPU is not available in this browser. The deterministic planner remains available.');
  if(!('Worker'in self))throw new Error('Dedicated Web Workers are unavailable. The deterministic planner remains available.');
  const w=await loadPackage();
  if(worker){try{worker.terminate()}catch{} worker=null}
  worker=new Worker(window.TXH_CONFIG?.webllmWorkerUrl||'./modules/webllm-worker.js',{type:'module',name:'txh-webllm'});
  const appConfig={...w.prebuiltAppConfig,cacheBackend:'indexeddb'};
  engine=await w.CreateWebWorkerMLCEngine(worker,modelId,{appConfig,initProgressCallback:p=>onProgress?.(p)});
  currentModel=modelId;
  return modelId;
}
function deterministicPlan(userText='',context=''){
  const q=(userText+' '+context).toLowerCase();
  const themes=[];
  const add=(name,why,actions)=>themes.push({name,why,actions});
  if(/rural|distance|travel|county/.test(q))add('Rural access','Distance and sparse service capacity can make otherwise routine care difficult.',['Measure travel time to primary, urgent and specialty care','Check transportation and telehealth pathways','Document provider/service availability with dated sources']);
  if(/maternal|pregnan|postpartum|birth/.test(q))add('Maternal/child access','Pregnancy and postpartum access can depend on coverage, travel, workforce and service-line availability.',['Verify current prenatal/postpartum resource pathways','Map travel and backup transportation','Keep emergency warning-sign guidance separate from planning tools']);
  if(/broadband|telehealth|internet|connect/.test(q))add('Connectivity','Telehealth depends on device, bandwidth, privacy, power and a clinically appropriate visit type.',['Test device/camera/microphone before the visit','Identify a private backup site such as a library/clinic where appropriate','Keep phone and in-person fallback pathways']);
  if(/heat|power|outage|storm|flood|disaster/.test(q))add('Continuity','Infrastructure disruptions can affect medications, devices, transport and communications.',['Inventory power/water/transport dependencies','Create primary and backup contacts/routes','Verify storage/device instructions with clinicians, pharmacists or manufacturers']);
  if(/cost|insurance|medicaid|chip|bill|uninsured/.test(q))add('Affordability/coverage','Coverage status, network rules and assistance programs change the practical path to care.',['Use official eligibility/application sources','Compare total-cost structure rather than premium alone','Ask providers about estimates and financial-assistance policies']);
  if(/school|student|child/.test(q))add('School/community coordination','Schools can be important health-access and referral partners without becoming substitutes for clinical care.',['Coordinate consent and privacy boundaries','Use current DSHS school-health resources','Create explicit referral/transport follow-up ownership']);
  if(!themes.length)add('Health-access workflow','A useful plan separates verified facts, unknowns, constraints and candidate interventions.',['Define the access problem and geography','Gather current authoritative evidence','Compare at least two feasible interventions with transparent assumptions']);
  const lines=['DETERMINISTIC LOCAL PLANNER — no model was required.','This is a planning scaffold, not medical advice or a prediction.','',...themes.flatMap(t=>[t.name.toUpperCase(),t.why,...t.actions.map(a=>'• '+a),'']), 'CROSS-DOMAIN CHECK','• Health ↔ mobility ↔ broadband ↔ housing ↔ food ↔ water ↔ energy ↔ education ↔ resilience.','• Assign each action an owner, evidence source, due date, accessibility check and measurable outcome.','• Keep personal health information out of shared multiplayer rooms unless an approved system and explicit consent process exist.'];
  return lines.join('\n');
}
async function chat(userText,context=''){
  if(!engine)return deterministicPlan(userText,context);
  const system=`You are a local planning assistant inside the Texas Health Navigator OS. Support healthcare access, public-health planning, multidisciplinary coordination and evidence literacy. Never diagnose, prescribe, change medication doses, or present uncertain claims as facts. Separate FACT, INFERENCE, MODEL, SCENARIO and HYPOTHESIS. Prefer official Texas HHS/DSHS, HRSA, CMS, CDC, TCEQ, TxDOT and peer-reviewed evidence. Do not infer eligibility. Keep personal health information out of shared-workspace suggestions. ${context}`;
  const r=await engine.chat.completions.create({messages:[{role:'system',content:system},{role:'user',content:userText}],temperature:.2});
  return r?.choices?.[0]?.message?.content||deterministicPlan(userText,context);
}
function unload(){try{engine?.unload?.()}catch{};try{worker?.terminate()}catch{};worker=null;engine=null;currentModel=''}
window.TXHWebLLM={capability,models,load,chat,unload,deterministicPlan,get model(){return currentModel}};
})();
