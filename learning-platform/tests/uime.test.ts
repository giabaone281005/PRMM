import {it,expect} from 'vitest';
import {engineTopics} from '../packages/lesson-authoring/uime-bank';
import {buildRecognition} from '../packages/lesson-authoring/math9';
import {LessonSession} from '../packages/lesson-runtime';
import {uimeKeys,uimeKinds} from '../packages/lesson-runtime/uime';
import {replay,type JournalEvent} from '../packages/lesson-runtime/replay';
it('covers every named engine and all three solids',()=>{expect(new Set(engineTopics.flatMap(t=>t.tasks.map(t=>t.uime!.kind))).size).toBe(uimeKinds.length);});
for(const topic of engineTopics)it('authoritative replay '+topic.id,()=>{
 const l=buildRecognition(topic,topic.id),s=new LessonSession(l),journal:JournalEvent[]=[];
 s.onInteraction(event=>journal.push({kind:'interaction',event}));
 expect(s.success).toBe(false);expect(s.interact({type:'adjust_parameter',name:'x',value:999})).toBe(false);
 for(const t of l.recognition!){const u=t.uime!;u.answers.forEach((v,i)=>s.interact({type:'adjust_parameter',name:uimeKeys[i],value:v}));if(u.kind==='3D_SOLID_INSPECTOR'){expect(s.success).toBe(false);s.interact({type:'adjust_parameter',name:'a',value:.5});}expect(s.success).toBe(true);expect(s.advance()).toBe(true);journal.push({kind:'advance'});}
 expect(replay(l,journal)).toEqual(s.snapshot);expect(new LessonSession(l,s.snapshot).snapshot.completed).toBe(true);
});
