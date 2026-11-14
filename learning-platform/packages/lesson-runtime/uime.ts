import {algebraInitial,algebraAccept,algebraError,validateAlgebra,type AlgebraConfig} from './algebra';
import {geometryInitial,geometryAccept,geometryError,validateGeometry,type GeometryConfig} from './geometry';
import {graphAccept,graphError,graphInitial,validateGraph,type GraphConfig} from './cartesian';
import {parabolaAccept,parabolaError,parabolaInitial,validateParabola,type ParabolaConfig} from './parabola';
import {cylinderAccept,cylinderError,type CylinderConfig} from './cylinder';
export const uimeKinds=['TOKEN_CLASSIFIER','TAP_COEFFICIENT','NUMBER_LINE_SELECTOR','INEQUALITY_SIGN_SWITCH','FORMULA_SNAP_BUILDER','PARABOLA_SLIDER','DELTA_STATE_TOGGLE','TRIANGLE_HOTSPOT_TAP','GEOMETRIC_HOTSPOT_FINDER','ANGLE_MEASURE_TAP','3D_SOLID_INSPECTOR','CHART_BAR_TAP','EVENT_CARD_BUCKET'] as const;
export type UimeKind=typeof uimeKinds[number];
export const uimeKeys=['x','y','a','b','c','width','height','numerator'] as const;
export type UimeConfig={kind:UimeKind;labels:string[];tokens:string[];answers:number[];min:number;max:number;step:number;solid:'cone'|'cylinder'|'sphere';svg?:string;cylinder?:CylinderConfig;parabola?:ParabolaConfig;graph?:GraphConfig;geometry?:GeometryConfig;algebra?:AlgebraConfig;hotspots:{label:string;x:number;y:number;width:number;height:number}[]};
export function uimeInitial(u:UimeConfig){if(u.algebra)return algebraInitial();if(u.geometry)return geometryInitial();if(u.graph)return graphInitial();if(u.parabola)return parabolaInitial(u.parabola);if(u.cylinder)return {x:-1,y:0,c:0,width:1};return Object.fromEntries(uimeKeys.map((key,i)=>[key,u.kind==='3D_SOLID_INSPECTOR'&&i>0?0:-1]));}
export function uimeAccept(u:UimeConfig,name:string,value:number){
 if(u.algebra)return algebraAccept(u.algebra,name,value);
 if(u.geometry)return geometryAccept(u.geometry,name,value);
 if(u.graph)return graphAccept(u.graph,name,value);
 if(u.parabola)return parabolaAccept(u.parabola,name,value);
 if(u.cylinder)return cylinderAccept(u.cylinder,name,value);
 const i=uimeKeys.indexOf(name as typeof uimeKeys[number]);if(i<0||!Number.isFinite(value))return false;
 if(u.kind==='3D_SOLID_INSPECTOR'&&['a','b'].includes(name))return Math.abs(value)<=Math.PI*2;
 if(i>=u.answers.length)return false;
 if(u.kind==='NUMBER_LINE_SELECTOR'&&i>0)return value===0||value===1;
 if(['PARABOLA_SLIDER','NUMBER_LINE_SELECTOR','GEOMETRIC_HOTSPOT_FINDER'].includes(u.kind)&&i===0)return value>=u.min&&value<=u.max&&Math.abs((value-u.min)/u.step-Math.round((value-u.min)/u.step))<1e-6;
 const max=['TOKEN_CLASSIFIER','EVENT_CARD_BUCKET'].includes(u.kind)?u.labels.length:u.tokens.length;
 return Number.isInteger(value)&&value>=0&&value<max;
}
export function uimeError(u:UimeConfig,state:Record<string,number|boolean>){if(u.algebra)return algebraError(u.algebra,state);if(u.geometry)return geometryError(u.geometry,state);if(u.graph)return graphError(u.graph,state);if(u.parabola)return parabolaError(u.parabola,state);if(u.cylinder)return cylinderError(u.cylinder,state);let error=u.answers.reduce((sum,v,i)=>sum+Math.abs(Number(state[uimeKeys[i]])-v),0);if(u.kind==='3D_SOLID_INSPECTOR'&&Math.abs(Number(state.a))+Math.abs(Number(state.b))<.3)error+=1;return error;}
export function validateUime(u:UimeConfig){const e:string[]=[];if(u.algebra){e.push(...validateAlgebra(u.algebra));if(u.kind!=='FORMULA_SNAP_BUILDER'||u.geometry||u.graph||u.parabola||u.cylinder)e.push('Algebra adapter binding invalid');}if(u.geometry){e.push(...validateGeometry(u.geometry));if(u.kind!=='TRIANGLE_HOTSPOT_TAP'||u.graph||u.parabola||u.cylinder)e.push('Geometry adapter binding invalid');}if(u.graph){e.push(...validateGraph(u.graph));if(u.kind!=='PARABOLA_SLIDER'||u.parabola||u.cylinder)e.push('Graph adapter binding invalid');}if(u.parabola){e.push(...validateParabola(u.parabola));if(u.kind!=='PARABOLA_SLIDER'||u.cylinder||u.min!==-5||u.max!==5||u.step!==1||u.answers.length!==1||u.answers[0]!==u.parabola.a)e.push('Invalid parabola model binding');}if(u.cylinder){const c=u.cylinder;if(u.kind!=='3D_SOLID_INSPECTOR'||u.solid!=='cylinder'||![c.radius,c.height].every(n=>Number.isFinite(n)&&n>=.1&&n<=100)||c.height/c.radius<.1||c.height/c.radius>10||!['cm','m'].includes(c.unit)||!['orbit','radius','equal-bases','height','side'].includes(c.task)||u.tokens.length!==5)e.push('Invalid cylinder model');}if(u.answers.length<1||u.answers.length>8||u.min>=u.max||u.step<=0)e.push('Invalid U-IME dimensions/bounds');if(['TOKEN_CLASSIFIER','EVENT_CARD_BUCKET'].includes(u.kind)&&u.tokens.length!==u.answers.length)e.push('Every card needs a target bucket');if(u.kind==='FORMULA_SNAP_BUILDER'&&u.labels.length!==u.answers.length)e.push('Every formula slot needs a label');if(u.kind==='NUMBER_LINE_SELECTOR'&&(u.answers.length!==3||u.min< -10||u.max>10))e.push('Number line requires endpoint, direction and closure within -10..10');if(u.kind==='GEOMETRIC_HOTSPOT_FINDER'&&u.answers.length!==2)e.push('Circle requires distance and selected part');if(u.hotspots.some(h=>h.x+h.width>360||h.y+h.height>240))e.push('Hotspot outside viewport');if(!u.algebra&&!u.geometry&&!u.parabola&&!u.graph)u.answers.forEach((v,i)=>{if(!uimeAccept(u,uimeKeys[i],v))e.push('Unreachable U-IME answer');});return e;}
