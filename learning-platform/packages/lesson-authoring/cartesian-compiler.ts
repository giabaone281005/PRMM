import {buildRecognition,type RecognitionTask} from './math9';
import {compileAuthoring,sixStepFlow,type TemplateCompiler,type CompileContext} from './template-registry';
import {graphTemplates,isGraphTemplate,type GraphTemplateId,type GraphAuthoringProblem} from './graph-templates';
import {graphSolution,relationPoint,type GraphConfig} from '../lesson-runtime/cartesian';

export const graphCompilers=Object.fromEntries(Object.entries(graphTemplates).map(([templateId,definition])=>[templateId,{
 templateId:templateId as GraphTemplateId,templateVersion:1,compilerVersion:'cartesian-1.0.0',
 compile(problem,context){
  if(!isGraphTemplate(problem.templateId))throw Error('Không phải template Cartesian.');
  const p=problem as GraphAuthoringProblem;
  const configs:GraphConfig[]=[p.parameters,p.parameters,p.parameters,p.parameters,p.variants.practice,p.variants.assessment].map((data,i)=>({...data,mode:definition.mode,task:sixStepFlow[i].id}));
  const tasks:RecognitionTask[]=configs.map((g,i)=>{
   const anchor=relationPoint(g,i===4?2:i===5?3:1),solution=graphSolution(g,g.mode);
   const name=g.mode==='linear_relation'?'đường thẳng G':g.mode==='linear_system'?'hệ hai đường thẳng':'đường thẳng G và parabol H';
   const solve=g.mode==='linear_relation'?`Đặt ghim lên G ${g.b!==0?`với x = ${anchor.x}`:`với y = ${anchor.y}`}, rồi xác nhận.`:
    'Chọn số nghiệm/giao điểm; nếu có nghiệm hữu hạn, đặt ghim tại các điểm chung rồi xác nhận. Nếu không có hoặc vô số, xác nhận kết luận.';
   const instructions=[`Kéo ghim để quan sát tọa độ và ${name}.`,g.mode==='linear_relation'?'Tìm một điểm thuộc G bằng cách di chuyển ghim rồi xác nhận.':'Chạm cả G và H để nhận diện hai đồ thị (có thể dùng nút có nhãn).',
    g.mode==='linear_relation'?`Tìm thêm điểm trên G: ${solve}`:'Quan sát vị trí tương đối và chọn số nghiệm/giao điểm, rồi xác nhận kết luận.',
    `Thực hành có hướng dẫn: ${solve}`,`Dữ kiện mới: ${solve}`,`Tự kiểm tra với dữ kiện mới: ${solve}`];
   const result=g.mode==='linear_relation'?`Điểm (${anchor.x}; ${anchor.y}) thỏa ${g.a}x + (${g.b})y = ${g.c}.`:
    solution.kind==='parallel'?'Hai đường thẳng song song phân biệt: hệ vô nghiệm.':solution.kind==='coincident'?'Hai đường thẳng trùng nhau: hệ có vô số nghiệm.':solution.points.length===0?'Không có điểm chung.':`Điểm chung: ${solution.points.map(p=>`(${Number(p.x.toFixed(6))}; ${Number(p.y.toFixed(6))})`).join(', ')}.`;
   return {question:instructions[i],mode:'tap',diagram:'none',correct:1,choices:['Thao tác đồ thị','Quan sát'],
    explanation:i===1&&g.mode==='linear_relation'?'Điểm bạn chọn thỏa phương trình đường thẳng G.':i===0?'Ghim và tọa độ cùng thay đổi theo hệ trục.':i===1&&g.mode!=='linear_relation'?'Đã nhận diện hai đối tượng có ID riêng, kể cả khi chúng trùng nhau.':result,
    hint:i===3?(g.mode==='linear_relation'?'Thay tọa độ đã biết vào ax + by = c để tìm tọa độ còn lại.':'Tìm điểm thỏa đồng thời hai phương trình. Song song phân biệt không có điểm chung, trùng nhau có vô số điểm chung.'):'Quan sát đồ thị và dùng quan hệ phương trình để đặt ghim. Không cần dùng hết hai ghim nếu không có hai giao điểm.',
    uime:{kind:'PARABOLA_SLIDER',solid:'cylinder',labels:[],tokens:[],answers:[1],min:-12,max:12,step:1,hotspots:[],graph:g}};
  });
  const lesson=buildRecognition({id:p.curriculumCode,title:p.title,tasks},context.lessonId);
  lesson.version=context.version;lesson.topicIds=[p.curriculumCode];lesson.learningObjectives=['Khám phá phương trình và điểm nghiệm bằng thao tác trên hệ tọa độ.'];
  lesson.checkpoints.forEach((cp,i)=>{cp.id=sixStepFlow[i].id;});lesson.completion.requiredCheckpointIds=lesson.checkpoints.map(c=>c.id);
  return lesson;
 },
} satisfies TemplateCompiler])) as Record<GraphTemplateId,TemplateCompiler>;
export function compileCartesian(input:unknown,context:CompileContext,templateId:GraphTemplateId){return compileAuthoring(input,context,graphCompilers[templateId]);}
