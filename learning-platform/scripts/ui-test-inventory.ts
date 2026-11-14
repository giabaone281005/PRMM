import {writeFileSync} from 'node:fs';
import {listAuthoringTemplates} from '../packages/lesson-authoring/template-registry';
import {math9Topics} from '../packages/lesson-authoring/math9';
import {engineTopics} from '../packages/lesson-authoring/uime-bank';
import {curriculum,pilotLesson} from '../packages/lesson-authoring/curriculum-pilot';
const inventory={templates:listAuthoringTemplates().map(t=>({id:t.templateId,code:t.curriculumCode})),
  math9:math9Topics.map(t=>({id:t.id,title:t.title})),engines:engineTopics.map(t=>({id:t.id,title:t.title})),
  curriculum:curriculum.map(t=>({id:t.id,title:t.title,pilot:!!pilotLesson(t.id)}))};
writeFileSync('.local/ui-test-inventory.json',JSON.stringify(inventory,null,2));
console.log(JSON.stringify(Object.fromEntries(Object.entries(inventory).map(([key,value])=>[key,value.length]))));
