import {writeFileSync} from 'node:fs';
import {math9Topics,buildRecognition} from '../packages/lesson-authoring/math9';
import {engineTopics} from '../packages/lesson-authoring/uime-bank';
writeFileSync('contracts/uime-fixtures.json',JSON.stringify(engineTopics.map(t=>buildRecognition(t,t.id)),null,2));
writeFileSync('contracts/math9-recognition.json',JSON.stringify(math9Topics.map(t=>buildRecognition(t,'math9-'+t.id)),null,2));
console.log(`${math9Topics.length} topics, ${math9Topics.reduce((sum,t)=>sum+t.tasks.length,0)} checkpoints`);
