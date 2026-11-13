-- Additive foundation. Never run on an unidentified project.
begin;
create schema if not exists lesson_private;
revoke all on schema lesson_private from public;
grant usage on schema lesson_private to authenticated;
create table public.user_roles(user_id uuid primary key references auth.users(id),role text not null check(role in ('admin','author','student')));
create table public.profiles(id uuid primary key references auth.users(id),display_name text not null default '',created_at timestamptz not null default now());
create table public.lessons(id text primary key,owner_id uuid not null references auth.users(id),draft jsonb not null,published_version integer,updated_at timestamptz not null default now());
create table public.lesson_versions(lesson_id text not null references public.lessons(id),version integer not null check(version>0),manifest jsonb not null,content_hash text not null,published_by uuid not null references auth.users(id),created_at timestamptz not null default now(),primary key(lesson_id,version));
alter table public.lessons add constraint published_version_fk foreign key(id,published_version) references public.lesson_versions(lesson_id,version) deferrable initially deferred;
create table public.lesson_assignments(lesson_id text not null references public.lessons(id),user_id uuid not null references auth.users(id),assigned_by uuid not null default auth.uid() references auth.users(id),primary key(lesson_id,user_id));
create table public.lesson_progress(user_id uuid not null references auth.users(id),lesson_id text not null,version integer not null,active_checkpoint_id text not null,completion_status text not null check(completion_status in ('in_progress','completed')),snapshot jsonb not null,revision integer not null default 0,updated_at timestamptz not null default now(),primary key(user_id,lesson_id,version),foreign key(lesson_id,version) references public.lesson_versions(lesson_id,version));
create table public.checkpoint_attempts(user_id uuid not null references auth.users(id),attempt_id uuid not null,lesson_id text not null,version integer not null,checkpoint_id text not null,result jsonb not null,occurred_at timestamptz not null default now(),primary key(user_id,attempt_id),foreign key(lesson_id,version) references public.lesson_versions(lesson_id,version));
create table public.audit_logs(id bigint generated always as identity primary key,actor_id uuid not null default auth.uid(),action text not null,object_id text not null,created_at timestamptz not null default now());
create table public.engine_registry(engine_type text primary key,runtime_version text not null,capabilities jsonb not null,is_enabled boolean not null default true);
insert into public.engine_registry values ('geometry_2d','1.0.0','["drag_vertex","measure_angle","show_geometry_annotation","toggle_angle_labels","drag_angle_token"]',true),('geometry_3d_web','1.0.0','["orbit_solid","select_face","fill_layers","measure_volume"]',true);
insert into public.engine_registry values ('number_line_2d','1.0.0','["adjust_parameter","number_line_drag"]',true),('fraction_bar_2d','1.0.0','["adjust_parameter","fraction_partition"]',true),('algebra_balance_2d','1.0.0','["adjust_parameter","balance_equation"]',true),('function_plot_2d','1.0.0','["adjust_parameter","plot_function"]',true),('math_explorer_2d','1.0.0','["adjust_parameter"]',true);
insert into public.engine_registry values ('percentage_2d','1.0.0','["adjust_parameter","percentage_grid"]',true),('ratio_2d','1.0.0','["adjust_parameter","ratio_table"]',true),('coordinate_2d','1.0.0','["adjust_parameter","coordinate_plane"]',true),('area_2d','1.0.0','["adjust_parameter","rectangle_area"]',true),('pythagorean_2d','1.0.0','["adjust_parameter","pythagorean"]',true),('linear_plot_2d','1.0.0','["adjust_parameter","linear_graph"]',true);
create table public.authoring_jobs(id uuid primary key,owner_id uuid not null references auth.users(id),input jsonb not null,status text not null check(status in ('queued','running','review','failed')),result jsonb,safe_error text,created_at timestamptz not null default now());
create index lessons_owner_idx on public.lessons(owner_id);
create index assignments_user_idx on public.lesson_assignments(user_id);
create index versions_publisher_idx on public.lesson_versions(published_by);
create index jobs_owner_idx on public.authoring_jobs(owner_id);
create index progress_version_idx on public.lesson_progress(lesson_id,version);
create index attempts_version_idx on public.checkpoint_attempts(lesson_id,version);

create function lesson_private.role() returns text language sql stable security definer set search_path='' as $$select role from public.user_roles where user_id=(select auth.uid())$$;
revoke all on function lesson_private.role() from public;
grant execute on function lesson_private.role() to authenticated;
alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_versions enable row level security;
alter table public.lesson_assignments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.checkpoint_attempts enable row level security;
alter table public.audit_logs enable row level security;
alter table public.engine_registry enable row level security;
alter table public.authoring_jobs enable row level security;
create policy roles_read on public.user_roles for select to authenticated using(user_id=(select auth.uid()) or (select lesson_private.role())='admin');
create policy profiles_read on public.profiles for select to authenticated using(id=(select auth.uid()) or (select lesson_private.role())='admin');
create policy profiles_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy drafts_read on public.lessons for select to authenticated using((select lesson_private.role())='admin' or (owner_id=(select auth.uid()) and (select lesson_private.role())='author'));
create policy drafts_insert on public.lessons for insert to authenticated with check(owner_id=(select auth.uid()) and (select lesson_private.role()) in ('admin','author'));
create policy drafts_update on public.lessons for update to authenticated using((select lesson_private.role())='admin' or (owner_id=(select auth.uid()) and (select lesson_private.role())='author')) with check((select lesson_private.role())='admin' or (owner_id=(select auth.uid()) and (select lesson_private.role())='author'));
create policy versions_read on public.lesson_versions for select to authenticated using(exists(select 1 from public.lessons l where l.id=lesson_id));
create policy assignments_admin on public.lesson_assignments for all to authenticated using((select lesson_private.role())='admin') with check((select lesson_private.role())='admin' and assigned_by=(select auth.uid()));
create policy assignments_own on public.lesson_assignments for select to authenticated using(user_id=(select auth.uid()));
create policy progress_own on public.lesson_progress for select to authenticated using(user_id=(select auth.uid()));
create policy attempts_own on public.checkpoint_attempts for select to authenticated using(user_id=(select auth.uid()));
create policy audit_admin on public.audit_logs for select to authenticated using((select lesson_private.role())='admin');
create policy registry_read on public.engine_registry for select to authenticated using(true);
create policy jobs_own on public.authoring_jobs for select to authenticated using(owner_id=(select auth.uid()) or (select lesson_private.role())='admin');
grant select on public.user_roles,public.lesson_versions,public.lesson_progress,public.checkpoint_attempts,public.audit_logs,public.engine_registry,public.authoring_jobs to authenticated;
grant select,update(display_name) on public.profiles to authenticated;
grant select,insert on public.lessons to authenticated;
grant update(draft,updated_at) on public.lessons to authenticated;
grant select,insert,delete on public.lesson_assignments to authenticated;
-- No client grants for version writes, role changes or progress writes.

