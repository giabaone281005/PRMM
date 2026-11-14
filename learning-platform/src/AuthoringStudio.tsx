import {isAlgebraTemplate} from '../packages/lesson-authoring/algebra-templates';
import {algebraModel,algebraFormat} from '../packages/lesson-runtime/algebra';
import {isGeometryTemplate} from '../packages/lesson-authoring/geometry-templates';
import {geometryModel} from '../packages/lesson-runtime/geometry';
import {isGraphTemplate} from '../packages/lesson-authoring/graph-templates';
import {graphSolution} from '../packages/lesson-runtime/cartesian';
import {useEffect,useMemo,useState} from 'react';
import {exportAuthoringBundle,getAuthoringTemplate,listAuthoringTemplates,parseAuthoring,type AuthoringProblem,type AuthoringReceipt,AuthoringError} from '../packages/lesson-authoring/template-registry';
import {compileProblem,diffAuthoring,templateName} from '../packages/lesson-authoring/authoring-service';
import {parabolaModel} from '../packages/lesson-runtime/parabola';
import {LessonSession} from '../packages/lesson-runtime';
import type {Lesson} from '../packages/lesson-contract';
import {MathExplorer} from './MathExplorer';
import {PhonePreview} from './PhonePreview';
import {saveAuthoring,type RecordLesson} from './store';

