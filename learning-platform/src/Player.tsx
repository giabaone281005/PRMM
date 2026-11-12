import {useEffect,useReducer,useState} from 'react';
import {LessonSession,type Snapshot} from '../packages/lesson-runtime';
import type {JournalEvent} from '../packages/lesson-runtime/replay';
import type {Lesson} from '../packages/lesson-contract';
import {Scene2D} from './Scene2D';
import {Scene3D} from './Scene3D';
import {MathExplorer} from './MathExplorer';
import {loadProgress,saveLocalProgress,remoteProgress,supabase,hasLocalApi,localRequest} from './store';
type Saved=Snapshot&{journal?:JournalEvent[]};
export function Player(props:{lesson:Lesson;onExit:()=>void;preview?:boolean}){
  const[loaded,setLoaded]=useState(!!props.preview),[saved,setSaved]=useState<Saved|undefined>(()=>props.preview?undefined:loadProgress(props.lesson));
  useEffect(()=>{if(props.preview)return;let cancelled=false;remoteProgress(props.lesson).then(s=>{if(cancelled)return;setSaved(local=>(s?.revision??-1)>(local?.revision??-1)?s:local);}).catch(()=>{}).finally(()=>{if(!cancelled)setLoaded(true);});return()=>{cancelled=true;};},[props.lesson,props.preview]);
  if(!loaded)return <main className="auth">Đang khôi phục tiến độ...</main>;
  return <SessionPlayer {...props} saved={saved}/>;
}
function SessionPlayer({lesson,onExit,preview=false,saved}:{lesson:Lesson;onExit:()=>void;preview?:boolean;saved?:Saved}){
  const[session]=useState(()=>new LessonSession(lesson,saved)),[journal]=useState<JournalEvent[]>(()=>saved?.identity===JSON.stringify(lesson)?saved.journal??[]:[]),[,update]=useReducer(n=>n+1,0),[hint,setHint]=useState(false),[syncError,setSyncError]=useState('');
  function persist(){if(!preview)saveLocalProgress(lesson,{...session.snapshot,journal} as Saved);}
  async function sync(){if(preview)return;if(!supabase){if(await hasLocalApi()){try{await localRequest('progress',{user:'local',lessonId:lesson.lessonId,version:lesson.version,events:journal});setSyncError('');}catch(e){setSyncError((e as Error).message);}}return;}const{error}=await supabase.functions.invoke('progress',{body:{lessonId:lesson.lessonId,version:lesson.version,events:journal}});setSyncError(error?'Chưa đồng bộ; tiến độ đã lưu trên thiết bị.':'');}
  useEffect(()=>{const unsub=session.subscribe(()=>{persist();update();});const events=session.onInteraction(event=>{journal.push({kind:'interaction',event});persist();});return()=>{unsub();events();};},[session,lesson,preview]);
  const s=session.snapshot,cp=session.checkpoint;
  return <div className={'player '+(preview?'preview':'')}><header className="player-top"><button className="icon-btn" onClick={onExit} aria-label="Thoát bài học">✕</button><span>{lesson.title}</span><span className="step-count">{s.checkpoint+1} / {lesson.checkpoints.length}</span></header><div className="progress-track"><div style={{width:`${(s.checkpoint+(s.completed?1:0))/lesson.checkpoints.length*100}%`}}/></div><div className="player-body"><div className="eyebrow">{preview?'BẢN XEM TRƯỚC':'HỌC QUA KHÁM PHÁ'} · LỚP {lesson.grade}</div><h1>{s.completed?'Bạn đã tự mình khám phá!':cp.instruction}</h1><div className="scene-wrap" data-scene-id={lesson.scene.sceneId}>{lesson.engine.type==='geometry_2d'?<Scene2D session={session}/>:lesson.engine.type==='geometry_3d_web'?<Scene3D session={session}/>:<MathExplorer session={session}/>}</div><div className="player-tools"><button onClick={()=>setHint(!hint)}>☼ Gợi ý</button><button onClick={()=>{journal.length=0;session.reset();setHint(false);}}>↺ Bắt đầu lại</button></div>{hint&&<p className="hint">{cp.hints[0]}</p>}<div className={'feedback '+(session.success?'success':'')} role="status">{s.completed?'✓ Đã hoàn thành bài học':session.success?'✓ '+cp.feedback.success:'Thử thao tác trên hình để tiếp tục.'}</div>{syncError&&<button onClick={sync}>{syncError} Thử lại</button>}<button className="primary continue" disabled={!session.success&&!s.completed} onClick={()=>{if(s.completed)onExit();else{if(session.advance()){journal.push({kind:'advance'});persist();sync();}setHint(false);}}}>{s.completed?'Trở về khám phá':s.checkpoint===lesson.checkpoints.length-1?'Hoàn thành bài học':'Tiếp tục'} <span>→</span></button></div></div>;
}
