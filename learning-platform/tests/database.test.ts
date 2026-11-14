import {beforeAll,afterAll,describe,it,expect} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {readFileSync,readdirSync} from 'node:fs';
import {fixtures} from '../packages/lesson-authoring';
import {replay} from '../packages/lesson-runtime/replay';
import cylinderFixtures from '../contracts/generated/cylinder-recognition.json';
import graphFixtures from '../contracts/generated/cartesian.json';
import graphVectors from '../contracts/core-engines/cartesian-vectors.json';
import geometryFixtures from '../contracts/generated/geometry.json';
import geometryVectors from '../contracts/core-engines/geometry-vectors.json';
import algebraFixtures from '../contracts/generated/algebra.json';
import algebraVectors from '../contracts/core-engines/algebra-vectors.json';
const ids={admin:'00000000-0000-4000-a000-000000000001',author:'00000000-0000-4000-a000-000000000002',student:'00000000-0000-4000-a000-000000000003',other:'00000000-0000-4000-a000-000000000004'};
let db:PGlite;
async function as(role:keyof typeof ids|'anon'|'root'){await db.exec('reset role');if(role==='root')return;await db.query("select set_config('request.jwt.claim.sub',$1,false)",[role==='anon'?'':ids[role]]);await db.exec(`set role ${role==='anon'?'anon':'authenticated'}`);}
beforeAll(async()=>{db=new PGlite();await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);for(const id of Object.values(ids))await db.query('insert into auth.users(id) values($1)',[id]);for(const file of readdirSync('supabase/migrations').sort())await db.exec(readFileSync('supabase/migrations/'+file,'utf8'));for(const [role,id]of Object.entries(ids))await db.query('insert into public.user_roles values($1,$2) on conflict(user_id) do update set role=excluded.role',[id,role==='other'?'student':role]);},30000);
afterAll(async()=>{await db?.close();});
describe('actual PostgreSQL RLS and transactional publication',()=>{
  it('validates algebra vectors and publishes 18 compiled lessons atomically, preserving rational/quadratic guards',async()=>{
    await as('admin');await db.exec('begin');try{
      for(const v of algebraVectors)expect((await db.query('select lesson_private.valid_algebra($1::jsonb) valid',[JSON.stringify(v.config)])).rows,v.name).toEqual([{valid:v.valid}]);
      for(const f of algebraFixtures){await db.query('select public.save_lesson_draft($1::jsonb)',[JSON.stringify(f.manifest)]);expect((await db.query('select public.publish_lesson($1) version',[f.manifest.lessonId])).rows).toEqual([{version:1}]);}
      const bad=structuredClone(algebraFixtures.find(f=>f.input.mode==='rational_equation')!.manifest) as any;bad.recognition[0].uime.algebra.data.d=0;bad.recognition[0].uime.algebra.data.e=0;
      expect((await db.query('select lesson_private.valid_manifest($1::jsonb) valid',[JSON.stringify(bad)])).rows).toEqual([{valid:false}]);
    }finally{await db.exec('rollback');}
  });
  it('validates geometry vectors and atomically publishes all 30 compiled geometry lessons',async()=>{
    await as('admin');await db.exec('begin');try{
      for(const v of geometryVectors)expect((await db.query('select lesson_private.valid_geometry($1::jsonb) valid',[JSON.stringify(v.config)])).rows, v.name).toEqual([{valid:v.valid}]);
      for(const f of geometryFixtures){await db.query('select public.save_lesson_draft($1::jsonb)',[JSON.stringify(f.manifest)]);expect((await db.query('select public.publish_lesson($1) version',[f.manifest.lessonId])).rows).toEqual([{version:1}]);}
      const bad=structuredClone(geometryFixtures.find(f=>f.input.mode==='triangle_circles')!.manifest) as any;bad.recognition[0].uime.geometry.data.sideA=1;bad.recognition[0].uime.geometry.data.sideB=1;bad.recognition[0].uime.geometry.data.sideC=5;
      expect((await db.query('select lesson_private.valid_manifest($1::jsonb) valid',[JSON.stringify(bad)])).rows).toEqual([{valid:false}]);
    }finally{await db.exec('rollback');}
  });
  it('validates Cartesian mathematical vectors and publishes compiled graph versions atomically',async()=>{
    await as('admin');await db.exec('begin');try{
      for(const v of graphVectors){const config={...v.data,mode:v.mode,task:'guided'};expect((await db.query('select lesson_private.valid_cartesian_graph($1::jsonb) valid',[JSON.stringify(config)])).rows).toEqual([{valid:v.valid}]);}
      for(const f of graphFixtures){await db.query('select public.save_lesson_draft($1::jsonb)',[JSON.stringify(f.manifest)]);expect((await db.query('select public.publish_lesson($1) version',[f.manifest.lessonId])).rows).toEqual([{version:1}]);}
      const bad=structuredClone(graphFixtures[0].manifest) as any;bad.recognition[0].uime.graph.a=0;bad.recognition[0].uime.graph.b=0;
      expect((await db.query('select lesson_private.valid_manifest($1::jsonb) valid',[JSON.stringify(bad)])).rows).toEqual([{valid:false}]);
    }finally{await db.exec('rollback');}
  });
  it('publishes data-driven cylinders and rejects malformed geometry without rewriting legacy content',async()=>{
    await as('admin');await db.exec('begin');try {
      for(const f of cylinderFixtures){
        await db.query('select public.save_lesson_draft($1::jsonb)',[JSON.stringify(f.manifest)]);
        expect((await db.query('select public.publish_lesson($1) version',[f.manifest.lessonId])).rows).toEqual([{version:1}]);
      }
      const bad=structuredClone(cylinderFixtures[0].manifest);bad.recognition[0].uime.cylinder.height=100;bad.recognition[0].uime.cylinder.radius=.1;
      expect((await db.query('select lesson_private.valid_manifest($1::jsonb) valid',[JSON.stringify(bad)])).rows).toEqual([{valid:false}]);
    }finally{await db.exec('rollback');}
  });
  it('all U-IME engines publish and invalid formula/interval targets are rejected',async()=>{await as('admin');await db.exec('begin');try{const lessons=JSON.parse(readFileSync('contracts/uime-fixtures.json','utf8'));for(const l of lessons){await db.query('select public.save_lesson_draft($1::jsonb)',[JSON.stringify(l)]);expect((await db.query('select public.publish_lesson($1) version',[l.lessonId])).rows).toEqual([{version:1}]);}const invalid=structuredClone(lessons.find((l:any)=>l.recognition[0].uime.kind==='NUMBER_LINE_SELECTOR'));invalid.recognition[0].uime.answers[1]=3;expect((await db.query('select lesson_private.valid_manifest($1::jsonb) valid',[JSON.stringify(invalid)])).rows).toEqual([{valid:false}]);}finally{await db.exec('rollback');}});
  it('signals only published catalog changes and prevents learners forging notifications',async()=>{
    await as('student');
    const before=await db.query<{revision:number}>('select revision from public.catalog_state');
    const revision=Number(before.rows[0].revision);
    await expect(db.query('update public.catalog_state set revision=revision+1')).rejects.toThrow();
    await as('admin');
    const manifest={...structuredClone(fixtures[0]),lessonId:'catalog-signal-test'};
    await db.query('select public.save_lesson_draft($1::jsonb)',[JSON.stringify(manifest)]);
    expect(Number((await db.query<{revision:number}>('select revision from public.catalog_state')).rows[0].revision)).toBe(revision);
    await db.query('select public.publish_lesson($1)',[manifest.lessonId]);
    expect(Number((await db.query<{revision:number}>('select revision from public.catalog_state')).rows[0].revision)).toBe(revision+1);
    await db.query('select public.unpublish_lesson($1)',[manifest.lessonId]);
    expect(Number((await db.query<{revision:number}>('select revision from public.catalog_state')).rows[0].revision)).toBe(revision+2);
    await as('anon');await expect(db.query('select * from public.catalog_state')).rejects.toThrow();
  });
  it('requires verified, server-approved email for bootstrap admin',async()=>{
    await as('root');
    const id='00000000-0000-4000-a000-000000000005';
    await db.query("insert into lesson_private.admin_bootstrap(email) values('owner@example.invalid')");
    await db.query("insert into auth.users(id,email) values($1,'owner@example.invalid')",[id]);
    expect((await db.query('select role from public.user_roles where user_id=$1',[id])).rows).toEqual([{role:'student'}]);
    await db.query('update auth.users set email_confirmed_at=now() where id=$1',[id]);
    expect((await db.query('select role from public.user_roles where user_id=$1',[id])).rows).toEqual([{role:'admin'}]);
  });
  it('admin saves and publishes canonical version; subsequent published content immutable',async()=>{await as('admin');await db.query('select public.save_lesson_draft($1::jsonb)',[JSON.stringify(fixtures[0])]);const r=await db.query('select public.publish_lesson($1) as version',[fixtures[0].lessonId]);expect(r.rows).toEqual([{version:1}]);await as('root');await expect(db.query("update public.lesson_versions set content_hash='bad'")).rejects.toThrow('immutable');});
  it('students read published catalog, cannot read drafts, publish, forge roles or progress',async()=>{await as('student');expect((await db.query('select * from public.published_catalog()')).rows).toHaveLength(1);expect((await db.query('select * from public.lessons')).rows).toHaveLength(0);await expect(db.query('select public.publish_lesson($1)',[fixtures[0].lessonId])).rejects.toThrow('Forbidden');await expect(db.query("update public.user_roles set role='admin'")).rejects.toThrow();await expect(db.query("insert into public.lesson_progress(user_id,lesson_id,version,active_checkpoint_id,completion_status,snapshot) values($1,$2,1,'cp-1','completed','{}')",[ids.student,fixtures[0].lessonId])).rejects.toThrow();});
  it('author cannot see another authors drafts; own write succeeds; publication requires admin',async()=>{await as('author');expect((await db.query('select * from public.lessons')).rows).toHaveLength(0);const own={...fixtures[1],lessonId:'author-solid'};await db.query('select public.save_lesson_draft($1::jsonb)',[JSON.stringify(own)]);expect((await db.query('select * from public.lessons')).rows).toHaveLength(1);await expect(db.query('select public.publish_lesson($1)',[own.lessonId])).rejects.toThrow('Forbidden');});
  it('SQL contract rejects executable data, capabilities and cross references',async()=>{await as('admin');for(const mutation of [(l:any)=>l.code='eval',(l:any)=>l.engine.requiredCapabilities.push('unimplemented'),(l:any)=>l.scene.objects[3].vertexIds[0]='bad']){const l=structuredClone(fixtures[0]);mutation(l);await expect(db.query('select public.save_lesson_draft($1::jsonb)',[JSON.stringify(l)])).rejects.toThrow('Invalid lesson contract');}});
  it('anonymous cannot read catalog or drafts',async()=>{await as('anon');await expect(db.query('select * from public.published_catalog()')).rejects.toThrow();await expect(db.query('select * from public.lessons')).rejects.toThrow();});
  it('event replay rejects claimed completion and valid progress stays isolated/idempotent',async()=>{const l={...fixtures[0],status:'published' as const};expect(()=>replay(l,[{kind:'advance'}])).toThrow();expect(()=>replay(l,[{kind:'completed',value:true}])).toThrow();const events=[{kind:'interaction',event:{type:'drag_vertex',id:'A',position:[180,75]}},{kind:'advance'}],s=replay(l,events);await as('root');await db.exec('set role service_role');const params=[ids.student,l.lessonId,1,'00000000-0000-4000-a000-000000000099',JSON.stringify(s),s.revision];const q='select public.commit_lesson_progress($1,$2,$3,$4,$5::jsonb,$6)';await db.query(q,params);await db.query(q,params);await as('student');expect((await db.query('select * from public.lesson_progress')).rows).toHaveLength(1);expect((await db.query('select * from public.checkpoint_attempts')).rows).toHaveLength(1);await as('other');expect((await db.query('select * from public.lesson_progress')).rows).toHaveLength(0);expect((await db.query('select * from public.checkpoint_attempts')).rows).toHaveLength(0);});
  it('all twelve registered engines validate and six new engines publish',async()=>{await as('admin');for(const l of fixtures){expect((await db.query('select lesson_private.valid_manifest($1::jsonb) as valid',[JSON.stringify(l)])).rows).toEqual([{valid:true}]);}for(const l of fixtures.slice(6)){await db.query('select public.save_lesson_draft($1::jsonb)',[JSON.stringify(l)]);expect((await db.query('select public.publish_lesson($1) as version',[l.lessonId])).rows).toEqual([{version:1}]);}});
  it('unions overlapping devices, splits local midnight and isolates activity',async()=>{
    await as('student');
    const query='select public.record_study_session($1,$2,1,$3,1,$4::jsonb)';
    const id='00000000-0000-4000-a000-000000000020',device='00000000-0000-4000-a000-000000000030';
    const intervals=JSON.stringify([{start:'2026-11-10T16:59:50Z',end:'2026-11-10T17:00:10Z'}]);
    await db.query(query,[id,fixtures[0].lessonId,device,intervals]);
    await db.query(query,[id,fixtures[0].lessonId,device,intervals]);
    await db.query(query,['00000000-0000-4000-a000-000000000021',fixtures[0].lessonId,device,JSON.stringify([{start:'2026-11-10T16:59:55Z',end:'2026-11-10T17:00:15Z'}])]);
    const result=await db.query<{activity:any}>('select public.my_study_activity() activity');
    expect(result.rows[0].activity.days['2026-11-10'].seconds).toBe(10);
    expect(result.rows[0].activity.days['2026-11-11'].seconds).toBe(15);
    await expect(db.query(query,[id,fixtures[0].lessonId,device,'[]'])).rejects.toThrow();
    await as('other');
    expect((await db.query('select * from public.study_sessions')).rows).toHaveLength(0);
    await expect(db.query(query,[id,fixtures[0].lessonId,device,intervals])).rejects.toThrow('identity conflict');
  });
  it('request owner cannot forge status or identity; profile columns stay protected',async()=>{
    await as('student');
    await db.query("insert into public.engine_requests(problem) values('Thêm dạng toán mới')");
    await expect(db.query("insert into public.engine_requests(problem,status) values('bad','supported')")).rejects.toThrow();
    await expect(db.query("update public.profiles set created_at=now() where id=$1",[ids.student])).rejects.toThrow();
    await db.query("update public.profiles set display_name='Học sinh thật' where id=$1",[ids.student]);
    await as('other');expect((await db.query('select * from public.engine_requests')).rows).toHaveLength(0);
  });
  it('rejects reused attempt IDs with different payloads',async()=>{
    await as('root');await db.exec('set role service_role');
    const l={...fixtures[0],status:'published' as const};
    const snapshot=replay(l,[{kind:'interaction',event:{type:'drag_vertex',id:'A',position:[180,75]}},{kind:'advance'}]);
    await expect(db.query('select public.commit_lesson_progress($1,$2,1,$3,$4::jsonb,$5)',[ids.student,l.lessonId,'00000000-0000-4000-a000-000000000099',JSON.stringify({...snapshot,extra:'changed'}),snapshot.revision])).rejects.toThrow('Attempt identity conflict');
  });
});

