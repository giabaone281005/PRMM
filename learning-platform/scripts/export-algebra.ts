import {writeFileSync} from 'node:fs';
import {algebraTemplates} from '../packages/lesson-authoring/algebra-templates';
import {compileProblem} from '../packages/lesson-authoring/authoring-service';
import {LessonSession} from '../packages/lesson-runtime';
import {algebraModel,algebraSolutionEvents,algebraDomainMask,algebraSlotTargets,algebraOperationAllowed,evaluateExpr,type AlgebraConfig} from '../packages/lesson-runtime/algebra';
const sources:any[]=structuredClone(algebraTemplates);
const degree=structuredClone(algebraTemplates.find(t=>t.mode==='quadratic_equation')!) as any;degree.example.title+=' · Hạ bậc';degree.example.parameters={a:0,b:2,c:-3,degreePolicy:'allow_linear'};degree.example.variants={practice:{a:0,b:0,c:0,degreePolicy:'allow_linear'},assessment:{a:0,b:0,c:2,degreePolicy:'allow_linear'}};sources.push(degree);
const rationalExtra=structuredClone(algebraTemplates.find(t=>t.mode==='rational_equation')!) as any;rationalExtra.example.title+=' · Kiểm nghiệm';rationalExtra.example.parameters={p:1,q:-2,r:1,s:3,d:1,e:-4,f:0,g:1,k:0};rationalExtra.example.variants={practice:{p:1,q:-2,r:1,s:-2,d:1,e:-2,f:0,g:1,k:0},assessment:{p:1,q:0,r:1,s:0,d:1,e:1,f:1,g:1,k:-1}};sources.push(rationalExtra);
const fixtures=sources.flatMap((t,templateIndex)=>[0,1,2].map(i=>{
 const input=structuredClone(t.example),sets=[input.parameters,input.variants.practice,input.variants.assessment];input.parameters=sets[i];input.variants={practice:sets[(i+1)%3],assessment:sets[(i+2)%3]};input.title+=` · Bộ ${i+1}`;
 const {manifest,receipt}=compileProblem(input,{lessonId:`eng03-${input.mode.replaceAll('_','-')}-${templateIndex+1}-${i+1}`,version:1}),s=new LessonSession(manifest);
 const steps=manifest.recognition!.map(t=>{
  const g=t.uime!.algebra!,events:any[]=[];
  const change=(event:any)=>{const accepted=s.interact(event);events.push({event,accepted,success:s.success,state:structuredClone(s.snapshot.state)});};
  if(s.success)throw Error('Auto-complete');change({type:'adjust_parameter',name:'x',value:10000});change({type:'adjust_parameter',name:'targetY',value:1});if(s.success)throw Error('Empty confirmation passes');
  for(const event of algebraSolutionEvents(g))change(event);
  if(!s.success||!s.advance())throw Error(`Unreachable ${g.mode}/${g.task}`);return events;
 });
 return {input,manifest,receipt,steps};
}));
writeFileSync('contracts/generated/algebra.json',JSON.stringify(fixtures,null,2)+'\n');
const vector=(name:string,g:AlgebraConfig)=>{const m=algebraModel(g);return {name,config:g,valid:true,model:{a:m.a,b:m.b,c:m.c,degree:m.degree,delta:m.delta,roots:m.roots,candidates:m.candidates,forbidden:m.forbidden,extraneous:m.extraneous,kind:m.kind,count:m.count,sum:m.sum,product:m.product},equation:m.equation,probes:[0,1,-2,.5,...m.forbidden,...m.candidates].map(x=>({x,left:evaluateExpr(m.equation.left,x),right:evaluateExpr(m.equation.right,x)})),domainMask:algebraDomainMask(g),slots:algebraSlotTargets(g),operations:[0,1,2,3,4,5,6].map(i=>algebraOperationAllowed(g,i,true))};};
const vectors:any[]=fixtures.map(f=>vector(f.manifest.lessonId,f.manifest.recognition![3].uime!.algebra!));
const quadratic=fixtures.find(f=>f.input.mode==='quadratic_equation')!.manifest.recognition![3].uime!.algebra!;
for(const [name,data] of Object.entries({linear:{a:0,b:2,c:-3,degreePolicy:'allow_linear'},constantFalse:{a:0,b:0,c:1,degreePolicy:'allow_linear'},identity:{a:0,b:0,c:0,degreePolicy:'allow_linear'},irrational:{a:1,b:0,c:-2,degreePolicy:'quadratic_only'},negativeLeading:{a:-2,b:0,c:8,degreePolicy:'quadratic_only'}}))vectors.push(vector(name,{...quadratic,data}));
const rational=fixtures.find(f=>f.input.mode==='rational_equation')!.manifest.recognition![3].uime!.algebra!;
for(const [name,data] of Object.entries({noRootsAfterExclusion:{p:1,q:-2,r:1,s:-2,d:1,e:-2,f:0,g:1,k:0},negativeDiscriminant:{p:1,q:0,r:1,s:0,d:1,e:1,f:1,g:1,k:-1},twoValidRoots:{p:1,q:-2,r:1,s:3,d:1,e:-4,f:0,g:1,k:0},constantFalse:{p:1,q:-2,r:1,s:2,d:1,e:-1,f:1,g:1,k:1},linear:{p:1,q:0,r:1,s:0,d:1,e:1,f:1,g:1,k:1},repeatedDenominator:{p:1,q:-3,r:1,s:2,d:1,e:-1,f:2,g:-2,k:0}}))vectors.push(vector('rational-'+name,{...rational,data}));
for(const [name,mode,data] of [
 ['zero-factor','product_equation',{p:0,q:1,r:1,s:2}],['zero-denominator','rational_equation',{...rational.data,d:0,e:0}],['zero-second-denominator','rational_equation',{...rational.data,f:0,g:0}],['fractional-coefficient','quadratic_equation',{a:.5,b:1,c:1,degreePolicy:'quadratic_only'}],['a-zero-strict','quadratic_equation',{a:0,b:1,c:2,degreePolicy:'quadratic_only'}],['unknown-degree-policy','quadratic_equation',{a:0,b:1,c:2,degreePolicy:'ignore'}],['viete-no-real','viete',{a:1,b:0,c:1}],['viete-a-zero','viete',{a:0,b:1,c:2}],['unbounded-coefficient','viete',{a:10,b:0,c:0}],
 ] as const)vectors.push({name,config:{mode,data,task:'guided'},valid:false});
writeFileSync('contracts/core-engines/algebra-vectors.json',JSON.stringify(vectors,null,2)+'\n');
console.log(`Exported ${fixtures.length} whole lessons and ${vectors.length} shared algebra vectors. No database writes.`);
