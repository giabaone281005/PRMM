export type GraphMode='linear_relation'|'linear_system'|'line_parabola_intersection';
export type GraphData={a:number;b:number;c:number;snap:0|0.5|1;d?:number;e?:number;f?:number;q?:number};
export type GraphTask='explore'|'identify'|'discover'|'guided'|'practice'|'assessment';
export type GraphConfig=GraphData & {mode:GraphMode;task:GraphTask};
export type XY={x:number;y:number};
export type GraphSolution={kind:'unique'|'parallel'|'coincident'|'none'|'two';points:XY[]};
export const graphObjectIds=['graph-line-1','graph-line-2','graph-parabola','pin-1','pin-2','origin','coefficient-handle'] as const;
const eps=1e-8;
export const lineDistance=(a:number,b:number,c:number,p:XY)=>Math.abs(a*p.x+b*p.y-c)/Math.hypot(a,b);
export function relationPoint(g:GraphData,index=0):XY {
  // A deterministic anchor on the line; a vertical line uses y as its free coordinate.
  const t=[0,2,-2,1][index%4];return g.b!==0?{x:t,y:(g.c-g.a*t)/g.b}:{x:g.c/g.a,y:t};
}
export function graphSolution(g:GraphData,mode:GraphMode):GraphSolution {
 if(mode==='linear_relation')return {kind:'unique',points:[relationPoint(g)]};
 if(mode==='linear_system'){
  const d=g.d!,e=g.e!,f=g.f!,det=g.a*e-d*g.b;
  if(Math.abs(det)>eps)return {kind:'unique',points:[{x:(g.c*e-f*g.b)/det,y:(g.a*f-d*g.c)/det}]};
  return {kind:Math.abs(g.a*f-d*g.c)<eps&&Math.abs(g.b*f-e*g.c)<eps?'coincident':'parallel',points:[]};
 }
 const A=g.b*g.q!,B=g.a,C=-g.c;
 if(Math.abs(A)<eps){const x=-C/B;return {kind:'unique',points:[{x,y:g.q!*x*x}]};}
 const delta=B*B-4*A*C;
 if(delta< -eps)return {kind:'none',points:[]};
 if(Math.abs(delta)<=eps){const x=-B/(2*A);return {kind:'unique',points:[{x,y:g.q!*x*x}]};}
 const v=-.5*(B+(B>=0?1:-1)*Math.sqrt(delta)),xs=[v/A,C/v].sort((a,b)=>a-b);
 return {kind:'two',points:xs.map(x=>({x,y:g.q!*x*x}))};
}
export function graphTargets(g:GraphConfig):XY[]{return g.mode==='linear_relation'?[relationPoint(g,g.task==='practice'?2:g.task==='assessment'?3:1)]:graphSolution(g,g.mode).points;}
export function graphClass(g:GraphConfig){const k=graphSolution(g,g.mode).kind;return k==='parallel'||k==='none'?0:k==='unique'?1:k==='coincident'?3:2;}
export function graphBounds(g:GraphData,mode:GraphMode){
 const points=[relationPoint(g),relationPoint(g,1),relationPoint(g,2),relationPoint(g,3),...graphSolution(g,mode).points];
 if(mode==='linear_system'){const other={a:g.d!,b:g.e!,c:g.f!,snap:g.snap};points.push(relationPoint(other),relationPoint(other,1));}
 if(mode==='line_parabola_intersection')points.push({x:2,y:4*g.q!},{x:-2,y:4*g.q!});
 const x=Math.max(5,...points.map(p=>Math.abs(p.x)))*1.3,y=Math.max(5,...points.map(p=>Math.abs(p.y)))*1.3;
 return {xMin:-x,xMax:x,yMin:-y,yMax:y};
}
export function validateGraphData(g:GraphData,mode:GraphMode):string[]{
 const errors:string[]=[];
 for(const key of ['a','b','c',...(mode==='linear_system'?['d','e','f']:[]),...(mode==='line_parabola_intersection'?['q']:[])] as (keyof GraphData)[]){const v=g[key];if(typeof v!=='number'||!Number.isFinite(v)||!Number.isInteger(v)||Math.abs(v)>12)errors.push(`${key}: hệ số phải là số nguyên trong [−12; 12].`);}
 if(g.a===0&&g.b===0)errors.push('a và b không được đồng thời bằng 0: cần một đường thẳng.');
 if(mode==='linear_system'&&g.d===0&&g.e===0)errors.push('d và e không được đồng thời bằng 0 ở đường thẳng thứ hai.');
 if(mode==='line_parabola_intersection'&&g.q===0)errors.push('Hệ số parabol q phải khác 0.');
 if(![0,.5,1].includes(g.snap))errors.push('Bước ghim chỉ nhận 0 (tự do), 0,5 hoặc 1.');
 if(errors.length)return errors;
 const targets=mode==='linear_relation'?[0,1,2,3].map(i=>relationPoint(g,i)):graphSolution(g,mode).points;
 if(g.snap&&targets.some(p=>[p.x,p.y].some(n=>Math.abs(n/g.snap-Math.round(n/g.snap))>eps)))errors.push('Điểm đích không nằm trên lưới đã chọn. Đặt bước ghim bằng 0 hoặc đổi hệ số để có tọa độ trên lưới.');
 if(targets.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.abs(p.x)>1000||Math.abs(p.y)>1000))errors.push('Điểm đích vượt miền quan sát ±1000. Giảm hệ số hoặc chọn hệ khác.');
 return errors;
}
export function validateGraph(g:GraphConfig):string[]{return !['linear_relation','linear_system','line_parabola_intersection'].includes(g.mode)||!['explore','identify','discover','guided','practice','assessment'].includes(g.task)?['Mode hoặc nhiệm vụ đồ thị không được hỗ trợ.']:validateGraphData(g,g.mode);}
export function graphInitial(){return {x:0,y:0,width:0,height:0,a:0,b:0,c:0,numerator:0};}
export function graphAccept(g:GraphConfig,name:string,value:number){
 if(!Number.isFinite(value))return false;
 if(['x','y','width','height'].includes(name)){
  if(['width','height'].includes(name)&&g.mode!=='line_parabola_intersection')return false;
  const bounds=graphBounds(g,g.mode),horizontal=['x','width'].includes(name),limit=horizontal?bounds.xMax:bounds.yMax;
  return Math.abs(value)<=limit+eps&&(!g.snap||Math.abs(value/g.snap-Math.round(value/g.snap))<eps);
 }
 if(name==='a')return g.task==='explore'&&g.mode==='line_parabola_intersection'&&Number.isInteger(value)&&value!==0&&Math.abs(value)<=12;
 if(name==='b')return g.task==='identify'&&[1,2].includes(value);
 if(name==='c')return !['explore','identify'].includes(g.task)&&g.mode!=='linear_relation'&&[0,1,2,3].includes(value);
 if(name==='numerator')return value===1;
 return false;
}
export function applyGraphInteraction(g:GraphConfig,s:Record<string,number|boolean>,name:string,value:number){
 if(['x','y','width','height','a','c'].includes(name))s.numerator=0;
 if(name==='b'){s.b=Number(s.b)|value;return;}
 s[name]=value;
}
export function graphError(g:GraphConfig,s:Record<string,number|boolean>){
 if(g.task==='explore')return Math.abs(Number(s.x))+Math.abs(Number(s.y))>.2||(g.mode==='line_parabola_intersection'&&Number(s.a)!==0)?0:1;
 if(g.task==='identify'&&g.mode!=='linear_relation')return Number(s.b)===3?0:1;
 if(g.task==='discover'&&g.mode!=='linear_relation')return Number(s.numerator)===1&&Number(s.c)===graphClass(g)?0:1;
 if(!['explore','identify'].includes(g.task)&&g.mode!=='linear_relation'&&Number(s.c)!==graphClass(g))return 1;
 const points=graphTargets(g),pin={x:Number(s.x),y:Number(s.y)};
 if(g.task==='identify')return Number(s.numerator)===1&&lineDistance(g.a,g.b,g.c,pin)<1e-5?0:1;
 if(!points.length)return Number(s.numerator)===1&&Number(s.c)===graphClass(g)?0:1;
 if(Number(s.numerator)!==1)return 1;
 const distance=(p:XY,q:XY)=>Math.hypot(p.x-q.x,p.y-q.y),tol=1e-5;
 if(points.length===1)return distance(points[0],pin)<tol?0:1;
 const pin2={x:Number(s.width),y:Number(s.height)};
 return Math.min(distance(points[0],pin)+distance(points[1],pin2),distance(points[1],pin)+distance(points[0],pin2))<tol?0:1;
}
export function graphProject(g:GraphData,mode:GraphMode,p:XY):[number,number]{const b=graphBounds(g,mode);return [180+p.x/b.xMax*148,170-p.y/b.yMax*138];}
export function graphUnproject(g:GraphData,mode:GraphMode,x:number,y:number):XY{const b=graphBounds(g,mode);return {x:(x-180)/148*b.xMax,y:(170-y)/138*b.yMax};}
export function snapGraph(g:GraphData,p:XY):XY{const snap=(v:number)=>g.snap?Math.round(v/g.snap)*g.snap:Math.round(v*1e6)/1e6;return {x:snap(p.x),y:snap(p.y)};}
export function lineSegment(g:GraphData,mode:GraphMode,a:number,b:number,c:number):XY[]{
 const v=graphBounds(g,mode),hits:XY[]=[];
 for(const x of [v.xMin,v.xMax])if(b!==0){const y=(c-a*x)/b;if(y>=v.yMin-eps&&y<=v.yMax+eps)hits.push({x,y});}
 for(const y of [v.yMin,v.yMax])if(a!==0){const x=(c-b*y)/a;if(x>=v.xMin-eps&&x<=v.xMax+eps&&!hits.some(p=>Math.hypot(p.x-x,p.y-y)<eps))hits.push({x,y});}
 return hits.slice(0,2);
}
