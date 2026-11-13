import {describe,it,expect} from 'vitest';
import Ajv from 'ajv/dist/2020.js';
import {curriculum,pilotLesson,importPilot,aiBundle} from '../packages/lesson-authoring/curriculum-pilot';
import {LessonSession} from '../packages/lesson-runtime';
import {uimeKeys} from '../packages/lesson-runtime/uime';
describe('Excel curriculum local pilot',()=>{
 it('preserves 24 source entries and six engine families',()=>{expect(curriculum).toHaveLength(24);expect(new Set(curriculum.map(r=>r.engine)).size).toBe(6);});
 for(const id of ['M9-ALG-05','M9-ALG-09','M9-STP-02'])it(id+' has six reachable checkpoints and round trips through AI schema',()=>{
  const lesson=pilotLesson(id)!;expect(lesson.checkpoints).toHaveLength(6);const bundle=aiBundle(lesson);const validate=new Ajv({strict:false}).compile(bundle.schema);expect(validate(lesson),JSON.stringify(validate.errors)).toBe(true);
  const copy=importPilot(JSON.stringify(lesson));expect(copy.lessonId).not.toBe(lesson.lessonId);const session=new LessonSession(copy);
  for(let i=0;i<6;i++){expect(session.success).toBe(false);const u=copy.recognition![i].uime!;u.answers.forEach((v,j)=>session.interact({type:'adjust_parameter',name:uimeKeys[j],value:v}));expect(session.success).toBe(true);expect(session.advance()).toBe(true);}expect(session.snapshot.completed).toBe(true);
 });
 it('rejects wrong count, invalid answers and mismatched question',()=>{const l=pilotLesson('M9-ALG-09')!;l.checkpoints.pop();expect(()=>importPilot(JSON.stringify(l))).toThrow();const a=pilotLesson('M9-ALG-09')!;a.recognition![0].uime!.answers=[100];expect(()=>importPilot(JSON.stringify(a))).toThrow();const b=pilotLesson('M9-ALG-09')!;b.recognition![0].question='Different';expect(()=>importPilot(JSON.stringify(b))).toThrow();});
 it('rejects syntactically valid but unreachable completion criteria',()=>{const l=pilotLesson('M9-ALG-09')!;l.checkpoints[0].successCriteria={op:'gte',path:'metrics.modelError',value:999};expect(()=>importPilot(JSON.stringify(l))).toThrow('không thể đạt');});
});
