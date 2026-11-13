export const uimeKinds=['TOKEN_CLASSIFIER','TAP_COEFFICIENT','NUMBER_LINE_SELECTOR','INEQUALITY_SIGN_SWITCH','FORMULA_SNAP_BUILDER','PARABOLA_SLIDER','DELTA_STATE_TOGGLE','TRIANGLE_HOTSPOT_TAP','GEOMETRIC_HOTSPOT_FINDER','ANGLE_MEASURE_TAP','3D_SOLID_INSPECTOR','CHART_BAR_TAP','EVENT_CARD_BUCKET'] as const;
export type UimeKind=typeof uimeKinds[number];
export const uimeKeys=['x','y','a','b','c','width','height','numerator'] as const;
export type UimeConfig={kind:UimeKind;labels:string[];tokens:string[];answers:number[];min:number;max:number;step:number;solid:'cone'|'cylinder'|'sphere';svg?:string;hotspots:{label:string;x:number;y:number;width:number;height:number}[]};
export function uimeInitial(u:UimeConfig){return Object.fromEntries(uimeKeys.map((key,i)=>[key,u.kind==='3D_SOLID_INSPECTOR'&&i>0?0:-1]));}
export function uimeAccept(u:UimeConfig,name:string,value:number){
 const i=uimeKeys.indexOf(name as typeof uimeKeys[number]);if(i<0||!Number.isFinite(value))return false;
 if(u.kind==='3D_SOLID_INSPECTOR'&&['a','b'].includes(name))return Math.abs(value)<=Math.PI*2;
 if(i>=u.answers.length)return false;
 if(u.kind==='NUMBER_LINE_SELECTOR'&&i>0)return value===0||value===1;
 if(['PARABOLA_SLIDER','NUMBER_LINE_SELECTOR','GEOMETRIC_HOTSPOT_FINDER'].includes(u.kind)&&i===0)return value>=u.min&&value<=u.max&&Math.abs((value-u.min)/u.step-Math.round((value-u.min)/u.step))<1e-6;
 const max=['TOKEN_CLASSIFIER','EVENT_CARD_BUCKET'].includes(u.kind)?u.labels.length:u.tokens.length;
 return Number.isInteger(value)&&value>=0&&value<max;
}
export function uimeError(u:UimeConfig,state:Record<string,number|boolean>){let error=u.answers.reduce((sum,v,i)=>sum+Math.abs(Number(state[uimeKeys[i]])-v),0);if(u.kind==='3D_SOLID_INSPECTOR'&&Math.abs(Number(state.a))+Math.abs(Number(state.b))<.3)error+=1;return error;}
export function validateUime(u:UimeConfig){const e:string[]=[];if(u.answers.length<1||u.answers.length>8||u.min>=u.max||u.step<=0)e.push('Invalid U-IME dimensions/bounds');if(['TOKEN_CLASSIFIER','EVENT_CARD_BUCKET'].includes(u.kind)&&u.tokens.length!==u.answers.length)e.push('Every card needs a target bucket');if(u.kind==='FORMULA_SNAP_BUILDER'&&u.labels.length!==u.answers.length)e.push('Every formula slot needs a label');if(u.kind==='NUMBER_LINE_SELECTOR'&&(u.answers.length!==3||u.min< -10||u.max>10))e.push('Number line requires endpoint, direction and closure within -10..10');if(u.kind==='GEOMETRIC_HOTSPOT_FINDER'&&u.answers.length!==2)e.push('Circle requires distance and selected part');if(u.hotspots.some(h=>h.x+h.width>360||h.y+h.height>240))e.push('Hotspot outside viewport');u.answers.forEach((v,i)=>{if(!uimeAccept(u,uimeKeys[i],v))e.push('Unreachable U-IME answer');});return e;}
