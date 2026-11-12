import {describe,it,expect} from 'vitest';
import {fixtures,createDraft} from '../packages/lesson-authoring';
import {evaluate,routeEngine,validateLesson,capabilities} from '../packages/lesson-contract';
import {LessonSession,triangleAngles,triangleArea} from '../packages/lesson-runtime';
import vectors from '../contracts/evaluation-vectors.json' with {type:'json'};
describe('canonical contract',()=>{
  it.each(fixtures)('accepts $lessonId',l=>expect(validateLesson(l)).toEqual([]));
  it('rejects unknown fields, executable operators, capabilities, references and bad tolerance',()=>{
    for(const mutation of [(l:any)=>l.code='alert(1)',(l:any)=>l.engine.requiredCapabilities.push('eval'),(l:any)=>l.checkpoints[0].successCriteria={op:'eval',source:'return true'},(l:any)=>l.scene.objects[3].vertexIds[0]='missing',(l:any)=>l.checkpoints[0].successCriteria={op:'approx',path:'metrics.volume',value:1,tolerance:-1},(l:any)=>l.checkpoints[0].order=2,(l:any)=>l.completion.requiredCheckpointIds=['missing']]){const l=structuredClone(fixtures[0]);mutation(l);expect(validateLesson(l).length).toBeGreaterThan(0);}
  });
  it.each(vectors)('shared evaluation vector %#',v=>expect(evaluate(v.criterion as any,v.metrics as unknown as Record<string,number>)).toBe(v.expected));
  it('routes only implemented engines with supported mobile capabilities',()=>{expect(routeEngine(['drag_vertex']).engine).toBe('geometry_2d');expect(routeEngine(['orbit_solid']).engine).toBe('geometry_3d_web');expect(routeEngine(['orbit_solid'],capabilities.slice(0,5)).engine).toBeNull();expect(routeEngine(['fraction_split']).engine).toBeNull();expect(routeEngine(['plot_quadratic']).engine).toBeNull();expect(()=>createDraft(6,'Phân số','triangle')).toThrow();});
});
describe('persistent triangle',()=>{
  it('conserves 180 degrees across valid geometry',()=>{for(let x=70;x<300;x+=20){const points:[[number,number],[number,number],[number,number]]=[[x,60],[60,240],[300,240]];expect(triangleAngles(points).reduce((a,b)=>a+b,0)).toBeCloseTo(180,8);expect(triangleArea(points)).toBeGreaterThan(500);}});
  it('blocks taps, invalid hit identities, degeneracy, skipped checkpoints and restores matching version',()=>{
    const s=new LessonSession(fixtures[0]);expect(s.advance()).toBe(false);expect(s.interact({type:'drag_vertex',id:'unknown',position:[200,70]})).toBe(false);expect(s.interact({type:'drag_vertex',id:'A',position:[170,65]})).toBe(false);expect(s.interact({type:'drag_vertex',id:'A',position:[170,240]})).toBe(false);expect(s.success).toBe(false);
    const objects=s.objects;s.interact({type:'drag_vertex',id:'A',position:[180,75]});expect(s.success).toBe(true);s.advance();expect(s.objects).toBe(objects);expect(s.snapshot.points.A).toEqual([180,75]);expect(s.success).toBe(false);s.interact({type:'drag_vertex',id:'A',position:[190,80]});s.advance();expect(s.interact({type:'drag_angle_token',id:'angle-token-0',position:[100,100]})).toBe(false);
    for(let i=0;i<3;i++)s.interact({type:'drag_angle_token',id:`angle-token-${i}`,position:[180,320]});expect(s.success).toBe(true);expect(s.interact({type:'drag_angle_token',id:'angle-token-0',position:[180,320]})).toBe(false);s.advance();expect(s.snapshot.completed).toBe(true);
    const restored=new LessonSession(fixtures[0],s.snapshot);expect(restored.snapshot.completed).toBe(true);const next=structuredClone(fixtures[0]);next.version++;expect(new LessonSession(next,s.snapshot).snapshot.completed).toBe(false);
  });
  it('keeps preview session isolated',()=>{const a=new LessonSession(fixtures[0]),b=new LessonSession(fixtures[0]);a.interact({type:'drag_vertex',id:'A',position:[200,60]});expect(b.snapshot.metrics.validVertexDragCount).toBe(0);});
});
describe('solid',()=>{it('requires orbit, raycast face event and actual layers; resets local step metrics',()=>{const s=new LessonSession(fixtures[1]),objects=s.objects;expect(s.interact({type:'fill_layers',layers:3})).toBe(false);s.interact({type:'orbit_solid',radians:.4});expect(s.advance()).toBe(true);expect(s.interact({type:'select_face',face:99})).toBe(false);s.interact({type:'select_face',face:1});s.advance();s.interact({type:'fill_layers',layers:3});expect(s.success).toBe(true);s.advance();expect(s.objects).toBe(objects);expect(s.success).toBe(false);s.interact({type:'fill_layers',layers:3});expect(s.snapshot.metrics.volume).toBe(36);s.advance();expect(s.snapshot.completed).toBe(true);});});

