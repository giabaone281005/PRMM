export const parabolaTasks=['explore','identify','compare','guided','practice','assessment'] as const;
export type ParabolaTask=typeof parabolaTasks[number];
export type ParabolaConfig={a:number;pointX:1|2|-2;task:ParabolaTask};
export const parabolaIds={target:'graph-target',reference:'graph-reference',learner:'curve-learner',point:'point-target',probe:'point-probe',origin:'origin'} as const;
export const parabolaValue=(a:number,x:number)=>a*x*x;
export function parabolaModel(c:ParabolaConfig) {
  const referenceA=c.a>0?c.a/2:c.a*2;
  const point={x:c.pointX,y:parabolaValue(c.a,c.pointX)};
  return {point,referenceA,narrower:Math.abs(c.a)>Math.abs(referenceA)?0:1,
    viewport:{xMin:-2.5,xMax:2.5,yMax:Math.max(5,c.task==='compare'?Math.abs(referenceA):0)*2.2**2*1.12}};
}
export function validateParabola(c:ParabolaConfig):string[] {
  return !Number.isInteger(c.a)||c.a===0||Math.abs(c.a)>5||![1,2,-2].includes(c.pointX)||!parabolaTasks.includes(c.task)?['Parabol cần a nguyên khác 0 trong [−5; 5], điểm có x khác 0 và nhiệm vụ được hỗ trợ.']:[];
}
export function parabolaInitial(c:ParabolaConfig) {
  return {x:c.task==='explore'?c.a:c.a===1?-1:1,y:-1,a:1,b:0};
}
export function parabolaAccept(c:ParabolaConfig,name:string,value:number) {
  if(!Number.isFinite(value))return false;
  if(name==='x')return c.task!=='identify'&&c.task!=='compare'&&Number.isInteger(value)&&value!==0&&Math.abs(value)<=5;
  if(name==='a')return c.task==='compare'&&Number.isInteger(value)&&value>=1&&value<=2;
  if(name==='y')return c.task==='identify'||c.task==='compare'?value===0||value===1:
    ['guided','practice','assessment'].includes(c.task)&&value===0;
  return false;
}
export function applyParabolaInteraction(c:ParabolaConfig,s:Record<string,number|boolean>,name:string,value:number) {
  if(name==='x'){
    if(c.task==='explore')s.b=Number(s.b??0)|(value>0?1:2);
    else s.y=-1; // Confirm the point again after changing the constructed curve.
  }
  if(name==='a')s.y=-1;
  s[name]=value;
}
export function parabolaError(c:ParabolaConfig,s:Record<string,number|boolean>) {
  if(c.task==='explore')return Number(s.b)===3?0:1;
  if(c.task==='identify')return Number(s.y)===(c.a>0?0:1)?0:1;
  if(c.task==='compare')return Number(s.a)===2&&Number(s.y)===parabolaModel(c).narrower?0:1;
  return Number(s.x)===c.a&&Number(s.y)===0?0:1;
}
/** Logical coordinates shared by drawing, point labels and pointer hit regions. */
export function parabolaProject(c:ParabolaConfig,x:number,y:number):[number,number] {
  const {viewport}=parabolaModel(c);
  return [180+x*60,160-y/viewport.yMax*124];
}
export function parabolaPath(c:ParabolaConfig,a:number) {
  return Array.from({length:177},(_,i)=>{const x=-2.2+i*.025;return `${i?'L':'M'}${parabolaProject(c,x,parabolaValue(a,x)).join(',')}`;}).join(' ');
}
