import {describe,it,expect} from 'vitest';
import fixtures from '../contracts/generated/geometry.json';
import vectors from '../contracts/core-engines/geometry-vectors.json';
import {geometryModel,geometryTargetIndex,geometrySelectable,geometryProject,geometryUnproject,validateGeometry,geometrySolutionEvents,type GeometryConfig} from '../packages/lesson-runtime/geometry';
import {compileProblem} from '../packages/lesson-authoring/authoring-service';
import {validateAuthoring} from '../packages/lesson-authoring/template-registry';
import {LessonSession,type Interaction} from '../packages/lesson-runtime';
describe('ENG-02 geometry math, contracts and persistence',()=>{
 for(const v of vectors)it(`math/guard ${v.name}`,()=>{
  const g=v.config as unknown as GeometryConfig;expect(validateGeometry(g).length===0).toBe(v.valid);
  if(v.valid){const m=geometryModel(g);expect(m.value).toBeCloseTo(v.value!,8);expect(geometryTargetIndex(g)).toBe(v.targetIndex);expect(geometrySelectable(g).length).toBe(v.selectionCount);for(const [key,value] of Object.entries(v.facts!))expect(m.facts[key]).toBeCloseTo(Number(value),8);const seen=new Set<string>();for(const node of m.construction){expect(node.parents.every(id=>seen.has(id))).toBe(true);seen.add(node.id);}expect(m.constraints.lengths).toBe('locked');}
 });
 for(const f of fixtures)it(`six steps, restore and immutable flow ${f.manifest.lessonId}`,()=>{
  const {manifest}=compileProblem(f.input,{lessonId:f.manifest.lessonId,version:1});expect(manifest).toEqual(f.manifest);const s=new LessonSession(manifest),objects=s.objects;
  for(const events of f.steps){expect(s.success).toBe(false);expect(s.advance()).toBe(false);for(const v of events){expect(s.interact(v.event as Interaction)).toBe(v.accepted);expect(s.success).toBe(v.success);expect(s.snapshot.state).toEqual(v.state);expect(new LessonSession(manifest,s.snapshot).snapshot).toEqual(s.snapshot);}expect(s.advance()).toBe(true);expect(s.objects).toBe(objects);}expect(s.snapshot.completed).toBe(true);
 });
 it('preserves right angles/lengths and side roles under constrained dragging, rotation and scale',()=>{
  for(const f of fixtures.filter(f=>f.input.mode==='right_triangle'))for(const angle of [-175,-90,25,135]){
   const g=f.manifest.recognition[3].uime.geometry as GeometryConfig,m=geometryModel(g,{x:angle}),[A,B,C]=m.objects.slice(0,3).map(o=>o.points[0]),u={x:B.x-A.x,y:B.y-A.y},v={x:C.x-A.x,y:C.y-A.y};
   expect(u.x*v.x+u.y*v.y).toBeCloseTo(0,8);expect(Math.hypot(u.x,u.y)).toBeCloseTo(Number(g.data.legA),8);expect(Math.hypot(v.x,v.y)).toBeCloseTo(Number(g.data.legB),8);
   for(const zoom of [.6,1])for(const o of m.objects){const pt=o.points[0],pixel=geometryProject(m,pt,zoom),back=geometryUnproject(m,...pixel,zoom);expect(back.x).toBeCloseTo(pt.x,8);expect(back.y).toBeCloseTo(pt.y,8);expect(pixel.every(n=>n>=20&&n<=340)).toBe(true);}
   expect(geometrySelectable(g)[geometryTargetIndex(g)].id).toBe(m.targetId);
  }
 });
 it('constructs real intersections, incircle/circumcircle and tangent orthogonality',()=>{
  for(const f of fixtures){const g=f.manifest.recognition[0].uime.geometry as GeometryConfig,m=geometryModel(g),get=(id:string)=>m.objects.find(o=>o.id===id)!;
   if(g.mode==='line_circle'||g.mode==='two_circles')for(const o of m.objects.filter(o=>o.id.startsWith('intersection-'))){const P=o.points[0],r=Number(g.data.radius);expect(Math.hypot(P.x,P.y)).toBeCloseTo(r,8);if(g.mode==='two_circles')expect(Math.hypot(P.x-Number(g.data.distance),P.y)).toBeCloseTo(Number(g.data.radius2),8);else expect(P.x*Math.cos(Number(g.data.normalAngle)*Math.PI/180)+P.y*Math.sin(Number(g.data.normalAngle)*Math.PI/180)).toBeCloseTo(Number(g.data.distance),8);}
   if(g.mode==='line_circle'){const [line,contact]=m.layers[0].objects,[A,B]=line.points,T=contact.points[0];expect(T.x*(B.x-A.x)+T.y*(B.y-A.y)).toBeCloseTo(0,8);expect(Math.hypot(T.x,T.y)).toBeCloseTo(Number(g.data.radius),8);}
   if(g.mode==='triangle_circles'){
    const circle=m.layers.find(l=>l.id==='circumcircle')!.objects[0],O=circle.points[0];for(const id of ['vertex-A','vertex-B','vertex-C']){const V=get(id).points[0];expect(Math.hypot(V.x-O.x,V.y-O.y)).toBeCloseTo(circle.radius!,8);}
    const I=m.layers.find(l=>l.id==='incircle')!.objects[0];for(const id of ['side-AB','side-AC','side-BC']){const [A,B]=get(id).points,C=I.points[0];expect(Math.abs((B.x-A.x)*(A.y-C.y)-(A.x-C.x)*(B.y-A.y))/Math.hypot(B.x-A.x,B.y-A.y)).toBeCloseTo(I.radius!,8);}
   }
  }
 });
 it('keeps inscribed angle constant while its vertex moves on the major arc',()=>{
  const g=fixtures.find(f=>f.input.mode==='circle_angles')!.manifest.recognition[0].uime.geometry as GeometryConfig;
  for(const angle of [Number(g.data.sweep)+5,180,240,355]){const m=geometryModel(g,{a:angle}),point=(id:string)=>m.objects.find(o=>o.id===id)!.points[0],A=point('arc-A'),B=point('arc-B'),V=point('inscribed-V'),u={x:A.x-V.x,y:A.y-V.y},v={x:B.x-V.x,y:B.y-V.y},actual=Math.acos((u.x*v.x+u.y*v.y)/(Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y)))*180/Math.PI;expect(actual).toBeCloseTo(Number(g.data.sweep)/2,7);}
 });
 it('requires the selected construction layer, rejects stale answers and preserves transforms on layer toggles',()=>{
  const f=fixtures.find(f=>f.input.mode==='triangle_circles')!,s=new LessonSession(f.manifest as any);s.previewCheckpoint(3);const g=s.lesson.recognition![3].uime!.geometry!;
  for(const event of geometrySolutionEvents(g))s.interact(event);expect(s.success).toBe(true);s.interact({type:'adjust_parameter',name:'c',value:0});expect(s.success).toBe(false);
  s.interact({type:'adjust_parameter',name:'x',value:50});s.interact({type:'adjust_parameter',name:'y',value:.7});s.interact({type:'adjust_parameter',name:'c',value:4});expect(s.snapshot.state.x).toBe(50);expect(s.snapshot.state.y).toBe(.7);
  s.interact({type:'adjust_parameter',name:'numerator',value:99});expect(s.success).toBe(false);expect(s.snapshot.state.width).toBe(0);
 });
 it('blocks arbitrary constraints, independent answers, wrong code and ambiguous triangle data at author boundary',()=>{
  for(const mutate of [(p:any)=>p.parameters.constraints={free:true},(p:any)=>p.parameters.answer=2,(p:any)=>p.parameters.sideA=2,(p:any)=>p.curriculumCode='M9-GEO-07']){const input=structuredClone(fixtures[0].input);mutate(input);expect(validateAuthoring(input).length).toBeGreaterThan(0);}
 });
});
