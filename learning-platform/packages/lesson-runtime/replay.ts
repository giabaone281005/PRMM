import {LessonSession,type Interaction} from './index';
import type {Lesson} from '../lesson-contract';
export type JournalEvent={kind:'interaction';event:Interaction}|{kind:'advance'};
export function replay(lesson:Lesson,events:unknown){
  if(!Array.isArray(events)||events.length>10000)throw Error('Invalid event journal');
  const session=new LessonSession(lesson);
  for(const entry of events){if(!entry||typeof entry!=='object')throw Error('Invalid event');if(entry.kind==='advance'){if(!session.advance())throw Error('Checkpoint criteria not met');}else if(entry.kind==='interaction'){if(!session.interact(entry.event))throw Error('Invalid interaction');}else throw Error('Unknown event');}
  return session.snapshot;
}
