import {compileAlgebra} from './algebra-compiler';
import {isAlgebraTemplate,algebraTemplates} from './algebra-templates';
import {algebraSolutionEvents} from '../lesson-runtime/algebra';
import {compileGeometry} from './geometry-compiler';
import {isGeometryTemplate,geometryTemplates} from './geometry-templates';
import {geometrySolutionEvents} from '../lesson-runtime/geometry';
import {compileCartesian} from './cartesian-compiler';
import {isGraphTemplate,graphTemplates} from './graph-templates';
import {graphClass,graphTargets} from '../lesson-runtime/cartesian';
import {parseAuthoring,type CompileContext,type AuthoringProblem} from './template-registry';
import {compileCylinder} from './cylinder-compiler';
import {compileParabola} from './parabola-compiler';
import {LessonSession} from '../lesson-runtime';
import {parabolaModel} from '../lesson-runtime/parabola';
import {requireProblemAdapter} from './core-routing';

/** Used by import/preview and by trusted persistence; never accepts a client manifest or receipt. */
export function compileProblem(input:unknown,context:CompileContext) {
  const problem=parseAuthoring(input);
  const {adapter}=requireProblemAdapter(problem,context.lessonId+'-scene');
  if(adapter.templateId!==problem.templateId)throw Error('Template không khớp canonical engine adapter.');
  const result=isAlgebraTemplate(problem.templateId)?compileAlgebra(problem,context,problem.templateId):isGeometryTemplate(problem.templateId)?compileGeometry(problem,context,problem.templateId):isGraphTemplate(problem.templateId)?compileCartesian(problem,context,problem.templateId):problem.templateId==='math9-cylinder-recognition'?compileCylinder(problem,context):compileParabola(problem,context);
  const session=new LessonSession(result.manifest),objects=session.objects;
  for(const task of result.manifest.recognition!) {
    if(session.success)throw Error('Bước mới tự hoàn thành. Chọn lại dữ kiện hoặc báo quản trị viên.');
    const change=(name:string,value:number)=>session.interact({type:'adjust_parameter',name,value});
    const u=task.uime!;
    if(u.algebra){for(const event of algebraSolutionEvents(u.algebra))session.interact(event);}
    else if(u.geometry){for(const event of geometrySolutionEvents(u.geometry))session.interact(event);}
    else if(u.graph){const g=u.graph;
      if(g.task==='explore')change('x',g.snap||1);
      else if(g.task==='identify'&&g.mode!=='linear_relation'){change('b',1);change('b',2);}
      else if(g.task==='discover'&&g.mode!=='linear_relation'){change('c',graphClass(g));change('numerator',1);}
      else{const points=graphTargets(g);if(g.mode!=='linear_relation')change('c',graphClass(g));points.forEach((p,i)=>{change(i?'width':'x',p.x);change(i?'height':'y',p.y);});change('numerator',1);}
    }else if(u.cylinder){
      switch(u.cylinder.task){
        case 'orbit':change('a',1);break;
        case 'equal-bases':change('width',1.3);change('x',2);change('x',3);break;
        case 'radius':change('x',0);break;
        case 'height':change('x',1);break;
        case 'side':change('x',4);break;
      }
    }else if(u.parabola){
      const c=u.parabola;
      if(c.task==='explore'){change('x',-c.a);change('x',c.a);}
      else if(c.task==='identify')change('y',c.a>0?0:1);
      else if(c.task==='compare'){change('a',2);change('y',parabolaModel(c).narrower);}
      else{change('x',c.a);change('y',0);}
    }else throw Error('Template chưa có renderer được hỗ trợ trong luồng chuẩn.');
    if(!session.success||!session.advance()||session.objects!==objects)throw Error('Dữ kiện chưa thể hoàn thành đủ sáu bước. Kiểm tra giới hạn template.');
  }
  return result;
}
export type AuthoringChange={path:string;before:unknown;after:unknown};
export function diffAuthoring(before:unknown,after:unknown,path=''):AuthoringChange[] {
  if(JSON.stringify(before)===JSON.stringify(after))return [];
  if(before&&after&&typeof before==='object'&&typeof after==='object'&&!Array.isArray(before)&&!Array.isArray(after)) {
    const a=before as Record<string,unknown>,b=after as Record<string,unknown>;
    return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>diffAuthoring(a[k],b[k],path+'/'+k));
  }
  return [{path,before,after}];
}
export const templateName=(id:AuthoringProblem['templateId'])=>isAlgebraTemplate(id)?algebraTemplates.find(t=>t.templateId===id)!.label:isGeometryTemplate(id)?geometryTemplates.find(t=>t.templateId===id)!.label:isGraphTemplate(id)?graphTemplates[id].label:id==='math9-cylinder-recognition'?'Hình trụ · Nhận diện':'Parabol · Hệ số';
