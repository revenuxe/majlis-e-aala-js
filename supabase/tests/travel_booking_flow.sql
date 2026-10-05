-- Run with: supabase db query --linked --project-ref <ref> --file supabase/tests/travel_booking_flow.sql
-- Every test write is rolled back; no customer requests or prices are retained.
begin;
create function pg_temp.reject_travel(payload jsonb) returns void language plpgsql as $$
declare rejected boolean := false;
begin
  begin perform public.submit_travel_booking(payload); exception when others then rejected := true; end;
  if not rejected then raise exception 'Invalid request was accepted: %', payload; end if;
end;
$$;
do $$
declare
  pkg uuid;
  dep uuid;
  token uuid := gen_random_uuid();
  payload jsonb;
  first_ref text;
  second_ref text;
  result public.travel_booking_requests%rowtype;
begin
  select id into strict pkg from public.travel_packages where slug = 'classic-umrah';
  update public.travel_packages set price_per_adult = 100, inclusions = array['Test transfer'] where id = pkg;
  insert into public.travel_departures(package_id, departure_city, start_date, end_date, capacity)
    values(pkg, 'Test departure city', current_date + 30, current_date + 40, 3) returning id into dep;
  payload := jsonb_build_object('request_token',token,'customer_name','Test traveller','phone','910000000001',
    'contact_consent',true,'category','umrah','departure_city','Bengaluru','dates_flexible',true,
    'adults',2,'children',1,'child_ages',jsonb_build_array(7),'package_id',pkg,'departure_id',dep,
    'estimated_adult_total',999999,'preferences',jsonb_build_object('room','twin','stay','comfort','assistance',jsonb_build_array('mobility')));
  select booking_reference into first_ref from public.submit_travel_booking(payload);
  select booking_reference into second_ref from public.submit_travel_booking(payload);
  if first_ref <> second_ref or (select count(*) from public.travel_booking_requests where request_token = token) <> 1 then
    raise exception 'Retries must create exactly one request with the same reference';
  end if;
  select * into strict result from public.travel_booking_requests where request_token = token;
  if result.estimated_adult_total <> 200 or result.package_snapshot->>'name' <> 'The Essential Umrah'
    or result.departure_city <> 'Test departure city' or result.preferred_date <> current_date + 30
    or result.dates_flexible or result.status <> 'new' or result.contact_consent_at is null then
    raise exception 'Server price, snapshot, departure or consent was incorrect';
  end if;
  update public.travel_packages set name = 'Changed after request', price_per_adult = 999 where id = pkg;
  if (select package_snapshot->>'name' from public.travel_booking_requests where request_token = token) <> 'The Essential Umrah' then
    raise exception 'Historical snapshots must not change with the catalogue';
  end if;
  payload := payload || jsonb_build_object('request_token',gen_random_uuid());
  perform pg_temp.reject_travel(payload || '{"adults":0}');
  perform pg_temp.reject_travel(payload || '{"adults":100,"children":1}');
  perform pg_temp.reject_travel(payload || '{"children":1,"child_ages":[null]}');
  perform pg_temp.reject_travel(payload || '{"child_ages":[18]}');
  perform pg_temp.reject_travel(payload || '{"child_ages":[]}');
  perform pg_temp.reject_travel(payload || '{"contact_consent":false}');
  perform pg_temp.reject_travel(payload || '{"email":"invalid"}');
  perform pg_temp.reject_travel(payload || '{"category":"hajj"}');
  perform pg_temp.reject_travel(payload || '{"adults":3}');
  perform pg_temp.reject_travel(payload || jsonb_build_object('preferred_date',current_date-1));
  perform pg_temp.reject_travel(payload || '{"preferences":{"room":"invalid"}}');
  perform pg_temp.reject_travel(payload || '{"preferences":{"assistance":[null]}}');
  update public.travel_packages set is_active = false where id = pkg;
  perform pg_temp.reject_travel(payload);
  -- Hide a record to verify public catalogue policies below.
