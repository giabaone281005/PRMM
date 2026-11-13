-- Recursive validator for the exact JSON Schema vocabulary used by this project.
create or replace function lesson_private.schema_valid(v jsonb,s jsonb,root jsonb,depth integer default 0) returns boolean language plpgsql immutable set search_path='' as $$
declare t text;k text;item jsonb;n integer;valid boolean;ty text;
begin
 if depth>32 then return false;end if;
 if s ? '$ref' then return lesson_private.schema_valid(v,root#>string_to_array(substr(s->>'$ref',3),'/'),root,depth+1);end if;
 if s ? 'oneOf' then n=0;for item in select value from jsonb_array_elements(s->'oneOf') loop if lesson_private.schema_valid(v,item,root,depth+1) then n=n+1;end if;end loop;return n=1;end if;
 if s ? 'const' and v is distinct from s->'const' then return false;end if;
 if s ? 'enum' and not exists(select 1 from jsonb_array_elements(s->'enum') x where x.value=v) then return false;end if;
 t=s->>'type';ty=jsonb_typeof(v);
 if t='integer' then if ty<>'number' or (v#>>'{}')::numeric<>trunc((v#>>'{}')::numeric) then return false;end if;
 elsif t is not null and t is distinct from ty then return false;end if;
 if ty='object' and t='object' then
  for item in select value from jsonb_array_elements(coalesce(s->'required','[]')) loop if not v ? (item#>>'{}') then return false;end if;end loop;
  for k,item in select * from jsonb_each(v) loop
   if not (coalesce(s->'properties','{}') ? k) then if s->'additionalProperties'='false'::jsonb then return false;end if;
   elsif not lesson_private.schema_valid(item,s->'properties'->k,root,depth+1) then return false;end if;
  end loop;
 elsif ty='array' and t='array' then
  n=jsonb_array_length(v);if n<coalesce((s->>'minItems')::integer,0) or n>coalesce((s->>'maxItems')::integer,1000000) then return false;end if;
  if s->'uniqueItems'='true'::jsonb and (select count(distinct value) from jsonb_array_elements(v))<>n then return false;end if;
  for item in select value from jsonb_array_elements(v) loop if not lesson_private.schema_valid(item,s->'items',root,depth+1) then return false;end if;end loop;
 elsif ty='number' then
  if s ? 'minimum' and (v#>>'{}')::numeric<(s->>'minimum')::numeric then return false;end if;
  if s ? 'maximum' and (v#>>'{}')::numeric>(s->>'maximum')::numeric then return false;end if;
  if s ? 'exclusiveMinimum' and (v#>>'{}')::numeric<=(s->>'exclusiveMinimum')::numeric then return false;end if;
 elsif ty='string' then
  if length(v#>>'{}')<coalesce((s->>'minLength')::integer,0) or length(v#>>'{}')>coalesce((s->>'maxLength')::integer,10000000) then return false;end if;
  if s ? 'pattern' and (v#>>'{}')!~(s->>'pattern') then return false;end if;
 end if;
 return true;
exception when others then return false;
end$$;

create or replace function lesson_private.valid_manifest(m jsonb) returns boolean language plpgsql stable set search_path='' as $$
declare cp jsonb;o jsonb;cap jsonb;objects jsonb;ids text[]='{}';cps text[]='{}';i integer=0;registry jsonb;ref text;refs text[];t jsonb;u jsonb;a jsonb;j integer;target numeric;
begin
 if octet_length(m::text)>131072 or not lesson_private.schema_valid(m,lesson_private.contract_schema(),lesson_private.contract_schema()) then return false;end if;
 select capabilities into registry from public.engine_registry where engine_type=m#>>'{engine,type}' and is_enabled;
 if registry is null or not registry @> (m#>'{engine,requiredCapabilities}') then return false;end if;
 if ((m#>>'{engine,type}')<>'geometry_3d_web')<>((m#>>'{scene,coordinateSystem}')='cartesian_2d') then return false;end if;
 objects=m#>'{scene,objects}';
 if m ? 'recognition' then
  if jsonb_array_length(m->'recognition')<>jsonb_array_length(m->'checkpoints') or m#>>'{engine,type}'<>'math_explorer_2d' then return false;end if;
  for t in select value from jsonb_array_elements(m->'recognition') loop
   if not(t ? 'uime') then continue;end if;u=t->'uime';a=u->'answers';
   if (u->>'min')::numeric >= (u->>'max')::numeric then return false;end if;
   if u->>'kind' in ('TOKEN_CLASSIFIER','EVENT_CARD_BUCKET') and jsonb_array_length(u->'tokens')<>jsonb_array_length(a) then return false;end if;
   if u->>'kind'='FORMULA_SNAP_BUILDER' and jsonb_array_length(u->'labels')<>jsonb_array_length(a) then return false;end if;
   if u->>'kind'='NUMBER_LINE_SELECTOR' and (jsonb_array_length(a)<>3 or (u->>'min')::numeric < -10 or (u->>'max')::numeric > 10) then return false;end if;
   if u->>'kind'='GEOMETRIC_HOTSPOT_FINDER' and jsonb_array_length(a)<>2 then return false;end if;
   for j in 0..jsonb_array_length(a)-1 loop
    target=(a->>j)::numeric;
    if j=0 and u->>'kind' in ('PARABOLA_SLIDER','NUMBER_LINE_SELECTOR','GEOMETRIC_HOTSPOT_FINDER') then
     if target<(u->>'min')::numeric or target>(u->>'max')::numeric or abs((target-(u->>'min')::numeric)/(u->>'step')::numeric-round((target-(u->>'min')::numeric)/(u->>'step')::numeric))>0.000001 then return false;end if;
    elsif u->>'kind'='NUMBER_LINE_SELECTOR' then if target not in (0,1) then return false;end if;
    else if target<>trunc(target) or target<0 or target>=jsonb_array_length(case when u->>'kind' in ('TOKEN_CLASSIFIER','EVENT_CARD_BUCKET') then u->'labels' else u->'tokens' end) then return false;end if;
    end if;
   end loop;
   for o in select value from jsonb_array_elements(u->'hotspots') loop if (o->>'x')::numeric+(o->>'width')::numeric>360 or (o->>'y')::numeric+(o->>'height')::numeric>240 then return false;end if;end loop;
  end loop;
 end if;
 for cp in select value from jsonb_array_elements(m->'checkpoints') loop
  i=i+1;if (cp->>'order')::integer<>i or cp->>'id'=any(cps) then return false;end if;cps=array_append(cps,cp->>'id');
  if not registry @> (cp->'allowedInteractions') or not (m#>'{engine,requiredCapabilities}') @> (cp->'allowedInteractions') then return false;end if;
  objects=objects||coalesce(cp#>'{scenePatch,addObjects}','[]');
 end loop;
 for o in select value from jsonb_array_elements(objects) loop
  if o->>'id'=any(ids) then return false;end if;ids=array_append(ids,o->>'id');
  if o->>'kind'='polygon' then
   refs=array(select value#>>'{}' from jsonb_array_elements(o->'vertexIds'));
   if cardinality(refs)<>3 or (select count(distinct x) from unnest(refs) x)<>3 then return false;end if;
   foreach ref in array refs loop if not exists(select 1 from jsonb_array_elements(objects) x where x->>'id'=ref and x->>'kind'='point') then return false;end if;end loop;
  elsif o->>'kind'='angle_token' and not exists(select 1 from jsonb_array_elements(objects) x where x->>'id'=o->>'sourceVertexId' and x->>'kind'='point') then return false;
  end if;
 end loop;
 if m#>>'{engine,type}'='geometry_2d' and not exists(select 1 from jsonb_array_elements(m#>'{scene,objects}') x where x->>'kind'='polygon') then return false;end if;
 if m#>>'{engine,type}'='geometry_3d_web' and (select count(*) from jsonb_array_elements(m#>'{scene,objects}') x where x->>'kind'='prism')<>1 then return false;end if;
 if cardinality(cps)<>jsonb_array_length(m#>'{completion,requiredCheckpointIds}') then return false;end if;
 for o in select value from jsonb_array_elements(m#>'{completion,requiredCheckpointIds}') loop if not (o#>>'{}')=any(cps) then return false;end if;end loop;
 return true;
exception when others then return false;
end$$;
create or replace function lesson_private.validate_draft() returns trigger language plpgsql set search_path='' as $$begin
 if not lesson_private.valid_manifest(new.draft) or new.id<>new.draft->>'lessonId' or new.draft->>'status'<>'draft' then raise exception 'Invalid lesson contract';end if;return new;
end$$;
create trigger validate_lesson_draft before insert or update of draft on public.lessons for each row execute function lesson_private.validate_draft();
revoke all on function lesson_private.schema_valid(jsonb,jsonb,jsonb,integer),lesson_private.valid_manifest(jsonb),lesson_private.validate_draft() from public;
grant execute on function lesson_private.schema_valid(jsonb,jsonb,jsonb,integer),lesson_private.valid_manifest(jsonb),lesson_private.contract_schema() to authenticated;
