import {createRoot} from 'react-dom/client';
import {Component,useEffect,useReducer,type ReactNode} from 'react';
import {LessonSession} from '../packages/lesson-runtime';
import {Scene3D} from './Scene3D';
import {RecognitionScene} from './RecognitionScene';
import {validateLesson} from '../packages/lesson-contract';
declare global { interface Window {LessonChannel?:{postMessage:(s:string)=>void};lessonBridge:(s:string)=>void;} }
const root=createRoot(document.getElementById('root')!);let session:LessonSession|undefined,sessionId='',seen=new Set<string>(),paused=false;
function emit(type:string,payload:unknown,requestId=crypto.randomUUID()){window.LessonChannel?.postMessage(JSON.stringify({protocolVersion:'1.0.0',sessionId,requestId,type,payload}));}
class RuntimeBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){emit('RENDER_ERROR',{message:'Runtime rendering failed'});}
 render(){return this.state.failed?<p role="alert">Không hiển thị được phần tương tác. Chạm Thử lại trên ứng dụng.</p>:this.props.children;}
}
window.addEventListener('error',()=>emit('RENDER_ERROR',{message:'Runtime script failed'}));
window.addEventListener('unhandledrejection',()=>emit('RENDER_ERROR',{message:'Runtime operation failed'}));
function View({session}:{session:LessonSession}){const[,render]=useReducer(n=>n+1,0);useEffect(()=>session.subscribe(render),[session]);return session.lesson.recognition?<RecognitionScene session={session}/>:<Scene3D session={session}/>;}
window.lessonBridge=(raw:string)=>{
  if(raw.length>131072)return;let m:any;try{m=JSON.parse(raw);}catch{return;}
  if(m.protocolVersion!=='1.0.0'||typeof m.requestId!=='string'||typeof m.sessionId!=='string'||!m.payload)return;
  if(m.type==='INIT'&&!session){sessionId=m.sessionId;try{if(validateLesson(m.payload.manifest).length){emit('RENDER_ERROR',{message:'Invalid manifest'},m.requestId);return;}session=new LessonSession(m.payload.manifest,m.payload.snapshot);session.onInteraction(e=>{if(!paused)emit('INTERACTION',{event:e});});root.render(<RuntimeBoundary><View session={session}/></RuntimeBoundary>);}catch{emit('RENDER_ERROR',{message:'Runtime initialization failed'},m.requestId);return;}}
  else if(!session||m.sessionId!==sessionId)return;
  else if(seen.has(m.requestId)){emit('ACK',{},m.requestId);return;}
  else if(m.type==='SET_CHECKPOINT'){if(m.payload.checkpointId!==session.checkpoint.id){if(!session.advance()||session.checkpoint.id!==m.payload.checkpointId){emit('RENDER_ERROR',{message:'Invalid transition'},m.requestId);return;}}}
  else if(m.type==='REQUEST_SNAPSHOT')emit('SNAPSHOT',{snapshot:session.snapshot},m.requestId);
  else if(m.type==='RESET')session.reset();
  else if(m.type==='PAUSE'){paused=true;document.body.style.pointerEvents='none';}
  else if(m.type==='RESUME'){paused=false;document.body.style.pointerEvents='auto';}
  else if(m.type==='DISPOSE'){root.unmount();session=undefined;}
  else if(m.type!=='INIT')return;
  seen.add(m.requestId);if(seen.size>512)seen.delete(seen.values().next().value!);emit('ACK',{},m.requestId);
};
emit('READY',{rendererVersion:'1.0.0'});
