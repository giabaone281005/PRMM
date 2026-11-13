import {parsePlanInput,planLesson} from '../../../packages/lesson-authoring/planner';
declare const Deno:{env:{get:(key:string)=>string|undefined};serve:(f:(r:Request)=>Promise<Response>)=>void};
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
const json=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status,headers:{...cors,'Content-Type':'application/json'}});
Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('',{headers:cors});if(req.method!=='POST')return json({error:'Method not allowed'},405);
  const url=Deno.env.get('SUPABASE_URL')!,key=Deno.env.get('SUPABASE_ANON_KEY')!,secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;let jobId:string|undefined;
  const serviceHeaders={apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json',Prefer:'return=representation'};
  async function update(values:unknown){if(jobId)await fetch(`${url}/rest/v1/authoring_jobs?id=eq.${jobId}`,{method:'PATCH',headers:serviceHeaders,body:JSON.stringify(values)});}
  try{
    const auth=req.headers.get('Authorization');if(!auth?.startsWith('Bearer '))return json({error:'Unauthorized'},401);const headers={apikey:key,Authorization:auth};
    const userResponse=await fetch(url+'/auth/v1/user',{headers});if(!userResponse.ok)return json({error:'Unauthorized'},401);const user=await userResponse.json();
    const roleResponse=await fetch(`${url}/rest/v1/user_roles?user_id=eq.${user.id}&select=role`,{headers});const roles=await roleResponse.json();if(!roleResponse.ok||!['admin','author'].includes(roles[0]?.role))return json({error:'Forbidden'},403);
    const raw=await req.text();if(raw.length>10000)return json({error:'Payload too large'},413);const body=JSON.parse(raw),input=parsePlanInput(body.input);
    if(typeof body.requestId!=='string'||! /^[0-9a-f-]{36}$/.test(body.requestId))return json({error:'Invalid request ID'},400);
    const existingResponse=await fetch(`${url}/rest/v1/authoring_jobs?id=eq.${body.requestId}`,{headers:serviceHeaders});if(!existingResponse.ok)throw Error('Job store unavailable');const existing=await existingResponse.json();if(existing.length){if(existing[0].owner_id!==user.id)return json({error:'Forbidden'},403);if(existing[0].status==='review')return json({jobId:body.requestId,...existing[0].result});if(existing[0].status!=='failed')return json({jobId:body.requestId,status:existing[0].status},202);jobId=body.requestId;}
    else{
      const since=new Date(Date.now()-3600000).toISOString();const recent=await fetch(`${url}/rest/v1/authoring_jobs?owner_id=eq.${user.id}&created_at=gte.${encodeURIComponent(since)}&select=id&limit=10`,{headers:serviceHeaders});if(!recent.ok)throw Error('Quota store unavailable');if((await recent.json()).length>=10)return json({error:'Giới hạn 10 yêu cầu mỗi giờ.'},429);
      const created=await fetch(url+'/rest/v1/authoring_jobs',{method:'POST',headers:serviceHeaders,body:JSON.stringify({id:body.requestId,owner_id:user.id,input,status:'queued'})});if(!created.ok)throw Error('Could not create job');jobId=body.requestId;
    }
    await update({status:'running',safe_error:null});const endpoint=Deno.env.get('LESSON_AI_ENDPOINT'),providerKey=Deno.env.get('LESSON_AI_KEY');
    const result=await planLesson(input,endpoint&&providerKey?async(input,template)=>{if(!endpoint.startsWith('https://'))throw Error('HTTPS provider required');const response=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+providerKey,'Content-Type':'application/json'},body:JSON.stringify({input,template,outputContract:{title:'string',instructions:`string[${template.checkpoints.length}]`,hints:`string[${template.checkpoints.length}]`}}),signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('AI provider failed');return response.json();}:undefined);
    await update({status:'review',result});return json({jobId,status:'review',...result});
  }catch{await update({status:'failed',safe_error:'Generation failed. Check template, provider and retry.'});return json({error:'Không tạo được bản nháp. Kiểm tra template hoặc cấu hình provider rồi thử lại.',jobId},400);}
});
