import type {AuthoringProblem,AuthoringReceipt} from '../packages/lesson-authoring/template-registry';
import {createClient} from '@supabase/supabase-js';
import {validateLesson,type Lesson} from '../packages/lesson-contract';
import type {Snapshot} from '../packages/lesson-runtime';
const env=(import.meta as unknown as {env:Record<string,string>}).env;
export const supabase=env.VITE_ENABLE_LOCAL_DEMO!=='true'&&env.VITE_SUPABASE_URL&&env.VITE_SUPABASE_PUBLISHABLE_KEY?createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY):null;
let progressUser='local';
export function setProgressUser(id:string){progressUser=id;}
let localCheck:Promise<boolean>|undefined;
export function hasLocalApi(){if(env.VITE_ENABLE_LOCAL_DEMO!=='true')return Promise.resolve(false);return localCheck??=fetch('/api/health').then(async r=>r.ok&&(await r.json()).mode==='local').catch(()=>false);}
export async function localRequest(path:string,body?:unknown){const r=await fetch('/api/'+path,body===undefined?{cache:'no-store'}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.error??'Local API failed');return data;}
export interface RecordLesson {authoring?:{receipt:AuthoringReceipt;revision:number};authoringVersions?:{version:number;receipt:AuthoringReceipt;manifestContentHash:string}[];id:string;draft:Lesson;versions:Lesson[];publishedVersion:number|null;assignedTo:string[];updatedAt:string;}
export interface Audit {at:string;action:string;lessonId:string;}
const missingBackend=()=>new Error('Chưa cấu hình Supabase hoặc API phát triển.');
export function readAudit():Audit[]{return [];}
export type EngineRequest={id?:string;problem:string;at:string;status?:string};
export async function submitEngineRequest(problem:string){
  if(supabase){const{error}=await supabase.from('engine_requests').insert({problem:problem.trim()});if(error)throw error;return;}
  if(!await hasLocalApi())throw missingBackend();
  const rows=JSON.parse(localStorage.getItem('mohoc-engine-requests')??'[]');
  rows.unshift({problem:problem.trim(),at:new Date().toISOString()});localStorage.setItem('mohoc-engine-requests',JSON.stringify(rows));
}
export async function loadEngineRequests():Promise<EngineRequest[]>{
  if(supabase){const{data,error}=await supabase.from('engine_requests').select('id,problem,status,created_at').order('created_at',{ascending:false}).limit(100);if(error)throw error;return(data??[]).map(r=>({...r,at:r.created_at}));}
  if(!await hasLocalApi())return [];
  try{return JSON.parse(localStorage.getItem('mohoc-engine-requests')??'[]');}catch{return [];}
}
export async function saveDraft(l:Lesson){const errors=validateLesson(l);if(errors.length)throw Error(errors.join('\n'));if(supabase){const{error}=await supabase.rpc('save_lesson_draft',{p_manifest:l});if(error)throw error;return;}
  if(await hasLocalApi()){await localRequest('admin/draft',{manifest:l});return;}
  throw missingBackend();
}
export async function loadLessons():Promise<RecordLesson[]>{
 if(!supabase)return await hasLocalApi()?localRequest('admin/lessons'):Promise.reject(missingBackend());
 const {data,error}=await supabase.from('lessons').select('id,draft,published_version,updated_at,lesson_versions!lesson_versions_lesson_id_fkey(manifest),lesson_assignments(user_id)');if(error)throw error;
 const [drafts,versions]=await Promise.all([supabase.from('lesson_authoring_drafts').select('lesson_id,revision,receipt'),supabase.from('lesson_authoring_revisions').select('lesson_id,version,receipt,manifest_content_hash')]);
 for(const result of [drafts,versions])if(result.error&&!['42P01','PGRST205'].includes(result.error.code))throw result.error;
 return(data??[]).map((r:any)=>{const a=drafts.data?.find(a=>a.lesson_id===r.id);return {id:r.id,draft:r.draft,versions:r.lesson_versions.map((v:any)=>v.manifest),publishedVersion:r.published_version,assignedTo:r.lesson_assignments.map((a:any)=>a.user_id),updatedAt:r.updated_at,
  authoring:a?{receipt:a.receipt as AuthoringReceipt,revision:Number(a.revision)}:undefined,
  authoringVersions:versions.data?.filter(a=>a.lesson_id===r.id).map(a=>({version:a.version,receipt:a.receipt as AuthoringReceipt,manifestContentHash:a.manifest_content_hash}))??[]};});
}
export type AuthoringSaved={draft:Lesson;receipt:AuthoringReceipt;revision:number;publishedVersion:number|null};
export async function saveAuthoring(input:AuthoringProblem,lessonId:string,expectedRevision:number,goLive=false):Promise<AuthoringSaved>{
 const body={input,lessonId,expectedRevision,publish:goLive};
 if(supabase){const{data,error}=await supabase.functions.invoke('authoring',{body});if(error){let message='Không lưu được bài authoring. Kiểm tra kết nối và triển khai chức năng authoring.';try{message=(await (error as any).context.json()).error??message;}catch{}throw Error(message);}return data;}
 if(await hasLocalApi())return localRequest('admin/authoring',body);
 throw missingBackend();
}
export async function publish(l:Lesson){if(!supabase&&await hasLocalApi()){await localRequest("admin/publish",{manifest:l});return;}if(validateLesson(l).length)throw Error('Bài học chưa hợp lệ');await saveDraft(l);if(supabase){const{error}=await supabase.rpc('publish_lesson',{p_lesson_id:l.lessonId});if(error)throw error;return;}throw missingBackend();}
export async function unpublish(id:string){if(!supabase&&await hasLocalApi()){await localRequest("admin/unpublish",{id});return;}if(supabase){const{error}=await supabase.rpc('unpublish_lesson',{p_lesson_id:id});if(error)throw error;return;}throw missingBackend();}
export async function assignLesson(id:string,userId:string){if(!supabase&&await hasLocalApi()){await localRequest("admin/assign",{id,userId});return;}if(!userId.trim())throw Error('Nhập mã học sinh');if(supabase){const{error}=await supabase.from('lesson_assignments').upsert({lesson_id:id,user_id:userId},{onConflict:'lesson_id,user_id',ignoreDuplicates:true});if(error)throw error;return;}throw missingBackend();}
export async function loadCatalog():Promise<Lesson[]>{if(!supabase&&await hasLocalApi())return localRequest("catalog");if(!supabase)throw missingBackend();const{data,error}=await supabase.rpc('published_catalog');if(error)throw error;const lessons=(data??[]).map((r:any)=>r.manifest) as Lesson[];
  if(progressUser!=='local'&&progressUser!=='guest'){
    const progress=await supabase.from('lesson_progress').select('lesson_id,version,snapshot').eq('user_id',progressUser);
    if(progress.error)throw progress.error;
    for(const row of progress.data??[]){const lesson=lessons.find(l=>l.lessonId===row.lesson_id&&l.version===row.version);if(lesson&&(row.snapshot.revision??-1)>=(loadProgress(lesson)?.revision??-1))saveLocalProgress(lesson,row.snapshot);}
  }
  return lessons;}
export function loadProgress(l:Lesson):Snapshot|undefined{try{return JSON.parse(localStorage.getItem(`mohoc-progress-${progressUser}-${l.lessonId}-${l.version}`)??'null')??undefined;}catch{return undefined;}}
export function saveLocalProgress(l:Lesson,s:Snapshot){localStorage.setItem(`mohoc-progress-${progressUser}-${l.lessonId}-${l.version}`,JSON.stringify(s));}
export async function remoteProgress(l:Lesson){if(!supabase)return await hasLocalApi()?localRequest(`progress?user=${progressUser}&lessonId=${l.lessonId}&version=${l.version}`):undefined;const{data,error}=await supabase.from('lesson_progress').select('snapshot').eq('user_id',progressUser).eq('lesson_id',l.lessonId).eq('version',l.version).maybeSingle();if(error)throw error;return data?.snapshot as Snapshot|undefined;}