type Rule={type?:string;minimum?:number;maximum?:number;enum?:Array<string|number>;not?:{const:unknown};maxLength?:number};
type Props={initial?:AuthoringProblem;row?:RecordLesson;onSaved:()=>Promise<unknown>;onDirtyChange:(dirty:boolean)=>void;canPublish:boolean};
const stages=[['parameters','Dữ kiện khám phá · bước 1–4'],['practice','Vận dụng độc lập · bước 5'],['assessment','Tự kiểm tra · bước 6']] as const;
const slotLabels:Record<string,string>={context:'Ghi chú bối cảnh cho người soạn',exploreInstruction:'Lời mời khám phá'};
const optionLabel=(v:string|number)=>({opposite:'Cạnh đối',adjacent:'Cạnh kề',hypotenuse:'Cạnh huyền',incircle:'Nội tiếp',circumcircle:'Ngoại tiếp',quadratic_only:'Chỉ phương trình bậc hai',allow_linear:'Cho phép hạ bậc khi a = 0',regular_polygon:'Đa giác đều',cyclic_quadrilateral:'Tứ giác nội tiếp',arc:'Độ dài cung',sector:'Diện tích quạt',annulus:'Diện tích vành khuyên',x:'Trục ngang',y:'Trục đứng'}[String(v)]??v);
function download(name:string,value:unknown){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

export function AuthoringStudio({initial,row,onSaved,onDirtyChange,canPublish}:Props){
 const [input,setInput]=useState<AuthoringProblem>(()=>structuredClone(initial??parseAuthoring(exportAuthoringBundle('math9-cylinder-recognition',1).example)));
 const [baseline,setBaseline]=useState<AuthoringProblem>(()=>structuredClone(input));
 const [hasUserInput,setHasUserInput]=useState(!!initial);
 const [identity,setIdentity]=useState(()=>({lessonId:row?.id??'lesson-'+crypto.randomUUID(),version:row?.draft.version??1}));
 const [revision,setRevision]=useState(row?.authoring?.revision??0),[persisted,setPersisted]=useState(!!row?.authoring);
 const [receipt,setReceipt]=useState<AuthoringReceipt|undefined>(row?.authoring?.receipt),[checkpoint,setCheckpoint]=useState(0),[focus,setFocus]=useState('');
 const [preview,setPreview]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [importText,setImportText]=useState(''),[pending,setPending]=useState<AuthoringProblem|null>(null);
 const template=getAuthoringTemplate(input.templateId,input.templateVersion),bundle=useMemo(()=>exportAuthoringBundle(input.templateId,input.templateVersion),[input.templateId,input.templateVersion]);
 const branch=bundle.schema.oneOf[0].properties as unknown as {parameters:{properties:Record<string,Rule>};content:{properties:Record<string,Rule>}};
 const changes=diffAuthoring(baseline,input),dirty=(!persisted&&hasUserInput)||changes.length>0||!!pending||!!importText.trim();
 const compiled=useMemo(()=>{try{return {value:compileProblem(input,identity),error:''};}catch(e){return {value:null,error:e instanceof AuthoringError?e.issues.map(issue=>`${humanPath(issue.path)}: ${issue.message}`).join('\n'):(e as Error).message};}},[input,identity]);
 useEffect(()=>{onDirtyChange(dirty);return()=>onDirtyChange(false);},[dirty,onDirtyChange]);
 useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue='';}};addEventListener('beforeunload',warn);return()=>removeEventListener('beforeunload',warn);},[dirty]);
 function update(fn:(p:AuthoringProblem)=>void){setHasUserInput(true);setInput(p=>{const next=structuredClone(p);fn(next);return next;});setError('');setNotice('');}
 function selectTemplate(id:string){if(id===input.templateId)return;if(dirty&&!confirm('Thay dạng bài sẽ bỏ nội dung đang soạn chưa lưu. Tiếp tục?'))return;setInput(parseAuthoring(exportAuthoringBundle(id,1).example));setCheckpoint(0);setPending(null);setImportText('');setNotice('Đã nạp flow sáu bước của dạng bài mới.');}
 function prepareImport(raw:string){try{if(raw.length>131072)throw Error('JSON đề tối đa 128 KB.');const candidate=JSON.parse(raw);if(candidate?.checkpoints)throw Error('Đây là manifest kỹ thuật. Luồng chuẩn chỉ nhận JSON đề; mở công cụ legacy trong phần nâng cao nếu cần.');const parsed=parseAuthoring(candidate);compileProblem(parsed,identity);setPending(parsed);setError('');setNotice('Đã kiểm cấu trúc, dữ kiện và khả năng hoàn thành. Xem khác biệt trước khi áp dụng.');}catch(e){setPending(null);setError((e as Error).message);}}
 function applyImport(asNew:boolean){if(!pending)return;setHasUserInput(true);if(asNew){history.replaceState({},'','/admin/lessons/new');setIdentity({lessonId:'lesson-'+crypto.randomUUID(),version:1});setRevision(0);setPersisted(false);setReceipt(undefined);setBaseline(structuredClone(pending));}setInput(pending);setPending(null);setImportText('');setCheckpoint(0);setNotice(asNew?'Đã tạo đề biến thể mới, chưa lưu và chưa xuất bản.':'Đã áp dụng vào đề đang soạn, chưa lưu và chưa xuất bản.');}
 function duplicate(){setHasUserInput(true);history.replaceState({},'','/admin/lessons/new');setIdentity({lessonId:'lesson-'+crypto.randomUUID(),version:1});setRevision(0);setPersisted(false);setReceipt(undefined);setBaseline(structuredClone(input));setNotice('Đang soạn bài mới từ nội dung này. Bài gốc được giữ nguyên.');}
 async function save(goLive:boolean){if(!compiled.value||pending||importText.trim())return;setBusy(true);setError('');try{
   const saved=await saveAuthoring(input,identity.lessonId,revision,goLive);setRevision(saved.revision);setReceipt(saved.receipt);setIdentity({lessonId:saved.draft.lessonId,version:saved.draft.version});setPersisted(true);setBaseline(structuredClone(input));
   history.replaceState({},'',`/admin/lessons/${saved.draft.lessonId}/edit`);
   setNotice(goLive?`Đã xuất bản phiên bản ${saved.publishedVersion}. Lịch sử và tiến độ phiên bản cũ được giữ nguyên.`:'Đã lưu bản nháp cùng dữ kiện và phiên bản template.');await onSaved();
  }catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 function fieldFocus(stage:string,key:string){setFocus(key);setCheckpoint(stage==='practice'?4:stage==='assessment'?5:key==='height'?3:key==='radius'?1:0);}
 function humanPath(path:string){return path.split('/').filter(Boolean).map(k=>({parameters:'Dữ kiện gốc',variants:'',practice:'Bước 5',assessment:'Bước 6',title:'Tên bài',content:'Nội dung',templateId:'Dạng bài',templateVersion:'Phiên bản mẫu',mode:'Mục tiêu',curriculumCode:'Mã chương trình',namespace:'Nguồn mã',authoringVersion:'Phiên bản JSON',...slotLabels}[k]??template.form.find(f=>f.key===k)?.label??k)).filter(Boolean).join(' · ');}
 const blocked=busy||!compiled.value||!!pending||!!importText.trim();
 return <section className="authoring-studio">
  <div className="panel"><div className="panel-heading"><div><h2>Soạn đề theo mẫu</h2><p>{persisted?'Cập nhật bản nháp hiện tại':'Bài mới / biến thể mới'} · {dirty?'Có nội dung chưa lưu':persisted?'Đã lưu':'Chưa lưu bài mới'} · Lớp 9</p></div>{persisted&&<button disabled={busy} onClick={duplicate}>Tạo bài mới từ nội dung này</button>}</div>
   <label>Dạng bài và mục tiêu<select aria-label="Dạng bài authoring" disabled={busy} value={input.templateId} onChange={e=>selectTemplate(e.target.value)}>{listAuthoringTemplates().map(t=><option key={t.templateId} value={t.templateId}>{templateName(t.templateId)}</option>)}</select></label>
   <p>Flow sáu bước do mẫu quy định. Tam giác và các cấu hình đường tròn đã có form theo dữ kiện; tần số thuộc ENG-06.</p>
  </div>
  <div className="authoring-grid"><div className="panel">
   <fieldset disabled={busy} className="authoring-fieldset"><label>Tên bài học<input aria-label="Tên đề authoring" maxLength={120} value={input.title} onChange={e=>update(p=>{p.title=e.target.value;})}/></label>
   {stages.map(([stage,label])=>{
    const data=(stage==='parameters'?input.parameters:input.variants[stage]) as unknown as Record<string,number|string>;
    return <section key={stage} className="authoring-data"><h3>{label}</h3>{stage!=='parameters'&&<p>Nhập dữ kiện mới, khác dữ kiện gốc và khác bước còn lại. {isGeometryTemplate(input.templateId)?'Đơn vị được khai báo cho từng bộ dữ kiện.':'Đơn vị kế thừa từ dữ kiện gốc.'}</p>}<div className="given-fields friendly-fields">{template.form.filter(f=>stage==='parameters'||isGeometryTemplate(input.templateId)||f.key!=='unit').map(f=>{
     const rule=branch.parameters.properties[f.key],example=(bundle.example.parameters as Record<string,unknown>)[f.key];
     return <label key={f.key}>{f.label}{f.symbol?` (${f.symbol})`:''}
      {rule.enum?<select aria-label={`${label} · ${f.label}`} value={data[f.key]} onFocus={()=>fieldFocus(stage,f.key)} onChange={e=>update(p=>{const target=(stage==='parameters'?p.parameters:p.variants[stage]) as unknown as Record<string,unknown>;target[f.key]=typeof rule.enum![0]==='number'?+e.target.value:e.target.value;})}>{rule.enum.map(v=><option key={v} value={v}>{optionLabel(v)}</option>)}</select>:
      <input type="number" aria-label={`${label} · ${f.label}`} min={rule.minimum} max={rule.maximum} step={rule.type==='integer'?1:'any'} value={Number.isFinite(data[f.key])?data[f.key]:''} placeholder={String(example)} onFocus={()=>fieldFocus(stage,f.key)} onBlur={()=>setFocus('')} onChange={e=>update(p=>{const target=(stage==='parameters'?p.parameters:p.variants[stage]) as unknown as Record<string,unknown>;target[f.key]=e.target.value===''?NaN:e.target.valueAsNumber;})}/>}
      <small>{f.help} Ví dụ: {String(example)}{f.unitField?' '+String((input.parameters as unknown as Record<string,unknown>)[f.unitField]):''}.</small>
     </label>;
    })}</div></section>;
   })}
   <h3>Nội dung được phép tùy chỉnh</h3>{template.contentSlots.map(slot=>{const rule=branch.content.properties[slot],value=(input.content as Record<string,string>|undefined)?.[slot]??'';return <label key={slot}>{slotLabels[slot]??slot}
    {rule.enum?<select value={value} onChange={e=>update(p=>{const content=p.content as Record<string,string>??{};if(e.target.value)content[slot]=e.target.value;else delete content[slot];p.content=content;})}><option value="">Dùng lời dẫn mặc định</option>{rule.enum.map(v=><option key={v} value={v}>{v}</option>)}</select>:
    <textarea maxLength={rule.maxLength??240} value={value} onChange={e=>update(p=>{const content=p.content as Record<string,string>??{};if(e.target.value)content[slot]=e.target.value;else delete content[slot];p.content=content;})}/>}
    {slot==='context'&&<small>Ghi chú một dòng lưu kèm JSON đề, không gõ lại số liệu hoặc công thức. Template v1 giữ ghi chú này để truy vết; lời dẫn runtime chỉ đổi qua slot được liệt kê.</small>}
   </label>})}
   </fieldset>
   {compiled.error&&<div className="error" role="alert"><strong>Chưa thể dựng bài. Cách sửa:</strong><pre>{compiled.error}</pre><p>Bán kính/chiều cao cần dương và trong giới hạn ghi ở form; hệ số parabol cần nguyên, khác 0; đường thẳng cần ít nhất một hệ số x/y khác 0; nghiệm cần nằm trên bước ghim đã chọn (hoặc đặt bước ghim bằng 0); ba bộ dữ kiện phải khác nhau.</p></div>}
   {compiled.value&&<ComputedInput input={compiled.value.receipt.authoringInput}/>}
  </div><aside className="panel authoring-preview" data-authoring-focus={focus}><h3>Preview theo dữ kiện</h3><p>Chọn bước để thử. Khi đổi trường, đối tượng liên quan sẽ được làm nổi.</p>
    <div className="authoring-flow">{template.flow.map((step,i)=><button key={step.id} className={checkpoint===i?'selected':''} onClick={()=>setCheckpoint(i)}><strong>{i+1}. {step.role}</strong></button>)}</div>
    {compiled.value?<><p>{compiled.value.manifest.checkpoints[checkpoint].instruction}</p><AuthoringPreview lesson={compiled.value.manifest} checkpoint={checkpoint}/><button onClick={()=>setPreview(true)}>Preview điện thoại đủ sáu bước</button></>:<p>Sửa dữ kiện trong form để xem preview mới.</p>}
   </aside></div>
  <section className="panel"><h3>JSON đề và bộ hướng dẫn AI</h3><div className="result-actions"><button onClick={()=>download(input.templateId+'.authoring.schema.json',bundle.schema)}>Tải schema đề</button><button onClick={()=>download(input.templateId+'.example.json',bundle.example)}>Tải JSON mẫu</button><button onClick={()=>download(input.templateId+'.ai-bundle.json',{...bundle,template:{templateId:template.templateId,templateVersion:template.templateVersion,mode:template.mode,flow:template.flow,form:template.form,contentSlots:template.contentSlots}})}>Tải bộ hướng dẫn AI</button><button disabled={!compiled.value} onClick={()=>download(input.templateId+'.problem.json',input)}>Xuất JSON đề hiện tại</button></div>
   <label>Nạp JSON đề<input type="file" accept=".json,application/json" disabled={busy} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>131072)throw Error('JSON đề tối đa 128 KB.');const raw=await file.text();setImportText(raw);prepareImport(raw);}catch(err){setError((err as Error).message);}e.target.value='';}}/></label>
   <details><summary>Dán JSON đề do AI trả về</summary><textarea className="blueprint-json" aria-label="JSON đề từ AI" disabled={busy} value={importText} onChange={e=>{setImportText(e.target.value);setPending(null);}}/><button disabled={busy||!importText.trim()} onClick={()=>prepareImport(importText)}>Kiểm tra & xem khác biệt</button><button disabled={busy} onClick={()=>{setImportText('');setPending(null);}}>Bỏ nội dung nhập</button></details>
   {pending&&<div className="authoring-import-review"><h3>Khác biệt so với đề đang soạn</h3><ChangeTable changes={diffAuthoring(input,pending)} label={humanPath}/><button disabled={busy} onClick={()=>applyImport(false)}>{persisted?'Áp dụng vào bản nháp hiện tại':'Áp dụng vào đề đang soạn'}</button><button disabled={busy} onClick={()=>applyImport(true)}>Tạo thành bài biến thể mới</button><p>Áp dụng JSON chỉ đổi nội dung soạn; không lưu hoặc xuất bản tự động.</p></div>}
  </section>
  <details className="panel"><summary>Khác biệt từ lần lưu gần nhất · {changes.length} trường</summary><ChangeTable changes={changes} label={humanPath}/></details>
  {error&&<div role="alert" className="error">{error}</div>}{notice&&<div role="status" className="notice">{notice}</div>}
  <div className="panel authoring-save"><button disabled={blocked} onClick={()=>save(false)}>Lưu bản nháp</button><button className="primary" disabled={blocked||!canPublish} onClick={()=>save(true)}>Xuất bản phiên bản mới</button><p>Xuất bản tạo phiên bản mới và lưu nguồn dữ kiện/mẫu. Phiên bản và tiến độ cũ được giữ lại.</p></div>
  <details className="panel author-details"><summary>Nâng cao · manifest runtime chỉ đọc và truy vết</summary><p>Manifest do compiler tạo. Form chuẩn không cho thay checkpoints, tiêu chí hoặc thứ tự bước qua JSON đề.</p>{receipt&&<p>Template {receipt.templateId} · v{receipt.templateVersion} · compiler {receipt.compilerVersion} · revision nháp {revision}</p>}{compiled.value&&<><button onClick={()=>download(identity.lessonId+'.lesson.json',compiled.value!.manifest)}>Xuất manifest kỹ thuật</button><pre>{JSON.stringify(compiled.value.manifest,null,2)}</pre></>}</details>
  {preview&&compiled.value&&<PhonePreview lesson={compiled.value.manifest} onClose={()=>setPreview(false)}/>}
 </section>;
}
function ChangeTable({changes,label}:{changes:ReturnType<typeof diffAuthoring>;label:(path:string)=>string}){return changes.length?<table><thead><tr><th>Trường</th><th>Trước</th><th>Sau</th></tr></thead><tbody>{changes.map(c=><tr key={c.path}><td>{label(c.path)}</td><td>{c.before===undefined?'—':String(c.before)}</td><td>{c.after===undefined?'—':String(c.after)}</td></tr>)}</tbody></table>:<p>Không có thay đổi dữ kiện.</p>;}
function ComputedInput({input}:{input:AuthoringProblem}){if(isAlgebraTemplate(input.templateId))return <section className="authoring-computed"><h3>Đại số · kết quả chỉ đọc cho người soạn</h3>{stages.map(([stage,label])=>{const data=stage==='parameters'?input.parameters:input.variants[stage],m=algebraModel({mode:input.mode as any,data:data as any,task:'guided'});return <div key={stage}><strong>{label}</strong><p>Bậc {m.degree} · Δ: {m.delta??'không áp dụng'} · Nghiệm: {m.kind==='all'?'mọi x trong miền':m.roots.length?m.roots.map(algebraFormat).join(', '):'không có'} · Giá trị cấm: {m.forbidden.map(algebraFormat).join(', ')||'không có'} · Nghiệm loại: {m.extraneous.map(algebraFormat).join(', ')||'không có'}</p></div>;})}</section>;if(isGeometryTemplate(input.templateId))return <section className="authoring-computed"><h3>Kết quả hình học · chỉ đọc cho người soạn</h3>{stages.map(([stage,label])=>{const data=stage==='parameters'?input.parameters:input.variants[stage],m=geometryModel({mode:input.mode as any,curriculumCode:input.curriculumCode,data:data as any,task:'guided'});return <div key={stage}><strong>{label}</strong><p>{m.quantity}: {Number(m.value.toFixed(6))}</p></div>;})}</section>;if(isGraphTemplate(input.templateId))return <section className="authoring-computed"><h3>Kết quả tự tính · chỉ đọc cho người soạn</h3>{stages.map(([stage,label])=>{const data=stage==='parameters'?input.parameters:input.variants[stage],r=graphSolution(data as any,input.mode as any);return <div key={stage}><strong>{label}</strong><p>{r.kind}: {r.points.map(p=>`(${Number(p.x.toFixed(6))}; ${Number(p.y.toFixed(6))})`).join(', ')}</p></div>;})}</section>;return <section className="authoring-computed"><h3>Kết quả tự tính · chỉ đọc</h3>{stages.map(([stage,label])=>{const data=stage==='parameters'?input.parameters:input.variants[stage];return <div key={stage}><strong>{label}</strong>{input.mode==='recognition'?<p>Đường kính đáy: {2*(data as {radius:number}).radius} {(input.parameters as {unit?:string}).unit} · Tỉ lệ chiều cao / bán kính: {Math.round((data as {height:number}).height/(data as {radius:number}).radius*1000)/1000}</p>:<p>y = {(data as {a:number}).a}x² · Mở {(data as {a:number}).a>0?'lên':'xuống'} · Điểm mẫu: P({stage==='assessment'?-2:stage==='practice'?1:2}; {parabolaModel({a:(data as {a:number}).a,pointX:stage==='assessment'?-2:stage==='practice'?1:2,task:'guided'}).point.y})</p>}</div>;})}</section>;}
function AuthoringPreview({lesson,checkpoint}:{lesson:Lesson;checkpoint:number}){
 const [session,setSession]=useState(()=>new LessonSession(lesson)),[,redraw]=useState(0);
 useEffect(()=>{const next=new LessonSession(lesson);next.previewCheckpoint(checkpoint);setSession(next);},[lesson]);
 useEffect(()=>session.subscribe(()=>redraw(n=>n+1)),[session]);useEffect(()=>session.previewCheckpoint(checkpoint),[session,checkpoint]);
 return <MathExplorer session={session}/>;
}
