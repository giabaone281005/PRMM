begin;
grant select,insert,update on public.lesson_progress,public.checkpoint_attempts to service_role;
grant select on public.lesson_versions to service_role;
grant select,update on public.lessons to service_role;
create function public.commit_lesson_progress(p_user_id uuid,p_lesson_id text,p_version integer,p_attempt_id uuid,p_snapshot jsonb,p_revision integer) returns jsonb language plpgsql security invoker set search_path='' as $$
declare current_progress public.lesson_progress;cp text;result jsonb;
begin
 -- Callable only by the trusted event-replay service. No client write grant.
 perform 1 from public.lessons where id=p_lesson_id for update;
 select * into current_progress from public.lesson_progress where user_id=p_user_id and lesson_id=p_lesson_id and version=p_version for update;
 if found and current_progress.revision>p_revision then return current_progress.snapshot;end if;
 if current_progress.revision=p_revision and current_progress.snapshot is distinct from p_snapshot then raise exception 'Revision conflict';end if;
 select manifest#>>array['checkpoints',p_snapshot->>'checkpoint','id'] into cp from public.lesson_versions where lesson_id=p_lesson_id and version=p_version;
 if cp is null then raise exception 'Unknown checkpoint';end if;
 insert into public.checkpoint_attempts(user_id,attempt_id,lesson_id,version,checkpoint_id,result) values(p_user_id,p_attempt_id,p_lesson_id,p_version,cp,jsonb_build_object('revision',p_revision)) on conflict(user_id,attempt_id) do nothing;
 insert into public.lesson_progress(user_id,lesson_id,version,active_checkpoint_id,completion_status,snapshot,revision) values(p_user_id,p_lesson_id,p_version,cp,case when (p_snapshot->>'completed')::boolean then 'completed' else 'in_progress' end,p_snapshot,p_revision)
 on conflict(user_id,lesson_id,version) do update set active_checkpoint_id=excluded.active_checkpoint_id,completion_status=excluded.completion_status,snapshot=excluded.snapshot,revision=excluded.revision,updated_at=now();
 return p_snapshot;
end$$;
revoke all on function public.commit_lesson_progress(uuid,text,integer,uuid,jsonb,integer) from public,anon,authenticated;
grant execute on function public.commit_lesson_progress(uuid,text,integer,uuid,jsonb,integer) to service_role;
commit;
