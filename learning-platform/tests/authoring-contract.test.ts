import {readFileSync,readdirSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import Ajv2020 from 'ajv/dist/2020.js';
import curriculum from '../contracts/math9-curriculum.json';
import runtimeSchema from '../contracts/lesson.schema.json';
import {
  authoringSchema,compileAuthoring,exportAuthoringBundle,getAuthoringTemplate,listAuthoringTemplates,
  matchesAuthoringSchema,parseAuthoring,sixStepFlow,validateAuthoring,type TemplateCompiler,
} from '../packages/lesson-authoring/template-registry';
import {pilotLesson} from '../packages/lesson-authoring/curriculum-pilot';
import {validateLesson,type Lesson} from '../packages/lesson-contract';
import {LessonSession} from '../packages/lesson-runtime';
import {uimeKeys} from '../packages/lesson-runtime/uime';

const cylinder=()=>exportAuthoringBundle('math9-cylinder-recognition',1).example;
const parabola=()=>exportAuthoringBundle('math9-parabola-coefficient',1).example;
describe('CP-03 strict authoring boundary',()=>{
  it('pins the canonical namespace and all 24 codes without renumbering',()=>{
    expect(authoringSchema.properties.curriculumCode.enum).toEqual(curriculum.map(c=>c.id));
    expect(listAuthoringTemplates()).toHaveLength(19);
    expect(getAuthoringTemplate('math9-parabola-coefficient',1).curriculumCode).toBe('M9-ALG-09');
    expect(getAuthoringTemplate('math9-cylinder-recognition',1).compilerStatus).toBe('implemented-local');
    expect(getAuthoringTemplate('math9-parabola-coefficient',1).compilerStatus).toBe('implemented-local');
  });
  for(const factory of [cylinder,parabola])it('round trips the documented example and scoped standalone schema',()=>{
    const example=factory();const bundle=exportAuthoringBundle(example.templateId,1);
    const check=new Ajv2020({strict:false,strictNumbers:true}).compile(bundle.schema);
    expect(check(example),JSON.stringify(check.errors)).toBe(true);
    expect(matchesAuthoringSchema(example)).toBe(true);
    expect(validateAuthoring(example)).toEqual([]);
    expect(parseAuthoring(JSON.parse(JSON.stringify(example)))).toEqual(example);
    expect(bundle.template.flow.map(s=>s.id)).toEqual(['explore','identify','discover','guided','practice','assessment']);
    expect(bundle.template.form.every(f=>f.label&&f.help)).toBe(true);
  });
  const mutations: [string,(p:any)=>void,string][]=[
    ['unknown template',p=>p.templateId='other','/templateId'],
    ['unknown version',p=>p.templateVersion=2,'/templateVersion'],
    ['string version',p=>p.templateVersion='1','/templateVersion'],
    ['missing version',p=>delete p.templateVersion,'/templateVersion'],
    ['unknown authoring contract',p=>p.authoringVersion='2.0.0','/authoringVersion'],
    ['ambiguous alias namespace',p=>p.namespace='markdown-supplement-v1','/namespace'],
    ['wrong curriculum',p=>p.curriculumCode='M9-ALG-09','/curriculumCode'],
    ['unknown code',p=>p.curriculumCode='M9-GEO-99','/curriculumCode'],
    ['wrong mode',p=>p.mode='volume','/mode'],
    ['extra root field',p=>p.answer=42,'/answer'],
    ['technical checkpoints',p=>p.checkpoints=[], '/checkpoints'],
    ['flow override',p=>p.flow=['assessment','explore'],'/flow'],
    ['execution',p=>p.script='eval(input)','/script'],
    ['hotspots',p=>p.parameters.hotspots=[{x:40,y:20}],'/parameters/hotspots'],
    ['independent answer',p=>p.parameters.volume=351,'/parameters/volume'],
    ['bad radius',p=>p.parameters.radius=0,'/parameters/radius'],
    ['bad height',p=>p.parameters.height=-4,'/parameters/height'],
    ['unbounded geometry',p=>p.parameters.radius=101,'/parameters/radius'],
    ['NaN',p=>p.parameters.radius=NaN,'/parameters/radius'],
    ['Infinity',p=>p.parameters.height=Infinity,'/parameters/height'],
    ['unobservable ratio',p=>{p.parameters.radius=0.1;p.parameters.height=100;},'/parameters'],
    ['unknown units',p=>p.parameters.unit='pixel','/parameters/unit'],
    ['missing variant',p=>delete p.variants.assessment,'/variants/assessment'],
    ['variant unit override',p=>p.variants.practice.unit='m','/variants/practice/unit'],
    ['invalid assessment',p=>p.variants.assessment.radius=-1,'/variants/assessment/radius'],
    ['independent variant answer',p=>p.variants.practice.answer=42,'/variants/practice/answer'],
    ['duplicate variants',p=>p.variants.assessment={...p.variants.practice},'/variants'],
    ['extra content',p=>p.content.question='Chọn đáp án khác','/content/question'],
    ['instruction changes task',p=>p.content.exploreInstruction='Tính thể tích bằng 999','/content/exploreInstruction'],
    ['context numeric contradiction',p=>p.content.context='Bán kính 999 cm','/content/context'],
    ['context markup',p=>p.content.context='<script>run()</script>','/content/context'],
    ['context too long',p=>p.content.context='a'.repeat(241),'/content/context'],
    ['blank title',p=>p.title='   ','/title'],
  ];
  it.each(mutations)('rejects %s with a readable path',(_name,mutate,path)=>{
    const input=cylinder();mutate(input);
    expect(validateAuthoring(input).some(e=>e.path===path),JSON.stringify(validateAuthoring(input))).toBe(true);
    expect(()=>parseAuthoring(input)).toThrow();
  });
  it.each([null,[],7,'{}'])('rejects non-object %j',input=>expect(validateAuthoring(input)[0].code).toBe('schema.type'));
  it('checks per-mode parameters at every stage',()=>{
    for(const stage of ['parameters','practice','assessment'])for(const a of [0,0.5,6,-6]) {
      const input=parabola() as any;(stage==='parameters'?input.parameters:input.variants[stage]).a=a;
      expect(validateAuthoring(input).length).toBeGreaterThan(0);
    }
    const input=parabola() as any;input.parameters.radius=3;expect(validateAuthoring(input)[0].path).toBe('/parameters/radius');
  });
  it('keeps published definitions immutable and exports isolated schemas/examples',()=>{
    expect(()=>{(sixStepFlow as any).reverse();}).toThrow();
    expect(()=>{(listAuthoringTemplates()[0].form as any).push({});}).toThrow();
    expect(()=>{(getAuthoringTemplate('math9-cylinder-recognition',1) as any).templateVersion=2;}).toThrow();
    const bundle=exportAuthoringBundle('math9-cylinder-recognition',1);bundle.example.title='Changed';bundle.schema.oneOf=[];
    expect(cylinder().title).not.toBe('Changed');expect(validateAuthoring(cylinder())).toEqual([]);
  });
});

// Test adapter exercises the compiler boundary only. It is not a cylinder/parabola implementation.
const testCompiler:TemplateCompiler={templateId:'math9-parabola-coefficient',templateVersion:1,compilerVersion:'test-only',compile(problem,context){
  const l=pilotLesson('M9-ALG-09')!;l.lessonId=context.lessonId;l.version=context.version;l.title=problem.title;l.topicIds=[problem.curriculumCode];
  l.checkpoints.forEach((cp,i)=>{cp.id=sixStepFlow[i].id;cp.order=i+1;});l.completion.requiredCheckpointIds=l.checkpoints.map(cp=>cp.id);return l;
}};
describe('CP-03 compiler interface and provenance separation',()=>{
  it('returns a replayable input receipt outside the unchanged runtime contract',()=>{
    const input=parabola(),context={lessonId:'cp03-test',version:3};
    const {manifest,receipt}=compileAuthoring(input,context,testCompiler);
    expect(validateLesson(manifest)).toEqual([]);
    expect(receipt.runtime).toEqual(context);expect(receipt.authoringInput).toEqual(input);
    expect(receipt.templateId).toBe(input.templateId);expect(receipt.compilerVersion).toBe('test-only');
    input.title='Changed';expect(receipt.authoringInput.title).toBe(manifest.title);
    expect(new Ajv2020({strict:false}).compile(runtimeSchema)({...manifest,authoringInput:receipt.authoringInput})).toBe(false);
    expect(compileAuthoring(receipt.authoringInput,context,testCompiler).manifest).toEqual(manifest);
  });
  it('passes frozen copies to trusted adapters',()=>{
    expect(()=>compileAuthoring(parabola(),{lessonId:'test',version:1},{...testCompiler,compile(p){p.title='overwrite';throw Error('unreachable');}})).toThrow(TypeError);
  });
  it('rejects compiler mismatches and invalid identity',()=>{
    expect(()=>compileAuthoring(cylinder(),{lessonId:'test',version:1},testCompiler)).toThrow('Compiler không khớp');
    expect(()=>compileAuthoring(parabola(),{lessonId:'test',version:0},testCompiler)).toThrow('version');
  });
  it.each(['delete','reorder','extra','completion','identity','runtime field'])('rejects compiler output with %s',change=>{
    const compiler={...testCompiler,compile(p:Parameters<TemplateCompiler['compile']>[0],ctx:Parameters<TemplateCompiler['compile']>[1]){
      const l=testCompiler.compile(p,ctx);
      if(change==='delete')l.checkpoints.pop();if(change==='reorder')l.checkpoints.reverse();
      if(change==='extra')l.checkpoints.push(structuredClone(l.checkpoints[0]));
      if(change==='completion')l.completion.requiredCheckpointIds.pop();if(change==='identity')l.version++;
      if(change==='runtime field')(l as any).authoringInput=p;return l;
    }};
    expect(()=>compileAuthoring(parabola(),{lessonId:'test',version:1},compiler)).toThrow('manifest không hợp lệ');
  });
});

describe('CP-03 legacy runtime compatibility without authoring migration',()=>{
  const directory=new URL('../contracts/engine-templates/',import.meta.url);
  for(const file of readdirSync(directory).filter(f=>f.endsWith('.lesson.json')))it(`reads, completes and resumes ${file}`,()=>{
    const raw=readFileSync(new URL(file,directory),'utf8'),lesson=JSON.parse(raw) as Lesson;
    lesson.status='published';expect(validateLesson(lesson)).toEqual([]);
    const session=new LessonSession(lesson),objects=session.objects;
    for(const task of lesson.recognition!) {
      expect(session.success).toBe(false);
      task.uime!.answers.forEach((v,j)=>session.interact({type:'adjust_parameter',name:uimeKeys[j],value:v}));
      if(task.uime!.kind==='3D_SOLID_INSPECTOR')session.interact({type:'adjust_parameter',name:'a',value:.5});
      expect(session.success).toBe(true);expect(session.advance()).toBe(true);expect(session.objects).toBe(objects);
      expect(new LessonSession(lesson,session.snapshot).snapshot).toEqual(session.snapshot);
    }
    expect(session.snapshot.completed).toBe(true);expect(readFileSync(new URL(file,directory),'utf8')).toBe(raw);
    expect(validateAuthoring(lesson).length).toBeGreaterThan(0);
  });
});
