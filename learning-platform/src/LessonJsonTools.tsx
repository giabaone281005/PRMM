import {useState} from 'react';
import type {Lesson} from '../packages/lesson-contract';
import {aiBundle,importPilot} from '../packages/lesson-authoring/curriculum-pilot';
import sixSchema from '../contracts/lesson-six.schema.json';
function download(name:string,data:unknown){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
export function LessonJsonTools({lesson,onImport}:{lesson?:Lesson;onImport:(l:Lesson)=>void}){
 const[error,setError]=useState('');
 return <div className="blueprint-toolbar"><button onClick={()=>download('lesson-six.schema.json',sixSchema)}>Tải schema manifest legacy</button>{lesson&&<><button onClick={()=>download(lesson.lessonId+'.lesson.json',lesson)}>Tải manifest legacy</button>{lesson.checkpoints.length===6&&<button onClick={()=>download(lesson.lessonId+'.ai-bundle.json',aiBundle(lesson))}>Tải bộ AI legacy (full manifest)</button>}</>}<label className="file-button">Nạp manifest legacy<input aria-label="Nạp JSON bài học" type="file" accept=".json,application/json" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>1000000)throw Error('File tối đa 1 MB.');onImport(importPilot(await file.text()));setError('');}catch(e){setError((e as Error).message);}e.target.value='';}}/></label>{error&&<p role="alert">{error}</p>}</div>;
}
