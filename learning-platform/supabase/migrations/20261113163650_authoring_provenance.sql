begin;
create table public.lesson_authoring_drafts(
 lesson_id text primary key references public.lessons(id),
 revision bigint not null check(revision>0),
 receipt jsonb not null,
 compiled_manifest jsonb not null,
 updated_at timestamptz not null default now()
);
create table public.lesson_authoring_revisions(
 lesson_id text not null,
 version integer not null,
 receipt jsonb not null,
 manifest_content_hash text not null,
 created_at timestamptz not null default now(),
 primary key(lesson_id,version),
 foreign key(lesson_id,version) references public.lesson_versions(lesson_id,version)
);
alter table public.lesson_authoring_drafts enable row level security;
alter table public.lesson_authoring_revisions enable row level security;
create policy authoring_draft_read on public.lesson_authoring_drafts for select to authenticated
 using(exists(select 1 from public.lessons l where l.id=lesson_id));
create policy authoring_revision_read on public.lesson_authoring_revisions for select to authenticated
 using(exists(select 1 from public.lessons l where l.id=lesson_id));
grant select on public.lesson_authoring_drafts,public.lesson_authoring_revisions to authenticated;
create trigger immutable_authoring_revision before update or delete on public.lesson_authoring_revisions
 for each row execute function lesson_private.immutable_version();

-- A managed draft can only change together with its compiled sidecar. Version increments are harmless.
create function lesson_private.guard_authoring_draft() returns trigger language plpgsql security definer set search_path='' as $$
declare d public.lesson_authoring_drafts;
begin
 select * into d from public.lesson_authoring_drafts where lesson_id=new.id;
 if found and (new.draft-'version') is distinct from (d.compiled_manifest-'version') then
  raise exception 'Bài dùng template: hãy lưu qua form authoring, không sửa manifest trực tiếp.';
 end if;
 return new;
end$$;
create trigger guard_authoring_draft before update of draft on public.lessons
 for each row execute function lesson_private.guard_authoring_draft();

-- Captures provenance even when an admin invokes the existing publication RPC.
create function lesson_private.capture_authoring_revision() returns trigger language plpgsql security definer set search_path='' as $$
declare d public.lesson_authoring_drafts;r jsonb;
begin
 select * into d from public.lesson_authoring_drafts where lesson_id=new.lesson_id for update;
 if not found then return new;end if;
 if (new.manifest-'version'-'status') is distinct from (d.compiled_manifest-'version'-'status') then
  raise exception 'Manifest không khớp authoring input đã biên dịch.';
 end if;
 r=jsonb_set(d.receipt,'{runtime,version}',to_jsonb(new.version));
 insert into public.lesson_authoring_revisions(lesson_id,version,receipt,manifest_content_hash)
 values(new.lesson_id,new.version,r,new.content_hash);
 update public.lesson_authoring_drafts set
  receipt=jsonb_set(receipt,'{runtime,version}',to_jsonb(new.version+1)),
  compiled_manifest=jsonb_set(compiled_manifest,'{version}',to_jsonb(new.version+1))
 where lesson_id=new.lesson_id;
 return new;
end$$;
create trigger capture_authoring_revision after insert on public.lesson_versions
 for each row execute function lesson_private.capture_authoring_revision();

-- Service-only entrypoint. The Edge Function authenticates the actor and compiles the input.
create function public.commit_lesson_authoring(p_actor uuid,p_manifest jsonb,p_receipt jsonb,p_expected_revision bigint,p_publish boolean)
 returns jsonb language plpgsql security definer set search_path='' as $$
declare l public.lessons;d public.lesson_authoring_drafts;actor_role text;next_revision bigint;published integer;
begin
 select role into actor_role from public.user_roles where user_id=p_actor;
 if actor_role is null or actor_role not in ('admin','author') or (p_publish and actor_role<>'admin') then raise exception 'Forbidden';end if;
 if p_expected_revision is null or p_expected_revision<0 or p_publish is null or p_receipt is null or
    p_manifest is null or p_manifest->>'status' is distinct from 'draft' or not lesson_private.valid_manifest(p_manifest) then raise exception 'Invalid authoring draft';end if;
 if p_receipt->>'receiptVersion' is distinct from '1.0.0' or
    p_receipt#>>'{runtime,lessonId}' is distinct from p_manifest->>'lessonId' or
    p_receipt#>>'{runtime,version}' is distinct from p_manifest->>'version' or
    p_receipt->>'templateId' is distinct from p_receipt#>>'{authoringInput,templateId}' or
    p_receipt->>'templateVersion' is distinct from p_receipt#>>'{authoringInput,templateVersion}' or
    p_receipt->>'compilerVersion' is null then raise exception 'Invalid authoring receipt';end if;
 select * into l from public.lessons where id=p_manifest->>'lessonId' for update;
 if found then
  if l.owner_id<>p_actor and actor_role<>'admin' then raise exception 'Forbidden';end if;
  select * into d from public.lesson_authoring_drafts where lesson_id=l.id for update;
  if not found then raise exception 'Bài legacy: tạo biến thể mới để dùng form chuẩn.';end if;
  if d.revision<>p_expected_revision or l.draft->>'version' is distinct from p_manifest->>'version' then
   raise exception 'Bản nháp đã thay đổi ở nơi khác. Tải lại trước khi lưu.';
  end if;
  next_revision=d.revision+1;
  update public.lesson_authoring_drafts set revision=next_revision,receipt=p_receipt,compiled_manifest=p_manifest,updated_at=now() where lesson_id=l.id;
  update public.lessons set draft=p_manifest,updated_at=now() where id=l.id;
 else
  if p_expected_revision<>0 or p_manifest->>'version'<>'1' then raise exception 'Invalid new draft revision';end if;
  next_revision=1;
  insert into public.lessons(id,owner_id,draft) values(p_manifest->>'lessonId',p_actor,p_manifest);
  insert into public.lesson_authoring_drafts(lesson_id,revision,receipt,compiled_manifest) values(p_manifest->>'lessonId',1,p_receipt,p_manifest);
 end if;
 insert into public.audit_logs(actor_id,action,object_id) values(p_actor,'save_authoring',p_manifest->>'lessonId');
 if p_publish then
  perform set_config('request.jwt.claim.sub',p_actor::text,true);
  published=lesson_private.publish(p_manifest->>'lessonId');
 end if;
 select * into l from public.lessons where id=p_manifest->>'lessonId';
 select * into d from public.lesson_authoring_drafts where lesson_id=l.id;
 return jsonb_build_object('draft',l.draft,'receipt',d.receipt,'revision',d.revision,'publishedVersion',l.published_version);
end$$;
revoke all on function lesson_private.guard_authoring_draft(),lesson_private.capture_authoring_revision() from public,authenticated;
revoke all on function public.commit_lesson_authoring(uuid,jsonb,jsonb,bigint,boolean) from public,anon,authenticated;
grant execute on function public.commit_lesson_authoring(uuid,jsonb,jsonb,bigint,boolean) to service_role;
commit;
