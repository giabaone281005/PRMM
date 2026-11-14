import {buildRecognition,type RecognitionTask} from './math9';
import {compileAuthoring,sixStepFlow,type TemplateCompiler,type CompileContext} from './template-registry';
import {parabolaModel,type ParabolaConfig} from '../lesson-runtime/parabola';

export const parabolaCompiler:TemplateCompiler={
  templateId:'math9-parabola-coefficient',templateVersion:1,compilerVersion:'parabola-coefficient-1.0.0',
  compile(problem,context){
    if(problem.templateId!=='math9-parabola-coefficient')throw Error('Compiler chỉ hỗ trợ parabol y = ax².');
    const coefficients=[problem.parameters.a,problem.parameters.a,problem.parameters.a,problem.parameters.a,problem.variants.practice.a,problem.variants.assessment.a];
    const tasks:ParabolaConfig['task'][]=['explore','identify','compare','guided','practice','assessment'];
    const configs:ParabolaConfig[]=coefficients.map((a,i)=>({a,task:tasks[i],pointX:i===4?1:i===5?-2:2}));
    const recognition:RecognitionTask[]=configs.map((c,i)=>{
      const {point,referenceA}=parabolaModel(c);
      const questions=[
        'Thay đổi hệ số a của y = ax² để quan sát cả hai hướng mở. Hệ số 0 không tạo thành parabol.',
        'Quan sát đồ thị G. Kéo thẻ dấu hệ số vào đồ thị, hoặc chọn thẻ rồi chạm vùng đồ thị.',
        `Hai đồ thị G: y = ${c.a}x² và H: y = ${referenceA}x². Đưa điểm dò đến x = 2, rồi chạm đồ thị có |y| lớn hơn (hẹp hơn).`,
        `Dựng y = ax² đi qua P(${point.x}; ${point.y}). Kéo điểm điều khiển hoặc thay a, rồi chạm P để xác nhận.`,
        `Với điểm mới P(${point.x}; ${point.y}), tự dựng y = ax² đi qua P và chạm P để xác nhận.`,
        `Tự kiểm tra: dựng y = ax² đi qua P(${point.x}; ${point.y}), rồi chạm P để xác nhận.`,
      ];
      const feedback=[
        'Khi a dương, parabol mở lên; khi a âm, parabol mở xuống. Đỉnh luôn tại O.',
        `G mở ${c.a>0?'lên nên a > 0':'xuống nên a < 0'}.`,
        'Ở cùng hoành độ khác 0, hệ số có trị tuyệt đối lớn hơn cho |y| lớn hơn và đồ thị hẹp hơn.',
        `Thay tọa độ P vào y = ax²: a = ${point.y}/(${point.x})² = ${c.a}.`,
        `Điểm mới cho a = ${point.y}/(${point.x})² = ${c.a}; đồ thị đã đi qua P.`,
        `a = ${point.y}/(${point.x})² = ${c.a}. Với a khác 0: dấu quyết định hướng mở, |a| quyết định độ rộng; đỉnh tại O.`,
      ];
      return {question:questions[i],mode:'tap',choices:['Thao tác trên đồ thị','Quan sát'],correct:1,diagram:'none',explanation:feedback[i],
        hint:i===3?`Thay x = ${point.x}, y = ${point.y} vào y = ax². Chia hai vế cho x², rồi dựng và xác nhận.`:
          i>=4?'Dùng quan hệ giữa tọa độ điểm và đồ thị đã khám phá. Chạm P sau khi dựng xong.':
          i===2?'So sánh khoảng cách từ hai điểm trên đồ thị tới trục Ox ở cùng hoành độ.':
          'Thao tác trên đồ thị và quan sát vị trí so với trục Ox.',
        uime:{kind:'PARABOLA_SLIDER',solid:'cylinder',labels:['Hệ số a'],tokens:[],answers:[c.a],min:-5,max:5,step:1,hotspots:[],parabola:c}};
    });
    const lesson=buildRecognition({id:problem.curriculumCode,title:problem.title,tasks:recognition},context.lessonId);
    lesson.version=context.version;lesson.topicIds=[problem.curriculumCode];
    lesson.scene.objects=[{id:'parabola-model',kind:'math_model',model:'quadratic_graph',parameters:{a:problem.parameters.a,b:0,c:0,targetA:problem.parameters.a,targetB:0,targetC:0}}];
    lesson.learningObjectives=['Nhận biết hướng mở, độ rộng và dựng parabol y = ax² qua điểm có hoành độ khác 0.'];
    lesson.checkpoints.forEach((cp,i)=>{cp.id=sixStepFlow[i].id;cp.order=i+1;});
    lesson.completion.requiredCheckpointIds=lesson.checkpoints.map(cp=>cp.id);
    return lesson;
  },
};
export function compileParabola(input:unknown,context:CompileContext){return compileAuthoring(input,context,parabolaCompiler);}
