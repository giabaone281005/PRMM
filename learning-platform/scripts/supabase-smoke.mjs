// Explicit hosted acceptance test. Requires temporary users prepared by the operator.
// Credentials/results stay under gitignored .local/deployment; never print tokens.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
const config=JSON.parse(readFileSync('.local/supabase.mobile.json','utf8'));
const state=JSON.parse(readFileSync('.local/deployment/smoke-users.json','utf8'));
const base=config.SUPABASE_URL,key=config.SUPABASE_PUBLISHABLE_KEY;
const results=[];
async function call(user,path,body,method='POST',expected=200){
 const response=await fetch(base+'/'+path,{method,headers:{apikey:key,...(user?.token?{Authorization:'Bearer '+user.token}:{}),'Content-Type':'application/json'},...(method==='GET'?{}:{body:JSON.stringify(body??{})})});
 const raw=await response.text();let data;try{data=JSON.parse(raw);}catch{data=raw;}
 const accepted=Array.isArray(expected)?expected:[expected];
 assert(accepted.includes(response.status),`${method} ${path}: expected ${accepted}, got ${response.status}: ${JSON.stringify(data)}`);
 return data;
}
function pass(name){results.push({name,status:'PASS'});console.log('PASS '+name);}
try{
 for(const u of state.users){const r=await call(null,'auth/v1/token?grant_type=password',{email:u.email,password:u.password});u.token=r.access_token;assert.equal(r.user.id,u.id);}
 const [admin,author,author2,student,other]=state.users;
 pass('Auth password login for five isolated roles');
 await call(null,'rest/v1/rpc/published_catalog',{},'POST',[401,403]);
 assert.deepEqual(await call(student,'rest/v1/rpc/published_catalog',{}),[]);pass('Catalog empty; anon rejected');
 const manifest=JSON.parse(readFileSync('contracts/fixtures/grade7-triangle-angle-sum.lesson.json','utf8'));
 manifest.lessonId='smoke-'+state.run;
 state.lessonId=manifest.lessonId;writeFileSync('.local/deployment/smoke-users.json',JSON.stringify(state));
 await call(author,'rest/v1/rpc/save_lesson_draft',{p_manifest:manifest},'POST',[200,204]);
 assert.equal((await call(author2,'rest/v1/lessons?select=id',undefined,'GET')).length,0);
 assert.equal((await call(student,'rest/v1/lessons?select=id',undefined,'GET')).length,0);
 await call(author,'rest/v1/rpc/publish_lesson',{p_lesson_id:manifest.lessonId},'POST',[400,403]);
 await call(student,'rest/v1/rpc/set_user_role',{p_user_id:student.id,p_role:'admin'},'POST',[400,403]);
 pass('Draft isolation; author cannot publish; student cannot elevate');
 assert.equal(await call(admin,'rest/v1/rpc/publish_lesson',{p_lesson_id:manifest.lessonId}),1);
 const catalog=await call(student,'rest/v1/rpc/published_catalog',{});assert.equal(catalog[0].manifest.lessonId,manifest.lessonId);
 await call(admin,'rest/v1/lesson_versions?lesson_id=eq.'+manifest.lessonId,{content_hash:'invalid'},'PATCH',[401,403]);
 pass('Admin publishes immutable version; student reads manifest');
 const assignment={lesson_id:manifest.lessonId,user_id:student.id};
 for(let i=0;i<2;i++)await call(admin,'rest/v1/lesson_assignments?on_conflict=lesson_id,user_id',assignment,'POST',i?409:201);
 const progress={lessonId:manifest.lessonId,version:1,events:[{kind:'interaction',event:{type:'drag_vertex',id:'A',position:[180,75]}},{kind:'advance'}]};
 await call(null,'functions/v1/progress',progress,'POST',401);
 const first=await call(student,'functions/v1/progress',progress);assert.equal(first.snapshot.checkpoint,1);
 assert.deepEqual((await call(student,'functions/v1/progress',progress)).snapshot,first.snapshot);
 assert.equal((await call(other,'rest/v1/lesson_progress?select=snapshot',undefined,'GET')).length,0);
 await call(student,'rest/v1/lesson_progress',{user_id:student.id},'POST',[401,403]);
 await call(student,'functions/v1/progress',{...progress,events:[{kind:'advance'}]},'POST',400);
 pass('Edge progress replay, retry idempotency, forgery rejection and isolation');
 const segments=[{start:'2026-11-10T16:59:50Z',end:'2026-11-10T17:00:10Z'}];
 const session={p_id:randomUUID(),p_lesson_id:manifest.lessonId,p_version:1,p_device_id:randomUUID(),p_revision:1,p_segments:segments};
 for(let i=0;i<2;i++)await call(student,'rest/v1/rpc/record_study_session',session,'POST',[200,204]);
 const activity=await call(student,'rest/v1/rpc/my_study_activity',{});
 assert.equal(activity.days['2026-11-10'].seconds,10);assert.equal(activity.days['2026-11-11'].seconds,10);
 assert.equal(activity.events.filter(e=>e.type==='checkpoint').length,1);
 assert.deepEqual((await call(other,'rest/v1/rpc/my_study_activity',{})).days,{});
 pass('Hosted activity aggregation, midnight split, milestones and isolation');
 await call(student,'rest/v1/profiles?id=eq.'+student.id,{display_name:'Smoke test'},'PATCH',204);
 assert.equal((await call(student,'rest/v1/profiles?select=display_name',undefined,'GET'))[0].display_name,'Smoke test');
 await call(student,'rest/v1/engine_requests',{problem:'Temporary smoke request'},'POST',201);
 assert.equal((await call(other,'rest/v1/engine_requests?select=id',undefined,'GET')).length,0);
 pass('Profiles and engine requests use real Data API with RLS');
 const input={requestId:randomUUID(),input:{grade:7,template:'triangle',objective:'Khám phá tổng góc tam giác'}};
 await call(student,'functions/v1/generate',input,'POST',403);
 const job=await call(author,'functions/v1/generate',input);assert.equal(job.mode,'template');assert.equal(job.status,'review');
 pass('Generation function: author review workflow; student forbidden; no AI provider assumed');
 await call(admin,'rest/v1/rpc/unpublish_lesson',{p_lesson_id:manifest.lessonId},'POST',[200,204]);
 assert.deepEqual(await call(student,'rest/v1/rpc/published_catalog',{}),[]);
 assert.equal((await call(student,'rest/v1/rpc/get_published_manifest',{p_lesson_id:manifest.lessonId,p_version:1})).lessonId,manifest.lessonId);
 await call(student,'functions/v1/progress',progress);
 pass('Unpublished version remains resumable by existing learner');
}finally{
 writeFileSync('.local/deployment/hosted-smoke-results.json',JSON.stringify({project:base,results},null,2));
}
