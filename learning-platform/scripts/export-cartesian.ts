import {writeFileSync} from 'node:fs';
import relation from '../contracts/authoring/math9-linear-relation.example.json';
import system from '../contracts/authoring/math9-linear-system.example.json';
import intersection from '../contracts/authoring/math9-line-parabola.example.json';
import {compileProblem} from '../packages/lesson-authoring/authoring-service';
import {LessonSession} from '../packages/lesson-runtime';
import {graphClass,graphTargets,graphSolution,type GraphData,graphBounds} from '../packages/lesson-runtime/cartesian';
const originals=[relation,system,intersection];
const inputs=originals.flatMap(input=>[0,1,2].map(i=>{
 const sets=[input.parameters,input.variants.practice,input.variants.assessment];
 return {...structuredClone(input),title:input.title+` · Bộ ${i+1}`,parameters:sets[i],variants:{practice:sets[(i+1)%3],assessment:sets[(i+2)%3]}};
}));
const fixtures=inputs.map((input,index)=>{
 const {manifest,receipt}=compileProblem(input,{lessonId:`eng01-graph-${index+1}`,version:1}),session=new LessonSession(manifest);
 const steps=manifest.recognition!.map(t=>{
  const g=t.uime!.graph!,events:{event:{type:'adjust_parameter';name:string;value:number};accepted:boolean;success:boolean;state:Record<string,number|boolean>}[]=[];
  const change=(name:string,value:number)=>{const event={type:'adjust_parameter' as const,name,value},accepted=session.interact(event);events.push({event,accepted,success:session.success,state:structuredClone(session.snapshot.state)});};
  if(session.success)throw Error('Auto-complete');
  change('height',1e9);change('numerator',1); // Wrong / incomplete operation must not silently solve a new step.
  if(g.task==='explore')change('x',g.snap||1);
  else if(g.task==='identify'&&g.mode!=='linear_relation'){change('b',1);change('b',2);}
  else if(g.task==='discover'&&g.mode!=='linear_relation'){change('c',(graphClass(g)+1)%4);change('numerator',1);change('c',graphClass(g));change('numerator',1);}
  else{if(g.mode!=='linear_relation')change('c',graphClass(g));graphTargets(g).forEach((p,i)=>{change(i?'width':'x',p.x);change(i?'height':'y',p.y);});change('numerator',1);}
  if(!session.success||!session.advance())throw Error(`Unreachable graph step ${g.mode}/${g.task}`);
  return events;
 });
 return {input,manifest,receipt,steps};
});
writeFileSync('contracts/generated/cartesian.json',JSON.stringify(fixtures,null,2)+'\n');
const models=[
 ...fixtures.map(f=>{const g=f.manifest.recognition![0].uime!.graph!;return {name:f.manifest.lessonId,data:f.input.parameters,mode:g.mode,valid:true,solution:graphSolution(g,g.mode),bounds:graphBounds(g,g.mode)};}),
 {name:'irrational roots',data:{a:0,b:1,c:2,q:1,snap:0},mode:'line_parabola_intersection',valid:true,solution:{kind:'two',points:[{x:-Math.SQRT2,y:2},{x:Math.SQRT2,y:2}]}},
 {name:'vertical meets parabola',data:{a:1,b:0,c:2,q:-1,snap:1},mode:'line_parabola_intersection',valid:true,solution:{kind:'unique',points:[{x:2,y:-4}]}},
 ...[
  {a:0,b:0,c:1,snap:1},
  {a:1,b:1,c:1,d:0,e:0,f:1,snap:1},
  {a:0,b:1,c:2,q:0,snap:1},
  {a:0,b:1,c:2,q:1,snap:1},
 ].map((data,i)=>({name:'invalid-'+i,data,mode:i===0?'linear_relation':i===1?'linear_system':'line_parabola_intersection',valid:false})),
];
writeFileSync('contracts/core-engines/cartesian-vectors.json',JSON.stringify(models,null,2)+'\n');
console.log(`Exported ${fixtures.length} full graph lessons and shared math/replay vectors. No database writes.`);
