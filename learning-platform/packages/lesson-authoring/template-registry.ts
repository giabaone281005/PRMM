import {algebraTemplates,isAlgebraTemplate,type AlgebraAuthoringProblem} from './algebra-templates';
import {validateAlgebraData,type AlgebraData} from '../lesson-runtime/algebra';
import {geometryTemplates,isGeometryTemplate,type GeometryAuthoringProblem} from './geometry-templates';
import {validateGeometryData,type GeometryData} from '../lesson-runtime/geometry';
import {graphTemplates,isGraphTemplate,type GraphAuthoringProblem} from './graph-templates';
import {validateGraphData,type GraphData} from '../lesson-runtime/cartesian';
import relationExample from '../../contracts/authoring/math9-linear-relation.example.json' with {type:'json'};
import systemExample from '../../contracts/authoring/math9-linear-system.example.json' with {type:'json'};
import intersectionExample from '../../contracts/authoring/math9-line-parabola.example.json' with {type:'json'};
import Ajv2020 from 'ajv/dist/2020.js';
import type {ErrorObject} from 'ajv';
import schema from '../../contracts/authoring/lesson-authoring.schema.json' with {type:'json'};
import cylinderExample from '../../contracts/authoring/math9-cylinder-recognition.example.json' with {type:'json'};
import parabolaExample from '../../contracts/authoring/math9-parabola-coefficient.example.json' with {type:'json'};
import {validateLesson, type Lesson} from '../lesson-contract';

