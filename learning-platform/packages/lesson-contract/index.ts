import Ajv2020 from 'ajv/dist/2020.js';
import {validateUime} from '../lesson-runtime/uime';
import schema from '../../contracts/lesson.schema.json' with {type:'json'};
import {extraEngineMap,extraModels,isExtraModel} from '../lesson-runtime/extra-models';

export const capabilities = ['drag_vertex','measure_angle','show_geometry_annotation','toggle_angle_labels','drag_angle_token','orbit_solid','select_face','fill_layers','measure_volume','adjust_parameter','number_line_drag','fraction_partition','balance_equation','plot_function','percentage_grid','ratio_table','coordinate_plane','rectangle_area','pythagorean','linear_graph'] as const;
export type Capability = typeof capabilities[number];
export type Point = [number, number];
export type SceneObject = {id:string} & (
  {kind:'point'; position:Point; draggable:boolean} |
  {kind:'polygon'; vertexIds:string[]} |
  {kind:'angle_token'; sourceVertexId:string} |
  {kind:'prism'; dimensions:[number,number,number]} |
  {kind:'math_model';model:'number_line'|'fraction_bar'|'linear_balance'|'quadratic_graph'|typeof extraModels[number];parameters:Record<string,number>}
);
export const metricPaths = ['metrics.validVertexDragCount','metrics.validVertexDragCountSinceCheckpoint','metrics.snappedAngleTokens','metrics.assembledAngleDegrees','metrics.orbitRadians','metrics.selectedFaces','metrics.filledLayers','metrics.volume','metrics.parameterChangeCount','metrics.parameterChangeCountSinceCheckpoint','metrics.modelError','metrics.modelValue'] as const;
export type Criterion = {op:'all'|'any';conditions:Criterion[]} | {op:'not';condition:Criterion} | {op:'eq'|'neq'|'gt'|'gte'|'lt'|'lte'|'approx'|'within';path:typeof metricPaths[number];value:number;tolerance?:number;max?:number};
export type Patch = {setState?:Record<string,number|boolean>;addObjects?:SceneObject[]};
export type Checkpoint = {id:string;order:number;instruction:string;allowedInteractions:Capability[];scenePatch:Patch;successCriteria:Criterion;hints:string[];feedback:{success:string}};
export interface Lesson {
  recognition?:import('../lesson-authoring/math9').RecognitionTask[];
  schemaVersion:'1.0.0';lessonId:string;version:number;status:'draft'|'published';locale:'vi-VN';title:string;grade:6|7|8|9;subject:'math';topicIds:string[];learningObjectives:string[];
  engine:{type:'geometry_2d'|'geometry_3d_web'|'math_explorer_2d'|'number_line_2d'|'fraction_bar_2d'|'algebra_balance_2d'|'function_plot_2d'|typeof extraEngineMap[keyof typeof extraEngineMap];minRuntimeVersion:'1.0.0';requiredCapabilities:Capability[]};
  scene:{sceneId:string;coordinateSystem:'cartesian_2d'|'cartesian_3d';viewport:{width:number;height:number};objects:SceneObject[];initialState:Record<string,number|boolean>};
  checkpoints:Checkpoint[];completion:{requiredCheckpointIds:string[]};
}
const ajv = new Ajv2020({allErrors:true,strict:false});
const check = ajv.compile(schema);
export const engineCapabilities:Record<Lesson['engine']['type'],readonly Capability[]> = {
  geometry_2d:capabilities.slice(0,5), geometry_3d_web:capabilities.slice(5,9),math_explorer_2d:['adjust_parameter'],number_line_2d:['adjust_parameter','number_line_drag'],fraction_bar_2d:['adjust_parameter','fraction_partition'],algebra_balance_2d:['adjust_parameter','balance_equation'],function_plot_2d:['adjust_parameter','plot_function'],percentage_2d:['adjust_parameter','percentage_grid'],ratio_2d:['adjust_parameter','ratio_table'],coordinate_2d:['adjust_parameter','coordinate_plane'],area_2d:['adjust_parameter','rectangle_area'],pythagorean_2d:['adjust_parameter','pythagorean'],linear_plot_2d:['adjust_parameter','linear_graph']
};
export function isMathEngine(type:Lesson['engine']['type']){return !['geometry_2d','geometry_3d_web'].includes(type);}
export function validateLesson(input:unknown):string[] {
  if(!check(input)) return (check.errors??[]).map(e=>`${e.instancePath}: ${e.message}`);
  const l = input as unknown as Lesson, errors:string[]=[];
  l.recognition?.forEach(t=>{if(t.uime)errors.push(...validateUime(t.uime));});
  if(l.recognition){if(l.recognition.length!==l.checkpoints.length||l.engine.type!=='math_explorer_2d')errors.push('Recognition checkpoint/engine mismatch');l.recognition.forEach((t,i)=>{if(t.correct>t.choices.length||new Set(t.choices).size!==t.choices.length||l.checkpoints[i]?.scenePatch.setState?.targetX!==t.correct)errors.push('Invalid recognition target');});}
  const ids=new Set<string>();
  const objects=new Map<string,SceneObject>();
  function add(o:SceneObject){if(ids.has(o.id)) errors.push(`Duplicate object ${o.id}`);ids.add(o.id);objects.set(o.id,o);}
  l.scene.objects.forEach(add);
  const cps=new Set<string>();
  const allowed=engineCapabilities[l.engine.type];
  if(l.scene.viewport.width!==360||l.scene.viewport.height!==360)errors.push('Runtime 1 requires a 360 × 360 logical viewport');
  for(const cap of l.engine.requiredCapabilities) if(!allowed.includes(cap)) errors.push(`Unsupported capability ${cap}`);
  if((l.engine.type!=='geometry_3d_web')!==(l.scene.coordinateSystem==='cartesian_2d')) errors.push('Coordinate system mismatch');
  l.checkpoints.forEach((cp,i)=>{
    if(cp.order!==i+1||cps.has(cp.id))errors.push('Checkpoint order/identity invalid'); cps.add(cp.id);
    cp.scenePatch.addObjects?.forEach(add);
    for(const c of cp.allowedInteractions) if(!allowed.includes(c)||!l.engine.requiredCapabilities.includes(c))errors.push(`Undeclared interaction ${c}`);
    walk(cp.successCriteria,c=>{if(c.op==='approx'&&c.tolerance===undefined)errors.push('Approx requires tolerance');if(c.op==='within'&&(c.max===undefined||c.max<c.value))errors.push('Invalid interval');const index=metricPaths.indexOf(c.path);if((l.engine.type==='geometry_2d'&&index>3)||(l.engine.type==='geometry_3d_web'&&(index<4||index>7))||(isMathEngine(l.engine.type)&&index<8))errors.push('Metric unsupported by selected engine');if(c.value<0&&c.path!=='metrics.modelValue')errors.push('Metric target cannot be negative');});
  });
  for(const o of objects.values()){
    if(o.kind==='polygon'&&(o.vertexIds.length!==3||new Set(o.vertexIds).size!==3||o.vertexIds.some(id=>objects.get(id)?.kind!=='point'))) errors.push('Invalid triangle references');
    if(o.kind==='angle_token'&&objects.get(o.sourceVertexId)?.kind!=='point')errors.push('Invalid angle source');
    if(o.kind==='point'&&(o.position[0]<24||o.position[0]>336||o.position[1]<24||o.position[1]>265))errors.push('Point outside runtime bounds');
    if(o.kind==='prism'&&o.dimensions.some(n=>!Number.isInteger(n)||n>10))errors.push('Prism requires integer dimensions 1–10');
    if(o.kind==='math_model'){
      const engineForModel={number_line:'number_line_2d',fraction_bar:'fraction_bar_2d',linear_balance:'algebra_balance_2d',quadratic_graph:'function_plot_2d',...extraEngineMap};
      if(l.engine.type!=='math_explorer_2d'&&l.engine.type!==engineForModel[o.model])errors.push('Math model does not match selected engine');
      const p={x:0,a:1,b:0,c:0,numerator:1,denominator:4,targetX:2,targetRatio:.5,targetA:1,targetB:0,targetC:0,...o.parameters};
      if(p.denominator<1||p.denominator>12||!Number.isInteger(p.denominator)||p.numerator<0||p.numerator>p.denominator||!Number.isInteger(p.numerator))errors.push('Invalid fraction parameters');
      if(o.model==='linear_balance'&&(p.a===0||Math.abs((p.c-p.b)/p.a)>10))errors.push('Equation has no reachable solution');
      if(o.model==='number_line'&&Math.abs(p.targetX)>10)errors.push('Number line target outside bounds');
      if(isExtraModel(o.model)){const q=o.parameters;if(o.model==='percentage_grid'&&(q.targetX<0||q.targetX>100||!Number.isInteger(q.targetX)||!(q.b>0)))errors.push('Phần trăm cần số nguyên 0–100 và tổng ban đầu dương');if(o.model==='ratio_table'&&(!(q.a>0)||!(q.b>0)||q.targetX<0||q.targetX>10))errors.push('Tỉ lệ phải dương, số lần gấp từ 0–10');if(o.model==='coordinate_plane'&&(Math.abs(q.targetX)>10||Math.abs(q.targetY)>10))errors.push('Tọa độ mục tiêu trong khoảng −10 đến 10');if(['rectangle_area','pythagorean'].includes(o.model)&&[q.targetWidth,q.targetHeight].some(v=>v<1||v>10))errors.push('Độ dài cạnh từ 1–10');if(o.model==='linear_graph'&&[q.targetA,q.targetB].some(v=>!Number.isFinite(v)||Math.abs(v)>10))errors.push('Hệ số đường thẳng từ −10 đến 10');}
    }
  }
  const poly=l.scene.objects.find(o=>o.kind==='polygon');if(poly?.kind==='polygon'){const p=poly.vertexIds.map(id=>objects.get(id)).filter(o=>o?.kind==='point') as Extract<SceneObject,{kind:'point'}>[];if(p.length===3){const[a,b,c]=p.map(o=>o.position);if(Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))<1000)errors.push('Initial triangle is degenerate');}}
  if(l.engine.type==='geometry_2d'&&!l.scene.objects.some(o=>o.kind==='polygon')) errors.push('Triangle renderer requires polygon');
  if(l.engine.type==='geometry_3d_web'&&l.scene.objects.filter(o=>o.kind==='prism').length!==1)errors.push('Solid renderer requires one prism');
  if(isMathEngine(l.engine.type)&&l.scene.objects.filter(o=>o.kind==='math_model').length!==1)errors.push('Math explorer requires one model');
  if(l.completion.requiredCheckpointIds.length!==cps.size||l.completion.requiredCheckpointIds.some(id=>!cps.has(id)))errors.push('Completion must require all checkpoints');
  return errors;
}
function walk(c:Criterion,fn:(c:Extract<Criterion,{path:string}>)=>void){if('conditions'in c)c.conditions.forEach(x=>walk(x,fn));else if('condition'in c)walk(c.condition,fn);else fn(c);}
export function evaluate(c:Criterion,metrics:Record<string,number>):boolean {
  if('conditions'in c) return c.op==='all'?c.conditions.every(x=>evaluate(x,metrics)):c.conditions.some(x=>evaluate(x,metrics));
  if('condition'in c)return !evaluate(c.condition,metrics);
  const a=metrics[c.path.slice(8)]; if(!Number.isFinite(a))return false;
  switch(c.op){case'eq':return a===c.value;case'neq':return a!==c.value;case'gt':return a>c.value;case'gte':return a>=c.value;case'lt':return a<c.value;case'lte':return a<=c.value;case'approx':return Math.abs(a-c.value)<=(c.tolerance??0);case'within':return a>=c.value&&a<=(c.max??c.value);}
}
export function routeEngine(required:string[], supported:readonly string[]=capabilities){
  const engine=(Object.keys(engineCapabilities) as Lesson['engine']['type'][]).find(e=>required.every(c=>(engineCapabilities[e] as readonly string[]).includes(c)&&supported.includes(c)));
  return engine?{engine,reason:engine==='geometry_2d'?'Canvas 2D hỗ trợ kéo đỉnh và đo góc trực tiếp.':engine==='geometry_3d_web'?'Three.js hỗ trợ xoay khối, chọn mặt và xếp lớp.':'Canvas toán học hỗ trợ thay đổi tham số, đo kết quả và khám phá quy luật.'}:{engine:null,reason:'Chưa có renderer tương thích. Cần bổ sung template/capability và kiểm thử trước khi xuất bản.'};
}
