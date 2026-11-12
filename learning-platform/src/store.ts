import {createClient} from '@supabase/supabase-js';
import {fixtures} from '../packages/lesson-authoring';
import {validateLesson,type Lesson} from '../packages/lesson-contract';
import type {Snapshot} from '../packages/lesson-runtime';
const env=(import.meta as unknown as {env:Record<string,string>}).env;
export const supabase=env.VITE_SUPABASE_URL&&env.VITE_SUPABASE_PUBLISHABLE_KEY?createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY):null;
let progressUser='local';
export function setProgressUser(id:string){progressUser=id;}
let localCheck:Promise<boolean>|undefined;
export function hasLocalApi(){return localCheck??=fetch('/api/health').then(async r=>r.ok&&(await r.json()).mode==='local').catch(()=>false);}
export async function localRequest(path:string,body?:unknown){const r=await fetch('/api/'+path,body===undefined?{cache:'no-store'}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.error??'Local API failed');return data;}
export interface RecordLesson {id:string;draft:Lesson;versions:Lesson[];publishedVersion:number|null;assignedTo:string[];updatedAt:string;}
export interface Audit {at:string;action:string;lessonId:string;}
const key='mohoc-cms-v1';
function seed():RecordLesson[]{return fixtures.map(l=>({id:l.lessonId,draft:structuredClone(l),versions:[{...structuredClone(l),status:'published'}],publishedVersion:1,assignedTo:[],updatedAt:new Date().toISOString()}));}
export function readLessons():RecordLesson[]{try{const raw=localStorage.getItem(key);if(raw)return JSON.parse(raw);}catch{/* Keep corrupt data until user explicitly saves. */}return seed();}
function write(rows:RecordLesson[],action:string,id:string){localStorage.setItem(key,JSON.stringify(rows));const log=readAudit();log.unshift({at:new Date().toISOString(),action,lessonId:id});localStorage.setItem('mohoc-audit',JSON.stringify(log.slice(0,500)));}
export function readAudit():Audit[]{try{return JSON.parse(localStorage.getItem('mohoc-audit')??'[]');}catch{return[];}}
export async function saveDraft(l:Lesson){const errors=validateLesson(l);if(errors.length)throw Error(errors.join('\n'));if(supabase){const{error}=await supabase.rpc('save_lesson_draft',{p_manifest:l});if(error)throw error;return;}
  if(await hasLocalApi()){await localRequest('admin/draft',{manifest:l});return;}
  const rows=readLessons(),r=rows.find(r=>r.id===l.lessonId);if(r){r.draft=structuredClone(l);r.updatedAt=new Date().toISOString();}else rows.unshift({id:l.lessonId,draft:structuredClone(l),versions:[],publishedVersion:null,assignedTo:[],updatedAt:new Date().toISOString()});write(rows,'save_draft',l.lessonId);
}
export async function loadLessons():Promise<RecordLesson[]>{if(!supabase)return await hasLocalApi()?localRequest('admin/lessons'):readLessons();const{data,error}=await supabase.from('lessons').select('id,draft,published_version,updated_at,lesson_versions(manifest),lesson_assignments(user_id)');if(error)throw error;return(data??[]).map((r:any)=>({id:r.id,draft:r.draft,versions:r.lesson_versions.map((v:any)=>v.manifest),publishedVersion:r.published_version,assignedTo:r.lesson_assignments.map((a:any)=>a.user_id),updatedAt:r.updated_at}));}
export async function publish(l:Lesson){if(!supabase&&await hasLocalApi()){await localRequest("admin/publish",{manifest:l});return;}if(validateLesson(l).length)throw Error('Bài học chưa hợp lệ');await saveDraft(l);if(supabase){const{error}=await supabase.rpc('publish_lesson',{p_lesson_id:l.lessonId});if(error)throw error;return;}const rows=readLessons(),r=rows.find(r=>r.id===l.lessonId)!;const version=Math.max(0,...r.versions.map(v=>v.version))+1;const manifest={...structuredClone(l),version,status:'published' as const};r.versions.push(manifest);r.publishedVersion=version;r.draft={...structuredClone(l),version:version+1,status:'draft'};write(rows,'publish',l.lessonId);}
export async function unpublish(id:string){if(!supabase&&await hasLocalApi()){await localRequest("admin/unpublish",{id});return;}if(supabase){const{error}=await supabase.rpc('unpublish_lesson',{p_lesson_id:id});if(error)throw error;return;}const rows=readLessons();rows.find(r=>r.id===id)!.publishedVersion=null;write(rows,'unpublish',id);}
export async function assignLesson(id:string,userId:string){if(!supabase&&await hasLocalApi()){await localRequest("admin/assign",{id,userId});return;}if(!userId.trim())throw Error('Nhập mã học sinh');if(supabase){const{error}=await supabase.from('lesson_assignments').upsert({lesson_id:id,user_id:userId});if(error)throw error;return;}const rows=readLessons(),r=rows.find(r=>r.id===id)!;if(!r.assignedTo.includes(userId))r.assignedTo.push(userId);write(rows,'assign',id);}
export async function loadCatalog():Promise<Lesson[]>{if(!supabase&&await hasLocalApi())return localRequest("catalog");if(!supabase)return readLessons().flatMap(r=>r.versions.filter(v=>v.version===r.publishedVersion));const{data,error}=await supabase.rpc('published_catalog');if(error)throw error;return(data??[]).map((r:any)=>r.manifest);}
export function loadProgress(l:Lesson):Snapshot|undefined{try{return JSON.parse(localStorage.getItem(`mohoc-progress-${progressUser}-${l.lessonId}-${l.version}`)??'null')??undefined;}catch{return undefined;}}
export function saveLocalProgress(l:Lesson,s:Snapshot){localStorage.setItem(`mohoc-progress-${progressUser}-${l.lessonId}-${l.version}`,JSON.stringify(s));}
export async function remoteProgress(l:Lesson){if(!supabase)return await hasLocalApi()?localRequest(`progress?user=${progressUser}&lessonId=${l.lessonId}&version=${l.version}`):undefined;const{data,error}=await supabase.from('lesson_progress').select('snapshot').eq('lesson_id',l.lessonId).eq('version',l.version).maybeSingle();if(error)throw error;return data?.snapshot as Snapshot|undefined;}
