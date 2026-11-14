import {applyAlgebraInteraction} from './algebra';
import {applyGeometryInteraction} from './geometry';
import {applyGraphInteraction} from './cartesian';
import {applyParabolaInteraction} from './parabola';
import {applyCylinderInteraction} from './cylinder';
import {evaluate,validateLesson,type Lesson,type Point,type SceneObject} from '../lesson-contract';
import {uimeAccept,uimeError} from './uime';
import {isExtraModel,extraDefaults,extraMetrics,extraControls} from './extra-models';
export type Interaction = {type:'drag_vertex';id:string;position:Point}|{type:'drag_angle_token';id:string;position:Point}|{type:'orbit_solid';radians:number}|{type:'select_face';face:number}|{type:'fill_layers';layers:number}|{type:'adjust_parameter';name:string;value:number};
export interface Snapshot {identity:string;checkpoint:number;completed:boolean;points:Record<string,Point>;state:Record<string,number|boolean>;metrics:Record<string,number>;tokens:string[];faces:number[];revision:number;}
export function identity(l:Lesson){return JSON.stringify(l);}
export function triangleAngles(p:Point[]):number[]{
  return p.map((v,i)=>{const a=p[(i+1)%3],b=p[(i+2)%3],x=[a[0]-v[0],a[1]-v[1]],y=[b[0]-v[0],b[1]-v[1]];return Math.acos(Math.max(-1,Math.min(1,(x[0]*y[0]+x[1]*y[1])/(Math.hypot(...x)*Math.hypot(...y)))))*180/Math.PI;});
}
export function triangleArea(p:Point[]){return Math.abs((p[1][0]-p[0][0])*(p[2][1]-p[0][1])-(p[2][0]-p[0][0])*(p[1][1]-p[0][1]))/2;}
export class LessonSession {
  readonly lesson:Lesson; snapshot:Snapshot; objects:SceneObject[]; private listeners=new Set<()=>void>(); private eventListeners=new Set<(event:Interaction)=>void>();
  constructor(l:Lesson,saved?:Snapshot){
    const errors=validateLesson(l);if(errors.length)throw Error(errors.join('; '));this.lesson=structuredClone(l);this.objects=structuredClone(l.scene.objects);
    this.snapshot={identity:identity(l),checkpoint:0,completed:false,points:Object.fromEntries(l.scene.objects.filter(o=>o.kind==='point').map(o=>[o.id,(o as Extract<SceneObject,{kind:'point'}>).position])),state:{...l.scene.initialState},metrics:{validVertexDragCount:0,validVertexDragCountSinceCheckpoint:0,snappedAngleTokens:0,assembledAngleDegrees:0,orbitRadians:0,selectedFaces:0,filledLayers:0,volume:0},tokens:[],faces:[],revision:0};
    const model=this.objects.find(o=>o.kind==='math_model');if(model?.kind==='math_model')Object.assign(this.snapshot.state,{x:0,a:1,b:0,c:0,numerator:1,denominator:4,targetX:2,targetRatio:.5,targetA:1,targetB:0,targetC:0,...extraDefaults},model.parameters,l.scene.initialState);
    Object.assign(this.snapshot.metrics,{parameterChangeCount:0,parameterChangeCountSinceCheckpoint:0,modelError:1000,modelValue:0});
    const restored=!!(saved&&saved.identity===identity(l)&&Number.isInteger(saved.checkpoint)&&saved.checkpoint>=0&&saved.checkpoint<l.checkpoints.length&&Object.values(saved.points).every(p=>p.length===2&&p.every(Number.isFinite)));
    if(restored)this.snapshot=structuredClone(saved!);
    for(let i=0;i<=this.snapshot.checkpoint;i++)this.patch(restored?{addObjects:l.checkpoints[i].scenePatch.addObjects}:l.checkpoints[i].scenePatch);
    this.updateModel();
  }
  get checkpoint(){return this.lesson.checkpoints[this.snapshot.checkpoint];}
  get success(){return evaluate(this.checkpoint.successCriteria,this.snapshot.metrics);}
  subscribe=(f:()=>void)=>{this.listeners.add(f);return()=>{this.listeners.delete(f);};};
  onInteraction=(f:(event:Interaction)=>void)=>{this.eventListeners.add(f);return()=>{this.eventListeners.delete(f);};};
  private emit(){this.snapshot.revision++;this.listeners.forEach(f=>f());}
  private patch(p:Lesson['checkpoints'][number]['scenePatch']){Object.assign(this.snapshot.state,p.setState);for(const o of p.addObjects??[])if(!this.objects.some(x=>x.id===o.id))this.objects.push(structuredClone(o));}
  triangle(){const poly=this.objects.find(o=>o.kind==='polygon');return poly?.kind==='polygon'?poly.vertexIds.map(id=>this.snapshot.points[id]):[];}
  private updateModel(){const model=this.objects.find(o=>o.kind==='math_model');if(model?.kind!=='math_model')return;const s=this.snapshot.state as Record<string,number>,m=this.snapshot.metrics;const u=this.lesson.recognition?.[this.snapshot.checkpoint]?.uime;if(u){m.modelError=uimeError(u,s);m.modelValue=s.x;return;}if(isExtraModel(model.model)){Object.assign(m,extraMetrics(model.model,s));return;}switch(model.model){case'number_line':m.modelValue=s.x;m.modelError=Math.abs(s.x-s.targetX);break;case'fraction_bar':m.modelValue=s.numerator/s.denominator;m.modelError=Math.abs(m.modelValue-s.targetRatio);break;case'linear_balance':m.modelValue=s.a*s.x+s.b;m.modelError=Math.abs(m.modelValue-s.c);break;case'quadratic_graph':m.modelValue=s.a*s.x*s.x+s.b*s.x+s.c;m.modelError=Math.abs(s.a-s.targetA)+Math.abs(s.b-s.targetB)+Math.abs(s.c-s.targetC);}}
  interact(e:Interaction):boolean {
    if(this.snapshot.completed||!this.checkpoint.allowedInteractions.includes(e.type))return false;
    const s=this.snapshot,m=s.metrics;
    const u=this.lesson.recognition?.[s.checkpoint]?.uime;
    if(u&&e.type==='adjust_parameter'){if(!uimeAccept(u,e.name,e.value)||s.state[e.name]===e.value)return false;if(u.algebra)applyAlgebraInteraction(u.algebra,s.state,e.name,e.value);else if(u.geometry)applyGeometryInteraction(u.geometry,s.state,e.name,e.value);else if(u.graph)applyGraphInteraction(u.graph,s.state,e.name,e.value);else if(u.parabola)applyParabolaInteraction(u.parabola,s.state,e.name,e.value);else if(u.cylinder)applyCylinderInteraction(s.state,e.name,e.value);else s.state[e.name]=e.value;m.parameterChangeCount++;m.parameterChangeCountSinceCheckpoint++;m.modelError=uimeError(u,s.state);m.modelValue=Number(s.state.x);this.emit();this.eventListeners.forEach(f=>f(e));return true;}
    if(e.type==='drag_vertex'){
      const obj=this.objects.find(o=>o.id===e.id),old=s.points[e.id];if(obj?.kind!=='point'||!obj.draggable||!old||!e.position.every(Number.isFinite)||Math.hypot(old[0]-e.position[0],old[1]-e.position[1])<3)return false;
      const [x,y]=e.position;if(x<24||x>336||y<24||y>265)return false;
      s.points[e.id]=[x,y];if(triangleArea(this.triangle())<500){s.points[e.id]=old;return false;}
      m.validVertexDragCount++;m.validVertexDragCountSinceCheckpoint++;
    } else if(e.type==='drag_angle_token'){
      const o=this.objects.find(o=>o.id===e.id);if(o?.kind!=='angle_token'||s.tokens.includes(e.id)||e.position[0]<30||e.position[0]>330||e.position[1]<290||e.position[1]>350)return false;
      s.tokens.push(e.id);m.snappedAngleTokens=s.tokens.length;const polygon=this.objects.find(o=>o.kind==='polygon');const angles=triangleAngles(this.triangle());m.assembledAngleDegrees=s.tokens.reduce((sum,id)=>{const t=this.objects.find(o=>o.id===id);return sum+(t?.kind==='angle_token'&&polygon?.kind==='polygon'?angles[polygon.vertexIds.indexOf(t.sourceVertexId)]:0);},0);
    }else if(e.type==='orbit_solid'){
      if(!Number.isFinite(e.radians)||Math.abs(e.radians)>Math.PI)return false;m.orbitRadians+=Math.abs(e.radians);
    }else if(e.type==='select_face'){
      if(!Number.isInteger(e.face)||e.face<0||e.face>5)return false;if(!s.faces.includes(e.face))s.faces.push(e.face);m.selectedFaces=s.faces.length;
    }else if(e.type==='fill_layers'){
      const p=this.objects.find(o=>o.kind==='prism');if(p?.kind!=='prism'||!Number.isInteger(e.layers)||e.layers<0||e.layers>p.dimensions[2])return false;
      m.filledLayers=e.layers;m.volume=p.dimensions[0]*p.dimensions[1]*e.layers;s.state.layers=e.layers;
    }else if(e.type==='adjust_parameter'){
      const model=this.objects.find(o=>o.kind==='math_model');if(model?.kind!=='math_model'||!Number.isFinite(e.value))return false;
      const names=isExtraModel(model.model)?extraControls(model.model).map(c=>c.name):model.model==='number_line'||model.model==='linear_balance'?['x']:model.model==='fraction_bar'?['numerator','denominator']:['a','b','c'];
      if(!names.includes(e.name)||e.value===s.state[e.name])return false;
      if(isExtraModel(model.model)){const c=extraControls(model.model).find(c=>c.name===e.name)!;if(e.value<c.min||e.value>c.max||(c.step===1&&!Number.isInteger(e.value)))return false;}else if(model.model==='fraction_bar'){if(!Number.isInteger(e.value)||e.value<0||e.value>12||(e.name==='denominator'&&e.value<1)||(e.name==='numerator'&&e.value>Number(s.state.denominator))||(e.name==='denominator'&&e.value<Number(s.state.numerator)))return false;}else if(Math.abs(e.value)>10)return false;
      s.state[e.name]=e.value;m.parameterChangeCount++;m.parameterChangeCountSinceCheckpoint++;this.updateModel();
    }
    this.emit();this.eventListeners.forEach(f=>f(e));return true;
  }
  advance(){if(!this.success||this.snapshot.completed)return false;if(this.snapshot.checkpoint===this.lesson.checkpoints.length-1)this.snapshot.completed=true;else{this.snapshot.checkpoint++;this.snapshot.metrics.validVertexDragCountSinceCheckpoint=0;this.snapshot.metrics.parameterChangeCountSinceCheckpoint=0;if(this.lesson.engine.type==='geometry_3d_web'&&this.snapshot.checkpoint===3){this.snapshot.metrics.filledLayers=0;this.snapshot.metrics.volume=0;this.snapshot.state.layers=0;}this.patch(this.checkpoint.scenePatch);this.updateModel();}this.emit();return true;}
  reset(){const fresh=new LessonSession(this.lesson);this.snapshot=fresh.snapshot;this.objects=fresh.objects;this.emit();}
  previewCheckpoint(index:number){if(!Number.isInteger(index)||index<0||index>=this.lesson.checkpoints.length)return;this.snapshot.checkpoint=index;this.snapshot.completed=false;for(let i=0;i<=index;i++)this.patch(this.lesson.checkpoints[i].scenePatch);this.snapshot.metrics.validVertexDragCountSinceCheckpoint=0;this.snapshot.metrics.parameterChangeCountSinceCheckpoint=0;this.updateModel();this.emit();}
}
