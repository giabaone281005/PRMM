import {buildRecognition,type RecognitionTask} from './math9';
import {compileAuthoring,sixStepFlow,type TemplateCompiler,type CompileContext} from './template-registry';
import type {CylinderConfig} from '../lesson-runtime/cylinder';

export const cylinderCompiler:TemplateCompiler={
  templateId:'math9-cylinder-recognition',templateVersion:1,compilerVersion:'cylinder-recognition-1.0.0',
  compile(problem,context){
    if(problem.templateId!=='math9-cylinder-recognition')throw Error('Compiler chỉ hỗ trợ nhận diện hình trụ.');
    const {parameters:p,variants:v}=problem;
    const sets=[p,p,p,p,{...v.practice,unit:p.unit},{...v.assessment,unit:p.unit}];
    const tasks:CylinderConfig['task'][]=['orbit','radius','equal-bases','height','radius','side'];
    const questions=[problem.content?.exploreInstruction??'Xoay để quan sát hình trụ.',
      'Chạm đoạn biểu diễn bán kính của đáy.',
      'Thay đổi bán kính bằng thanh điều khiển, rồi chạm cả hai đáy. Hai đáy có cùng kích thước không?',
      'Chạm đoạn đo khoảng cách giữa hai mặt phẳng đáy. Có thể mở gợi ý.',
      'Với hình trụ mới, tự tìm đoạn bán kính.',
      'Tự kiểm tra: chạm mặt bên của hình trụ mới.'];
    const feedback=['Bạn đã quan sát hình trụ từ các hướng.',
      'Bán kính nối tâm đáy tới đường tròn đáy.',
      'Hai đáy là hai hình tròn bằng nhau; thay bán kính làm cả hai đáy cùng thay đổi.',
      'Chiều cao là khoảng cách giữa hai mặt phẳng đáy, vuông góc với đáy.',
      'Dù kích thước đổi, bán kính vẫn nối tâm tới đường tròn đáy.',
      'Mặt bên là mặt cong nối hai đường tròn đáy. Hình trụ có hai đáy bằng nhau.'];
    const recognition:RecognitionTask[]=sets.map((data,i)=>({question:`${questions[i]} (r = ${data.radius} ${p.unit}, h = ${data.height} ${p.unit})`,
      mode:'tap',choices:['Thao tác trên hình','Quan sát'],correct:1,diagram:'none',explanation:feedback[i],
      hint:i===3?'Tìm đoạn vuông góc với hai đáy, nối hai mặt phẳng đáy.':i>=4?'Hãy vận dụng định nghĩa đã khám phá; chọn trực tiếp trên mô hình.':'Vuốt để nhìn từ hướng khác; chạm trực tiếp bộ phận trên hình.',
      uime:{kind:'3D_SOLID_INSPECTOR',solid:'cylinder',labels:[],tokens:['A','B','C','D','E'],answers:[{orbit:0,radius:0,'equal-bases':2,height:1,side:4}[tasks[i]]],
        min:0,max:5,step:1,hotspots:[],cylinder:{radius:data.radius,height:data.height,unit:p.unit,task:tasks[i]}}}));
    const lesson=buildRecognition({id:problem.curriculumCode,title:problem.title,tasks:recognition},context.lessonId);
    lesson.version=context.version;lesson.topicIds=[problem.curriculumCode];
    lesson.learningObjectives=['Nhận diện hai đáy, mặt bên, bán kính và chiều cao của hình trụ.'];
    lesson.scene.initialState={a:.4,b:.3};
    lesson.checkpoints.forEach((cp,i)=>{cp.id=sixStepFlow[i].id;cp.order=i+1;});
    lesson.completion.requiredCheckpointIds=lesson.checkpoints.map(cp=>cp.id);
    return lesson;
  },
};
export function compileCylinder(input:unknown,context:CompileContext){return compileAuthoring(input,context,cylinderCompiler);}