type CylinderData = {radius:number;height:number};
type ParabolaData = {a:number};
type ProblemBase = {
  authoringVersion:'1.0.0'; namespace:'excel-repo-v1'; templateVersion:1; title:string;
};
export type AuthoringProblem = AlgebraAuthoringProblem | GeometryAuthoringProblem | GraphAuthoringProblem | ProblemBase & (
  {templateId:'math9-cylinder-recognition';curriculumCode:'M9-GEO-11';mode:'recognition';
    parameters:CylinderData & {unit:'cm'|'m'};variants:{practice:CylinderData;assessment:CylinderData};
    content?:{context?:string;exploreInstruction?:'Xoay để quan sát hình trụ.'|'Xoay để quan sát chiếc hộp.'}} |
  {templateId:'math9-parabola-coefficient';curriculumCode:'M9-ALG-09';mode:'coefficient';
    parameters:ParabolaData;variants:{practice:ParabolaData;assessment:ParabolaData};content?:{context?:string}}
);
export type AuthoringIssue = {path:string;code:string;message:string};
export class AuthoringError extends Error {
  constructor(public readonly issues:AuthoringIssue[]) {
    super(issues.map(i=>`${i.path || '/'}: ${i.message}`).join('\n'));
    this.name='AuthoringError';
  }
}
function freeze<T>(value:T):T {
  if(value && typeof value==='object') {Object.values(value).forEach(freeze);Object.freeze(value);}
  return value;
}
export const sixStepFlow = freeze([
  {id:'explore',role:'Khám phá'}, {id:'identify',role:'Nhận diện'},
  {id:'discover',role:'Tìm quy luật'}, {id:'guided',role:'Thực hành có hướng dẫn'},
  {id:'practice',role:'Vận dụng độc lập'}, {id:'assessment',role:'Tự kiểm tra và chốt kiến thức'},
] as const);
export type FormField = {
  key:string;label:string;symbol?:string;help:string;unitField?:string;
};
export type TemplateStep = typeof sixStepFlow[number] & {
  readonly taskKey:string;readonly dataSource:'parameters'|'variants.practice'|'variants.assessment';
  readonly objective:string;
};
function templateFlow(tasks:readonly [string,string][]):readonly TemplateStep[] {
  if(tasks.length!==6)throw new Error('Template phải định nghĩa đúng sáu nhiệm vụ.');
  return sixStepFlow.map((step,i)=>({...step,taskKey:tasks[i][0],objective:tasks[i][1],
    dataSource:i===4?'variants.practice':i===5?'variants.assessment':'parameters'}));
}
export interface TemplateDefinition {
  readonly templateId:AuthoringProblem['templateId']; readonly templateVersion:1;
  readonly namespace:'excel-repo-v1'; readonly curriculumCode:AuthoringProblem['curriculumCode'];
  readonly mode:AuthoringProblem['mode']; readonly compilerStatus:'pending'|'implemented-local';
  readonly flow:readonly TemplateStep[]; readonly form:readonly FormField[];
  readonly contentSlots:readonly string[];
  readonly runtimeEngine:Lesson['engine']['type'];
  validateMath(problem:AuthoringProblem):AuthoringIssue[];
}
function validateMath(problem:AuthoringProblem):AuthoringIssue[] {
  const issues:AuthoringIssue[]=[];
  const sets=[['/parameters',problem.parameters],['/variants/practice',problem.variants.practice],['/variants/assessment',problem.variants.assessment]] as const;
  if(problem.mode==='recognition') {
    for(const [path,data] of sets) {
      const {radius,height}=data as CylinderData;
      if(height/radius<0.1 || height/radius>10)
        issues.push({path,code:'math.aspectRatio',message:'Tỉ lệ h/r phải từ 0,1 đến 10 để quan sát rõ các bộ phận.'});
    }
  }
  if(isAlgebraTemplate(problem.templateId))for(const [path,data] of sets)for(const message of validateAlgebraData(data as AlgebraData,problem.mode))issues.push({path,code:'math.algebra',message});
  if(isGeometryTemplate(problem.templateId))for(const [path,data] of sets)for(const message of validateGeometryData(data as GeometryData,problem.mode))issues.push({path,code:'math.geometry',message});
  if(isGraphTemplate(problem.templateId))for(const [path,data] of sets)for(const message of validateGraphData(data as GraphData,graphTemplates[problem.templateId].mode))issues.push({path,code:'math.graph',message});
  // New data for both independent steps is mandatory; no random or implicit variants.
  const signature=(data:AuthoringProblem['parameters'])=>isAlgebraTemplate(problem.templateId)||isGeometryTemplate(problem.templateId)||isGraphTemplate(problem.templateId)?JSON.stringify(data):'a' in data ? `${data.a}` : `${data.radius}/${data.height}`;
  if(new Set(sets.map(([,data])=>signature(data))).size!==3)
    issues.push({path:'/variants',code:'math.distinctVariants',message:'Dữ kiện gốc, bước 5 và bước 6 phải khác nhau.'});
  return issues;
}
const definitions:readonly TemplateDefinition[]=freeze([
 ...algebraTemplates.map(t=>({templateId:t.templateId as AlgebraAuthoringProblem['templateId'],templateVersion:1 as const,namespace:'excel-repo-v1' as const,curriculumCode:t.curriculumCode as AlgebraAuthoringProblem['curriculumCode'],mode:t.mode as AlgebraAuthoringProblem['mode'],compilerStatus:'implemented-local' as const,runtimeEngine:'math_explorer_2d' as const,flow:templateFlow([['probe','Thử giá trị và so sánh hai vế trên miền xác định.'],['identify','Ghép nhân tử/hệ số hoặc chốt giá trị cấm.'],['relationship','Kiểm phép biến đổi, Δ hoặc tổng–tích.'],['guided','Giải với hướng dẫn, giữ điều kiện.'],['practice','Giải bộ dữ kiện mới.'],['assessment','Tự kiểm tra với dữ kiện mới.']]),form:t.form,contentSlots:['context'],validateMath})),
 ...geometryTemplates.map(t=>({templateId:t.templateId as GeometryAuthoringProblem['templateId'],templateVersion:1 as const,namespace:'excel-repo-v1' as const,curriculumCode:t.curriculumCode,mode:t.mode as GeometryAuthoringProblem['mode'],compilerStatus:'implemented-local' as const,runtimeEngine:'math_explorer_2d' as const,flow:templateFlow([['constrained-drag','Kéo hình hợp lệ, giữ ràng buộc.'],['semantic-select','Nhận diện đối tượng theo vai trò.'],['relationship','Tính đại lượng theo mô hình.'],['guided','Chọn và tính có hướng dẫn.'],['practice','Thực hành dữ kiện mới.'],['assessment','Tự kiểm tra dữ kiện mới.']]),form:t.form,contentSlots:['context'],validateMath})),
 ...Object.entries(graphTemplates).map(([templateId,g])=>({templateId:templateId as GraphAuthoringProblem['templateId'],templateVersion:1 as const,namespace:'excel-repo-v1' as const,curriculumCode:g.curriculumCode,mode:g.mode,compilerStatus:'implemented-local' as const,runtimeEngine:'math_explorer_2d' as const,
 flow:templateFlow([['probe','Di chuyển ghim và quan sát tọa độ.'],['identify','Nhận diện điểm nghiệm hoặc hai đối tượng đồ thị.'],['classify','Khám phá nghiệm hoặc số điểm chung.'],['guided','Dựng ghim/kết luận có hướng dẫn.'],['practice','Dữ kiện mới, tự tìm nghiệm.'],['assessment','Tự xác nhận nghiệm trên bộ dữ kiện mới.']]),
 form:[...['a','b','c',...(g.mode==='linear_system'?['d','e','f']:[]),...(g.mode==='line_parabola_intersection'?['q']:[])].map(key=>({key,label:({a:'Hệ số trước x của G',b:'Hệ số trước y của G',c:'Vế phải của G',d:'Hệ số trước x của H',e:'Hệ số trước y của H',f:'Vế phải của H',q:'Hệ số parabol H'} as Record<string,string>)[key],symbol:key,help:'Số nguyên từ −12 đến 12. G: ax + by = c; H: dx + ey = f hoặc y = qx². Mỗi đường thẳng cần ít nhất một hệ số x/y khác 0; q khác 0.'})),{key:'snap',label:'Bước ghim trên lưới',help:'0: tự do; 0,5 hoặc 1: ghim theo lưới. Nghiệm phải nằm trên lưới đã chọn.'}],contentSlots:['context'],validateMath})),

  {templateId:'math9-cylinder-recognition',templateVersion:1,namespace:'excel-repo-v1',curriculumCode:'M9-GEO-11',mode:'recognition',compilerStatus:'implemented-local',
    flow:templateFlow([['orbit','Xoay để quan sát hai đáy và mặt bên.'],['identify-radius','Nhận diện đoạn bán kính đáy.'],['compare-dimensions','Quan sát hai đáy bằng nhau khi thay đổi kích thước.'],['guided-height','Nhận diện chiều cao với gợi ý.'],['practice-parts','Nhận diện bộ phận trên dữ kiện mới, không gợi ý trực tiếp.'],['assess-parts','Tự phân biệt đáy và mặt bên trên dữ kiện mới; chốt kiến thức sau thao tác.']]),runtimeEngine:'math_explorer_2d',
    form:[{key:'radius',label:'Bán kính',symbol:'r',unitField:'unit',help:'Khoảng cách từ tâm đến đường tròn đáy; từ 0,1 đến 100.'},{key:'height',label:'Chiều cao',symbol:'h',unitField:'unit',help:'Khoảng cách giữa hai mặt phẳng đáy; từ 0,1 đến 100. Tỉ lệ h/r từ 0,1 đến 10.'},{key:'unit',label:'Đơn vị',help:'Dùng chung cm hoặc m cho cả ba bộ dữ kiện.'}],
    contentSlots:['context','exploreInstruction'],validateMath},
  {templateId:'math9-parabola-coefficient',templateVersion:1,namespace:'excel-repo-v1',curriculumCode:'M9-ALG-09',mode:'coefficient',compilerStatus:'implemented-local',
    flow:templateFlow([['vary-coefficient','Thay hệ số và quan sát hướng mở.'],['identify-sign','Nhận diện dấu hệ số qua hướng mở.'],['compare-magnitude','Tìm quan hệ giữa độ lớn hệ số và độ rộng đồ thị.'],['guided-point','Dựng hệ số từ điểm thuộc đồ thị với gợi ý.'],['practice-point','Tìm hệ số với dữ kiện mới, không gợi ý trực tiếp.'],['assess-coefficient','Tự dựng đồ thị theo dữ kiện mới; chốt quy tắc sau thao tác.']]),runtimeEngine:'math_explorer_2d',
    form:[{key:'a',label:'Hệ số của bình phương x',symbol:'a',help:'Đồ thị y = ax². Số nguyên từ −5 đến 5, khác 0; phù hợp bộ điều khiển hiện tại.'}],
    contentSlots:['context'],validateMath},
]);
export function listAuthoringTemplates():readonly TemplateDefinition[] {return definitions;}
export function getAuthoringTemplate(templateId:string,templateVersion:number):TemplateDefinition {
  const template=definitions.find(t=>t.templateId===templateId);
  if(!template) throw new AuthoringError([{path:'/templateId',code:'template.unknown',message:`Chưa hỗ trợ template “${templateId}”.`}]);
  if(template.templateVersion!==templateVersion) throw new AuthoringError([{path:'/templateVersion',code:'template.version',message:`Template “${templateId}” chưa hỗ trợ phiên bản ${templateVersion}.`}]);
  return template;
}
const check=new Ajv2020({allErrors:true,strict:false,strictNumbers:true}).compile(schema);
function schemaIssue(e:ErrorObject):AuthoringIssue {
  const extra=e.keyword==='additionalProperties' ? String(e.params.additionalProperty) : e.keyword==='required' ? String(e.params.missingProperty) : '';
  const message=e.keyword==='additionalProperties' ? `Trường “${extra}” không được phép trong JSON đề.` :
    e.keyword==='required' ? `Thiếu trường bắt buộc “${extra}”.` :
    e.keyword==='const' ? `Giá trị phải là ${JSON.stringify(e.params.allowedValue)}.` :
    e.keyword==='enum' ? `Chọn một giá trị: ${e.params.allowedValues.join(', ')}.` :
    e.keyword==='type' ? `Cần nhập ${{number:'số',integer:'số nguyên',string:'văn bản',object:'đối tượng JSON',array:'danh sách',boolean:'giá trị đúng/sai'}[e.params.type as string]??e.params.type}.` :
    e.keyword==='minimum' ? `Giá trị phải lớn hơn hoặc bằng ${e.params.limit}.` :
    e.keyword==='maximum' ? `Giá trị phải nhỏ hơn hoặc bằng ${e.params.limit}.` :
    e.keyword==='maxLength' ? `Nội dung không được vượt quá ${e.params.limit} ký tự.` :
    'Giá trị không thỏa giới hạn trong schema của template (kiểu, khoảng số hoặc nội dung cho phép).';
  return {path:e.instancePath+(extra?`/${extra}`:''),code:`schema.${e.keyword}`,message};
}
/** Standalone schema bundle uses the same branch as the registry validator. */
export function exportAuthoringBundle(templateId:string,templateVersion:number) {
  const template=getAuthoringTemplate(templateId,templateVersion);
  const selected=schema.oneOf.find(b=>b.properties.templateId.const===templateId)!;
  return {schema:structuredClone({...schema,oneOf:[selected]}),template,
    example:structuredClone(algebraTemplates.find(t=>t.templateId===templateId)?.example??geometryTemplates.find(t=>t.templateId===templateId)?.example??({ 'math9-cylinder-recognition':cylinderExample,'math9-parabola-coefficient':parabolaExample,'math9-linear-relation':relationExample,'math9-linear-system':systemExample,'math9-line-parabola':intersectionExample } as Record<string,AuthoringProblem>)[templateId]),
    instructions:'Chỉ trả JSON đề theo schema. Giữ namespace và mã canonical. Không thêm checkpoints, đáp án, mã thực thi hoặc hotspot. practice/assessment là dữ kiện mới cho bước 5/6, dùng chung đơn vị. context là ghi chú bối cảnh một dòng lưu cùng đề, không chứa số; template v1 không dùng ghi chú này để thay lời dẫn runtime. Lời hỏi có dữ kiện do compiler sinh. Chỉ biên dịch bằng adapter tin cậy đã triển khai; kiểm nghiệm renderer/mobile và lưu sidecar trước khi publish.'};
}
export function validateAuthoring(input:unknown):AuthoringIssue[] {
  if(!input || typeof input!=='object' || Array.isArray(input)) return [{path:'',code:'schema.type',message:'JSON đề phải là một object.'}];
  const candidate=input as Record<string,unknown>;
  if(typeof candidate.templateId!=='string'||!candidate.templateId.trim())return [{path:'/templateId',code:'template.required',message:'Thiếu dạng bài. Dùng templateId từ JSON mẫu được tải trong Studio.'}];
  if(!Number.isSafeInteger(candidate.templateVersion)||Number(candidate.templateVersion)<1)return [{path:'/templateVersion',code:'template.version',message:'Phiên bản template phải là số nguyên dương. Dùng phiên bản từ JSON mẫu.'}];
  let template:TemplateDefinition;
  try {template=getAuthoringTemplate(String(candidate.templateId),Number(candidate.templateVersion));}
  catch(error) {if(error instanceof AuthoringError)return error.issues;throw error;}
  // Select one branch first so invalid input does not produce errors from unrelated templates.
  const validator=templateValidators.get(template.templateId)!;
  if(!validator(input))return (validator.errors??[]).filter(e=>e.keyword!=='oneOf').map(schemaIssue);
  return template.validateMath(input as AuthoringProblem);
}
const templateValidators=new Map(definitions.map(t=>[t.templateId,new Ajv2020({allErrors:true,strict:false,strictNumbers:true}).compile(exportAuthoringBundle(t.templateId,1).schema)]));
export function parseAuthoring(input:unknown):AuthoringProblem {
  const issues=validateAuthoring(input);
  if(issues.length)throw new AuthoringError(issues);
  return structuredClone(input as AuthoringProblem);
}
// Also exported for consumers needing the full discriminated JSON Schema.
export const authoringSchema=freeze(structuredClone(schema));
export function matchesAuthoringSchema(input:unknown):boolean {return !!check(input);}

