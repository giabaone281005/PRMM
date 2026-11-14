import {useId,useRef,useState,useEffect} from 'react';
import type {LessonSession} from '../packages/lesson-runtime';
import {graphBounds,graphProject,graphUnproject,lineSegment,snapGraph,type XY} from '../packages/lesson-runtime/cartesian';

const fmt=(n:number)=>Number(n.toFixed(6)).toString();
export function CartesianScene({session}:{session:LessonSession}){
 const g=session.lesson.recognition![session.snapshot.checkpoint].uime!.graph!,s=session.snapshot.state;
 const clip=useId(),drag=useRef<0|1|null>(null),[slot,setSlot]=useState<0|1>(0);
 useEffect(()=>{setSlot(0);drag.current=null;},[session.snapshot.checkpoint]);
 const change=(name:string,value:number)=>session.interact({type:'adjust_parameter',name,value});
 const bounds=graphBounds(g,g.mode),project=(p:XY)=>graphProject(g,g.mode,p);
 const setPin=(p:XY,index=slot)=>{const q=snapGraph(g,p);change(index?'width':'x',Math.max(bounds.xMin,Math.min(bounds.xMax,q.x)));change(index?'height':'y',Math.max(bounds.yMin,Math.min(bounds.yMax,q.y)));};
 const graphLine=(a:number,b:number,c:number)=>lineSegment(g,g.mode,a,b,c).map((p,i)=>(i?'L':'M')+project(p).join(',')).join(' ');
 const activeQ=g.task==='explore'&&Number(s.a)!==0?Number(s.a):g.q!;
 const curve=Array.from({length:301},(_,i)=>{const x=bounds.xMin+(bounds.xMax-bounds.xMin)*i/300;return `${i?'L':'M'}${project({x,y:activeQ*x*x}).join(',')}`;}).join(' ');
 const chooseGraph=(id:number)=>{if(g.task==='identify')change('b',id);};
 const selecting=['explore','identify'].includes(g.task),twoPins=g.mode==='line_parabola_intersection';
 const equation=(a:number,b:number,c:number)=>`${a}x + (${b})y = ${c}`;
 const [x,y]=project({x:Number(s.x),y:Number(s.y)}),[x2,y2]=project({x:Number(s.width),y:Number(s.height)});
 const dragPin=(e:React.PointerEvent<SVGCircleElement>,index:0|1)=>{e.stopPropagation();setSlot(index);drag.current=index;e.currentTarget.ownerSVGElement!.setPointerCapture(e.pointerId);};
 const onPoint=(e:React.PointerEvent<SVGSVGElement>)=>{const r=e.currentTarget.getBoundingClientRect();return graphUnproject(g,g.mode,(e.clientX-r.left)/r.width*360,(e.clientY-r.top)/r.height*340);};
 return <div className="cartesian-scene" data-mode={g.mode} data-task={g.task}>
  <p>G: {equation(g.a,g.b,g.c)}{g.mode==='linear_system'?` · H: ${equation(g.d!,g.e!,g.f!)}`:g.mode==='line_parabola_intersection'?` · H: y = ${activeQ}x²`:''}</p>
  <svg className="cartesian-canvas" viewBox="0 0 360 340" role="img" aria-label="Hệ tọa độ tương tác" style={{width:'100%',touchAction:'none'}} onPointerDown={e=>{if((e.target as Element).closest('[data-graph-select]'))return;drag.current=slot;e.currentTarget.setPointerCapture(e.pointerId);setPin(onPoint(e));}} onPointerMove={e=>{if(drag.current!==null)setPin(onPoint(e),drag.current);}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
   <defs><clipPath id={clip}><rect x="30" y="30" width="300" height="280"/></clipPath></defs><rect width="360" height="340" fill="#eef4e8" rx="16"/>
   {[-1,-.5,0,.5,1].map(t=><g key={t}><path d={`M${180+t*148} 30V310 M30 ${170-t*138}H330`} stroke="#d3dfcc"/><text x={180+t*148} y="327" textAnchor="middle" fontSize="11">{fmt(t*bounds.xMax)}</text><text x="3" y={173-t*138} fontSize="10">{fmt(t*bounds.yMax)}</text></g>)}
   <path d="M30 170H334M180 310V24" stroke="#66765c"/><text x="338" y="167">x</text><text x="188" y="23">y</text><text x="184" y="185" data-object-id="origin">O</text>
   <g clipPath={`url(#${clip})`}>
    <path data-object-id="graph-line-1" d={graphLine(g.a,g.b,g.c)} fill="none" stroke="#6854a0" strokeWidth="3"/>
    {g.mode==='linear_system'&&<path data-object-id="graph-line-2" d={graphLine(g.d!,g.e!,g.f!)} fill="none" stroke="#1d7d87" strokeWidth="3" strokeDasharray="7 4"/>}
    {g.mode==='line_parabola_intersection'&&<path data-object-id="graph-parabola" d={curve} fill="none" stroke="#1d7d87" strokeWidth="3" strokeDasharray="7 4"/>}
    {g.task==='identify'&&g.mode!=='linear_relation'&&<>
     <path data-graph-select="1" d={graphLine(g.a,g.b,g.c)} fill="none" stroke="transparent" strokeWidth="22" pointerEvents="stroke" onClick={()=>chooseGraph(1)}/>
     <path data-graph-select="2" d={g.mode==='linear_system'?graphLine(g.d!,g.e!,g.f!):curve} fill="none" stroke="transparent" strokeWidth="22" pointerEvents="stroke" onClick={()=>chooseGraph(2)}/>
    </>}
    <circle data-object-id="pin-1" pointerEvents={twoPins&&slot!==0?'none':'auto'} cx={x} cy={y} r="22" fill="#d9972730" stroke="#9f672b" strokeWidth="2" onPointerDown={e=>dragPin(e,0)}/><circle cx={x} cy={y} r="4" fill="#9f672b" pointerEvents="none"/>
    {twoPins&&!selecting&&<><circle data-object-id="pin-2" pointerEvents={slot!==1?'none':'auto'} cx={x2} cy={y2} r="22" fill="#c7356e20" stroke="#a32962" strokeWidth="2" onPointerDown={e=>dragPin(e,1)}/><circle cx={x2} cy={y2} r="4" fill="#a32962" pointerEvents="none"/></>}
   </g>
  </svg>
  <p>P₁({fmt(Number(s.x))}; {fmt(Number(s.y))}){twoPins?` · P₂(${fmt(Number(s.width))}; ${fmt(Number(s.height))})`:''} · {g.snap?`Bước lưới: ${g.snap}`:'Ghim tự do'}</p>
  <div className="cartesian-controls">
   {twoPins&&<><button aria-pressed={slot===0} onClick={()=>setSlot(0)}>Kéo ghim P₁</button><button aria-pressed={slot===1} onClick={()=>setSlot(1)}>Kéo ghim P₂</button></>}
   <label>Hoành độ ghim<input aria-label="Hoành độ ghim" type="number" step={g.snap||'any'} value={Number(s[slot?'width':'x'])} onChange={e=>{if(Number.isFinite(e.target.valueAsNumber))setPin({x:e.target.valueAsNumber,y:Number(s[slot?'height':'y'])});}}/></label>
   <label>Tung độ ghim<input aria-label="Tung độ ghim" type="number" step={g.snap||'any'} value={Number(s[slot?'height':'y'])} onChange={e=>{if(Number.isFinite(e.target.valueAsNumber))setPin({x:Number(s[slot?'width':'x']),y:e.target.valueAsNumber});}}/></label>
   {g.task==='explore'&&g.mode==='line_parabola_intersection'&&<label>Hệ số parabol đang khám phá<input aria-label="Hệ số parabol đang khám phá" type="range" min="-12" max="12" step="1" value={activeQ} onInput={e=>{const value=+e.currentTarget.value;if(value)change('a',value);}}/></label>}
   {g.task==='identify'&&g.mode!=='linear_relation'&&<><button aria-pressed={(Number(s.b)&1)!==0} onClick={()=>chooseGraph(1)}>Chạm G · nét liền</button><button aria-pressed={(Number(s.b)&2)!==0} onClick={()=>chooseGraph(2)}>Chạm H · nét đứt</button></>}
   {!selecting&&g.mode!=='linear_relation'&&<label>{g.mode==='linear_system'?'Số nghiệm của hệ':'Số giao điểm'}<select aria-label="Số nghiệm hoặc giao điểm" value={Number(s.c)} onChange={e=>change('c',+e.target.value)}><option value="0">Không có</option><option value="1">Một</option><option value="2">Hai</option>{g.mode==='linear_system'&&<option value="3">Vô số</option>}</select></label>}
   <button onClick={()=>change('numerator',1)}>Xác nhận ghim / kết luận</button>
  </div>
  <p>Thay vị trí ghim sẽ xóa xác nhận cũ. G và H trùng nhau vẫn có thể chọn bằng hai nút có nhãn riêng.</p>
 </div>;
}
