begin;

-- Supabase installations can give new tables/functions broad default grants.
-- Make grants explicit, including column grants, rather than relying on RLS alone.
alter default privileges in schema public revoke all on tables from anon,authenticated;
alter default privileges in schema public revoke execute on functions from public,anon,authenticated;
revoke all on all tables in schema public from anon,authenticated;
revoke all on all sequences in schema public from anon,authenticated;
revoke execute on all functions in schema public from public,anon,authenticated;
revoke execute on all functions in schema lesson_private from public,anon,authenticated;
grant usage on schema lesson_private to authenticated;
grant select on public.profiles,public.user_roles,public.lessons,public.lesson_versions,
 public.lesson_assignments,public.lesson_progress,public.checkpoint_attempts,public.audit_logs,
 public.engine_registry,public.authoring_jobs,public.courses,public.modules,public.module_lessons,public.enrollments to authenticated;
grant insert on public.lessons,public.lesson_assignments,public.courses,public.modules,public.module_lessons,public.enrollments to authenticated;
grant update(draft,updated_at) on public.lessons to authenticated;
grant update on public.courses,public.modules,public.module_lessons,public.enrollments to authenticated;
grant delete on public.lesson_assignments,public.modules,public.module_lessons,public.enrollments to authenticated;
grant execute on function lesson_private.role(),lesson_private.publish(text),lesson_private.unpublish(text),
 lesson_private.catalog(),lesson_private.manifest(text,integer),lesson_private.set_role(uuid,text),
 lesson_private.schema_valid(jsonb,jsonb,jsonb,integer),lesson_private.valid_manifest(jsonb),lesson_private.contract_schema() to authenticated;
grant execute on function public.save_lesson_draft(jsonb),public.publish_lesson(text),public.unpublish_lesson(text),
 public.published_catalog(),public.get_published_manifest(text,integer),public.set_user_role(uuid,text) to authenticated;
grant execute on function public.commit_lesson_progress(uuid,text,integer,uuid,jsonb,integer) to service_role;

alter table public.profiles add column timezone text not null default 'Asia/Ho_Chi_Minh',
 add column locale text not null default 'vi-VN', add column settings jsonb not null default '{}',
 add column updated_at timestamptz not null default now(),
 add constraint profile_name_length check(length(display_name)<=80),
 add constraint profile_settings_object check(jsonb_typeof(settings)='object' and octet_length(settings::text)<=8192);
create function lesson_private.validate_profile() returns trigger language plpgsql set search_path='' as $$begin
 if not exists(select 1 from pg_catalog.pg_timezone_names where name=new.timezone) or length(new.locale)>20 then raise exception 'Invalid timezone or locale';end if;
 new.updated_at=now();return new;
end$$;
create trigger validate_profile before insert or update on public.profiles for each row execute function lesson_private.validate_profile();
grant update(display_name,timezone,locale,settings) on public.profiles to authenticated;

-- First administrator is a server-configured, verified email, never the first signup.
create table lesson_private.admin_bootstrap(email text primary key check(email=lower(email)),claimed_by uuid references auth.users(id),claimed_at timestamptz);
revoke all on lesson_private.admin_bootstrap from public,anon,authenticated;
create or replace function lesson_private.new_profile() returns trigger language plpgsql security definer set search_path='' as $$begin
 insert into public.profiles(id,display_name) values(new.id,'Học viên') on conflict(id) do nothing;
 insert into public.user_roles(user_id,role) values(new.id,'student') on conflict(user_id) do nothing;
 if new.email_confirmed_at is not null and new.email is not null then
  update lesson_private.admin_bootstrap set claimed_by=new.id,claimed_at=now() where email=lower(new.email) and claimed_by is null;
  if found then
   update public.user_roles set role='admin' where user_id=new.id;
   insert into public.audit_logs(actor_id,action,object_id) values(new.id,'bootstrap_admin',new.id::text);
  end if;
 end if;
 return new;
end$$;
create trigger lesson_profile_verified after update of email,email_confirmed_at on auth.users for each row execute function lesson_private.new_profile();
insert into public.profiles(id) select id from auth.users on conflict(id) do nothing;
insert into public.user_roles(user_id,role) select id,'student' from auth.users on conflict(user_id) do nothing;

