-- Pure mathematical guard, called only after the canonical JSON Schema check.
create or replace function lesson_private.valid_cartesian_graph(g jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare a numeric=(g->>'a')::numeric;b numeric=(g->>'b')::numeric;c numeric=(g->>'c')::numeric;
 d numeric=(g->>'d')::numeric;e numeric=(g->>'e')::numeric;f numeric=(g->>'f')::numeric;
 q numeric=(g->>'q')::numeric;s numeric=(g->>'snap')::numeric;
 det numeric;disc numeric;qa numeric;v numeric;x numeric;y numeric;t numeric;coords numeric[]='{}';n numeric;
begin
 if a=0 and b=0 then return false;end if;
 if g->>'mode'='linear_relation' then
  foreach t in array array[0,2,-2,1]::numeric[] loop
   if b<>0 then x=t;y=(c-a*t)/b;else x=c/a;y=t;end if;coords=coords||array[x,y];
  end loop;
 elsif g->>'mode'='linear_system' then
  if d=0 and e=0 then return false;end if;
  det=a*e-d*b;
  if det<>0 then coords=array[(c*e-f*b)/det,(a*f-d*c)/det];end if;
 else
  if q=0 then return false;end if;qa=b*q;
  if qa=0 then x=c/a;coords=array[x,q*x*x];
  else
   disc=a*a+4*qa*c;
   if disc=0 then x=-a/(2*qa);coords=array[x,q*x*x];
   elsif disc>0 then
    v=-0.5*(a+case when a>=0 then 1 else -1 end*sqrt(disc));
    x=v/qa;y=-c/v;coords=array[x,q*x*x,y,q*y*y];
   end if;
  end if;
 end if;
 foreach n in array coords loop
  if abs(n)>1000 then return false;end if;
  if s<>0 and abs(n/s-round(n/s))>0.00000001 then return false;end if;
 end loop;
 return true;
exception when others then return false;
end$$;
revoke all on function lesson_private.valid_cartesian_graph(jsonb) from public;
grant execute on function lesson_private.valid_cartesian_graph(jsonb) to authenticated;