end;
$$;
set local role anon;
do $$
declare denied boolean := false;
begin
  if exists(select 1 from public.travel_packages where not is_active) then raise exception 'Hidden package leaked'; end if;
  if exists(select 1 from public.travel_departures d where d.departure_city='Test departure city') then raise exception 'Departure of hidden package leaked'; end if;
  begin perform 1 from public.travel_booking_requests; exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'Guest must not read customer requests'; end if;
  denied := false;
  begin insert into public.travel_booking_requests(customer_name,phone,category,departure_city,adults,request_token) values('Direct insert','910000000002','umrah','Bengaluru',1,gen_random_uuid()); exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'Guest must not bypass the submission function'; end if;
  -- A guest can submit a valid custom request through the function.
  perform public.submit_travel_booking(jsonb_build_object('request_token',gen_random_uuid(),'customer_name','Guest test','phone','910000000003','category','domestic','departure_city','Bengaluru','adults',1,'children',0,'child_ages','[]'::jsonb,'contact_consent',true));
end;
$$;
reset role;
set local role authenticated;
do $$
declare denied boolean := false;
begin
  if exists(select 1 from public.travel_booking_requests) then raise exception 'Non-admin must not read requests'; end if;
  begin insert into public.travel_packages(slug,category,name) values('unauthorised-test','umrah','Unauthorised'); exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'Non-admin modified the catalogue'; end if;
  denied := false;
  begin update public.travel_booking_requests set phone='123456789'; exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'Customer details are mutable through the admin API'; end if;
end;
$$;
reset role;
do $$
declare account uuid := gen_random_uuid();
begin
  insert into auth.users(id, email) values(account, 'travel-history-test-' || account || '@example.invalid');
  perform set_config('request.jwt.claim.sub', account::text, true);
end;
$$;
set local role authenticated;
do $$
declare result jsonb;
begin
  perform public.submit_travel_booking(jsonb_build_object('request_token',gen_random_uuid(),'customer_name','Account test','phone','910000000004','category','domestic','departure_city','Bengaluru','adults',1,'contact_consent',true));
  if (select count(*) from public.get_my_travel_bookings()) <> 1 then raise exception 'Own account request missing from history'; end if;
  select to_jsonb(h) into result from public.get_my_travel_bookings() h;
  perform set_config('app.test_travel_reference', result->>'booking_reference', true);
  if (select count(*) from public.get_my_travel_booking(result->>'booking_reference')) <> 1 then raise exception 'Specific booking lookup failed'; end if;
  if result ?| array['admin_notes','phone','email','request_token','customer_id'] then raise exception 'Private fields leaked through history'; end if;
  if exists(select 1 from public.travel_booking_requests) then raise exception 'Customer must not read internal request table'; end if;
end;
$$;
reset role;
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
set local role authenticated;
do $$ begin
  if exists(select 1 from public.get_my_travel_bookings()) then raise exception 'Another account can read customer history'; end if;
  if exists(select 1 from public.get_my_travel_booking(current_setting('app.test_travel_reference'))) then raise exception 'Another account can track a private booking'; end if;
end; $$;
reset role;
set local role anon;
do $$
declare denied boolean := false;
begin
  begin perform public.get_my_travel_bookings(); exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'Anonymous history access must be denied'; end if;
  denied := false;
  begin perform public.get_my_travel_booking(current_setting('app.test_travel_reference')); exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'Anonymous tracking lookup must be denied'; end if;
end; $$;
reset role;
-- Test status updates using the existing admin role model, without retaining a role change.
insert into public.user_roles(user_id,role)
  select customer_id,'admin' from public.travel_booking_requests where booking_reference=current_setting('app.test_travel_reference');
select set_config('request.jwt.claim.sub',(select customer_id::text from public.travel_booking_requests where booking_reference=current_setting('app.test_travel_reference')),true);
set local role authenticated;
do $$ begin
  update public.travel_booking_requests set status='quoted',quoted_total=12345,admin_notes='Internal tracking test' where booking_reference=current_setting('app.test_travel_reference');
  if not exists(select 1 from public.get_my_travel_booking(current_setting('app.test_travel_reference')) where status='quoted' and quoted_total=12345) then raise exception 'Admin update not visible in customer tracking'; end if;
end; $$;
reset role;
rollback;
select 'Travel validation, retries, snapshots, RLS and isolated account history passed; all test writes rolled back.' as result;