create function public.save_lesson_draft(p_manifest jsonb) returns void language plpgsql security invoker set search_path='' as $$
begin
 if p_manifest->>'schemaVersion'<>'1.0.0' or p_manifest->>'status'<>'draft' or jsonb_typeof(p_manifest->'checkpoints')<>'array' then raise exception 'Invalid draft'; end if;
 insert into public.lessons(id,owner_id,draft) values(p_manifest->>'lessonId',auth.uid(),p_manifest)
 on conflict(id) do update set draft=excluded.draft,updated_at=now();
end$$;

create function lesson_private.publish(p_lesson_id text) returns integer language plpgsql security definer set search_path='' as $$
declare l public.lessons;v integer;m jsonb;reg public.engine_registry;
begin
 if auth.uid() is null or lesson_private.role() is distinct from 'admin' then raise exception 'Forbidden';end if;
 select * into strict l from public.lessons where id=p_lesson_id for update;
 select * into strict reg from public.engine_registry where engine_type=l.draft#>>'{engine,type}' and is_enabled;
 if not reg.capabilities @> (l.draft#>'{engine,requiredCapabilities}') or l.draft->>'schemaVersion'<>'1.0.0' or jsonb_array_length(l.draft->'checkpoints')<1 then raise exception 'Unsupported manifest';end if;
 -- Full contract validation is additionally performed by the trusted publication Edge Function.
 select coalesce(max(version),0)+1 into v from public.lesson_versions where lesson_id=p_lesson_id;
 m=jsonb_set(jsonb_set(l.draft,'{version}',to_jsonb(v)),'{status}','"published"');
 insert into public.lesson_versions values(p_lesson_id,v,m,md5(m::text),auth.uid(),now());
 update public.lessons set published_version=v,draft=jsonb_set(draft,'{version}',to_jsonb(v+1)),updated_at=now() where id=p_lesson_id;
 insert into public.audit_logs(actor_id,action,object_id) values(auth.uid(),'publish',p_lesson_id);
 return v;
end$$;
create function lesson_private.unpublish(p_lesson_id text) returns void language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null or lesson_private.role() is distinct from 'admin' then raise exception 'Forbidden';end if;
 update public.lessons set published_version=null,updated_at=now() where id=p_lesson_id;
 insert into public.audit_logs(actor_id,action,object_id) values(auth.uid(),'unpublish',p_lesson_id);
end$$;
create function public.publish_lesson(p_lesson_id text) returns integer language sql security invoker set search_path='' as $$select lesson_private.publish(p_lesson_id)$$;
create function public.unpublish_lesson(p_lesson_id text) returns void language sql security invoker set search_path='' as $$select lesson_private.unpublish(p_lesson_id)$$;
create function lesson_private.catalog() returns table(manifest jsonb,content_hash text) language sql stable security definer set search_path='' as $$
 select v.manifest,v.content_hash from public.lesson_versions v join public.lessons l on l.id=v.lesson_id and l.published_version=v.version where auth.uid() is not null
$$;
create function public.published_catalog() returns table(manifest jsonb,content_hash text) language sql stable security invoker set search_path='' as $$select * from lesson_private.catalog()$$;
create function lesson_private.manifest(p_lesson_id text,p_version integer) returns jsonb language sql stable security definer set search_path='' as $$
 select v.manifest from public.lesson_versions v join public.lessons l on l.id=v.lesson_id where v.lesson_id=p_lesson_id and v.version=p_version and auth.uid() is not null and (l.published_version=v.version or exists(select 1 from public.lesson_progress p where p.user_id=auth.uid() and p.lesson_id=v.lesson_id and p.version=v.version))
$$;
create function public.get_published_manifest(p_lesson_id text,p_version integer) returns jsonb language sql stable security invoker set search_path='' as $$select lesson_private.manifest(p_lesson_id,p_version)$$;
revoke all on all functions in schema lesson_private from public;
grant execute on all functions in schema lesson_private to authenticated;
revoke all on function public.save_lesson_draft(jsonb),public.publish_lesson(text),public.unpublish_lesson(text),public.published_catalog(),public.get_published_manifest(text,integer) from public;
grant execute on function public.save_lesson_draft(jsonb),public.publish_lesson(text),public.unpublish_lesson(text),public.published_catalog(),public.get_published_manifest(text,integer) to authenticated;

create function lesson_private.immutable_version() returns trigger language plpgsql set search_path='' as $$begin raise exception 'Published versions are immutable';end$$;
create trigger immutable_version before update or delete on public.lesson_versions for each row execute function lesson_private.immutable_version();
commit;
