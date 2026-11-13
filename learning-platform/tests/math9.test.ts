import {describe,it,expect} from 'vitest';
import {math9Topics,buildRecognition} from '../packages/lesson-authoring/math9';
import {LessonSession} from '../packages/lesson-runtime';
import {validateLesson} from '../packages/lesson-contract';
describe('Toán 9 recognition',()=>{
 for(const topic of math9Topics)it(topic.title+' rejects wrong choices and completes all checkpoints',()=>{
  const lesson=buildRecognition(topic,'test-'+topic.id);expect(validateLesson(lesson)).toEqual([]);const session=new LessonSession(lesson);
  for(const task of lesson.recognition!){expect(session.success).toBe(false);session.interact({type:'adjust_parameter',name:'x',value:task.correct===1?2:1});expect(session.advance()).toBe(false);session.interact({type:'adjust_parameter',name:'x',value:task.correct});expect(session.success).toBe(true);expect(session.advance()).toBe(true);}
  expect(session.snapshot.completed).toBe(true);
 });
 it('rejects inconsistent targets',()=>{const l=buildRecognition(math9Topics[0],'test-invalid');l.recognition![0].correct=8;expect(validateLesson(l).length).toBeGreaterThan(0);});
});
