export const cylinderParts=['radius','height','top','bottom','side'] as const;
export type CylinderConfig={radius:number;height:number;unit:'cm'|'m';task:'orbit'|'radius'|'equal-bases'|'height'|'side'};
export function cylinderAccept(c:CylinderConfig,name:string,value:number):boolean {
  if(!Number.isFinite(value))return false;
  if(name==='a')return Math.abs(value)<=Math.PI*2;
  if(name==='b')return Math.abs(value)<=1.3;
  if(name==='width')return c.task==='equal-bases'&&value>=.5&&value<=1.5;
  return name==='x'&&Number.isInteger(value)&&value>=0&&value<cylinderParts.length;
}
/** Movement and visited bases are derived; clients cannot set c/y directly. */
export function applyCylinderInteraction(state:Record<string,number|boolean>,name:string,value:number) {
  if(name==='a'||name==='b')state.c=Number(state.c??0)+Math.abs(value-Number(state[name]??0));
  if(name==='x'&&(value===2||value===3))state.y=Number(state.y??0)|(value===2?1:2);
  state[name]=value;
}
export function cylinderError(c:CylinderConfig,s:Record<string,number|boolean>) {
  if(c.task==='orbit')return Number(s.c)>=.3?0:1;
  if(c.task==='equal-bases')return Number(s.y)===3&&Math.abs(Number(s.width)-1)>.09?0:1;
  return Number(s.x)==={radius:0,height:1,side:4}[c.task]?0:1;
}
export function cylinderGeometry(c:CylinderConfig,scale=1) {
  const fit=2.6/Math.max(2*c.radius*1.5,c.height);
  return {radius:c.radius*fit*scale,height:c.height*fit,fit};
}
