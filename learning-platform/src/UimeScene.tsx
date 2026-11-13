import {useEffect,useState} from 'react';
import type {LessonSession} from '../packages/lesson-runtime';
import {uimeKeys} from '../packages/lesson-runtime/uime';
import {UimeSolid} from './UimeSolid';
import './recognition.css';
export function UimeScene({session}:{session:LessonSession}){
 const t=session.lesson.recognition![session.snapshot.checkpoint],u=t.uime!,s=session.snapshot.state,[token,setToken]=useState(0);
 useEffect(()=>{setToken(0);},[session.snapshot.checkpoint]);
 const adjust=(i:number,v:number)=>session.interact({type:'adjust_parameter',name:uimeKeys[i],value:v}),value=(i:number)=>Number(s[uimeKeys[i]]);
 const bucket=['TOKEN_CLASSIFIER','EVENT_CARD_BUCKET'].includes(u.kind),formula=u.kind==='FORMULA_SNAP_BUILDER',solid=u.kind==='3D_SOLID_INSPECTOR';
 const slider=['PARABOLA_SLIDER','NUMBER_LINE_SELECTOR','GEOMETRIC_HOTSPOT_FINDER'].includes(u.kind),x=value(0);
 function drop(i:number,e:React.DragEvent){e.preventDefault();const n=Number(e.dataTransfer.getData('text/plain'));if(Number.isInteger(n)&&n>=0&&n<u.tokens.length){if(bucket)adjust(n,i);else adjust(i,n);}}
 function graph(a:number,c=0){let d='';for(let n=-4;n<=4;n+=.05)d+=(d?'L':'M')+`${180+n*30},${150-(a*n*n+c)*12} `;return d;}
 return <div className="uime-scene" data-engine={u.kind}>
 {solid?<UimeSolid session={session} u={u}/>:<svg viewBox="0 0 360 240" role="img" aria-label={u.kind} onPointerDown={e=>{if(u.kind!=='NUMBER_LINE_SELECTOR')return;e.currentTarget.setPointerCapture(e.pointerId);const r=e.currentTarget.getBoundingClientRect();adjust(0,Math.max(u.min,Math.min(u.max,Math.round(((e.clientX-r.left)/r.width*360-180)/14))));}} onPointerMove={e=>{if(u.kind!=='NUMBER_LINE_SELECTOR'||!e.currentTarget.hasPointerCapture(e.pointerId))return;const r=e.currentTarget.getBoundingClientRect();adjust(0,Math.max(u.min,Math.min(u.max,Math.round(((e.clientX-r.left)/r.width*360-180)/14))));}}>
 <defs><clipPath id="uime-clip"><rect width="360" height="230"/></clipPath></defs><rect width="360" height="240" fill="#eef4e8" rx="16"/>
 {u.kind==='TRIANGLE_HOTSPOT_TAP'&&<><path d="M65 40V185H300Z M65 170H80V185" fill="#d4e7c6" stroke="#455e34" strokeWidth="3"/><text x="40" y="210">A</text><text x="40" y="35">B · α</text><text x="310" y="210">C</text></>}
 {u.kind==='GEOMETRIC_HOTSPOT_FINDER'&&<><circle cx="180" cy="100" r="75" fill="none" stroke="#6854a0" strokeWidth="3"/><line x1="30" x2="330" y1={100+Math.max(0,x)*25} y2={100+Math.max(0,x)*25} stroke="#43864e" strokeWidth="4"/><path d="M180 100V175M100 135H260" stroke="#82936b"/><text x="15" y="25">R = 3; d = {x}; {x<3?'2 điểm chung':x===3?'1 tiếp điểm':'0 điểm chung'}</text></>}
 {u.kind==='ANGLE_MEASURE_TAP'&&<><circle cx="180" cy="115" r="85" fill="none" stroke="#6854a0" strokeWidth="3"/><path d="M120 55 180 200 240 55M120 55 180 115 240 55" stroke="#628e45" fill="none" strokeWidth="3"/><path d="M120 55Q180 5 240 55" stroke={x===0?'#e69c31':'#a07bcc'} strokeWidth="8" fill="none"/><text x="100" y="50">A</text><text x="245" y="50">B</text><text x="180" y="220">C</text><text x="185" y="115">O</text>{x===0&&<text x="100" y="155">∠ACB = ½ ∠AOB</text>}</>}
 {u.kind==='CHART_BAR_TAP'&&u.hotspots.map((h,i)=><g key={i}><rect x={h.x} y={h.y} width={h.width} height={h.height} fill={x===i?'#e69c31':'#9dc97b'}/><text x={h.x+20} y={h.y-8}>{u.labels[i]}</text><text x={h.x} y="222">{h.label}</text></g>)}
 {['PARABOLA_SLIDER','DELTA_STATE_TOGGLE'].includes(u.kind)&&<g clipPath="url(#uime-clip)"><path d="M15 150H345M180 10V225" stroke="#95a18b"/><path d={graph(u.kind==='PARABOLA_SLIDER'?x:1,u.kind==='PARABOLA_SLIDER'?0:x===0?-2:x===1?0:2)} fill="none" stroke="#6854a0" strokeWidth="3"/><text x="15" y="25">{u.kind==='PARABOLA_SLIDER'?`y = ${x}x² ${x===0?'(a = 0: không là parabol)':''}`:x===0?'Δ > 0: hai nghiệm':x===1?'Δ = 0: nghiệm kép':x===2?'Δ < 0: vô nghiệm':'Chọn dấu Δ'}</text></g>}
 {u.kind==='NUMBER_LINE_SELECTOR'&&<><path d="M25 125H335" stroke="#526644" strokeWidth="2"/>{Array.from({length:21},(_,i)=>i-10).map(n=><g key={n}><path d={`M${180+n*14} 120v10`} stroke="#526644"/><text x={175+n*14} y="150" fontSize="10">{n}</text></g>)}<path d={`M${180+x*14} 125H${value(1)===0?25:335}`} stroke="#6e62af" strokeWidth="7"/><circle cx={180+x*14} cy="125" r="8" stroke="#6e62af" strokeWidth="3" fill={value(2)===1?'#6e62af':'#fff'}/><text x="35" y="50">x {value(1)===0?(value(2)===1?'≤':'<'):(value(2)===1?'≥':'>')} {x}</text></>}
 {u.svg&&<image href={'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(u.svg)} x="0" y="0" width="360" height="240" pointerEvents="none"/>}
 {u.hotspots.map((h,i)=><g key={i} role="button" tabIndex={0} aria-label={h.label} onClick={()=>adjust(u.kind==='GEOMETRIC_HOTSPOT_FINDER'?1:0,i)} onKeyDown={e=>{if(e.key==='Enter')adjust(u.kind==='GEOMETRIC_HOTSPOT_FINDER'?1:0,i);}}><rect x={h.x} y={h.y} width={h.width} height={h.height} rx="8" fill={value(u.kind==='GEOMETRIC_HOTSPOT_FINDER'?1:0)===i?'#c5a7eb':'#ffffff01'} stroke={u.kind==='TAP_COEFFICIENT'?'#9e8aba':'transparent'}/><text x={h.x+8} y={h.y+26}>{h.label}</text></g>)}
 {formula&&<text x="25" y="90">Ghép các ô công thức bên dưới</text>}
 {bucket&&<text x="40" y="110">Kéo từng thẻ vào nhóm bên dưới</text>}
 {u.kind==='INEQUALITY_SIGN_SWITCH'&&<text x="65" y="120" fontSize="32">−2x {u.tokens[x]??'▢'} −2y</text>}
 </svg>}
 {slider&&<label>{u.labels[0]??'Tham số'}: {x}<input aria-label="Tham số động" type="range" min={u.min} max={u.max} step={u.step} value={Math.max(u.min,x)} onInput={e=>adjust(0,+e.currentTarget.value)}/></label>}
 {u.kind==='NUMBER_LINE_SELECTOR'&&<div>{['Trái','Phải'].map((t,i)=><button aria-pressed={value(1)===i} key={t} onClick={()=>adjust(1,i)}>{t}</button>)}{['Mở','Kín'].map((t,i)=><button aria-pressed={value(2)===i} key={t} onClick={()=>adjust(2,i)}>{t}</button>)}</div>}
 {(bucket||formula)&&<div className="uime-targets">{u.labels.map((label,i)=><button key={i} className="recognition-drop" aria-label={'Ô '+label} onDragOver={e=>e.preventDefault()} onDrop={e=>drop(i,e)} onClick={()=>{if(bucket)adjust(token,i);else adjust(i,token);}}>{label}: {bucket?u.tokens.filter((_,j)=>value(j)===i).join('; '):u.tokens[value(i)]??'▢'}</button>)}</div>}
 {!solid&&!slider&&<div className="recognition-choices">{u.tokens.map((label,i)=><button key={i} draggable={bucket||formula} onDragStart={e=>e.dataTransfer.setData('text/plain',String(i))} aria-pressed={token===i} onClick={()=>{setToken(i);if(!formula&&!bucket)adjust(0,i);}}>{label}{bucket&&value(i)>=0?' → '+u.labels[value(i)]:''}</button>)}</div>}
 <p aria-live="polite">{session.success?t.explanation:'Thao tác trên hình để hoàn thành. Có thể chạm thẻ rồi chạm ô đích.'}</p>
 </div>;
}
