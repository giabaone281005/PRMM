import type {LessonSession} from '../packages/lesson-runtime';
import {UimeScene} from './UimeScene';
export function RecognitionScene({session}:{session:LessonSession}){
 const t=session.lesson.recognition![session.snapshot.checkpoint],selected=Number(session.snapshot.state.x);
 if(t.uime)return <UimeScene session={session}/>;
 const choose=(value:number)=>{if(value>=1&&value<=t.choices.length)session.interact({type:'adjust_parameter',name:'x',value});};
 return <div className="recognition-scene"><svg viewBox="0 0 360 220" aria-label={'Hình minh họa '+t.diagram}>
 <rect width="360" height="220" rx="16" fill="#eef4e8"/>
 {t.diagram==='triangle'&&<><path d="M70 50V180H300Z M70 165H85V180" fill="#d6e9c7" stroke="#425d32" strokeWidth="3"/><text x="48" y="195">A</text><text x="48" y="45">B</text><text x="305" y="195">C</text></>}
 {t.diagram==='circle'&&<><circle cx="180" cy="105" r="75" fill="none" stroke="#6d63b5" strokeWidth="3"/><path d="M45 180H315M180 105V180M105 105H255" stroke="#425d32" strokeWidth="3"/><text x="185" y="100">O</text><text x="185" y="200">H</text><text x="88" y="100">A</text></>}
 {t.diagram==='cone'&&<><path d="M180 30 70 180M180 30 290 180M180 30V180H290" fill="none" stroke="#6d63b5" strokeWidth="3"/><ellipse cx="180" cy="180" rx="110" ry="24" fill="none" stroke="#425d32"/><text x="190" y="110">h</text><text x="245" y="110">l</text><text x="230" y="175">r</text></>}
 {t.diagram==='chart'&&[20,10,10].map((n,i)=><g key={i} onClick={()=>choose(t.choices.indexOf('Điểm '+(8+i))+1)}><rect x={60+i*85} y={180-n*6} width="55" height={n*6} fill="#a4cc81"/><text x={80+i*85} y={175-n*6}>{n}</text><text x={60+i*85} y="205">Điểm {8+i}</text></g>)}
 {t.diagram==='none'&&<><text x="180" y="90" textAnchor="middle" fontSize="28">{t.mode==='formula'?'▢ = ?':'Nhận diện & ghép'}</text><text x="180" y="140" textAnchor="middle">{t.mode==='drag'?'Kéo thẻ vào ô bên dưới':'Chọn mảnh ghép phù hợp'}</text></>}
 {t.mode==='tap'&&t.diagram==='triangle'&&[['AB',70,115],['AC',185,180],['BC',185,115]].map(([name,x,y])=><circle key={name} cx={x} cy={y} r="24" fill="transparent" role="button" aria-label={'Cạnh '+name} tabIndex={0} onClick={()=>choose(t.choices.indexOf(String(name))+1)} onKeyDown={e=>{if(e.key==='Enter')choose(t.choices.indexOf(String(name))+1);}}/>)}
 {t.mode==='tap'&&t.diagram==='cone'&&[['h',180,105],['r',235,180],['l',240,105]].map(([name,x,y])=><circle key={name} cx={x} cy={y} r="24" fill="transparent" onClick={()=>choose(t.choices.indexOf(String(name))+1)}/>)}
 {t.mode==='tap'&&t.diagram==='circle'&&[['O',180,105],['H',180,180],['A',105,105]].map(([name,x,y])=><circle key={name} cx={x} cy={y} r="24" fill="transparent" onClick={()=>choose(t.choices.indexOf(String(name))+1)}/>)}
 </svg>
 {t.mode==='drag'&&<div className="recognition-drop" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const n=Number(e.dataTransfer.getData('text/plain'));if(Number.isInteger(n)&&n>0&&n<=t.choices.length)choose(n);}}>{selected?t.choices[selected-1]:'Thả mảnh ghép vào đây'}</div>}
 <div className="recognition-choices">{t.choices.map((c,i)=><button key={i} draggable={t.mode==='drag'} onDragStart={e=>e.dataTransfer.setData('text/plain',String(i+1))} onClick={()=>choose(i+1)} aria-pressed={selected===i+1}>{c}</button>)}</div>
 <p aria-live="polite">{selected?(session.success?t.explanation:'Chưa khớp. Hãy thử mảnh ghép khác.'):'Có thể chạm thẻ để chọn.'}</p></div>;
}
