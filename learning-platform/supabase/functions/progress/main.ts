// Build this source with npm run bundle:edge; deploy generated index.ts.
import {replay} from '../../../packages/lesson-runtime/replay';
import type {Lesson} from '../../../packages/lesson-contract';
declare const Deno:{env:{get:(key:string)=>string|undefined};serve:(f:(r:Request)=>Promise<Response>)=>void};
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
function response(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});}
Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('',{headers:cors});if(req.method!=='POST')return response({error:'Method not allowed'},405);
  try{
    const url=Deno.env.get('SUPABASE_URL')!,key=Deno.env.get('SUPABASE_ANON_KEY')!,secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const auth=req.headers.get('Authorization');if(!auth?.startsWith('Bearer '))return response({error:'Unauthorized'},401);
    const headers={apikey:key,Authorization:auth,'Content-Type':'application/json'};
    const userResponse=await fetch(url+'/auth/v1/user',{headers});if(!userResponse.ok)return response({error:'Unauthorized'},401);const user=await userResponse.json();
    const raw=await req.text();if(raw.length>1000000)return response({error:'Payload too large'},413);const body=JSON.parse(raw);
    if(typeof body.lessonId!=='string'||!Number.isInteger(body.version))return response({error:'Invalid lesson identity'},400);
    const manifestResponse=await fetch(url+'/rest/v1/rpc/get_published_manifest',{method:'POST',headers,body:JSON.stringify({p_lesson_id:body.lessonId,p_version:body.version})});
    if(!manifestResponse.ok)return response({error:'Manifest unavailable'},403);const manifest=await manifestResponse.json() as Lesson;if(!manifest)return response({error:'Manifest unavailable'},404);
    const snapshot={...replay(manifest,body.events),journal:body.events};
    const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([user.id,body.lessonId,body.version,body.events]))));
    const hex=Array.from(digest.slice(0,16)).map(b=>b.toString(16).padStart(2,'0')).join(''),attemptId=`${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
    const saved=await fetch(url+'/rest/v1/rpc/commit_lesson_progress',{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify({p_user_id:user.id,p_lesson_id:body.lessonId,p_version:body.version,p_attempt_id:attemptId,p_snapshot:snapshot,p_revision:snapshot.revision})});
    if(!saved.ok)return response({error:saved.status===409?'Revision conflict':'Progress update rejected'},409);
    return response({snapshot:await saved.json()});
  }catch{return response({error:'Invalid request or event journal'},400);}
});
