create or replace function lesson_private.valid_algebra(g jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare d jsonb;mode text;a double precision;b double precision;c double precision;delta double precision;v double precision;k double precision;
begin
 if not lesson_private.schema_valid(g,lesson_private.contract_schema()#>'{properties,recognition,items,properties,uime,properties,algebra}',lesson_private.contract_schema()) then return false;end if;
 d=g->'data';mode=g->>'mode';
 if mode in ('product_equation','rational_equation') and ((d->>'p')::numeric=0 or (d->>'r')::numeric=0) then return false;end if;
 if mode='rational_equation' and ((d->>'d')::numeric=0 or ((d->>'f')::numeric=0 and (d->>'g')::numeric=0)) then return false;end if;
 if mode='quadratic_equation' and d->>'degreePolicy'='quadratic_only' and (d->>'a')::numeric=0 then return false;end if;
 if mode='viete' and ((d->>'a')::numeric=0 or power((d->>'b')::numeric,2)-4*(d->>'a')::numeric*(d->>'c')::numeric<0) then return false;end if;
 if mode in ('product_equation','rational_equation') then
  a=(d->>'p')::double precision*(d->>'r')::double precision;b=(d->>'p')::double precision*(d->>'s')::double precision+(d->>'q')::double precision*(d->>'r')::double precision;c=(d->>'q')::double precision*(d->>'s')::double precision;
  if mode='rational_equation' then k=(d->>'k')::double precision;a=a-k*(d->>'d')::double precision*(d->>'f')::double precision;b=b-k*((d->>'d')::double precision*(d->>'g')::double precision+(d->>'e')::double precision*(d->>'f')::double precision);c=c-k*(d->>'e')::double precision*(d->>'g')::double precision;end if;
 else a=(d->>'a')::double precision;b=(d->>'b')::double precision;c=(d->>'c')::double precision;end if;
 if a=0 then
  if b<>0 and abs(c/b)>1000 then return false;end if;
 else
  delta=b*b-4*a*c;
  if delta=0 and abs(b/(2*a))>1000 then return false;end if;
  if delta>0 then v=-.5*(b+(case when b>=0 then 1 else -1 end)*sqrt(delta));if abs(v/a)>1000 or abs(c/v)>1000 then return false;end if;end if;
 end if;
 -- Original denominator roots have absolute value <=9 under these integer bounds.
 return true;
exception when others then return false;
end$$;
revoke all on function lesson_private.valid_algebra(jsonb) from public;
grant execute on function lesson_private.valid_algebra(jsonb) to authenticated;
