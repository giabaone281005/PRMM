// Explicit CP-02 acceptance controller. Requires operator-provisioned temporary
// accounts in ignored .local/cp02/run.json; never prints credentials or tokens.
// The Dart harness only observes the WebView. Learner input uses Android ADB.
import {createServer} from 'node:http';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';

const run=JSON.parse(readFileSync('.local/cp02/run.json','utf8'));
const config=JSON.parse(readFileSync('.local/supabase.mobile.json','utf8'));
assert.equal(new URL(config.SUPABASE_URL).hostname,'sbzpmrgsqznaydllqmbm.supabase.co');
const evidence='../docs/qa/cp02-20261113';mkdirSync(evidence,{recursive:true});
const results=[],queue=[],waiting=new Map();let latest={},sequence=0;
function record(check,data={}){results.push({at:new Date().toISOString(),check,...data});writeFileSync(evidence+'/hosted-results.json',JSON.stringify({run:run.run,project:config.SUPABASE_URL,lessonId:run.lessonId,results},null,2));}
async function api(user,path,body,method='POST',allowed=[200,201,204]){
 const r=await fetch(config.SUPABASE_URL+'/'+path,{method,headers:{apikey:config.SUPABASE_PUBLISHABLE_KEY,...(user?.token?{Authorization:'Bearer '+user.token}:{}),'Content-Type':'application/json'},...(method==='GET'?{}:{body:JSON.stringify(body??{})})});
 const text=await r.text();let data;try{data=JSON.parse(text);}catch{data=text;}
 assert(allowed.includes(r.status),`${method} ${path.split('?')[0]} returned ${r.status}`);return data;
}
for(const user of run.users){const data=await api(null,'auth/v1/token?grant_type=password',{email:user.email,password:user.password});assert.equal(data.user.id,user.id);user.token=data.access_token;}
const [admin,author,student,other]=run.users;
run.lessonId=run.run+'-balls';
const manifest=JSON.parse(readFileSync('contracts/generated/engine-six-checkpoints.json','utf8')).find(l=>l.recognition?.[0]?.uime?.kind==='EVENT_CARD_BUCKET');
manifest.lessonId=run.lessonId;manifest.title='CP02 — Chọn bi sáu bước';manifest.status='draft';manifest.version=1;
writeFileSync('.local/cp02/lesson-id.json',JSON.stringify({run:run.run,lessonId:run.lessonId}));
await api(author,'rest/v1/rpc/save_lesson_draft',{p_manifest:manifest});
for(const user of [student,other]){
 const drafts=await api(user,'rest/v1/lessons?select=id&id=eq.'+run.lessonId,undefined,'GET');assert.equal(drafts.length,0);
 const catalog=await api(user,'rest/v1/rpc/published_catalog',{});assert(!catalog.some(r=>r.manifest.lessonId===run.lessonId));
}
record('authenticated password login; author draft hidden from both students',{status:'PASS'});
async function command(op){
 const id=++sequence;
 return new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>{waiting.delete(id);reject(Error('Native harness timeout for '+op.op));},30000);
  waiting.set(id,{resolve:r=>{clearTimeout(timeout);resolve(r);}});queue.push({...op,id});
 });
}
async function control(op){
 if(op.op==='publish'){
  assert(latest.joined,'Realtime must subscribe before publish');
  assert.equal(await api(admin,'rest/v1/rpc/publish_lesson',{p_lesson_id:run.lessonId}),1);
  record('admin publish after native Realtime subscribed',{status:'PASS'});return {lessonId:run.lessonId};
 }
 if(op.op==='verify'){
  const id=op.lessonId??run.lessonId;
  const path='rest/v1/lesson_progress?select=version,revision,completion_status,snapshot&lesson_id=eq.'+id;
  const progress=await api(student,path,undefined,'GET');assert.equal(progress.length,1);
  assert.equal(progress[0].completion_status,'completed');
  const attemptsPath='rest/v1/checkpoint_attempts?select=attempt_id&lesson_id=eq.'+id;
  const before=await api(student,attemptsPath,undefined,'GET');
  for(let i=0;i<2;i++)await api(student,'functions/v1/progress',{lessonId:id,version:progress[0].version,events:progress[0].snapshot.journal});
  const after=await api(student,attemptsPath,undefined,'GET');assert.equal(after.length,before.length);
  assert.deepEqual(await api(other,path,undefined,'GET'),[]);
  assert.deepEqual(await api(other,attemptsPath,undefined,'GET'),[]);
  const summary={lessonId:id,version:progress[0].version,revision:progress[0].revision,completionStatus:progress[0].completion_status,checkpoint:progress[0].snapshot.checkpoint,attempts:after.length};
  record('Edge completed readback; duplicate replay idempotent; other student sees no progress/attempts',{status:'PASS',...summary});return summary;
 }
 if(op.op==='signout'){
  for(const user of run.users)await api(user,'auth/v1/logout?scope=local',{});
  record('host controller sessions signed out',{status:'PASS'});return {ok:true};
 }
 if(op.op==='latest')return latest;
 const reply=await command(op);
 if(op.op!=='state')record('native harness '+op.op,{ready:reply.ready,error:reply.error,checkpoint:reply.snapshot?.checkpoint,completed:reply.snapshot?.completed,harnessError:reply.harnessError});
 return reply;
}
createServer(async(req,res)=>{
 try{
  assert.equal(req.headers['x-run-key'],run.key);
  let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>1000000)throw Error('Request too large');}
  const body=JSON.parse(raw||'{}');let reply;
  if(req.url==='/exchange'){
   latest=body;const item=waiting.get(body.id);if(item){waiting.delete(body.id);item.resolve(body);}
   reply=queue.shift()??{op:'state',id:0};
  }else if(req.url==='/control'){reply=await control(body);}
  else throw Error('Unknown endpoint');
  res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(reply));
 }catch(error){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:error.message}));}
}).listen(5198,'127.0.0.1',()=>console.log('CP02 controller ready on 127.0.0.1:5198; temporary draft prepared'));