create table public.engine_requests(
 id uuid primary key default gen_random_uuid(),owner_id uuid not null default auth.uid() references auth.users(id),
 problem text not null check(length(trim(problem)) between 1 and 10000),
 status text not null default 'submitted' check(status in ('submitted','reviewing','supported','closed')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.engine_requests enable row level security;
create policy requests_read on public.engine_requests for select to authenticated using(owner_id=(select auth.uid()) or (select lesson_private.role())='admin');
create policy requests_create on public.engine_requests for insert to authenticated with check(owner_id=(select auth.uid()) and status='submitted');
create policy requests_review on public.engine_requests for update to authenticated using((select lesson_private.role())='admin') with check((select lesson_private.role())='admin');
grant select on public.engine_requests to authenticated;
grant insert(id,problem) on public.engine_requests to authenticated;
grant update(status) on public.engine_requests to authenticated;
create function lesson_private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=now();return new;end$$;
create trigger requests_updated before update on public.engine_requests for each row execute function lesson_private.touch_updated_at();

create table public.study_sessions(
 id uuid primary key,user_id uuid not null references auth.users(id),lesson_id text not null,version integer not null,
 device_id uuid not null,started_at timestamptz not null,ended_at timestamptz not null,
 active_seconds numeric not null check(active_seconds>=0),active_segments jsonb not null,
 revision integer not null check(revision>=0),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 foreign key(lesson_id,version) references public.lesson_versions(lesson_id,version),
 check(ended_at>=started_at and active_seconds<=extract(epoch from ended_at-started_at)),
 check(jsonb_typeof(active_segments)='array' and jsonb_array_length(active_segments) between 1 and 500));
alter table public.study_sessions enable row level security;
create policy sessions_read on public.study_sessions for select to authenticated using(user_id=(select auth.uid()));
grant select on public.study_sessions to authenticated;

create table public.learning_milestones(
 user_id uuid not null references auth.users(id),lesson_id text not null,version integer not null,
 kind text not null check(kind in ('checkpoint','complete')),checkpoint_id text not null,
 occurred_at timestamptz not null default now(),primary key(user_id,lesson_id,version,kind,checkpoint_id),
 foreign key(lesson_id,version) references public.lesson_versions(lesson_id,version));
alter table public.learning_milestones enable row level security;
create policy milestones_read on public.learning_milestones for select to authenticated using(user_id=(select auth.uid()));
grant select on public.learning_milestones to authenticated;
grant select,insert,update on public.study_sessions,public.learning_milestones to service_role;

create function lesson_private.record_study_session(p_id uuid,p_lesson_id text,p_version integer,p_device_id uuid,p_revision integer,p_segments jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare prev public.study_sessions; seg jsonb; a timestamptz;b timestamptz;span tstzmultirange;first_at timestamptz;last_at timestamptz;seconds numeric;
begin
 if auth.uid() is null then raise exception 'Unauthorized';end if;
 if p_id is null or p_device_id is null or p_revision is null or p_revision<0 or p_segments is null or jsonb_typeof(p_segments)<>'array' or jsonb_array_length(p_segments) not between 1 and 500 then raise exception 'Invalid session';end if;
 if lesson_private.manifest(p_lesson_id,p_version) is null then raise exception 'Manifest unavailable';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_id::text,0));
 select * into prev from public.study_sessions where id=p_id for update;
 if found then
  if prev.user_id<>auth.uid() or prev.lesson_id<>p_lesson_id or prev.version<>p_version or prev.device_id<>p_device_id then raise exception 'Session identity conflict';end if;
  if p_revision<prev.revision then return;end if;
  if p_revision=prev.revision then
   if prev.active_segments is distinct from p_segments then raise exception 'Session revision conflict';end if;return;
  end if;
  if not p_segments @> prev.active_segments then raise exception 'Session intervals cannot be removed';end if;
 end if;
 for seg in select value from jsonb_array_elements(p_segments) loop
  a=(seg->>'start')::timestamptz;b=(seg->>'end')::timestamptz;
  if a is null or b is null or b<=a or b>a+interval '1 day' or a<'2020-01-01'::timestamptz or b>now()+interval '5 minutes' then raise exception 'Invalid activity interval';end if;
 end loop;
 select range_agg(tstzrange((s->>'start')::timestamptz,(s->>'end')::timestamptz,'[)')) into span from jsonb_array_elements(p_segments) s;
 select min(lower(r)),max(upper(r)),sum(extract(epoch from upper(r)-lower(r))) into first_at,last_at,seconds from unnest(span) r;
 insert into public.study_sessions(id,user_id,lesson_id,version,device_id,started_at,ended_at,active_seconds,active_segments,revision)
 values(p_id,auth.uid(),p_lesson_id,p_version,p_device_id,first_at,last_at,seconds,p_segments,p_revision)
 on conflict(id) do update set ended_at=excluded.ended_at,started_at=excluded.started_at,active_seconds=excluded.active_seconds,active_segments=excluded.active_segments,revision=excluded.revision,updated_at=now();
end$$;
create function public.record_study_session(p_id uuid,p_lesson_id text,p_version integer,p_device_id uuid,p_revision integer,p_segments jsonb)
returns void language sql security invoker set search_path='' as $$select lesson_private.record_study_session(p_id,p_lesson_id,p_version,p_device_id,p_revision,p_segments)$$;

-- RLS applies to both inputs. Union overlapping intervals across sessions/devices.
create function public.my_study_activity() returns jsonb language sql stable security invoker set search_path='' as $$
with tz as (select timezone from public.profiles where id=(select auth.uid())),
segments as (select (j->>'start')::timestamptz a,(j->>'end')::timestamptz b from public.study_sessions s cross join lateral jsonb_array_elements(s.active_segments) j where s.user_id=(select auth.uid())),
clipped as (select d::date study_day,tstzrange(greatest(a,d at time zone tz.timezone),least(b,(d+interval '1 day') at time zone tz.timezone),'[)') r
 from segments cross join tz cross join lateral generate_series((a at time zone tz.timezone)::date::timestamp,(b at time zone tz.timezone)::date::timestamp,interval '1 day') d where b>d at time zone tz.timezone),
merged as (select study_day,range_agg(r) spans from clipped group by study_day),
seconds as (select study_day,sum(extract(epoch from upper(r)-lower(r))) seconds from merged cross join lateral unnest(spans) r group by study_day),
marks as (select (occurred_at at time zone tz.timezone)::date study_day,count(*) filter(where kind='checkpoint') checkpoints,count(*) filter(where kind='complete') completed from public.learning_milestones cross join tz where user_id=(select auth.uid()) group by 1),
days as (select coalesce(s.study_day,m.study_day) study_day,coalesce(s.seconds,0) seconds,coalesce(m.checkpoints,0) checkpoints,coalesce(m.completed,0) completed from seconds s full join marks m using(study_day)),
recent as (select jsonb_build_object('type',m.kind,'title',coalesce(public.get_published_manifest(m.lesson_id,m.version)->>'title','Bài học'),'lessonId',m.lesson_id,'at',m.occurred_at) event from public.learning_milestones m where m.user_id=(select auth.uid()) order by m.occurred_at desc limit 100)
select jsonb_build_object('days',coalesce((select jsonb_object_agg(study_day::text,jsonb_build_object('seconds',seconds,'checkpoints',checkpoints,'completed',completed)) from days),'{}'::jsonb),
 'events',coalesce((select jsonb_agg(event) from recent),'[]'::jsonb),'milestones',coalesce((select jsonb_agg(lesson_id||':'||version||':'||case when kind='complete' then 'complete' else checkpoint_id end) from public.learning_milestones where user_id=(select auth.uid())),'[]'::jsonb))
$$;

create or replace function public.commit_lesson_progress(p_user_id uuid,p_lesson_id text,p_version integer,p_attempt_id uuid,p_snapshot jsonb,p_revision integer)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare prev public.lesson_progress;attempt public.checkpoint_attempts;m jsonb;cp text;cp_index integer;passed integer;payload_hash text;
begin
 if p_user_id is null or p_attempt_id is null or p_revision is null or p_revision<0 or (p_snapshot->>'revision')::integer is distinct from p_revision then raise exception 'Invalid revision';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text||':'||p_lesson_id||':'||p_version,0));
 payload_hash=md5(jsonb_build_array(p_lesson_id,p_version,p_snapshot)::text);
 select * into attempt from public.checkpoint_attempts where user_id=p_user_id and attempt_id=p_attempt_id;
 if found and (attempt.lesson_id<>p_lesson_id or attempt.version<>p_version or attempt.result->>'payload_hash' is distinct from payload_hash) then raise exception 'Attempt identity conflict';end if;
 select * into prev from public.lesson_progress where user_id=p_user_id and lesson_id=p_lesson_id and version=p_version for update;
 if found and prev.revision>p_revision then return prev.snapshot;end if;
 if prev.revision=p_revision and prev.snapshot is distinct from p_snapshot then raise exception 'Revision conflict';end if;
 select manifest into strict m from public.lesson_versions where lesson_id=p_lesson_id and version=p_version;
 cp_index=(p_snapshot->>'checkpoint')::integer;cp=m#>>array['checkpoints',cp_index::text,'id'];
 if cp is null or jsonb_typeof(p_snapshot->'completed') is distinct from 'boolean' then raise exception 'Invalid checkpoint';end if;
 insert into public.checkpoint_attempts(user_id,attempt_id,lesson_id,version,checkpoint_id,result) values(p_user_id,p_attempt_id,p_lesson_id,p_version,cp,jsonb_build_object('revision',p_revision,'payload_hash',payload_hash)) on conflict(user_id,attempt_id) do nothing;
 insert into public.lesson_progress(user_id,lesson_id,version,active_checkpoint_id,completion_status,snapshot,revision) values(p_user_id,p_lesson_id,p_version,cp,case when (p_snapshot->>'completed')::boolean then 'completed' else 'in_progress' end,p_snapshot,p_revision)
 on conflict(user_id,lesson_id,version) do update set active_checkpoint_id=excluded.active_checkpoint_id,completion_status=excluded.completion_status,snapshot=excluded.snapshot,revision=excluded.revision,updated_at=now();
 passed=cp_index+case when (p_snapshot->>'completed')::boolean then 1 else 0 end;
 insert into public.learning_milestones(user_id,lesson_id,version,kind,checkpoint_id)
 select p_user_id,p_lesson_id,p_version,'checkpoint',c->>'id' from jsonb_array_elements(m->'checkpoints') with ordinality x(c,ord) where ord<=passed on conflict do nothing;
 if (p_snapshot->>'completed')::boolean then
  insert into public.learning_milestones(user_id,lesson_id,version,kind,checkpoint_id) values(p_user_id,p_lesson_id,p_version,'complete','complete') on conflict do nothing;
 end if;
 return p_snapshot;
