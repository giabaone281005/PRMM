import {describe,it,expect} from 'vitest';
import fixtures from '../contracts/generated/algebra.json';
import vectors from '../contracts/core-engines/algebra-vectors.json';
import {algebraModel,validateAlgebra,evaluateExpr,algebraDomainMask,algebraSlotTargets,algebraOperationAllowed,algebraTransformed,algebraError,algebraInitial,algebraSolutionEvents,solvePolynomial,type AlgebraConfig,type Expr} from '../packages/lesson-runtime/algebra';
import {compileProblem} from '../packages/lesson-authoring/authoring-service';
import {validateAuthoring} from '../packages/lesson-authoring/template-registry';
import {LessonSession,type Interaction} from '../packages/lesson-runtime';
import {replay} from '../packages/lesson-runtime/replay';
describe('ENG-03 algebra model, domain, operations and parity',()=>{
 for(const v of vectors)it(`math/guard ${v.name}`,()=>{
  const g=v.config as unknown as AlgebraConfig;expect(validateAlgebra(g).length===0).toBe(v.valid);
  if(v.valid){const m=algebraModel(g);for(const [key,value] of Object.entries(v.model!)){const actual=(m as any)[key];if(typeof value==='number')expect(actual).toBeCloseTo(value,8);else expect(actual).toEqual(value);}expect(m.equation).toEqual(v.equation);expect(algebraDomainMask(g)).toBe(v.domainMask);expect(algebraSlotTargets(g)).toEqual(v.slots);expect([0,1,2,3,4,5,6].map(i=>algebraOperationAllowed(g,i,true))).toEqual(v.operations);
   for(const x of m.roots){const left=evaluateExpr(m.equation.left,x),right=evaluateExpr(m.equation.right,x);expect(left).not.toBeNull();expect(left!).toBeCloseTo(right!,6);expect(m.forbidden.every(f=>Math.abs(x-f)>1e-8)).toBe(true);}
   for(const x of m.forbidden)expect(evaluateExpr(m.equation.left,x)).toBeNull();
  }
 });
 for(const f of fixtures)it(`six steps, replay and restore ${f.manifest.lessonId}`,()=>{
  const {manifest}=compileProblem(f.input,{lessonId:f.manifest.lessonId,version:1});expect(manifest).toEqual(f.manifest);const s=new LessonSession(manifest),objects=s.objects;
  for(const events of f.steps){expect(s.success).toBe(false);expect(s.advance()).toBe(false);for(const v of events){expect(s.interact(v.event as Interaction)).toBe(v.accepted);expect(s.success).toBe(v.success);expect(s.snapshot.state).toEqual(v.state);expect(new LessonSession(manifest,s.snapshot).snapshot).toEqual(s.snapshot);}expect(s.advance()).toBe(true);expect(s.objects).toBe(objects);}expect(s.snapshot.completed).toBe(true);const journal=f.steps.flatMap(events=>[...events.filter(v=>v.accepted).map(v=>({kind:'interaction',event:v.event})),{kind:'advance'}]);expect(replay(manifest,journal)).toEqual(s.snapshot);
 });
 it('solves exact known roots, repeated roots, negative leading coefficients and purposeful degree reduction',()=>{
  expect(solvePolynomial(1,-3,2).roots).toEqual([1,2]);expect(solvePolynomial(2,4,2).roots).toEqual([-1]);expect(solvePolynomial(1,0,1).kind).toBe('none');expect(solvePolynomial(0,2,-3)).toEqual({degree:1,delta:null,kind:'one',roots:[1.5]});expect(solvePolynomial(0,0,0).kind).toBe('all');expect(solvePolynomial(0,0,3).kind).toBe('none');expect(solvePolynomial(-1,2,3).roots).toEqual([-1,3]);
 });
 it('preserves the original rational domain after cancellation and excludes spurious candidates',()=>{
  const g=fixtures.find(f=>f.input.mode==='rational_equation')!.manifest.recognition[3].uime.algebra as unknown as AlgebraConfig,m=algebraModel(g);expect(m.forbidden).toEqual([2]);expect(m.candidates).toEqual([-3,2]);expect(m.roots).toEqual([-3]);expect(m.extraneous).toEqual([2]);expect(evaluateExpr(m.equation.left,2)).toBeNull();
  expect(algebraOperationAllowed(g,0,false)).toBe(false);expect(algebraOperationAllowed(g,3,false)).toBe(false);expect(algebraOperationAllowed(g,3,true)).toBe(true);
  const product=fixtures[0].manifest.recognition[3].uime.algebra as unknown as AlgebraConfig;expect(algebraOperationAllowed(product,3,true)).toBe(false);expect(algebraOperationAllowed(product,4,true)).toBe(false);expect(algebraOperationAllowed(product,6,true)).toBe(false);
 });
 it('checks transformations by substitution on the same domain and never claims squaring equivalence',()=>{
  for(const f of fixtures){const g=f.manifest.recognition[3].uime.algebra as unknown as AlgebraConfig,m=algebraModel(g);for(const x of [-2,-.5,.3,1,4]){const left=evaluateExpr(m.equation.left,x),right=evaluateExpr(m.equation.right,x);if(left===null)continue;const polynomial=m.a*x*x+m.b*x+m.c,denominator=g.mode==='rational_equation'?(Number(g.data.d)*x+Number(g.data.e))*(Number(g.data.f)*x+Number(g.data.g)):1;expect((left!-right!)*denominator).toBeCloseTo(polynomial,7);if(algebraOperationAllowed(g,2,true))expect(polynomial/m.a).toBeCloseTo(x*x+(m.b/m.a)*x+m.c/m.a,7);}expect(algebraOperationAllowed(g,4,true)).toBe(false);}
 });
 it('invalidates confirmation after edits and rejects roots contradicting a no-solution/all-domain claim',()=>{
  const f=fixtures.find(f=>f.input.mode==='rational_equation')!,s=new LessonSession(f.manifest as any);s.previewCheckpoint(3);const g=s.lesson.recognition![3].uime!.algebra!;for(const e of algebraSolutionEvents(g))s.interact(e);expect(s.success).toBe(true);s.interact({type:'adjust_parameter',name:'height',value:2});expect(s.success).toBe(false);s.interact({type:'adjust_parameter',name:'targetY',value:1});expect(s.success).toBe(false);s.interact({type:'adjust_parameter',name:'height',value:-999999});s.interact({type:'adjust_parameter',name:'targetY',value:1});expect(s.success).toBe(true);
  const all=fixtures.find(f=>f.input.mode==='quadratic_equation'&&f.input.parameters.a===0&&f.input.parameters.b===0&&f.input.parameters.c===0)!,session=new LessonSession(all.manifest as any);session.previewCheckpoint(3);const config=session.lesson.recognition![3].uime!.algebra!;for(const e of algebraSolutionEvents(config))session.interact(e);expect(session.success).toBe(true);session.interact({type:'adjust_parameter',name:'width',value:123});session.interact({type:'adjust_parameter',name:'targetY',value:1});expect(session.success).toBe(false);
 });
 it('requires two copies of a repeated root in Viete and retains the actual coefficient signs',()=>{
  const f=fixtures.find(f=>f.input.mode==='viete'&&f.input.parameters.a===2)!,g=f.manifest.recognition[3].uime.algebra as unknown as AlgebraConfig,s:any=algebraInitial();for(const e of algebraSolutionEvents(g))s[e.name]=e.value;expect(algebraModel(g).sum).toBe(-2);expect(algebraModel(g).product).toBe(1);expect(algebraError(g,s)).toBe(0);s.height=-999999;expect(algebraError(g,s)).toBe(1);
 });
 it('renders normalization with exact fractions instead of rounded coefficients in an equality',()=>{
  const g:AlgebraConfig={mode:'quadratic_equation',data:{a:3,b:1,c:-1,degreePolicy:'quadratic_only'},task:'guided'};expect(algebraTransformed(g,2,true)).toBe('x² + ((1) / (3))x + ((-1) / (3)) = 0');
 });
 it('rejects unsupported AST, independent answers, arbitrary domain lists and mode/code mismatches at author boundary',()=>{
  for(const change of [(p:any)=>p.parameters.answer=[2],(p:any)=>p.parameters.forbidden_values=[2],(p:any)=>p.parameters.ast={op:'eval',code:'x'},(p:any)=>p.curriculumCode='M9-ALG-11']){const input=structuredClone(fixtures[0].input);change(input);expect(validateAuthoring(input).length).toBeGreaterThan(0);}expect(()=>evaluateExpr({op:'eval'} as unknown as Expr,2)).toThrow();
 });
});
