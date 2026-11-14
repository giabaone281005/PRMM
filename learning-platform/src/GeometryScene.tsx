import {useEffect,useId,useRef} from 'react';
import type {LessonSession} from '../packages/lesson-runtime';
import {geometryModel,geometrySelectable,geometryProject,geometryUnproject,type GeometryObject} from '../packages/lesson-runtime/geometry';
const fmt=(n:number)=>String(Number(n.toFixed(4)));
function GeometryAnswer({value,onCommit}:{value:number;onCommit:(value:number)=>void}){
 const input=useRef<HTMLInputElement>(null),editing=useRef(false);
 // Keep intermediate native text ("0.", "-") out of the runtime ACK loop.
 // Commit a complete number on blur/Enter; the confirmation button blurs first.
 useEffect(()=>{if(input.current&&!editing.current)input.current.value=value===-999999?'':String(value);},[value]);
 function commit(field:HTMLInputElement){if(field.value!==''&&Number.isFinite(field.valueAsNumber))onCommit(field.valueAsNumber);}
 return <input ref={input} type="number" aria-label="Kết quả hình học" step="any" defaultValue={value===-999999?'':String(value)} onFocus={()=>{editing.current=true;}} onBlur={e=>{editing.current=false;commit(e.currentTarget);}} onKeyDown={e=>{if(e.key==='Enter')commit(e.currentTarget);}}/>;
}
export function GeometryScene({session}:{session:LessonSession}){
 const g=session.lesson.recognition![session.snapshot.checkpoint].uime!.geometry!,s=session.snapshot.state,m=geometryModel(g,s),zoom=Number(s.y),clip=useId(),drag=useRef<{angle:number;orientation:number}|null>(null);
 const change=(name:string,value:number)=>session.interact({type:'adjust_parameter',name,value}),selectable=geometrySelectable(g),project=(p:{x:number;y:number})=>geometryProject(m,p,zoom),selected=selectable[Number(s.b)]?.id;
 const choose=(id:string)=>change('b',selectable.findIndex(o=>o.id===id));
 const coords=(e:React.PointerEvent<SVGElement>)=>{const r=e.currentTarget.ownerSVGElement?.getBoundingClientRect()??e.currentTarget.getBoundingClientRect();return geometryUnproject(m,(e.clientX-r.left)/r.width*360,(e.clientY-r.top)/r.height*360,zoom);};
 const path=(o:GeometryObject)=>{
  const [center,A,B]=o.points.map(project),radius=(o.radius??0)/m.bounds*148*zoom;
  if(o.kind==='polygon')return o.points.map((p,i)=>(i?'L':'M')+project(p).join(',')).join(' ')+'Z';
  if(o.kind==='segment')return `M${center}L${A}`;
  if(o.id==='annulus'){const r=radius,inner=Number(g.data.innerRadius)/m.bounds*148*zoom;return [r,inner].map(v=>`M${center[0]-v},${center[1]}a${v},${v} 0 1 0 ${2*v},0a${v},${v} 0 1 0 ${-2*v},0`).join(' ');}
  return `${o.kind==='sector'?`M${center}L${A}`:`M${A}`}A${radius},${radius} 0 ${(o.sweep??0)>180?1:0} 0 ${B}${o.kind==='sector'?'Z':''}`;
 };
 const render=(o:GeometryObject)=>{
  const active=selected===o.id,color=active?'#b36a13':o.layer?'#34765b':'#65549a',pt=project(o.points[0]);
  const common={'data-object-id':o.id,'data-selected':active?'true':'false',onClick:()=>choose(o.id),style:{cursor:'pointer'}};
  return <g key={o.id} {...common}><title>{o.label}</title>{o.kind==='point'?<><circle cx={pt[0]} cy={pt[1]} r={o.id.includes('center')?7:15} fill="transparent"/><circle cx={pt[0]} cy={pt[1]} r={active?6:4} fill={color}/><text pointerEvents="none" x={pt[0]+8} y={pt[1]-9} fontSize="12" fill="#163825">{o.label.replace(/^(Đỉnh |Điểm |Tâm |Giao điểm |Chân vuông góc |Tiếp điểm )/,'')}</text></>:o.kind==='circle'?<><circle cx={pt[0]} cy={pt[1]} r={o.radius!/m.bounds*148*zoom} fill="none" stroke="transparent" strokeWidth="22"/><circle cx={pt[0]} cy={pt[1]} r={o.radius!/m.bounds*148*zoom} fill="none" stroke={color} strokeWidth={active?4:2} strokeDasharray={o.layer?'6 4':undefined}/></>:<><path d={path(o)} fill={['sector','polygon'].includes(o.kind)?active?'#eccd8a66':'#728db21a':'none'} fillRule="evenodd" stroke="transparent" strokeWidth="20"/><path d={path(o)} fill={['sector','polygon'].includes(o.kind)?active?'#eccd8a66':'#728db21a':'none'} fillRule="evenodd" stroke={color} strokeWidth={active?4:2} strokeDasharray={o.layer?'6 4':undefined}/></>}</g>;
 };
 const active=[...m.objects,...m.layers.filter(l=>(Number(s.c)&l.bit)!==0).flatMap(l=>l.objects)],handle=project(m.handle);
 const rightMark=()=>{const [A,B,C]=m.objects.slice(0,3).map(o=>project(o.points[0])),ab=Math.hypot(B[0]-A[0],B[1]-A[1]),ac=Math.hypot(C[0]-A[0],C[1]-A[1]),u=[(B[0]-A[0])/ab*10,(B[1]-A[1])/ab*10],v=[(C[0]-A[0])/ac*10,(C[1]-A[1])/ac*10];return `M${A[0]+u[0]},${A[1]+u[1]}l${v}l${-u[0]},${-u[1]}`;};
 const names:Record<string,string>={legA:'AB',legB:'AC',radius:'r',radius2:'r₂',distance:'d',pointDistance:'OP',pointAngle:'Góc đặt P',normalAngle:'Góc pháp tuyến',sweep:'Góc ở tâm',innerRadius:'r trong',sideA:'BC',sideB:'CA',sideC:'AB',vertices:'Số đỉnh',angleB:'Góc cực B',angleC:'Góc cực C',angleD:'Góc cực D'};
 return <div className="geometry-scene" data-mode={g.mode} data-task={g.task}>
  <p className="geometry-givens">{Object.entries(g.data).filter(([k,v])=>typeof v==='number'&&names[k]).map(([k,v])=>`${names[k]} = ${fmt(Number(v))}`).join(' · ')} · {g.data.unit}</p>
  <svg className="geometry-canvas" viewBox="0 0 360 360" role="img" aria-label="Hình học động theo dữ kiện" style={{width:'100%',touchAction:'none'}} onPointerMove={e=>{
   if(!drag.current)return;const p=coords(e),angle=Math.atan2(p.y,p.x)*180/Math.PI;
   if(m.drag==='inscribed'){const a=((angle-Number(s.x))%360+360)%360;change('a',Math.max(Number(g.data.sweep)+5,Math.min(355,a)));}
   else{let delta=angle-drag.current.angle;delta=((delta+540)%360)-180;change('x',Math.max(-180,Math.min(180,drag.current.orientation+delta)));}
  }} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
   <defs><clipPath id={clip}><rect x="8" y="8" width="344" height="344"/></clipPath></defs><rect width="360" height="360" rx="16" fill="#eef4e8"/>
   <g clipPath={`url(#${clip})`}>{active.filter(o=>o.kind!=='point').sort((a,b)=>{const rank=(o:GeometryObject)=>o.id==='annulus'?0:['sector','polygon'].includes(o.kind)?1:o.kind==='arc'?3:2;return rank(a)-rank(b);}).map(render)}{g.mode==='right_triangle'&&<path data-object-id="right-angle-A" d={rightMark()} fill="none" stroke="#25684c" strokeWidth="2"/>}{active.filter(o=>o.kind==='point').map(render)}
   <circle data-drag-handle="true" cx={handle[0]} cy={handle[1]} r="18" fill="#e8bd5860" stroke="#a06b24" strokeWidth="2" style={{cursor:'grab'}} onClick={e=>e.stopPropagation()} onPointerDown={e=>{e.preventDefault();e.stopPropagation();const p=coords(e);drag.current={angle:Math.atan2(p.y,p.x)*180/Math.PI,orientation:Number(s.x)};e.currentTarget.ownerSVGElement!.setPointerCapture(e.pointerId);}}/>
   </g>
  </svg>
  <p>Kéo chấm cam: {m.drag==='inscribed'?'trượt đỉnh V trên cung lớn, giữ hai đầu cung A/B.':'xoay hình; độ dài và các quan hệ dựng hình được giữ nguyên.'}</p>
  <div className="geometry-controls"><label>Góc xoay hình<input type="range" aria-label="Góc xoay hình" min="-180" max="180" step="1" value={Number(s.x)} onChange={e=>change('x',+e.target.value)}/></label><label>Thu phóng<input type="range" aria-label="Thu phóng hình" min="0.6" max="1" step="0.05" value={zoom} onChange={e=>change('y',+e.target.value)}/></label></div>
  {m.layers.length>0&&<fieldset className="geometry-layers"><legend>Lớp dựng hình</legend>{m.layers.map(l=><label key={l.id}><input type="checkbox" data-layer-id={l.id} aria-label={l.label} checked={(Number(s.c)&l.bit)!==0} onChange={()=>change('c',Number(s.c)^l.bit)}/>{l.label}</label>)}</fieldset>}
  {g.task!=='explore'&&g.task!=='discover'&&<div className="geometry-object-controls" aria-label="Chọn đối tượng theo ID">{selectable.map(o=><button key={o.id} data-select-id={o.id} aria-pressed={selected===o.id} hidden={!!o.layer&&(Number(s.c)&o.layer)===0} disabled={!!o.layer&&(Number(s.c)&o.layer)===0} onClick={()=>choose(o.id)}>{o.label}</button>)}</div>}
  {!['explore','identify'].includes(g.task)&&<div className="geometry-answer"><label>{m.quantity}<GeometryAnswer key={session.snapshot.checkpoint} value={Number(s.numerator)} onCommit={value=>change('numerator',value)}/></label><button onClick={e=>{const field=e.currentTarget.parentElement?.querySelector<HTMLInputElement>('input[aria-label="Kết quả hình học"]');if(field&&field.value!==''&&Number.isFinite(field.valueAsNumber))change('numerator',field.valueAsNumber);change('width',1);}}>Xác nhận hình học</button><small>Nhập số, có thể dùng số thập phân. Sai số cho phép: 0,005 hoặc 0,01% kết quả. Chọn đúng đối tượng ở các bước thực hành.</small></div>}
  <p aria-live="polite">{session.success?session.lesson.recognition![session.snapshot.checkpoint].explanation:'Hình và vùng chọn cùng thay đổi theo dữ kiện.'}</p>
 </div>;
}
