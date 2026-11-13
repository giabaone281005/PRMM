begin;
-- A safe invalidation signal: no lesson title, draft, author or manifest is replicated.
create table public.catalog_state(
 id boolean primary key default true check(id),
 revision bigint not null default 0 check(revision>=0),
 updated_at timestamptz not null default now());
insert into public.catalog_state(id) values(true);
alter table public.catalog_state enable row level security;
revoke all on public.catalog_state from public,anon,authenticated;
grant select on public.catalog_state to authenticated;
create policy catalog_signal_read on public.catalog_state for select to authenticated using(true);
create function lesson_private.invalidate_catalog() returns trigger language plpgsql security definer set search_path='' as $$begin
 if (tg_op='INSERT' and new.published_version is not null)
 or (tg_op='UPDATE' and old.published_version is distinct from new.published_version)
 or (tg_op='DELETE' and old.published_version is not null) then
  update public.catalog_state set revision=revision+1,updated_at=now() where id=true;
 end if;
 return null;
end$$;
revoke all on function lesson_private.invalidate_catalog() from public,anon,authenticated;
create trigger published_catalog_changed after insert or update of published_version or delete on public.lessons for each row execute function lesson_private.invalidate_catalog();
-- PGlite contract tests have no replication publication; hosted Supabase does.
do $$begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') then
  alter publication supabase_realtime add table public.catalog_state;
 end if;
end$$;
notify pgrst,'reload schema';
commit;