export type CompileContext = {lessonId:string;version:number};
/** Trusted code adapter, never taken from the problem JSON. CP-04/05 supply implementations. */
export interface TemplateCompiler {
  readonly templateId:AuthoringProblem['templateId'];readonly templateVersion:1;
  readonly compilerVersion:string;
  compile(problem:AuthoringProblem,context:CompileContext):Lesson;
}
export interface AuthoringReceipt {
  receiptVersion:'1.0.0';templateId:AuthoringProblem['templateId'];templateVersion:1;
  compilerVersion:string;authoringInput:AuthoringProblem;
  runtime:{lessonId:string;version:number};
}
export function compileAuthoring(input:unknown,context:CompileContext,compiler:TemplateCompiler):{manifest:Lesson;receipt:AuthoringReceipt} {
  const problem=parseAuthoring(input),template=getAuthoringTemplate(problem.templateId,problem.templateVersion);
  if(compiler.templateId!==template.templateId || compiler.templateVersion!==template.templateVersion || !compiler.compilerVersion.trim())
    throw new Error('Compiler không khớp template/phiên bản đã chọn.');
  if(!context.lessonId.trim() || !Number.isSafeInteger(context.version) || context.version<1)throw new Error('Lesson ID hoặc version không hợp lệ.');
  const manifest=compiler.compile(freeze(structuredClone(problem)),freeze({...context}));
  const errors=validateLesson(manifest);
  if(manifest.lessonId!==context.lessonId || manifest.version!==context.version || manifest.status!=='draft' || manifest.grade!==9 || manifest.title!==problem.title || manifest.engine.type!==template.runtimeEngine || manifest.topicIds.length!==1 || manifest.topicIds[0]!==template.curriculumCode)
    errors.push('Manifest phải giữ identity, tiêu đề, curriculum và engine của template, ở trạng thái draft lớp 9.');
  if(manifest.checkpoints.length!==6 || manifest.checkpoints.some((cp,i)=>cp.id!==template.flow[i].id || cp.order!==i+1) || JSON.stringify(manifest.completion.requiredCheckpointIds)!==JSON.stringify(template.flow.map(s=>s.id)))
    errors.push('Compiler phải giữ đủ sáu bước theo ID/thứ tự cố định và completion tương ứng.');
  if(errors.length)throw new Error(`Compiler tạo manifest không hợp lệ: ${errors.join('; ')}`);
  return {manifest,receipt:{receiptVersion:'1.0.0',templateId:problem.templateId,templateVersion:1,compilerVersion:compiler.compilerVersion,authoringInput:problem,runtime:{...context}}};
}
