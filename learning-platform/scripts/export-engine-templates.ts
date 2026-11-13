import {mkdirSync,writeFileSync} from 'node:fs';
import {engineTopics} from '../packages/lesson-authoring/uime-bank';
import {buildRecognition} from '../packages/lesson-authoring/math9';
import {LessonSession} from '../packages/lesson-runtime';
import {uimeKeys} from '../packages/lesson-runtime/uime';
import {aiBundle} from '../packages/lesson-authoring/curriculum-pilot';
const existing:Record<string,[string,string]>={
 'engine-solid-cylinder':['math9-f1a1daed-ee88-4a3a-8e6b-0534ca5624a7','Khám phá 3D: Hình trụ'],
 'engine-parabola':['lesson-9b03769d-2372-4abb-8d0c-6c06be03606f','Khi đường cong chuyển động'],
 'engine-events':['math9-cb240cff-410b-41e5-b555-b672c86b108c','Chọn bi ba màu — Phân loại biến cố']};
const lessons=engineTopics.map(t=>{
 t=structuredClone(t);
 if(t.id==='engine-events'){
  const examples:[string,string[],number[]][]=[
   ['Túi có 5 bi đỏ, 3 bi xanh, 2 bi vàng. Phân loại các biến cố.',['Bi đỏ, xanh hoặc vàng','Bi tím','Bi đỏ'],[0,1,2]],
   ['Túi vẫn có 10 bi ba màu. Phân loại theo màu.',['Bi xanh','Bi vàng','Bi không thuộc ba màu'],[2,2,1]],
   ['Phân biệt chắc chắn với ngẫu nhiên trong túi bi.',['Bi thuộc ba màu','Bi đỏ hoặc xanh','Bi vàng'],[0,2,2]],
   ['Túi không có bi tím. Phân loại biến cố phủ định.',['Bi không phải tím','Bi không phải đỏ','Bi tím'],[0,2,1]],
   ['Đổi túi: 2 đỏ, 4 xanh, 4 vàng. Phân loại biến cố.',['Bi xanh','Bi tím','Bi đỏ, xanh hoặc vàng'],[2,1,0]],
   ['Tự kiểm tra: trở lại 5 đỏ, 3 xanh, 2 vàng.',['Bi không phải đỏ','Bi màu tím','Bi thuộc ba màu','Bi vàng'],[2,1,0,2]]];
  t.tasks.forEach((task,i)=>{task.question=examples[i][0];task.uime!.tokens=examples[i][1];task.uime!.answers=examples[i][2];task.explanation='Túi chỉ chứa đỏ, xanh, vàng: thuộc ba màu là chắc chắn; tím là không thể; từng màu riêng lẻ là ngẫu nhiên.';});
 }
 const [id,title]=existing[t.id]??['template-'+t.id,t.title];const l=buildRecognition(t,id,title);l.topicIds.push('engine-template-six-v1');
 const session=new LessonSession(l);
 l.recognition!.forEach((task,i)=>{if(session.success)throw Error(`${id}/${i}: auto complete`);const u=task.uime!;u.answers.forEach((v,j)=>session.interact({type:'adjust_parameter',name:uimeKeys[j],value:v}));if(u.kind==='3D_SOLID_INSPECTOR')session.interact({type:'adjust_parameter',name:'a',value:.5});if(!session.success)throw Error(`${id}/${i}: unreachable`);session.advance();});
 if(!session.snapshot.completed)throw Error('Incomplete');return l;
});
mkdirSync('contracts/generated',{recursive:true});writeFileSync('contracts/generated/engine-six-checkpoints.json',JSON.stringify(lessons,null,2));
mkdirSync('contracts/engine-templates',{recursive:true});
for(const l of lessons)writeFileSync('contracts/engine-templates/'+l.lessonId+'.lesson.json',JSON.stringify(l,null,2));
const schema=aiBundle(lessons[0]).schema;
schema.properties.grade={...schema.properties.grade,const:9} as typeof schema.properties.grade;
schema.properties.status={...schema.properties.status,const:'draft'} as typeof schema.properties.status;
writeFileSync('contracts/lesson-six.schema.json',JSON.stringify(schema,null,2));
console.log(JSON.stringify({lessons:lessons.length,checkpoints:lessons.reduce((n,l)=>n+l.checkpoints.length,0)}));
