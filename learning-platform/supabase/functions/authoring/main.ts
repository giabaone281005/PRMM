import {compileProblem} from '../../../packages/lesson-authoring/authoring-service';
declare const Deno:{env:{get:(key:string)=>string|undefined};serve:(f:(r:Request)=>Promise<Response>)=>void};
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('',{headers:cors});if(req.method!=='POST')return json({error:'Method not allowed'},405);
 try{
  const url=Deno.env.get('SUPABASE_URL')!,key=Deno.env.get('SUPABASE_ANON_KEY')!,secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const auth=req.headers.get('Authorization');if(!auth?.startsWith('Bearer '))return json({error:'Unauthorized'},401);
  const headers={apikey:key,Authorization:auth};
  const userResponse=await fetch(url+'/auth/v1/user',{headers});if(!userResponse.ok)return json({error:'Unauthorized'},401);const user=await userResponse.json();
  const rolesResponse=await fetch(`${url}/rest/v1/user_roles?user_id=eq.${user.id}&select=role`,{headers});const roles=await rolesResponse.json();
  if(!rolesResponse.ok||!['admin','author'].includes(roles[0]?.role))return json({error:'Forbidden'},403);
  const raw=await req.text();if(raw.length>131072)return json({error:'JSON đề tối đa 128 KB.'},413);const body=JSON.parse(raw);
  if(typeof body.lessonId!=='string'||!/^[a-zA-Z][a-zA-Z0-9_-]{0,93}$/.test(body.lessonId)||!Number.isSafeInteger(body.expectedRevision)||body.expectedRevision<0||typeof body.publish!=='boolean')return json({error:'Invalid authoring request'},400);
  if(body.publish&&roles[0].role!=='admin')return json({error:'Chỉ quản trị viên được xuất bản.'},403);
  const existingResponse=await fetch(`${url}/rest/v1/lessons?id=eq.${body.lessonId}&select=draft,owner_id`,{headers});if(!existingResponse.ok)throw Error('Không đọc được bản nháp.');const existing=await existingResponse.json();
  // A hidden existing lesson cannot be overwritten: the service RPC checks actor ownership again.
  const version=existing[0]?.draft?.version??1;
  const {manifest,receipt}=compileProblem(body.input,{lessonId:body.lessonId,version});
  const saved=await fetch(url+'/rest/v1/rpc/commit_lesson_authoring',{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify({p_actor:user.id,p_manifest:manifest,p_receipt:receipt,p_expected_revision:body.expectedRevision,p_publish:body.publish})});
  if(!saved.ok){const detail=await saved.json();return json({error:detail.message??'Không lưu được bài. Tải lại để kiểm tra revision.'},409);}
  return json(await saved.json());
 }catch(error){return json({error:error instanceof Error?error.message:'Không xử lý được JSON đề.'},400);}
});
