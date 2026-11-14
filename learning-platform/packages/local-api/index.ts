import {createHash} from 'node:crypto';
import {compileProblem} from '../lesson-authoring/authoring-service';
import type {AuthoringReceipt} from '../lesson-authoring/template-registry';
import type {Plugin} from 'vite';
import {mkdirSync,readFileSync,writeFileSync,renameSync,existsSync} from 'node:fs';
import {validateLesson,type Lesson} from '../lesson-contract';
import {replay} from '../lesson-runtime/replay';
type Row={authoring?:{receipt:AuthoringReceipt;revision:number};authoringVersions?:{version:number;receipt:AuthoringReceipt;manifestContentHash:string}[];id:string;draft:Lesson;versions:Lesson[];publishedVersion:number|null;assignedTo:string[];updatedAt:string};
type Workspace={lessons:Row[];progress:Record<string,unknown>;audit:{at:string;action:string;lessonId:string}[]};
export function localApi():Plugin {
  const testing=process.env.MOHOC_TEST_MODE==='1',file='.local/workspace.json';let memory:Workspace;
  function emptyWorkspace():Workspace{return{lessons:[],progress:{},audit:[]};}
  function read(){if(testing)return memory??=emptyWorkspace();if(!existsSync(file)){const state=emptyWorkspace();write(state);return state;}return JSON.parse(readFileSync(file,'utf8')) as Workspace;}
  function write(state:Workspace){if(testing){memory=state;return;}mkdirSync('.local',{recursive:true});writeFileSync(file+'.tmp',JSON.stringify(state,null,2));renameSync(file+'.tmp',file);}
  function save(state:Workspace,manifest:Lesson,managed=false){const errors=validateLesson(manifest);if(errors.length)throw Error(errors.join('; '));if(manifest.status!=='draft')throw Error('Draft required');let r=state.lessons.find(r=>r.id===manifest.lessonId);if(r){if(r.authoring&&!managed)throw Error('Bài dùng template: mở form authoring để lưu, không sửa manifest trực tiếp.');r.draft=structuredClone(manifest);r.updatedAt=new Date().toISOString();}else{r={id:manifest.lessonId,draft:structuredClone(manifest),versions:[],publishedVersion:null,assignedTo:[],updatedAt:new Date().toISOString()};state.lessons.unshift(r);}return r;}
  return{name:'mohoc-local-api',configureServer(server){server.middlewares.use(async(req,res,next)=>{
    const url=new URL(req.url??'/','http://localhost');if(!url.pathname.startsWith('/api/'))return next();
    const origin=req.headers.origin;if(origin&&!/^http:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?$/.test(origin)){res.statusCode=403;res.end('Local requests only');return;}
    res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
    try{
      let body:any={};if(req.method==='POST'){let raw='';for await(const chunk of req){raw+=chunk.toString();if(raw.length>1000000)throw Error('Payload too large');}body=JSON.parse(raw||'{}');}
      const state=read();let result:unknown;let action:string|undefined,id='';
      if(url.pathname==='/api/health')result={mode:'local',contract:'1.0.0'};
      else if(req.method==='GET'&&url.pathname==='/api/catalog')result=state.lessons.flatMap(r=>r.versions.filter(v=>v.version===r.publishedVersion));
      else if(req.method==='GET'&&url.pathname==='/api/admin/lessons')result=state.lessons;
      else if(req.method==='GET'&&url.pathname==='/api/audit')result=state.audit;
      else if(req.method==='POST'&&url.pathname==='/api/admin/authoring'){
        if(typeof body.lessonId!=='string'||!Number.isSafeInteger(body.expectedRevision)||body.expectedRevision<0||typeof body.publish!=='boolean')throw Error('Yêu cầu authoring không hợp lệ.');
        const existing=state.lessons.find(r=>r.id===body.lessonId);
        if(existing&&!existing.authoring)throw Error('Bài legacy: tạo biến thể mới để dùng form chuẩn.');
        if((existing?.authoring?.revision??0)!==body.expectedRevision)throw Error('Bản nháp đã thay đổi ở nơi khác. Tải lại trước khi lưu.');
        const version=existing?.draft.version??1,{manifest,receipt}=compileProblem(body.input,{lessonId:body.lessonId,version});
        const r=save(state,manifest,true),revision=body.expectedRevision+1;
        r.authoring={receipt,revision};
        if(body.publish){
          const publishedVersion=Math.max(0,...r.versions.map(v=>v.version))+1,published={...structuredClone(manifest),version:publishedVersion,status:'published' as const};
          const publishedReceipt=structuredClone(receipt);publishedReceipt.runtime.version=publishedVersion;
          r.versions.push(published);r.publishedVersion=publishedVersion;
          (r.authoringVersions??=[]).push({version:publishedVersion,receipt:publishedReceipt,manifestContentHash:createHash('sha256').update(JSON.stringify(published)).digest('hex')});
          r.draft.version=publishedVersion+1;r.authoring.receipt.runtime.version=r.draft.version;
        }
        result={draft:r.draft,receipt:r.authoring.receipt,revision,publishedVersion:r.publishedVersion};action=body.publish?'publish_authoring':'save_authoring';id=r.id;
      }
      else if(req.method==='POST'&&url.pathname==='/api/admin/draft'){result=save(state,body.manifest);action='save_draft';id=body.manifest.lessonId;}
      else if(req.method==='POST'&&url.pathname==='/api/admin/publish'){const r=save(state,body.manifest),version=Math.max(0,...r.versions.map(v=>v.version))+1;r.versions.push({...structuredClone(r.draft),version,status:'published'});r.publishedVersion=version;r.draft.version=version+1;result=r;action='publish';id=r.id;}
      else if(req.method==='POST'&&url.pathname==='/api/admin/unpublish'){const r=state.lessons.find(r=>r.id===body.id);if(!r)throw Error('Unknown lesson');r.publishedVersion=null;result=r;action='unpublish';id=r.id;}
      else if(req.method==='POST'&&url.pathname==='/api/admin/assign'){const r=state.lessons.find(r=>r.id===body.id);if(!r||typeof body.userId!=='string'||!body.userId.trim())throw Error('Invalid assignment');if(!r.assignedTo.includes(body.userId))r.assignedTo.push(body.userId);result=r;action='assign';id=r.id;}
      else if(url.pathname==='/api/progress'){
        const lessonId=req.method==='GET'?url.searchParams.get('lessonId'):body.lessonId,version=req.method==='GET'?Number(url.searchParams.get('version')):body.version,user=req.method==='GET'?url.searchParams.get('user'):body.user;
        if(typeof user!=='string'||user.length>100)throw Error('Invalid local user');const key=JSON.stringify([user,lessonId,version]);
        if(req.method==='GET')result=state.progress[key]??null;
        else if(req.method==='POST'){const row=state.lessons.find(r=>r.id===lessonId),l=row?.versions.find(v=>v.version===version);if(!l||row!.publishedVersion!==version)throw Error('Published manifest unavailable');const snapshot={...replay(l,body.events),journal:body.events};const previous=state.progress[key] as {revision:number}|undefined;if(!previous||previous.revision<=snapshot.revision)state.progress[key]=snapshot;write(state);result=state.progress[key];}
        else throw Error('Method not allowed');
      }else{res.statusCode=404;result={error:'Endpoint not found'};}
      if(action){state.audit.unshift({at:new Date().toISOString(),action,lessonId:id});state.audit=state.audit.slice(0,500);write(state);}
      res.end(JSON.stringify(result??{ok:true}));
    }catch(e){res.statusCode=400;res.end(JSON.stringify({error:(e as Error).message}));}
  });}};
}
