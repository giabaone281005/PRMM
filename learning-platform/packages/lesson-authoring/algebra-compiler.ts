import {buildRecognition,type RecognitionTask} from './math9';
import {compileAuthoring,sixStepFlow,type TemplateCompiler,type CompileContext} from './template-registry';
import {algebraTemplates,isAlgebraTemplate,type AlgebraAuthoringProblem,type AlgebraTemplateId} from './algebra-templates';
import {algebraModel,algebraFormat,type AlgebraConfig} from '../lesson-runtime/algebra';
export const algebraCompilers=Object.fromEntries(algebraTemplates.map(t=>[t.templateId,{
 templateId:t.templateId as AlgebraTemplateId,templateVersion:1,compilerVersion:'algebra-1.0.0',
 compile(problem,context){
  if(!isAlgebraTemplate(problem.templateId))throw Error('Không phải template đại số.');
  const p=problem as AlgebraAuthoringProblem,sets=[p.parameters,p.parameters,p.parameters,p.parameters,p.variants.practice,p.variants.assessment];
  const tasks:RecognitionTask[]=sets.map((data,i)=>{
   const g:AlgebraConfig={mode:p.mode,data,task:sixStepFlow[i].id},m=algebraModel(g);
   const identify=g.mode==='product_equation'?'Đưa hai nhân tử đang có vào hai khay (có thể đổi thứ tự).':g.mode==='rational_equation'?'Tìm tất cả giá trị làm mẫu bằng 0, chọn và chốt điều kiện xác định.':'Kéo/chạm các thẻ số vào đúng ô hệ số a, b, c; chú ý dấu và hệ số 0.';
   const discover=g.mode==='viete'?'Ghép công thức tổng và tích vào đúng ô; tính tổng/tích từ hệ số rồi xác nhận.':g.mode==='quadratic_equation'?'Xác định bậc, tính Δ nếu bậc hai và chọn số nghiệm thực khác nhau; xác nhận.':'Chọn một phép biến đổi tương đương hợp lệ rồi xác nhận. Với hữu tỉ, chốt đúng miền xác định trước khi khử mẫu.';
   const solve=g.mode==='viete'?'Ghép công thức tổng/tích, nhập tổng/tích và cả hai nghiệm (nghiệm kép nhập hai lần). Chọn phép biến đổi hợp lệ, số nghiệm khác nhau rồi xác nhận.':g.mode==='quadratic_equation'?'Ghép a/b/c, xác định bậc, tính Δ nếu bậc hai; chọn phép biến đổi hợp lệ, số nghiệm và nhập nghiệm thực rồi xác nhận.':g.mode==='product_equation'?'Ghép hai nhân tử, chọn phép biến đổi hợp lệ, số nghiệm thực khác nhau và nhập nghiệm rồi xác nhận.':'Chốt miền xác định; chọn phép biến đổi hợp lệ, phân loại nghiệm rồi nhập các nghiệm thỏa phương trình gốc. Loại nghiệm rơi vào giá trị cấm.';
   const question=[`Thay giá trị thử x và quan sát hai vế. Thẻ có dấu là số đại số, không phải khối lượng.`,identify,discover,`Thực hành có hướng dẫn: ${solve}`,`Dữ kiện mới: ${solve}`,`Tự kiểm tra với dữ kiện mới: ${solve}`][i];
   const result=m.kind==='all'?`Mọi số thực${m.forbidden.length?' trừ '+m.forbidden.map(algebraFormat).join(', '):''}.`:m.roots.length?`Nghiệm hợp lệ: ${m.roots.map(algebraFormat).join(', ')}${g.mode==='viete'&&m.roots.length===1?' (nghiệm kép)':''}.`:'Không có nghiệm thực hợp lệ.';
   const hint=g.mode==='rational_equation'?'Đặt từng nhân tử mẫu bằng 0 để tìm giá trị cấm. Sau khi giải phương trình đã khử mẫu, kiểm lại mọi nghiệm trên miền gốc.':g.mode==='product_equation'?'Tích bằng 0 khi ít nhất một nhân tử bằng 0. Chia cho một nhân tử có thể bằng 0 sẽ làm mất nghiệm.':g.mode==='viete'?'Với a khác 0 và có nghiệm thực: tổng = −b/a, tích = c/a. Nghiệm kép vẫn xuất hiện hai lần trong tổng và tích.':'Nếu a = 0 thì kiểm b để xét tuyến tính hoặc hằng; khi a khác 0, Δ = b² − 4ac quyết định số nghiệm thực.';
   return {question,mode:'tap',diagram:'none',correct:1,choices:['Thao tác đại số','Quan sát'],hint,explanation:i===0?'Hai vế được tính từ cùng biểu thức; mẫu bằng 0 làm phép thử không xác định.':i===1?'Đã nhận diện đúng thành phần hoặc miền xác định.':i===2?'Quan hệ và điều kiện áp dụng đã được xác nhận.':result+(m.extraneous.length?` Loại ${m.extraneous.map(algebraFormat).join(', ')} vì mẫu bằng 0.`:''),uime:{kind:'FORMULA_SNAP_BUILDER',labels:['Khay đại số'],tokens:[],answers:[1],min:-1000,max:1000,step:.000001,solid:'cylinder',hotspots:[],algebra:g}};
  });
  const lesson=buildRecognition({id:p.curriculumCode,title:p.title,tasks},context.lessonId);lesson.version=context.version;lesson.topicIds=[p.curriculumCode];lesson.learningObjectives=[`Thao tác ${t.label.toLowerCase()} với biểu thức và miền xác định được kiểm chứng.`];lesson.checkpoints.forEach((cp,i)=>{cp.id=sixStepFlow[i].id;});lesson.completion.requiredCheckpointIds=lesson.checkpoints.map(c=>c.id);return lesson;
 },
} satisfies TemplateCompiler])) as Record<AlgebraTemplateId,TemplateCompiler>;
export const compileAlgebra=(input:unknown,context:CompileContext,id:AlgebraTemplateId)=>compileAuthoring(input,context,algebraCompilers[id]);
