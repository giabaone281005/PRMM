import {useEffect,useId,useRef,useState} from 'react';
import type {LessonSession} from '../packages/lesson-runtime';
import {parabolaIds,parabolaModel,parabolaPath,parabolaProject,parabolaValue} from '../packages/lesson-runtime/parabola';

const coefficients=[-5,-4,-3,-2,-1,1,2,3,4,5];
export function ParabolaScene({session}:{session:LessonSession}) {
  const c=session.lesson.recognition![session.snapshot.checkpoint].uime!.parabola!,s=session.snapshot.state;
  const {point,referenceA,viewport}=parabolaModel(c),clipId=useId();
  const [sign,setSign]=useState<number|null>(null),drag=useRef<'coefficient'|'probe'|null>(null);
  useEffect(()=>{setSign(null);drag.current=null;},[session.snapshot.checkpoint]);
  const adjust=(name:string,value:number)=>session.interact({type:'adjust_parameter',name,value});
  const constructing=['guided','practice','assessment'].includes(c.task),varying=c.task==='explore'||constructing;
  const currentA=Number(s.x),displayA=varying?currentA:c.a;
  const [px,py]=parabolaProject(c,point.x,point.y),[hx,hy]=parabolaProject(c,1,currentA);
  const probeX=Number(s.a),[qx,qy]=parabolaProject(c,probeX,parabolaValue(c.a,probeX));
  function move(e:React.PointerEvent<SVGSVGElement>){
    if(!drag.current)return;const r=e.currentTarget.getBoundingClientRect();
    if(drag.current==='probe'){adjust('a',Math.max(1,Math.min(2,Math.round(((e.clientX-r.left)/r.width*360-180)/60))));}
    else {const y=(160-(e.clientY-r.top)/r.height*320)/124*viewport.yMax,rounded=Math.round(y);adjust('x',Math.max(-5,Math.min(5,rounded===0?(y>=0?1:-1):rounded)));}
  }
  function begin(e:React.PointerEvent<SVGElement>,kind:'coefficient'|'probe'){
    e.preventDefault();drag.current=kind;e.currentTarget.ownerSVGElement!.setPointerCapture(e.pointerId);
  }
  function chooseSign(){if(sign!==null)adjust('y',sign);}
  return <div className="parabola-scene" data-task={c.task} data-model="y=ax2">
    <p className="parabola-readout">{varying?`Đồ thị đang dựng: y = ${currentA}x²`:c.task==='identify'?'Đồ thị G: y = ax², a ≠ 0':`G: y = ${c.a}x² · H: y = ${referenceA}x²`}</p>
    <svg viewBox="0 0 360 320" role="img" aria-label="Đồ thị parabol tương tác" className="parabola-canvas"
      onPointerMove={move} onPointerUp={e=>{drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>{drag.current=null;}}>
      <defs><clipPath id={clipId}><rect x="30" y="30" width="300" height="260"/></clipPath></defs>
      <rect width="360" height="320" rx="16" fill="#eef4e8"/>
      {[-2,-1,1,2].map(x=><g key={x}><path d={`M${180+x*60} 32V288`} stroke="#d9e2d1"/><text x={180+x*60} y="181" textAnchor="middle" fontSize="12">{x}</text></g>)}
      {[-1,-.5,.5,1].map(k=><g key={k}><path d={`M32 ${160-k*124}H328`} stroke="#d9e2d1"/><text x="8" y={164-k*124} fontSize="11">{Math.round(k*viewport.yMax*10)/10}</text></g>)}
      <path d="M30 160H333M180 290V23" stroke="#63715b" strokeWidth="1.5"/>
      <text x="337" y="155" fontSize="14">x</text><text x="187" y="23" fontSize="14">y</text>
      <circle data-object-id={parabolaIds.origin} cx="180" cy="160" r="3" fill="#394b31"/><text x="185" y="177" fontSize="12">O</text>
      <g clipPath={`url(#${clipId})`}>
        <path data-object-id={constructing?parabolaIds.learner:parabolaIds.target} d={parabolaPath(c,displayA)} fill="none" stroke="#6854a0" strokeWidth="3"/>
        {c.task==='compare'&&<>
          <path data-object-id={parabolaIds.reference} d={parabolaPath(c,referenceA)} fill="none" stroke="#217b85" strokeWidth="3" strokeDasharray="7 4"/>
          {[c.a,referenceA].map((a,i)=><path key={i} data-object-id={'hit-'+(i===0?parabolaIds.target:parabolaIds.reference)} d={parabolaPath(c,a)} fill="none" stroke="transparent" strokeWidth="22" pointerEvents="stroke" role="button" tabIndex={0} aria-label={'Chọn đồ thị '+(i===0?'G':'H')} onClick={()=>adjust('y',i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();adjust('y',i);}}}/>)}
          <path d={`M${qx} 160V${qy}`} stroke="#9c7f54" strokeDasharray="4 3"/>
          <circle data-object-id={parabolaIds.probe} cx={qx} cy={qy} r="22" fill="transparent" stroke="#a2692f" strokeWidth="2" onPointerDown={e=>begin(e,'probe')}/>
        </>}
        {varying&&<circle data-object-id="coefficient-handle" cx={hx} cy={hy} r="22" fill="#6854a020" stroke="#6854a0" strokeWidth="2" onPointerDown={e=>begin(e,'coefficient')}/>}
        {constructing&&<>
          <path d={`M${px} 160V${py}H180`} stroke="#9c7f54" strokeDasharray="4 3"/>
          <circle data-object-id={parabolaIds.point} cx={px} cy={py} r="22" fill={Number(s.y)===0?'#e5b14b55':'#ffffff55'} stroke="#a2692f" strokeWidth="2" role="button" tabIndex={0} aria-label={`Xác nhận điểm P (${point.x}; ${point.y})`} onClick={()=>adjust('y',0)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();adjust('y',0);}}}/>
          <circle cx={px} cy={py} r="4" fill="#a2692f" pointerEvents="none"/>
        </>}
      </g>
      {constructing&&<text x={px>180?px-8:px+8} y={py>160?py+34:py-28} textAnchor={px>180?'end':'start'} fontSize="14" fill="#633a17" pointerEvents="none">P({point.x}; {point.y})</text>}
      {c.task==='identify'&&<g role="button" tabIndex={0} aria-label="Gắn dấu vào đồ thị G" onClick={chooseSign} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();chooseSign();}}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const raw=e.dataTransfer.getData('text/parabola-sign');if(raw==='0'||raw==='1')adjust('y',Number(raw));}}><rect x="30" y="30" width="300" height="260" fill="transparent"/><text x="40" y="50" fontSize="16">G {Number(s.y)===0?'· a > 0':Number(s.y)===1?'· a < 0':''}</text></g>}
    </svg>
    {varying&&<label>Hệ số đang dựng (a): {currentA}<input type="range" min="0" max="9" step="1" aria-label="Hệ số parabol" aria-valuetext={`a = ${currentA}`} value={coefficients.indexOf(currentA)} onInput={e=>adjust('x',coefficients[+e.currentTarget.value])}/></label>}
    {c.task==='explore'&&<p>Thử cả hệ số âm và dương. Kéo điểm tròn trên đồ thị hoặc dùng thanh hệ số.</p>}
    {c.task==='identify'&&<div className="parabola-signs">{['a > 0','a < 0'].map((label,i)=><button key={i} draggable aria-pressed={sign===i} onDragStart={e=>{e.dataTransfer.setData('text/parabola-sign',String(i));setSign(i);}} onClick={()=>setSign(i)}>{label}</button>)}<p>Chọn thẻ, rồi chạm vùng đồ thị để gắn.</p></div>}
    {c.task==='compare'&&<><label>Hoành độ điểm dò: {probeX}<input type="range" min="1" max="2" step="1" aria-label="Hoành độ điểm dò" value={probeX} onInput={e=>adjust('a',+e.currentTarget.value)}/></label><p>Tại x = {probeX}: G có y = {parabolaValue(c.a,probeX)}, H có y = {parabolaValue(referenceA,probeX)}.</p><div className="parabola-signs"><button onClick={()=>adjust('y',0)} aria-pressed={Number(s.y)===0}>Chọn G · nét liền</button><button onClick={()=>adjust('y',1)} aria-pressed={Number(s.y)===1}>Chọn H · nét đứt</button></div></>}
    {constructing&&<p>Điểm đã cho: P({point.x}; {point.y}). Sau mỗi lần đổi a, chạm P để xác nhận lại.</p>}
  </div>;
}
