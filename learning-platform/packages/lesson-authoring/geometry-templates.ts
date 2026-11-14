import catalog from '../../contracts/core-engines/geometry-catalog.json' with {type:'json'};
import type {GeometryData,GeometryMode} from '../lesson-runtime/geometry';
export type GeometryTemplateId=`math9-geometry-${string}`;
export const geometryTemplates=catalog;
export const isGeometryTemplate=(id:string):id is GeometryTemplateId=>catalog.some(t=>t.templateId===id);
export type GeometryAuthoringProblem={authoringVersion:'1.0.0';namespace:'excel-repo-v1';templateId:GeometryTemplateId;templateVersion:1;curriculumCode:string;mode:GeometryMode;title:string;parameters:GeometryData;variants:{practice:GeometryData;assessment:GeometryData};content?:{context?:string}};
