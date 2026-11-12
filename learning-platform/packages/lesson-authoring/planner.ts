import {createDraft} from './index';
import {validateLesson,type Lesson} from '../lesson-contract';
export interface PlanInput{grade:number;objective:string;template:'triangle'|'solid';}
export function parsePlanInput(input:unknown):PlanInput{
  if(!input||typeof input!=='object')throw Error('Invalid planner input');const p=input as Record<string,unknown>;
  if(![7,8].includes(p.grade as number)||!['triangle','solid'].includes(p.template as string)||typeof p.objective!=='string'||p.objective.trim().length<3||p.objective.length>1000)throw Error('Chỉ hỗ trợ template tam giác lớp 7 và khối hộp lớp 8; mục tiêu dài 3–1000 ký tự.');
  return p as unknown as PlanInput;
}
// Provider returns bounded instructional text only. Geometry/criteria stay template-owned.
export async function planLesson(input:PlanInput,provider?: (input:PlanInput,template:Lesson)=>Promise<unknown>):Promise<{manifest:Lesson;mode:'template'|'ai';reviewRequired:true}>{
  const draft=createDraft(input.grade,input.objective,input.template);
  if(!provider)return {manifest:draft,mode:'template',reviewRequired:true};
  const result=await provider(input,structuredClone(draft));
  if(!result||typeof result!=='object')throw Error('Provider returned invalid output');const r=result as Record<string,unknown>;
  if(Object.keys(r).some(k=>!['title','instructions','hints'].includes(k)))throw Error('Provider attempted unsupported output');
  if(typeof r.title!=='string'||r.title.length<3||r.title.length>200||!Array.isArray(r.instructions)||r.instructions.length!==draft.checkpoints.length||!Array.isArray(r.hints)||r.hints.length!==draft.checkpoints.length)throw Error('Provider output does not match template');
  if([...r.instructions,...r.hints].some(t=>typeof t!=='string'||t.length<3||t.length>2000))throw Error('Invalid instructional text');
  draft.title=r.title;draft.checkpoints.forEach((c,i)=>{c.instruction=(r.instructions as string[])[i];c.hints=[(r.hints as string[])[i]];});
  const errors=validateLesson(draft);if(errors.length)throw Error(errors.join('; '));return{manifest:draft,mode:'ai',reviewRequired:true};
}
