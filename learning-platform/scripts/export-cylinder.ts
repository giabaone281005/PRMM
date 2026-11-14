import {writeFileSync} from 'node:fs';
import base from '../contracts/authoring/math9-cylinder-recognition.example.json';
import {compileCylinder} from '../packages/lesson-authoring/cylinder-compiler';
import {LessonSession,type Interaction} from '../packages/lesson-runtime';
const samples=[base,
  {...structuredClone(base),title:'Hộp trụ cao',parameters:{radius:2,height:16,unit:'cm'},variants:{practice:{radius:3,height:15},assessment:{radius:2,height:12}}},
  {...structuredClone(base),title:'Hộp trụ thấp',parameters:{radius:8,height:2,unit:'m'},variants:{practice:{radius:6,height:3},assessment:{radius:5,height:2}}},
];
const fixtures=samples.map((input,i)=>{
  if(i)writeFileSync(`contracts/authoring/cylinder-${i===1?'tall':'wide'}.example.json`,JSON.stringify(input,null,2)+'\n');
  const {manifest,receipt}=compileCylinder(input,{lessonId:`cp04-cylinder-${i+1}`,version:1});
  const session=new LessonSession(manifest);
  const sequences:[string,number][][]=[
    [['x',4],['a',1.1]],
    [['x',1],['x',0]],
    [['y',3],['c',100],['width',1.3],['x',2],['x',3]],
    [['x',0],['x',1]],
    [['x',4],['x',0]],
    [['x',0],['x',4]],
  ];
  const steps=sequences.map((sequence,cp)=>{
    if(session.success)throw Error('Auto-completed '+cp);
    const events=sequence.map(([name,value])=>{
      const event:Interaction={type:'adjust_parameter',name,value};const accepted=session.interact(event);
      return {event,accepted,success:session.success,state:Object.fromEntries(['x','y','a','b','c','width'].map(k=>[k,session.snapshot.state[k]]))};
    });
    if(!session.success||!session.advance())throw Error('Unreachable '+cp);
    return events;
  });
  return {input,manifest,receipt,steps};
});
writeFileSync('contracts/generated/cylinder-recognition.json',JSON.stringify(fixtures,null,2)+'\n');
console.log('Exported 3 cylinder inputs/manifests and TS/Dart replay vectors. No database writes.');
