import {describe,it,expect} from 'vitest';
import rawFixtures from '../contracts/generated/parabola-coefficient.json';
import {compileParabola} from '../packages/lesson-authoring/parabola-compiler';
import {validateLesson,type Lesson} from '../packages/lesson-contract';
import {LessonSession,type Interaction} from '../packages/lesson-runtime';
import {parabolaIds,parabolaModel,parabolaProject,parabolaValue,parabolaAccept} from '../packages/lesson-runtime/parabola';

const fixtures=rawFixtures as unknown as {input:unknown;manifest:Lesson;steps:{event:Interaction;accepted:boolean;success:boolean}[][]}[];
describe('CP-05 parabola contract and TS/Dart replay vectors (prepared, not run)',()=>{
 for(const f of fixtures)it(`compiles, replays and restores ${f.manifest.lessonId}`,()=>{
  const {manifest}=compileParabola(f.input,{lessonId:f.manifest.lessonId,version:1});expect(manifest).toEqual(f.manifest);expect(validateLesson(manifest)).toEqual([]);
  const session=new LessonSession(manifest),objects=session.objects;
  for(const [i,events] of f.steps.entries()){
   expect(session.success).toBe(false);expect(session.advance()).toBe(false);
   for(const v of events){expect(session.interact(v.event)).toBe(v.accepted);expect(session.success).toBe(v.success);expect(new LessonSession(manifest,session.snapshot).snapshot).toEqual(session.snapshot);}
   expect(session.advance()).toBe(true);expect(session.objects).toBe(objects);
   if(i<5)expect(session.success).toBe(false);
  }
  expect(session.snapshot.completed).toBe(true);
 });
 it('rejects invalid coefficients in the source and both variants',()=>{
  for(const path of ['parameters','practice','assessment'])for(const a of [0,.5,6,-6,NaN,Infinity]){
   const input=structuredClone(fixtures[0].input) as any;(path==='parameters'?input.parameters:input.variants[path]).a=a;
   expect(()=>compileParabola(input,{lessonId:'bad-parabola',version:1})).toThrow();
  }
 });
 it('derives points, comparisons and hit coordinates within the logical viewport',()=>{
  for(const a of [-5,-4,-3,-2,-1,1,2,3,4,5])for(const pointX of [-2,1,2] as const){
   const c={a,pointX,task:'assessment' as const},{point}=parabolaModel(c),position=parabolaProject(c,point.x,point.y);
   expect(point.y).toBe(parabolaValue(a,pointX));expect(position[0]).toBeGreaterThanOrEqual(30);expect(position[0]).toBeLessThanOrEqual(330);
   expect(position[1]-22).toBeGreaterThanOrEqual(30);expect(position[1]+22).toBeLessThanOrEqual(290);
   expect(parabolaAccept(c,'x',0)).toBe(false);expect(parabolaAccept(c,'b',3)).toBe(false);
  }
  expect(parabolaProject({a:1,pointX:2,task:'guided'},2,4)).not.toEqual(parabolaProject({a:5,pointX:2,task:'guided'},2,20));
  expect(parabolaIds.point).toBe('point-target');
 });
 it('hides the final answer in instructions/hints and requires a fresh point confirmation',()=>{
  for(const f of fixtures){
   const lesson=f.manifest,last=lesson.recognition![5],s=new LessonSession(lesson);s.previewCheckpoint(5);
   const c=last.uime!.parabola!;expect(last.question).not.toContain(`a = ${c.a}`);expect(last.hint).not.toContain(`a = ${c.a}`);
   s.interact({type:'adjust_parameter',name:'x',value:c.a});expect(s.success).toBe(false);
   s.interact({type:'adjust_parameter',name:'y',value:0});expect(s.success).toBe(true);
   s.interact({type:'adjust_parameter',name:'x',value:-c.a});expect(s.success).toBe(false);
   s.interact({type:'adjust_parameter',name:'x',value:c.a});expect(s.success).toBe(false);
  }
 });
});
