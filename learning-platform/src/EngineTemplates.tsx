import {engineTopics} from '../packages/lesson-authoring/uime-bank';
import {buildRecognition} from '../packages/lesson-authoring/math9';
import type {Lesson} from '../packages/lesson-contract';
export function EngineTemplates({onEdit}:{onEdit:(l:Lesson)=>void}){return <section className="panel"><h2>Mẫu bài theo công cụ tương tác</h2><p>Mỗi mẫu có 6 checkpoint cùng chủ đề, cấu hình hình vẽ và điều kiện hoàn thành.</p><div className="engine-gallery">{engineTopics.map(t=><article className="panel engine-card" key={t.id}><h3>{t.title}</h3><p>6 checkpoint · {t.tasks[0].uime?.kind==='3D_SOLID_INSPECTOR'?'Mô hình 3D xoay và chọn bộ phận':'Hình tương tác 2D'}</p><button onClick={()=>onEdit(buildRecognition(t,'lesson-'+crypto.randomUUID()))}>Tạo bài từ mẫu</button></article>)}</div></section>;}
