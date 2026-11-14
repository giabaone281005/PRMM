import type {GraphData,GraphMode} from '../lesson-runtime/cartesian';
export const graphTemplates={
 'math9-linear-relation':{mode:'linear_relation',curriculumCode:'M9-ALG-01',label:'Phương trình hai ẩn · Điểm nghiệm'},
 'math9-linear-system':{mode:'linear_system',curriculumCode:'M9-ALG-02',label:'Hệ hai đường thẳng'},
 'math9-line-parabola':{mode:'line_parabola_intersection',curriculumCode:'M9-ALG-09',label:'Mở rộng · Đường thẳng và parabol'},
} as const;
export type GraphTemplateId=keyof typeof graphTemplates;
export type GraphAuthoringProblem={authoringVersion:'1.0.0';namespace:'excel-repo-v1';templateId:GraphTemplateId;templateVersion:1;curriculumCode:'M9-ALG-01'|'M9-ALG-02'|'M9-ALG-09';mode:GraphMode;title:string;parameters:GraphData;variants:{practice:GraphData;assessment:GraphData};content?:{context?:string}};
export function isGraphTemplate(id:string):id is GraphTemplateId{return Object.hasOwn(graphTemplates,id);}
