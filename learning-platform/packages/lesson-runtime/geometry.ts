import type {XY} from './cartesian';
export const geometryModes=['right_triangle','circle_symmetry','line_circle','two_circles','circle_angles','arc_sector_annulus','triangle_circles','cyclic_polygon'] as const;
export type GeometryMode=typeof geometryModes[number];
export type GeometryData=Record<string,number|string>;
export type GeometryConfig={mode:GeometryMode;curriculumCode:string;data:GeometryData;task:'explore'|'identify'|'discover'|'guided'|'practice'|'assessment'};
export type GeometryObject={id:string;label:string;kind:'point'|'segment'|'circle'|'arc'|'sector'|'polygon';points:XY[];radius?:number;sweep?:number;layer?:number};
export type GeometryModel={objects:GeometryObject[];value:number;quantity:string;targetId:string;layers:{id:string;label:string;bit:number;objects:GeometryObject[]}[];bounds:number;center:XY;handle:XY;handleOrigin:XY;drag:'orientation'|'inscribed';facts:Record<string,number|string>;construction:{id:string;parents:string[]}[];constraints:{lengths:'locked';orientation:'free';zoom:'view-only';vertexDrag:'rigid'|'major-arc'}};
const rad=Math.PI/180;
const p=(x:number,y:number):XY=>({x,y});
const polar=(r:number,a:number):XY=>p(r*Math.cos(a*rad),r*Math.sin(a*rad));
const distance=(a:XY,b:XY)=>Math.hypot(a.x-b.x,a.y-b.y);
const add=(a:XY,b:XY)=>p(a.x+b.x,a.y+b.y);
const scale=(a:XY,k:number)=>p(a.x*k,a.y*k);
const turn=(a:XY,angle:number)=>p(a.x*Math.cos(angle*rad)-a.y*Math.sin(angle*rad),a.x*Math.sin(angle*rad)+a.y*Math.cos(angle*rad));
/** Compiler-owned dependency DAG. Data contains givens, never executable constraints. */
function constructionGraph(g:GeometryConfig,objects:GeometryObject[]){
 const triangle=['right_triangle','triangle_circles'].includes(g.mode),nodes=new Map<string,string[]>([['data',[]]]);
 if(triangle){nodes.set('construction-I',['vertex-A','vertex-B','vertex-C']);nodes.set('construction-O',['vertex-A','vertex-B','vertex-C']);}
 const parents=(id:string):string[]=>{
  if(id==='vertex-A'||id==='center-O'||id==='center-K')return ['data'];
  if(triangle&&id==='vertex-B')return ['vertex-A','data'];
  if(triangle&&id==='vertex-C')return ['vertex-A','vertex-B','data'];
  if(id.startsWith('side-'))return id.slice(-2).split('').map(v=>'vertex-'+v);
  if(id.startsWith('bisector-'))return ['side-'+id.slice(-2),'construction-O'];
  if(id.startsWith('angle-bisector-'))return ['vertex-'+['A','B','C'][Number(id.slice(-1))],'construction-I'];
  if(id==='incircle'||id==='incenter')return ['construction-I'];
  if(id==='circumcircle'||id==='circumcenter')return [triangle?'construction-O':'center-O','data'];
  if(id==='circle-1'||id==='inner-circle')return ['center-O','data'];
  if(id==='circle-2')return ['center-K','data'];
  if(id==='axis'||id==='line-1')return ['center-O','data'];
  if(id==='point-P')return ['center-O','data'];
  if(id==='point-Q')return ['point-P','axis'];
  if(id==='radius-OP')return ['center-O','point-P'];
  if(id==='reflection-PQ')return ['point-P','point-Q'];
  if(id==='centers-OK')return ['center-O','center-K'];
  if(id==='foot-H')return ['center-O','line-1'];
  if(id==='distance-OH')return ['center-O','foot-H'];
  if(id.startsWith('intersection-'))return ['circle-1',g.mode==='two_circles'?'circle-2':'line-1'];
  if(id==='tangent-contact')return ['circle-1','data'];
  if(id==='tangent-1'||id==='tangent-radius')return ['center-O','tangent-contact'];
  if(id==='arc-A'||id==='arc-B')return ['circle-1','data'];
  if(id==='radius-OA'||id==='radius-OB')return ['center-O','arc-'+id.slice(-1)];
  if(id==='arc-AB'||id==='sector-AOB')return ['center-O','arc-A','arc-B'];
  if(id==='annulus')return ['circle-1','inner-circle'];
  if(id==='inscribed-V')return ['arc-AB','circle-1','data'];
  if(id==='chord-VA'||id==='chord-VB')return ['inscribed-V','arc-'+id.slice(-1)];
  if(id.startsWith('vertex-'))return ['circumcircle','data'];
  if(id.startsWith('polygon-side-')){const i=Number(id.slice(13)),n=g.data.shape==='regular_polygon'?Number(g.data.vertices):4;return ['vertex-'+i,'vertex-'+((i+1)%n)];}
  if(id==='polygon')return objects.filter(o=>o.id.startsWith('vertex-')).map(o=>o.id);
  return ['data'];
 };
 objects.forEach(o=>nodes.set(o.id,parents(o.id)));
 const result:{id:string;parents:string[]}[]=[],seen=new Set<string>(),visiting=new Set<string>();
 const visit=(id:string)=>{if(seen.has(id))return;if(visiting.has(id)||!nodes.has(id))throw Error('Invalid trusted geometry dependency: '+id);visiting.add(id);nodes.get(id)!.forEach(visit);visiting.delete(id);seen.add(id);result.push({id,parents:nodes.get(id)!});};
 nodes.forEach((_,id)=>visit(id));return result;
}
export function geometryInitial(){return {x:0,y:1,a:240,b:-1,c:0,numerator:-999999,width:0,height:0};}
export function geometryModel(g:GeometryConfig,state:Record<string,number|boolean>={}):GeometryModel{
 const d=g.data,n=(k:string)=>Number(d[k]),objects:GeometryObject[]=[],layers:GeometryModel['layers']=[];
 let value=0,quantity='',targetId='',handle=p(1,0),handleOrigin=p(0,0),drag:GeometryModel['drag']='orientation';
 const facts:GeometryModel['facts']={};
 const point=(id:string,label:string,v:XY)=>{objects.push({id,label,kind:'point',points:[v]});return v;};
 const segment=(id:string,label:string,a:XY,b:XY)=>objects.push({id,label,kind:'segment',points:[a,b]});
 const circle=(id:string,label:string,c:XY,r:number)=>objects.push({id,label,kind:'circle',points:[c],radius:r});
 const layer=(id:string,label:string,bit:number,items:GeometryObject[])=>layers.push({id,label,bit,objects:items.map(o=>({...o,layer:bit}))});
 const O=p(0,0);
 if(g.mode==='right_triangle'||g.mode==='triangle_circles'){
  let A=O,B:XY,C:XY,a:number,b:number,c:number;
  if(g.mode==='right_triangle'){B=p(n('legA'),0);C=p(0,n('legB'));a=Math.hypot(n('legA'),n('legB'));b=n('legB');c=n('legA');}
  else{a=n('sideA');b=n('sideB');c=n('sideC');B=p(c,0);const x=(b*b+c*c-a*a)/(2*c);C=p(x,Math.sqrt(Math.max(0,b*b-x*x)));}
  point('vertex-A','Đỉnh A',A);point('vertex-B','Đỉnh B',B);point('vertex-C','Đỉnh C',C);
  segment('side-AB','Cạnh AB',A,B);segment('side-AC','Cạnh AC',A,C);segment('side-BC','Cạnh BC',B,C);
  handle=B;
  const area=Math.abs(B.x*C.y)/2,s=(a+b+c)/2,I=scale(add(add(scale(A,a),scale(B,b)),scale(C,c)),1/(2*s)),U=p(c/2,(b*b-c*C.x)/(2*C.y)),r=area/s,R=a*b*c/(4*area);
  facts.area=area;facts.inradius=r;facts.circumradius=R;
  const bisectors=[['AB',A,B],['AC',A,C],['BC',B,C]] as [string,XY,XY][];
  layer('perpendicular-bisectors','Trung trực',1,bisectors.map(([id,u,v])=>{const mid=scale(add(u,v),.5),direction=p(-(v.y-u.y),v.x-u.x),sign=(U.x-mid.x)*direction.x+(U.y-mid.y)*direction.y<0?-1:1,normal=scale(direction,sign/distance(u,v)),len=Math.max(a,b,c)*.2;return {id:'bisector-'+id,label:'Trung trực '+id,kind:'segment',points:[add(mid,scale(normal,-len)),add(U,scale(normal,len))]};}));
  layer('angle-bisectors','Phân giác',2,[A,B,C].map((v,i)=>({id:'angle-bisector-'+i,label:'Phân giác '+['A','B','C'][i],kind:'segment',points:[v,I]})));
  if(g.mode==='right_triangle'){
   const opposite=d.angleAt==='B'?b:c,adjacent=d.angleAt==='B'?c:b,side=d.target==='hypotenuse'?a:d.target==='opposite'?opposite:adjacent;
   targetId=d.target==='hypotenuse'?'side-BC':d.target==='opposite'?(d.angleAt==='B'?'side-AC':'side-AB'):(d.angleAt==='B'?'side-AB':'side-AC');
   const ratio=d.ratio==='sin'?opposite/a:d.ratio==='cos'?adjacent/a:opposite/adjacent;
   const angle=Math.atan2(opposite,adjacent)/rad;
   value=g.curriculumCode==='M9-GEO-01'?side:g.curriculumCode==='M9-GEO-02'?ratio:angle;
   quantity=g.curriculumCode==='M9-GEO-01'?`Độ dài cạnh ${d.target==='opposite'?'đối':d.target==='adjacent'?'kề':'huyền'} theo góc ${d.angleAt} (${d.unit})`:g.curriculumCode==='M9-GEO-02'?`${d.ratio} góc ${d.angleAt}`:`Góc ${d.angleAt} (độ)`;
   facts.rightAngle=90;facts.opposite=opposite;facts.adjacent=adjacent;facts.hypotenuse=a;facts.ratio=ratio;facts.acuteAngle=angle;
  }else{
   const inc=d.construction==='incircle';targetId=inc?'incircle':'circumcircle';value=inc?r:R;quantity=`Bán kính đường tròn ${inc?'nội':'ngoại'} tiếp (${d.unit})`;
   layer('incircle','Đường tròn nội tiếp',4,[{id:'incircle',label:'Đường tròn nội tiếp',kind:'circle',points:[I],radius:r},{id:'incenter',label:'Tâm nội tiếp I',kind:'point',points:[I]}]);
   layer('circumcircle','Đường tròn ngoại tiếp',8,[{id:'circumcircle',label:'Đường tròn ngoại tiếp',kind:'circle',points:[U],radius:R},{id:'circumcenter',label:'Tâm ngoại tiếp O',kind:'point',points:[U]}]);
  }
 }else if(g.mode==='circle_symmetry'){
  const r=n('radius'),P=polar(n('pointDistance'),n('pointAngle')),Q=d.axis==='x'?p(P.x,-P.y):p(-P.x,P.y);
  circle('circle-1','Đường tròn tâm O',O,r);point('center-O','Tâm O',O);point('point-P','Điểm P',P);point('point-Q','Điểm đối xứng Q',Q);segment('radius-OP','OP',O,P);segment('reflection-PQ','Cặp đối xứng PQ',P,Q);
  segment('axis','Trục đối xứng',d.axis==='x'?p(-r*1.5,0):p(0,-r*1.5),d.axis==='x'?p(r*1.5,0):p(0,r*1.5));
  value=n('pointDistance')<r-1e-8?0:Math.abs(n('pointDistance')-r)<=1e-8?1:2;quantity='Vị trí P: trong = 0; trên = 1; ngoài = 2';targetId='point-Q';handle=P;facts.reflectionX=Q.x;facts.reflectionY=Q.y;
 }else if(g.mode==='line_circle'){
  const r=n('radius'),h=n('distance'),angle=n('normalAngle'),N=polar(1,angle),T=p(-N.y,N.x),foot=scale(N,h),length=1.7*r;
  circle('circle-1','Đường tròn tâm O',O,r);point('center-O','Tâm O',O);segment('line-1',`Đường thẳng ℓ · d = ${h} ${d.unit}`,add(foot,scale(T,-length)),add(foot,scale(T,length)));segment('distance-OH','Khoảng cách OH',O,foot);point('foot-H','Chân vuông góc H',foot);
  value=h>r+1e-8?0:Math.abs(h-r)<=1e-8?1:2;quantity='Số giao điểm của đường thẳng và đường tròn';targetId='line-1';handle=polar(r,angle);
  if(value>0){const z=Math.sqrt(Math.max(0,r*r-h*h));point('intersection-1','Giao điểm I',add(foot,scale(T,z)));if(value===2)point('intersection-2','Giao điểm J',add(foot,scale(T,-z)));}
  const contact=scale(N,r);layer('tangent','Tiếp tuyến tại T',16,[{id:'tangent-1',label:'Tiếp tuyến',kind:'segment',points:[add(contact,scale(T,-2*r)),add(contact,scale(T,2*r))]},{id:'tangent-contact',label:'Tiếp điểm T',kind:'point',points:[contact]},{id:'tangent-radius',label:'OT vuông góc tiếp tuyến',kind:'segment',points:[O,contact]}]);
  facts.distance=h;facts.radius=r;
 }else if(g.mode==='two_circles'){
  const r=n('radius'),s=n('radius2'),h=n('distance'),C=p(h,0);circle('circle-1','Đường tròn O',O,r);circle('circle-2','Đường tròn K',C,s);point('center-O','Tâm O',O);point('center-K','Tâm K',C);segment('centers-OK','Đoạn nối tâm',O,C);
  value=h<1e-8?(Math.abs(r-s)<1e-8?3:0):h>r+s+1e-8||h<Math.abs(r-s)-1e-8?0:Math.abs(h-r-s)<1e-8||Math.abs(h-Math.abs(r-s))<1e-8?1:2;
  quantity='Số giao điểm: 0 / 1 / 2; trùng nhau = 3 (vô số)';targetId='circle-2';handle=h>0?C:p(r,0);
  if(h>0&&value>0&&value<3){const x=(r*r-s*s+h*h)/(2*h),y=Math.sqrt(Math.max(0,r*r-x*x));point('intersection-1','Giao điểm I',p(x,y));if(value===2)point('intersection-2','Giao điểm J',p(x,-y));}
  facts.centerDistance=h;
 }else if(g.mode==='circle_angles'||g.mode==='arc_sector_annulus'){
  const r=n('radius'),sweep=n('sweep'),A=polar(r,0),B=polar(r,sweep);circle('circle-1','Đường tròn tâm O',O,r);point('center-O','Tâm O',O);point('arc-A','Đầu cung A',A);point('arc-B','Đầu cung B',B);segment('radius-OA','Bán kính OA',O,A);segment('radius-OB','Bán kính OB',O,B);
  objects.push({id:'arc-AB',label:'Cung nhỏ AB',kind:'arc',points:[O,A,B],radius:r,sweep});
  objects.push({id:'sector-AOB',label:'Quạt tròn AOB',kind:'sector',points:[O,A,B],radius:r,sweep});
  if(g.mode==='circle_angles'){
   const alpha=Math.min(355,Math.max(sweep+5,Number(state.a??240))),V=polar(r,alpha);point('inscribed-V','Đỉnh góc nội tiếp V',V);segment('chord-VA','Dây VA',V,A);segment('chord-VB','Dây VB',V,B);value=sweep/2;quantity=`Góc nội tiếp AVB (độ), góc ở tâm AOB = ${sweep}°`;targetId='arc-AB';handle=V;drag='inscribed';facts.centralAngle=sweep;facts.inscribedAngle=sweep/2;
  }else{
   const inner=n('innerRadius');circle('inner-circle','Đường tròn trong',O,inner);
   objects.push({id:'annulus',label:'Vành khuyên',kind:'sector',points:[O,polar(r,0),polar(r,359.999)],radius:r,sweep:359.999});
   value=d.measure==='arc'?Math.PI*r*sweep/180:d.measure==='sector'?Math.PI*r*r*sweep/360:Math.PI*(r*r-inner*inner);targetId=d.measure==='arc'?'arc-AB':d.measure==='sector'?'sector-AOB':'annulus';quantity=d.measure==='arc'?`Độ dài cung AB (${d.unit})`:d.measure==='sector'?`Diện tích quạt AOB (${d.unit}²)`:`Diện tích vành khuyên (${d.unit}²)`;
   facts.arcLength=Math.PI*r*sweep/180;facts.sectorArea=Math.PI*r*r*sweep/360;facts.annulusArea=Math.PI*(r*r-inner*inner);handle=B;
  }
 }else{
  const r=n('radius'),regular=d.shape==='regular_polygon',angles=regular?Array.from({length:n('vertices')},(_,i)=>i*360/n('vertices')):[0,n('angleB'),n('angleC'),n('angleD')],vertices=angles.map(a=>polar(r,a));
  circle('circumcircle','Đường tròn ngoại tiếp',O,r);point('center-O','Tâm O',O);vertices.forEach((v,i)=>{point('vertex-'+i,'Đỉnh '+String.fromCharCode(65+i),v);segment('polygon-side-'+i,'Cạnh '+String.fromCharCode(65+i)+String.fromCharCode(65+(i+1)%vertices.length),v,vertices[(i+1)%vertices.length]);});
  objects.push({id:'polygon',label:regular?'Đa giác đều':'Tứ giác nội tiếp',kind:'polygon',points:vertices});
  value=regular?(n('vertices')-2)*180/n('vertices'):n('angleC')/2;quantity=regular?'Mỗi góc trong đa giác đều (độ)':`Góc D đối góc B = ${180-n('angleC')/2}° (độ)`;targetId='polygon';handle=vertices[0];facts.oppositeAngleSum=180;facts.centralStep=regular?360/n('vertices'):0;
 }
 const orientation=Number(state.x??0),all=[...objects,...layers.flatMap(l=>l.objects)],extents=all.flatMap(o=>o.radius?[p(o.points[0].x-o.radius,o.points[0].y-o.radius),p(o.points[0].x+o.radius,o.points[0].y+o.radius)]:o.points),center=p((Math.min(...extents.map(p=>p.x))+Math.max(...extents.map(p=>p.x)))/2,(Math.min(...extents.map(p=>p.y))+Math.max(...extents.map(p=>p.y)))/2),bounds=Math.max(.5,...all.map(o=>o.radius?distance(o.points[0],center)+o.radius:Math.max(...o.points.map(v=>distance(v,center)))))*1.12;
 for(const o of all)o.points=o.points.map(v=>turn(v,orientation));
 return {objects,value,quantity,targetId,layers,bounds,center:turn(center,orientation),handle:turn(handle,orientation),handleOrigin:turn(handleOrigin,orientation),drag,facts,construction:constructionGraph(g,all),constraints:{lengths:'locked',orientation:'free',zoom:'view-only',vertexDrag:drag==='inscribed'?'major-arc':'rigid'}};
}
export function validateGeometryData(data:GeometryData,mode:string):string[]{
 const e:string[]=[],n=(k:string)=>Number(data[k]),positive=(keys:string[])=>keys.forEach(k=>{if(!Number.isFinite(n(k))||n(k)<.5||n(k)>20)e.push(`${k}: nhập độ dài từ 0,5 đến 20.`);});
 if(!geometryModes.includes(mode as GeometryMode))return ['Mode hình học chưa hỗ trợ.'];
 if(!['cm','m'].includes(String(data.unit)))e.push('Đơn vị phải là cm hoặc m.');
 if(mode==='right_triangle'){
  positive(['legA','legB']);if(n('legA')/n('legB')<.1||n('legA')/n('legB')>10)e.push('Tỉ lệ hai cạnh góc vuông cần từ 0,1 đến 10.');
  if(!['B','C'].includes(String(data.angleAt))||!['opposite','adjacent','hypotenuse'].includes(String(data.target))||!['sin','cos','tan'].includes(String(data.ratio)))e.push('Chọn góc B/C, vai trò cạnh và tỉ số lượng giác được hỗ trợ.');
 }
 else if(mode==='triangle_circles'){
  positive(['sideA','sideB','sideC']);const a=n('sideA'),b=n('sideB'),c=n('sideC'),s=(a+b+c)/2,area2=s*(s-a)*(s-b)*(s-c);
  if(a+b<=c||a+c<=b||b+c<=a||area2<=0||Math.sqrt(area2)/Math.max(a,b,c)**2<.03)e.push('Ba cạnh không dựng được tam giác rõ: mỗi cạnh phải nhỏ hơn tổng hai cạnh còn lại; tránh tam giác gần suy biến.');
  if(!['incircle','circumcircle'].includes(String(data.construction)))e.push('Chọn đường tròn nội tiếp hoặc ngoại tiếp.');
 }else{
  positive(['radius']);
  if(mode==='circle_symmetry'){if(!Number.isFinite(n('pointDistance'))||n('pointDistance')<.5||n('pointDistance')>30)e.push('Khoảng cách OP cần từ 0,5 đến 30.');if(!Number.isFinite(n('pointAngle'))||n('pointAngle')<10||n('pointAngle')>80||!['x','y'].includes(String(data.axis)))e.push('Góc đặt P từ 10° đến 80°, trục đối xứng x/y để hai điểm phân biệt.');}
  if(mode==='line_circle'||mode==='two_circles'){if(!Number.isFinite(n('distance'))||n('distance')<0||n('distance')>40)e.push('Khoảng cách cần từ 0 đến 40.');}
  if(mode==='line_circle'&&(!Number.isFinite(n('normalAngle'))||n('normalAngle')<0||n('normalAngle')>359))e.push('Góc pháp tuyến cần từ 0° đến 359°.');
  if(mode==='two_circles')positive(['radius2']);
  if(mode==='circle_angles'||mode==='arc_sector_annulus'){if(!Number.isFinite(n('sweep'))||n('sweep')<20||n('sweep')>160)e.push('Cung nhỏ từ 20° đến 160° để đỉnh góc nội tiếp nằm trên cung lớn.');}
  if(mode==='arc_sector_annulus'){positive(['innerRadius']);if(n('innerRadius')>=n('radius'))e.push('Bán kính trong phải nhỏ hơn bán kính ngoài.');if(!['arc','sector','annulus'].includes(String(data.measure)))e.push('Chọn độ dài cung, quạt hoặc vành khuyên.');}
  if(mode==='cyclic_polygon'){
   if(!['regular_polygon','cyclic_quadrilateral'].includes(String(data.shape)))e.push('Chọn đa giác đều hoặc tứ giác nội tiếp.');
   if(!Number.isInteger(n('vertices'))||n('vertices')<3||n('vertices')>12)e.push('Số đỉnh nguyên từ 3 đến 12.');
   const angles=[0,n('angleB'),n('angleC'),n('angleD'),360];if(!angles.every(Number.isFinite)||angles.slice(1).some((a,i)=>a-angles[i]<10||a-angles[i]>170))e.push('Góc đỉnh tứ giác tăng dần; mỗi khoảng cung từ 10° đến 170° để hình lồi, không suy biến.');
  }
 }
 return e;
}
export function validateGeometry(g:GeometryConfig){const e=validateGeometryData(g.data,g.mode),index=Number(g.curriculumCode.slice(-2));if(!Number.isInteger(index)||index<1||index>10||geometryModes[index<=3?0:index-3]!==g.mode)e.push('Mã curriculum không khớp mode hình học.');if(!['explore','identify','discover','guided','practice','assessment'].includes(g.task))e.push('Nhiệm vụ hình học không hợp lệ.');return e;}
export function geometrySelectable(g:GeometryConfig){const m=geometryModel(g);return [...m.objects,...m.layers.flatMap(l=>l.objects)];}
export function geometryTargetIndex(g:GeometryConfig){return geometrySelectable(g).findIndex(o=>o.id===geometryModel(g).targetId);}
export function geometryAccept(g:GeometryConfig,name:string,value:number){
 if(!Number.isFinite(value))return false;
 if(name==='x')return value>=-180&&value<=180;
 if(name==='y')return value>=.6&&value<=1;
 if(name==='a')return g.mode==='circle_angles'&&value>=Number(g.data.sweep)+5&&value<=355;
 if(name==='b')return Number.isInteger(value)&&value>=0&&value<geometrySelectable(g).length;
 if(name==='c'){const mask=geometryModel(g).layers.reduce((a,l)=>a|l.bit,0);return Number.isInteger(value)&&value>=0&&(value&~mask)===0;}
 if(name==='numerator')return value>=-100000&&value<=100000;
 return name==='width'&&value===1&&g.task!=='explore';
}
export function applyGeometryInteraction(_g:GeometryConfig,s:Record<string,number|boolean>,name:string,value:number){s[name]=value;if(['b','numerator','a'].includes(name))s.width=0;}
export function geometryError(g:GeometryConfig,s:Record<string,number|boolean>){
 if(g.task==='explore')return Math.abs(Number(s.x))>=5||g.mode==='circle_angles'&&Math.abs(Number(s.a)-240)>=5?0:1;
 const m=geometryModel(g),target=geometryTargetIndex(g),selected=geometrySelectable(g)[Number(s.b)],visible=!selected?.layer||(Number(s.c)&selected.layer)!==0;
 if(g.task==='identify')return Number(s.b)===target&&visible?0:1;
 if(s.width!==1)return 1;
 const tolerance=Math.max(.005,Math.abs(m.value)*.0001),numeric=Math.abs(Number(s.numerator)-m.value)<=tolerance;
 return numeric&&(g.task==='discover'||Number(s.b)===target&&visible)?0:1;
}
export function geometrySolutionEvents(g:GeometryConfig){
 const event=(name:string,value:number)=>({type:'adjust_parameter' as const,name,value});
 if(g.task==='explore')return [event('x',25)];
 const m=geometryModel(g),selected=geometrySelectable(g)[geometryTargetIndex(g)],events=selected.layer?[event('c',selected.layer)]:[];
 if(g.task!=='discover')events.push(event('b',geometryTargetIndex(g)));
 if(g.task!=='identify')events.push(event('numerator',m.value),event('width',1));
 return events;
}
export function geometryProject(m:GeometryModel,p:XY,zoom=1):[number,number]{return [180+(p.x-m.center.x)/m.bounds*148*zoom,180-(p.y-m.center.y)/m.bounds*148*zoom];}
export function geometryUnproject(m:GeometryModel,x:number,y:number,zoom=1):XY{return p(m.center.x+(x-180)*m.bounds/(148*zoom),m.center.y+(180-y)*m.bounds/(148*zoom));}
