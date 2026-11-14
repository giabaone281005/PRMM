import {describe,it,expect} from 'vitest';
import fixtures from '../contracts/generated/cartesian.json';
import vectors from '../contracts/core-engines/cartesian-vectors.json';
import {graphSolution,validateGraphData,graphProject,graphBounds,lineSegment,type GraphData,type GraphMode,graphError} from '../packages/lesson-runtime/cartesian';
import {compileProblem} from '../packages/lesson-authoring/authoring-service';
import {LessonSession,type Interaction} from '../packages/lesson-runtime';
import {validateLesson,type Lesson} from '../packages/lesson-contract';

describe('ENG-01 Cartesian math and integration',()=>{
 for(const v of vectors)it(`math ${v.name}`,()=>{
  const g=v.data as GraphData,mode=v.mode as GraphMode;
  expect(validateGraphData(g,mode).length===0).toBe(v.valid);
  if(v.valid){const r=graphSolution(g,mode);expect(r.kind).toBe(v.solution!.kind);expect(r.points).toHaveLength(v.solution!.points.length);r.points.forEach((p,i)=>{expect(p.x).toBeCloseTo(v.solution!.points[i].x,8);expect(p.y).toBeCloseTo(v.solution!.points[i].y,8);expect(g.a*p.x+g.b*p.y).toBeCloseTo(g.c,8);});}
 });
 for(const f of fixtures)it(`full lesson ${f.manifest.lessonId}`,()=>{
  const {manifest}=compileProblem(f.input,{lessonId:f.manifest.lessonId,version:1});expect(manifest).toEqual(f.manifest);expect(validateLesson(manifest)).toEqual([]);
  const s=new LessonSession(manifest),objects=s.objects;
  for(const [index,events] of f.steps.entries()){
   expect(s.success).toBe(false);expect(s.advance()).toBe(false);
   for(const v of events){expect(s.interact(v.event as Interaction)).toBe(v.accepted);expect(s.success).toBe(v.success);expect(s.snapshot.state).toEqual(v.state);expect(new LessonSession(manifest,s.snapshot).snapshot).toEqual(s.snapshot);}
   expect(s.advance()).toBe(true);expect(s.objects).toBe(objects);expect(s.snapshot.checkpoint).toBe(Math.min(index+1,5));
  }
  expect(s.snapshot.completed).toBe(true);
 });
 it('handles vertical/horizontal lines, swapped/scaled equations and classification invariants',()=>{
  expect(graphSolution({a:1,b:0,c:2,d:0,e:1,f:3,snap:1},'linear_system')).toEqual({kind:'unique',points:[{x:2,y:3}]});
  for(const k of [-3,-1,1,4])expect(graphSolution({a:k,b:2*k,c:3*k,d:2,e:4,f:6,snap:0},'linear_system').kind).toBe('coincident');
  expect(graphSolution({a:0,b:1,c:1,d:0,e:-1,f:2,snap:1},'linear_system').kind).toBe('parallel');
 });
 it('fits target points and clips line segments to deterministic world bounds',()=>{
  for(const f of fixtures){const c=f.manifest.recognition[0].uime.graph as any,b=graphBounds(c,c.mode),r=graphSolution(c,c.mode);for(const p of r.points){const pixel=graphProject(c,c.mode,p);expect(pixel[0]).toBeGreaterThan(30);expect(pixel[0]).toBeLessThan(330);expect(pixel[1]).toBeGreaterThan(30);expect(pixel[1]).toBeLessThan(310);}for(const p of lineSegment(c,c.mode,c.a,c.b,c.c)){expect(p.x).toBeGreaterThanOrEqual(b.xMin-1e-8);expect(p.x).toBeLessThanOrEqual(b.xMax+1e-8);expect(c.a*p.x+c.b*p.y).toBeCloseTo(c.c,8);}}
 });
 it('does not accept only one of two intersections or a stale point confirmation',()=>{
  const f=fixtures.find(f=>f.input.templateId==='math9-line-parabola')!,s=new LessonSession(f.manifest as unknown as Lesson);s.previewCheckpoint(3);
  for(const [name,value] of [['c',2],['x',-2],['y',4],['numerator',1]] as const)s.interact({type:'adjust_parameter',name,value});
  expect(s.success).toBe(false);s.interact({type:'adjust_parameter',name:'width',value:2});s.interact({type:'adjust_parameter',name:'height',value:4});expect(s.success).toBe(false);s.interact({type:'adjust_parameter',name:'numerator',value:1});expect(s.success).toBe(true);
  s.interact({type:'adjust_parameter',name:'c',value:1});expect(s.success).toBe(false);
 });
});
