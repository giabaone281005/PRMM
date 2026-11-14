import type {AuthoringProblem} from '../packages/lesson-authoring/template-registry';
import {coreEngineRegistry,coreEngineCoverage} from '../packages/lesson-contract/core-engines';
import {exportAuthoringBundle} from '../packages/lesson-authoring/template-registry';
import {compileProblem} from '../packages/lesson-authoring/authoring-service';
import {engineTopics} from '../packages/lesson-authoring/uime-bank';
import {buildRecognition} from '../packages/lesson-authoring/math9';
import type {Lesson} from '../packages/lesson-contract';
import {useState} from 'react';
import {compileCylinder} from '../packages/lesson-authoring/cylinder-compiler';
import cylinder from '../contracts/authoring/math9-cylinder-recognition.example.json';
import tall from '../contracts/authoring/cylinder-tall.example.json';
import wide from '../contracts/authoring/cylinder-wide.example.json';
import {compileParabola} from '../packages/lesson-authoring/parabola-compiler';
import parabola from '../contracts/authoring/math9-parabola-coefficient.example.json';
import downward from '../contracts/authoring/parabola-downward.example.json';
import narrow from '../contracts/authoring/parabola-narrow.example.json';

export function EngineTemplates({onEdit}:{onEdit:(l:Lesson,input?:AuthoringProblem)=>void}){
 const [sample,setSample]=useState(0),examples=[cylinder,tall,wide];
 const [parabolaSample,setParabolaSample]=useState(0),parabolas=[parabola,downward,narrow];
 return <section className="panel"><h2>Năng lực sáu core engine</h2><p>Các mode đang phát triển chưa được phép xuất bản. Mẫu legacy bên dưới không thay thế mức bao phủ đầy đủ.</p><div className="engine-gallery">{coreEngineRegistry.engines.map(e=><article className="panel engine-card" key={e.engineId}><h3>{e.label}</h3><p>{coreEngineCoverage.rows.filter(r=>r.engineId===e.engineId).length} dạng chương trình · {e.supportedModes.length}/{e.modes.length} mode có adapter chuẩn</p>{e.modes.map(m=><div key={m.mode}><p>{m.mode}: {m.publishEnabled?'Có adapter · chờ nghiệm thu đầy đủ':'Chưa triển khai · không thể xuất bản'}</p>{m.publishEnabled&&m.templateId&&<button onClick={()=>{const result=compileProblem(exportAuthoringBundle(m.templateId!,1).example,{lessonId:'lesson-'+crypto.randomUUID(),version:1});onEdit(result.manifest,result.receipt.authoringInput);}}>Soạn bài từ mode này</button>}</div>)}</article>)}</div><h2>Mẫu bài theo công cụ tương tác</h2><p>Mỗi mẫu có 6 checkpoint cùng chủ đề, cấu hình hình vẽ và điều kiện hoàn thành.</p><div className="engine-gallery">{engineTopics.map(t=><article className="panel engine-card" key={t.id}><h3>{t.title}</h3><p>6 checkpoint · {t.tasks[0].uime?.kind==='3D_SOLID_INSPECTOR'?'Mô hình 3D xoay và chọn bộ phận':'Hình tương tác 2D'}</p>
  {t.id==='engine-solid-cylinder'&&<label>Dữ kiện hình trụ<select value={sample} onChange={e=>setSample(+e.target.value)}>{examples.map((p,i)=><option key={i} value={i}>{p.title} · r = {p.parameters.radius}, h = {p.parameters.height} {p.parameters.unit}</option>)}</select></label>}
  {t.id==='engine-parabola'&&<label>Dữ kiện parabol<select value={parabolaSample} onChange={e=>setParabolaSample(+e.target.value)}>{parabolas.map((p,i)=><option key={i} value={i}>{p.title} · a = {p.parameters.a}</option>)}</select></label>}
  <button onClick={()=>{const id='lesson-'+crypto.randomUUID();if(t.id==='engine-solid-cylinder'){const result=compileCylinder(examples[sample],{lessonId:id,version:1});onEdit(result.manifest,result.receipt.authoringInput);}else if(t.id==='engine-parabola'){const result=compileParabola(parabolas[parabolaSample],{lessonId:id,version:1});onEdit(result.manifest,result.receipt.authoringInput);}else onEdit(buildRecognition(t,id));}}>Tạo bài từ mẫu</button></article>)}</div></section>;
}
