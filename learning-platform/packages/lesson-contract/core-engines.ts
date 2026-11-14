import {validateAlgebraData,type AlgebraData,type AlgebraMode} from '../lesson-runtime/algebra';
import algebraCatalog from '../../contracts/core-engines/algebra-catalog.json' with {type:'json'};
import {validateGeometryData,type GeometryData,type GeometryMode} from '../lesson-runtime/geometry';
import geometryCatalog from '../../contracts/core-engines/geometry-catalog.json' with {type:'json'};
import {validateGraphData,type GraphData,type GraphMode} from '../lesson-runtime/cartesian';
import Ajv2020 from 'ajv/dist/2020.js';
import rawRegistry from '../../contracts/core-engines/registry.json' with {type:'json'};
import rawCoverage from '../../contracts/core-engines/coverage.json' with {type:'json'};
import rawSchema from '../../contracts/core-engines/core-engine-config.schema.json' with {type:'json'};

export type CoreEngineId='geometry_2d_canvas'|'cartesian_graph_engine'|'balance_scale_engine'|'area_fraction_grid'|'number_line_engine'|'data_probability_sim';
export type CoreConfig={configVersion:'1.0.0';engineVersion:'1.0.0';namespace:'excel-repo-v1';templateVersion:1;sceneId:string;viewport:{logicalWidth:360;logicalHeight:360;fit:'adapter-derived'}} & (
 {engineId:'balance_scale_engine';mode:AlgebraMode;curriculumCode:'M9-ALG-03'|'M9-ALG-10'|'M9-ALG-11';model:AlgebraData} |
 {engineId:'geometry_2d_canvas';mode:GeometryMode;curriculumCode:string;model:GeometryData} |
 {engineId:'cartesian_graph_engine';mode:GraphMode;curriculumCode:'M9-ALG-01'|'M9-ALG-02'|'M9-ALG-09';model:GraphData} |
 {engineId:'area_fraction_grid';mode:'cylinder_recognition';curriculumCode:'M9-GEO-11';model:{radius:number;height:number;unit:'cm'|'m'}} |
 {engineId:'cartesian_graph_engine';mode:'parabola_coefficient';curriculumCode:'M9-ALG-09';model:{a:number}}
);
export type CoreIssue={path:string;code:string;message:string};
export type CoreAdapter={templateId:string;web:string;mobile:string;evaluatorTS:string;evaluatorDart:string;minRuntimeVersion:'1.0.0';snapshotVersion:'legacy-lesson-identity-v1'};
const adapters:Record<string,CoreAdapter>={
 ...Object.fromEntries(algebraCatalog.map(t=>['balance_scale_engine/'+t.mode,{templateId:t.templateId,web:'AlgebraScene',mobile:'SolidView/WebView/AlgebraScene',evaluatorTS:'lesson-runtime/algebra',evaluatorDart:'lib/algebra.dart',minRuntimeVersion:'1.0.0' as const,snapshotVersion:'legacy-lesson-identity-v1' as const}])),
 ...Object.fromEntries(geometryCatalog.map(t=>['geometry_2d_canvas/'+t.mode,{templateId:geometryCatalog.find(x=>x.mode===t.mode)!.templateId,web:'GeometryScene',mobile:'SolidView/WebView/GeometryScene',evaluatorTS:'lesson-runtime/geometry',evaluatorDart:'lib/geometry.dart',minRuntimeVersion:'1.0.0' as const,snapshotVersion:'legacy-lesson-identity-v1' as const}])),
 ...Object.fromEntries([['linear_relation','math9-linear-relation'],['linear_system','math9-linear-system'],['line_parabola_intersection','math9-line-parabola']].map(([mode,templateId])=>['cartesian_graph_engine/'+mode,{templateId,web:'CartesianScene',mobile:'SolidView/WebView/CartesianScene',evaluatorTS:'lesson-runtime/cartesian',evaluatorDart:'lib/cartesian.dart',minRuntimeVersion:'1.0.0' as const,snapshotVersion:'legacy-lesson-identity-v1' as const}])),

 'area_fraction_grid/cylinder_recognition':{templateId:'math9-cylinder-recognition',web:'CylinderScene',mobile:'SolidView/WebView/CylinderScene',evaluatorTS:'lesson-runtime/cylinder',evaluatorDart:'lib/uime.dart:cylinder',minRuntimeVersion:'1.0.0',snapshotVersion:'legacy-lesson-identity-v1'},
 'cartesian_graph_engine/parabola_coefficient':{templateId:'math9-parabola-coefficient',web:'ParabolaScene',mobile:'SolidView/WebView/ParabolaScene',evaluatorTS:'lesson-runtime/parabola',evaluatorDart:'lib/parabola.dart',minRuntimeVersion:'1.0.0',snapshotVersion:'legacy-lesson-identity-v1'},
};
function freeze<T>(v:T):T{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
export const coreEngineRegistry=freeze(structuredClone(rawRegistry));
export const coreEngineCoverage=freeze(structuredClone(rawCoverage));
export const coreConfigSchema=freeze(structuredClone(rawSchema));
const check=new Ajv2020({strict:false,allErrors:true,strictNumbers:true}).compile(rawSchema);
export function resolveCoreAdapter(engineId:string,mode:string,engineVersion='1.0.0'):Readonly<CoreAdapter>{
 const engine=coreEngineRegistry.engines.find(e=>e.engineId===engineId);
 if(!engine)throw Error(`Chưa có core engine “${engineId}”.`);
 if(engine.engineVersion!==engineVersion)throw Error(`Core engine chưa hỗ trợ phiên bản ${engineVersion}.`);
 const entry=engine.modes.find(m=>m.mode===mode),adapter=adapters[engineId+'/'+mode];
 if(!entry||!entry.publishEnabled||entry.status!=='implemented_adapter'||!adapter)throw Error(`Mode “${mode}” chưa có đủ compiler/web/mobile adapter để xuất bản.`);
 return freeze(structuredClone(adapter));
}
export function validateCoreConfig(input:unknown):CoreIssue[]{
 if(!check(input))return (check.errors??[]).map(e=>({path:e.instancePath,code:'schema.'+e.keyword,message:`Cấu hình core engine sai tại ${e.instancePath||'/'}: ${e.message}.`}));
 const c=input as CoreConfig;
 try{resolveCoreAdapter(c.engineId,c.mode,c.engineVersion);}catch(e){return [{path:'/mode',code:'mode.unavailable',message:(e as Error).message}];}
 if(c.engineId==='balance_scale_engine')return validateAlgebraData(c.model,c.mode).map(message=>({path:'/model',code:'math.algebra',message}));
 if(c.engineId==='geometry_2d_canvas')return validateGeometryData(c.model,c.mode).map(message=>({path:'/model',code:'math.geometry',message}));
 if(c.engineId==='area_fraction_grid'&&(c.model.height/c.model.radius<.1||c.model.height/c.model.radius>10))return [{path:'/model',code:'math.aspectRatio',message:'Tỉ lệ chiều cao/bán kính phải từ 0,1 đến 10.'}];
 if(c.engineId==='cartesian_graph_engine'&&c.mode!=='parabola_coefficient')return validateGraphData(c.model,c.mode).map(message=>({path:'/model',code:'math.graph',message}));
 return [];
}
export function requireCoreConfig(input:unknown):CoreConfig{const issues=validateCoreConfig(input);if(issues.length)throw Error(issues.map(i=>i.message).join('\n'));return structuredClone(input as CoreConfig);}

/** Future canonical runtime module boundary. No v2 dispatcher/evaluator is claimed yet. */
export interface CanonicalEngineModule<Model,State,Event,Metrics> {
 readonly engineId:CoreEngineId;readonly engineVersion:string;readonly mode:string;
 validateModel(model:unknown):CoreIssue[];
 createState(model:Model):State;
 applyEvent(model:Model,state:Readonly<State>,event:Event):State;
 measure(model:Model,state:Readonly<State>):Metrics;
 restore(model:Model,snapshot:unknown,identity:{lessonId:string;version:number;sceneId:string;configHash:string}):State;
}