end$$;

alter table public.module_lessons add constraint module_order_nonnegative check(sort_order>=0);
alter table public.modules add constraint module_order_unique unique(course_id,sort_order) deferrable initially deferred;
alter table public.module_lessons add constraint lesson_order_unique unique(module_id,sort_order) deferrable initially deferred;
create index assignments_assigner_idx on public.lesson_assignments(assigned_by);
create index audit_actor_time_idx on public.audit_logs(actor_id,created_at);
create index audit_time_idx on public.audit_logs(created_at desc);
create index attempts_user_time_idx on public.checkpoint_attempts(user_id,occurred_at);
create index sessions_user_time_idx on public.study_sessions(user_id,started_at);
create index sessions_version_idx on public.study_sessions(lesson_id,version);
create index milestones_version_idx on public.learning_milestones(lesson_id,version);
create index milestones_user_time_idx on public.learning_milestones(user_id,occurred_at desc);
create index requests_owner_time_idx on public.engine_requests(owner_id,created_at);
revoke execute on all functions in schema lesson_private from public,anon;
revoke execute on function lesson_private.validate_profile(),lesson_private.touch_updated_at(),lesson_private.new_profile() from authenticated;
revoke all on function public.record_study_session(uuid,text,integer,uuid,integer,jsonb),public.my_study_activity() from public,anon;
grant execute on function lesson_private.record_study_session(uuid,text,integer,uuid,integer,jsonb),public.record_study_session(uuid,text,integer,uuid,integer,jsonb),public.my_study_activity() to authenticated;
notify pgrst,'reload schema';
commit;
