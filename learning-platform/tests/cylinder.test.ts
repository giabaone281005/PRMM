import {expect,it,describe} from 'vitest';
import * as THREE from 'three';
import fixtures from '../contracts/generated/cylinder-recognition.json';
import {compileCylinder} from '../packages/lesson-authoring/cylinder-compiler';
import {LessonSession,type Interaction} from '../packages/lesson-runtime';
import {validateLesson} from '../packages/lesson-contract';
import {cylinderGeometry} from '../packages/lesson-runtime/cylinder';
import {cylinderVisual,cylinderCamera,disposeCylinder,pickCylinder} from '../src/cylinder-visual';

describe('CP-04 data-driven cylinder',()=>{
 for(const fixture of fixtures)it(`compiles and replays ${fixture.manifest.lessonId}`,()=>{
   const {manifest}=compileCylinder(fixture.input,{lessonId:fixture.manifest.lessonId,version:1});
   expect(manifest).toEqual(fixture.manifest);expect(validateLesson(manifest)).toEqual([]);
   const s=new LessonSession(manifest),objects=s.objects;
   for(const [i,events] of fixture.steps.entries()) {
     expect(s.success).toBe(false);expect(s.advance()).toBe(false);
     const u=manifest.recognition![i].uime!,c=u.cylinder!;
     const data=i<4?fixture.input.parameters:i===4?fixture.input.variants.practice:fixture.input.variants.assessment;
     expect(c.radius).toBe(data.radius);expect(c.height).toBe(data.height);
     expect(s.checkpoint.instruction).toContain(`r = ${data.radius} ${fixture.input.parameters.unit}`);
     expect(s.checkpoint.instruction).toContain(`h = ${data.height} ${fixture.input.parameters.unit}`);
     for(const vector of events) {
       expect(s.interact(vector.event as Interaction)).toBe(vector.accepted);
       expect(s.success).toBe(vector.success);
       for(const [k,v] of Object.entries(vector.state))expect(Number(s.snapshot.state[k])).toBeCloseTo(Number(v),10);
       expect(new LessonSession(manifest,s.snapshot).success).toBe(s.success);
     }
     const orientation=[s.snapshot.state.a,s.snapshot.state.b];expect(s.advance()).toBe(true);
     expect([s.snapshot.state.a,s.snapshot.state.b]).toEqual(orientation);expect(s.objects).toBe(objects);
   }
   expect(s.snapshot.completed).toBe(true);
 });
 it('does not let input set answers or derived progress',()=>{
   const s=new LessonSession(fixtures[0].manifest as any);
   for(const name of ['c','y','height','radius'])expect(s.interact({type:'adjust_parameter',name,value:3})).toBe(false);
   expect(s.interact({type:'adjust_parameter',name:'width',value:1.5})).toBe(false);
   const input=structuredClone(fixtures[0].input) as any;input.parameters.answer=4;expect(()=>compileCylinder(input,{lessonId:'bad',version:1})).toThrow();
 });
 it('preserves aspect ratio for every accepted boundary',()=>{
   for(const [radius,height] of [[.1,1],[100,10],[4,7],[2,16],[8,2]]) {
     const g=cylinderGeometry({radius,height,unit:'cm',task:'radius'});
     expect(g.height/g.radius).toBeCloseTo(height/radius,10);
     expect(Math.max(2*g.radius*1.5,g.height)).toBeCloseTo(2.6,10);
   }
 });
 it('raycasts semantic measurement parts after dimension and orientation changes',()=>{
   for(const f of fixtures)for(const [yaw,pitch] of [[.4,.3],[-.7,-.3],[1.2,.6]]) {
     const rig=cylinderVisual(f.manifest.recognition[0].uime.cylinder as any),camera=cylinderCamera();
     rig.group.rotation.set(pitch,yaw,0);rig.group.updateMatrixWorld(true);
     for(const id of [0,1]) {
       const mesh=rig.parts.find(m=>m.userData.part===id)!;
       const center=mesh.getWorldPosition(new THREE.Vector3()).project(camera),ray=new THREE.Raycaster();
       ray.setFromCamera(new THREE.Vector2(center.x,center.y),camera);expect(pickCylinder(rig.parts,ray)).toBe(id);
     }
     disposeCylinder(rig.group);
   }
 });
 it('keeps assessment hints and visible tokens free of the answer mapping',()=>{
   for(const f of fixtures) {
     const task=f.manifest.recognition[5];expect(task.uime.tokens).toEqual(['A','B','C','D','E']);
     expect(task.hint).not.toMatch(/mặt cong|mặt bên.*E|chọn E/);expect(task.question).not.toContain('E');
     expect(task.explanation).toContain('Mặt bên là mặt cong');
   }
 });
});
