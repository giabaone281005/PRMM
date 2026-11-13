import {expect,it} from 'vitest';
import {engineTopics} from '../packages/lesson-authoring/uime-bank';
import {buildRecognition} from '../packages/lesson-authoring/math9';
import {LessonSession} from '../packages/lesson-runtime';
import {uimeKinds,uimeKeys} from '../packages/lesson-runtime/uime';
it('covers every interaction kind with six distinct, reachable checkpoints',()=>{
 expect(new Set(engineTopics.map(t=>t.tasks[0].uime!.kind))).toEqual(new Set(uimeKinds));
 for(const topic of engineTopics){expect(topic.tasks).toHaveLength(6);expect(new Set(topic.tasks.map(t=>t.question)).size).toBe(6);const l=buildRecognition(topic,topic.id);const s=new LessonSession(l);for(const task of l.recognition!){expect(s.success,topic.id).toBe(false);task.uime!.answers.forEach((v,j)=>s.interact({type:'adjust_parameter',name:uimeKeys[j],value:v}));if(task.uime!.kind==='3D_SOLID_INSPECTOR')s.interact({type:'adjust_parameter',name:'a',value:.5});expect(s.success,task.question).toBe(true);s.advance();}expect(s.snapshot.completed).toBe(true);}
});
