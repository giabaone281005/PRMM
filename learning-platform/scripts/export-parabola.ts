import {writeFileSync} from 'node:fs';
import base from '../contracts/authoring/math9-parabola-coefficient.example.json';
import {compileParabola} from '../packages/lesson-authoring/parabola-compiler';
import {parabolaModel} from '../packages/lesson-runtime/parabola';
import type {Interaction} from '../packages/lesson-runtime';

const samples=[base,
  {...structuredClone(base),title:'Parabol mở xuống',parameters:{a:-3},variants:{practice:{a:-1},assessment:{a:3}}},
  {...structuredClone(base),title:'Parabol hệ số lớn',parameters:{a:5},variants:{practice:{a:-4},assessment:{a:1}}},
];
const fixtures=samples.map((input,i)=>{
  if(i)writeFileSync(`contracts/authoring/parabola-${i===1?'downward':'narrow'}.example.json`,JSON.stringify(input,null,2)+'\n');
  const {manifest,receipt}=compileParabola(input,{lessonId:`cp05-parabola-${i+1}`,version:1});
  // Declarative expected vectors for later TS/Dart tests; no test/replay is run by this exporter.
  const steps=manifest.recognition!.map(t=>{
    const c=t.uime!.parabola!;
    const event=(name:string,value:number,accepted:boolean,success:boolean)=>({event:{type:'adjust_parameter',name,value} as Interaction,accepted,success});
    if(c.task==='explore')return [event('x',0,false,false),event('b',3,false,false),event('x',-c.a,true,false),event('x',c.a,true,true)];
    if(c.task==='identify'){const correct=c.a>0?0:1;return [event('x',c.a,false,false),event('y',1-correct,true,false),event('y',correct,true,true)];}
    if(c.task==='compare'){const correct=parabolaModel(c).narrower;return [event('y',correct,true,false),event('a',2,true,false),event('y',1-correct,true,false),event('y',correct,true,true)];}
    return [event('x',0,false,false),event('y',0,true,false),event('x',c.a,true,false),event('y',0,true,true)];
  });
  return {input,manifest,receipt,steps};
});
writeFileSync('contracts/generated/parabola-coefficient.json',JSON.stringify(fixtures,null,2)+'\n');
console.log('Exported 3 parabola inputs/manifests and declarative replay vectors. No tests or database writes.');
