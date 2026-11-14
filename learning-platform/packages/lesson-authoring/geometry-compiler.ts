import {buildRecognition,type RecognitionTask} from './math9';
import {compileAuthoring,sixStepFlow,type TemplateCompiler,type CompileContext} from './template-registry';
import {geometryTemplates,isGeometryTemplate,type GeometryAuthoringProblem,type GeometryTemplateId} from './geometry-templates';
import {geometryModel,type GeometryConfig} from '../lesson-runtime/geometry';
export const geometryCompilers=Object.fromEntries(geometryTemplates.map(t=>[t.templateId,{
 templateId:t.templateId as GeometryTemplateId,templateVersion:1,compilerVersion:'geometry-1.0.0',
 compile(problem,context){
  if(!isGeometryTemplate(problem.templateId))throw Error('Không phải template hình học.');
  const p=problem as GeometryAuthoringProblem,sets=[p.parameters,p.parameters,p.parameters,p.parameters,p.variants.practice,p.variants.assessment];
  const tasks:RecognitionTask[]=sets.map((data,i)=>{
   const g:GeometryConfig={mode:p.mode,curriculumCode:p.curriculumCode,data,task:sixStepFlow[i].id},m=geometryModel(g);
   const subject=p.mode==='right_triangle'?`cạnh ${data.target==='opposite'?'đối':data.target==='adjacent'?'kề':'huyền'} theo góc ${data.angleAt}`:p.mode==='circle_symmetry'?'điểm đối xứng Q':p.mode==='line_circle'?'đường thẳng ℓ':p.mode==='two_circles'?'đường tròn tâm K':p.mode==='circle_angles'?'cung nhỏ AB':p.mode==='arc_sector_annulus'?data.measure==='arc'?'cung AB':data.measure==='sector'?'quạt AOB':'vành khuyên':p.mode==='triangle_circles'?`đường tròn ${data.construction==='incircle'?'nội':'ngoại'} tiếp`:'đa giác';
   const question=[`Kéo chấm cam để thay đổi hướng hoặc vị trí hợp lệ. Quan sát các quan hệ được giữ nguyên.`,`Chạm/chọn ${subject}. Nếu đối tượng thuộc lớp dựng hình, bật lớp tương ứng trước.`,`Quan sát mô hình và tính: ${m.quantity}. Nhập kết quả rồi xác nhận.`,`Chọn ${subject}, tính ${m.quantity}, rồi xác nhận.`,`Dữ kiện mới: chọn ${subject} và tính ${m.quantity}.`,`Tự kiểm tra với dữ kiện mới: chọn ${subject}, nhập ${m.quantity}, rồi xác nhận.`][i];
   const hint=p.mode==='right_triangle'?'Góc vuông ở A. Huyền là cạnh đối diện A; đối/kề thay đổi theo góc đang xét. Dùng Pythagore hoặc tỉ số lượng giác.':p.mode==='line_circle'||p.mode==='two_circles'?'So sánh khoảng cách với bán kính (hoặc tổng/hiệu hai bán kính); kiểm riêng trường hợp đồng tâm.':p.mode==='circle_angles'?'Góc nội tiếp chắn cùng cung bằng nửa góc ở tâm.':p.mode==='arc_sector_annulus'?'Độ dài cung tỉ lệ với góc/360; diện tích quạt cũng vậy. Vành khuyên lấy diện tích ngoài trừ trong.':p.mode==='triangle_circles'?'Tâm nội tiếp là giao phân giác, r = S/p. Tâm ngoại tiếp là giao trung trực, R = abc/(4S).':p.mode==='cyclic_polygon'?'Tứ giác nội tiếp có hai góc đối bù nhau. Góc trong đa giác đều bằng (n−2)×180/n.':'Đối xứng qua trục giữ khoảng cách; so sánh OP với bán kính.';
   return {question,mode:'tap',diagram:'none',correct:1,choices:['Thao tác hình học','Quan sát'],hint,
    explanation:i===0?'Hình đổi hướng nhưng các ràng buộc toán được giữ.':i===1?'Bạn đã chọn đúng đối tượng theo vai trò hình học.':`${m.quantity}: ${Number(m.value.toFixed(6))}.`,
    uime:{kind:'TRIANGLE_HOTSPOT_TAP',labels:[],tokens:[],answers:[1],min:-100000,max:100000,step:.001,solid:'cylinder',hotspots:[],geometry:g}};
  });
  const lesson=buildRecognition({id:p.curriculumCode,title:p.title,tasks},context.lessonId);lesson.version=context.version;lesson.topicIds=[p.curriculumCode];lesson.learningObjectives=[`Khám phá ${t.label.toLowerCase()} qua dựng hình và thao tác có ràng buộc.`];lesson.checkpoints.forEach((cp,i)=>{cp.id=sixStepFlow[i].id;});lesson.completion.requiredCheckpointIds=lesson.checkpoints.map(c=>c.id);return lesson;
 },
} satisfies TemplateCompiler])) as Record<GeometryTemplateId,TemplateCompiler>;
export const compileGeometry=(input:unknown,context:CompileContext,id:GeometryTemplateId)=>compileAuthoring(input,context,geometryCompilers[id]);
