import {isAlgebraTemplate} from './algebra-templates';
import {isGeometryTemplate,geometryTemplates} from './geometry-templates';
import {isGraphTemplate,graphTemplates} from './graph-templates';
import {requireCoreConfig,resolveCoreAdapter,type CoreConfig} from '../lesson-contract/core-engines';
import type {AuthoringProblem} from './template-registry';

/** Canonical classification beside legacy Lesson. Never inserts unsupported engine IDs into runtime v1. */
export function coreConfigForProblem(problem:AuthoringProblem,sceneId:string):CoreConfig{
 const common={configVersion:'1.0.0',engineVersion:'1.0.0',namespace:'excel-repo-v1',templateVersion:problem.templateVersion,sceneId,viewport:{logicalWidth:360,logicalHeight:360,fit:'adapter-derived'}};
 return requireCoreConfig(isAlgebraTemplate(problem.templateId)?{...common,engineId:'balance_scale_engine',mode:problem.mode,curriculumCode:problem.curriculumCode,model:problem.parameters}:isGeometryTemplate(problem.templateId)?{...common,engineId:'geometry_2d_canvas',mode:problem.mode,curriculumCode:problem.curriculumCode,model:problem.parameters}:isGraphTemplate(problem.templateId)?{...common,engineId:'cartesian_graph_engine',mode:graphTemplates[problem.templateId].mode,curriculumCode:problem.curriculumCode,model:problem.parameters}:problem.templateId==='math9-cylinder-recognition'?
  {...common,engineId:'area_fraction_grid',mode:'cylinder_recognition',curriculumCode:problem.curriculumCode,model:problem.parameters}:
  {...common,engineId:'cartesian_graph_engine',mode:'parabola_coefficient',curriculumCode:problem.curriculumCode,model:problem.parameters});
}
export function requireProblemAdapter(problem:AuthoringProblem,sceneId:string){const config=coreConfigForProblem(problem,sceneId);const adapter=resolveCoreAdapter(config.engineId,config.mode,config.engineVersion);return {config,adapter:isGeometryTemplate(problem.templateId)?{...adapter,templateId:geometryTemplates.find(t=>t.templateId===problem.templateId)!.templateId}:adapter};}
