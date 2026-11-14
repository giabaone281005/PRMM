// Run after hosted-checkpoint-server.mjs and the Android hosted harness are ready.
// DOM queries only locate controls; all lesson answers/orbit/advance use ADB input.
import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import assert from 'node:assert/strict';
const exec=promisify(execFile),run=JSON.parse(readFileSync('.local/cp02/run.json','utf8'));
const {lessonId:balls}=JSON.parse(readFileSync('.local/cp02/lesson-id.json','utf8'));
const evidence='../docs/qa/cp02-20261113',results=[];
const fixtures=JSON.parse(readFileSync('contracts/generated/engine-six-checkpoints.json','utf8'));
const keys=['x','y','a','b','c','width','height','numerator'];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function control(op){const r=await fetch('http://127.0.0.1:5198/control',{method:'POST',headers:{'Content-Type':'application/json','X-Run-Key':run.key},body:JSON.stringify(op)});const data=await r.json();assert(r.ok,data.error);return data;}
async function state(op='state',extra={}){const s=await control({op,...extra});if(s.dom){for(let i=0;i<2&&typeof s.dom==='string';i++)s.dom=JSON.parse(s.dom);}assert(!s.harnessError,s.harnessError);return s;}
async function wait(predicate,label){const end=Date.now()+25000;let s;do{s=await state();if(predicate(s))return s;await delay(200);}while(Date.now()<end);throw Error('Timed out: '+label+' '+JSON.stringify({ready:s.ready,error:s.error,checkpoint:s.snapshot?.checkpoint}));}
async function adb(...args){appendFileSync(evidence+'/android-input.jsonl',JSON.stringify({at:new Date().toISOString(),args})+'\n');return exec('adb',['-s','emulator-5554',...args],{maxBuffer:12000000});}
async function screenshot(name){const r=await exec('adb',['-s','emulator-5554','exec-out','screencap','-p'],{encoding:'buffer',maxBuffer:12000000});writeFileSync(evidence+'/'+name+'.png',r.stdout);}
function point(s,c){assert(s.webRect&&s.dom,'WebView not observed');assert(c&&c.y>=0&&c.y+c.h<=s.dom.height,'Control outside WebView viewport');const scale=s.webRect.w/s.dom.width;return {x:Math.round((s.webRect.x+(c.x+c.w/2)*scale)*s.dpr),y:Math.round((s.webRect.y+(c.y+c.h/2)*scale)*s.dpr)};}
async function tap(match){const s=await state(),c=s.dom.controls.find(match),p=point(s,c);assert(p.y>100&&p.y<2750,'Control clipped by native viewport');await adb('shell','input','tap',String(p.x),String(p.y));await delay(250);}
async function advance(cp){await state('ensureNext');const s=await state(),r=s.nextRect;assert(s.nextEnabled,'Next must unlock after correct input');await adb('shell','input','tap',String(Math.round((r.x+r.w/2)*s.dpr)),String(Math.round((r.y+r.h/2)*s.dpr)));await wait(s=>cp===5?s.snapshot?.completed:s.snapshot?.checkpoint===cp+1,'advance '+cp);}
async function open(id){let s=await state();if(s.lessonId)await state('close');await state('open',{lessonId:id});s=await wait(s=>s.ready&&s.lessonId===id,'open '+id);await state('ensureScene');return s;}
async function orbit(){const s=await state(),c=s.dom.controls.find(c=>c.tag==='CANVAS'),p=point(s,c);await adb('shell','input','swipe',String(p.x-120),String(p.y),String(p.x+120),String(p.y),'650');await wait(s=>Math.abs(Number(s.snapshot.state.a))+Math.abs(Number(s.snapshot.state.b))>=.3,'orbit');}
function record(check,data){results.push({at:new Date().toISOString(),check,...data});writeFileSync(evidence+'/android-touch-'+selected+'-results.json',JSON.stringify({run:run.run,input:'ADB Android input; no DOM-dispatched answers',results},null,2));console.log(check+' '+JSON.stringify(data));}
const selected=process.argv[2]??'balls';
try{
 const originalIds={cylinder:'math9-f1a1daed-ee88-4a3a-8e6b-0534ca5624a7',cone:'template-engine-solid-cone',sphere:'template-engine-solid-sphere'};
 const id=selected==='balls'?balls:originalIds[selected];assert(id,'Unknown lesson');
 const fixture=selected==='balls'?fixtures.find(l=>l.recognition[0].uime.kind==='EVENT_CARD_BUCKET'):fixtures.find(l=>l.recognition[0].uime.kind==='3D_SOLID_INSPECTOR'&&l.recognition[0].uime.solid===selected);
 let initial=await state();if(initial.lessonId!==id)initial=await open(id);
 await wait(s=>s.ready,'runtime ready');
 for(let cp=initial.snapshot?.checkpoint??0;cp<6;cp++){
  await state('ensureScene');const u=fixture.recognition[cp].uime;
  assert.equal((await state()).snapshot.checkpoint,cp);
  if(u.kind==='EVENT_CARD_BUCKET'){
   // Prove a wrong assignment does not unlock the step, then correct it.
   await tap(c=>c.tag==='BUTTON'&&!c.label&&(c.text===u.tokens[0]||c.text.startsWith(u.tokens[0]+' →')));
   const wrong=(u.answers[0]+1)%u.labels.length;
   await tap(c=>c.label==='Ô '+u.labels[wrong]);
   const rejected=await wait(s=>s.snapshot.state.x===wrong,'wrong answer delivery');assert.equal(rejected.success,false);
   for(let i=0;i<u.tokens.length;i++){
    await tap(c=>c.tag==='BUTTON'&&!c.label&&(c.text===u.tokens[i]||c.text.startsWith(u.tokens[i]+' →')));
    await tap(c=>c.label==='Ô '+u.labels[u.answers[i]]);
    await wait(s=>s.snapshot.state[keys[i]]===u.answers[i],'card '+i);
   }
  }else{
   const wrong=(u.answers[0]+1)%u.tokens.length;
   await tap(c=>c.tag==='BUTTON'&&c.text===u.tokens[wrong]);
   await wait(s=>s.snapshot.state.x===wrong,'wrong solid part');assert.equal((await state()).success,false);
   await orbit();
   await tap(c=>c.tag==='BUTTON'&&c.text===u.tokens[u.answers[0]]);
  }
  await wait(s=>s.success,'correct answer');await screenshot(selected+'-cp'+(cp+1));
  if(cp===0){
   const before=(await state()).snapshot.revision;
   await adb('shell','input','keyevent','KEYCODE_HOME');await delay(600);
   await adb('shell','am','start','-n','vn.mohoc.mo_hoc/.MainActivity');
   const resumed=await wait(s=>s.ready&&s.snapshot.checkpoint===0,'foreground resume');assert.equal(resumed.snapshot.revision,before);
   record('background/foreground retains snapshot',{lessonId:id,checkpoint:cp,revision:before});
  }
  await advance(cp);record('checkpoint completed by Android touch',{lessonId:id,checkpoint:cp+1});
  if(cp===1){
   await state('close');await open(id);
   const restored=await wait(s=>s.snapshot.checkpoint===2&&s.ready,'close/reopen resume');
   record('close/reopen retains checkpoint',{lessonId:id,checkpoint:restored.snapshot.checkpoint});
  }
 }
 await screenshot(selected+'-completed');
 let readback;for(let i=0;i<8;i++){try{readback=await control({op:'verify',lessonId:id});break;}catch(error){if(i===7)throw error;await delay(1000);}}
 record('hosted completed progress, idempotency and RLS',{...readback});
}catch(error){await screenshot(selected+'-failure').catch(()=>{});record('FAIL',{message:error.message});process.exitCode=1;}
