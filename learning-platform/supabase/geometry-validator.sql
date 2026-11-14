create or replace function lesson_private.valid_geometry(g jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare d jsonb;mode text;a double precision;b double precision;c double precision;s double precision;area2 double precision;angles double precision[];i integer;index integer;
begin
 if not lesson_private.schema_valid(g,lesson_private.contract_schema()#>'{properties,recognition,items,properties,uime,properties,geometry}',lesson_private.contract_schema()) then return false;end if;
 d=g->'data';mode=g->>'mode';index=right(g->>'curriculumCode',2)::integer;
 if (array['right_triangle','right_triangle','right_triangle','circle_symmetry','line_circle','two_circles','circle_angles','arc_sector_annulus','triangle_circles','cyclic_polygon'])[index] is distinct from mode then return false;end if;
 if mode='right_triangle' then
  if (d->>'legA')::double precision/(d->>'legB')::double precision not between .1 and 10 then return false;end if;
 elsif mode='triangle_circles' then
  a=(d->>'sideA')::double precision;b=(d->>'sideB')::double precision;c=(d->>'sideC')::double precision;s=(a+b+c)/2;area2=s*(s-a)*(s-b)*(s-c);
  if a+b<=c or a+c<=b or b+c<=a or area2<=0 or sqrt(area2)/power(greatest(a,b,c),2)<.03 then return false;end if;
 elsif mode='arc_sector_annulus' then
  if (d->>'innerRadius')::numeric >= (d->>'radius')::numeric then return false;end if;
 elsif mode='cyclic_polygon' then
  angles=array[0,(d->>'angleB')::double precision,(d->>'angleC')::double precision,(d->>'angleD')::double precision,360];
  for i in 2..5 loop if angles[i]-angles[i-1] not between 10 and 170 then return false;end if;end loop;
 end if;
 return true;
exception when others then return false;
end$$;
revoke all on function lesson_private.valid_geometry(jsonb) from public;
grant execute on function lesson_private.valid_geometry(jsonb) to authenticated;
