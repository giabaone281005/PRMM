import catalog from '../../contracts/core-engines/algebra-catalog.json' with {type:'json'};
import type {AlgebraData,AlgebraMode} from '../lesson-runtime/algebra';
export type AlgebraTemplateId=`math9-algebra-${string}`;
export const algebraTemplates=catalog;
export const isAlgebraTemplate=(id:string):id is AlgebraTemplateId=>catalog.some(t=>t.templateId===id);
export type AlgebraAuthoringProblem={authoringVersion:'1.0.0';namespace:'excel-repo-v1';templateId:AlgebraTemplateId;templateVersion:1;curriculumCode:'M9-ALG-03'|'M9-ALG-10'|'M9-ALG-11';mode:AlgebraMode;title:string;parameters:AlgebraData;variants:{practice:AlgebraData;assessment:AlgebraData};content?:{context?:string}};
