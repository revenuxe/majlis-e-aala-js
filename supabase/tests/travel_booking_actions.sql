-- All fixtures and mutations are rolled back, including auth users.
begin;
insert into auth.users(id, email) values
  ('a06ca600-0000-4000-8000-000000000001', 'travel-actions-owner@example.invalid'),
  ('a06ca600-0000-4000-8000-000000000002', 'travel-actions-admin@example.invalid');
insert into public.user_roles(user_id, role) values
  ('a06ca600-0000-4000-8000-000000000002', 'admin');
insert into public.travel_booking_requests(customer_id,customer_name,phone,category,departure_city,adults,request_token,booking_reference,status,quoted_total)
select 'a06ca600-0000-4000-8000-000000000001', 'Action test', '910000000099', 'domestic', 'Test city', 1, gen_random_uuid(), 'TEST-ACTIONS-' || s,
  s, case when s in ('quoted','confirmed') then 100 else null end
from unnest(array['new','contacted','quoted','confirmed','completed','cancelled']) s;

set local role authenticated;
select set_config('request.jwt.claim.sub','a06ca600-0000-4000-8000-000000000002',true);
do $$ begin
  if public.cancel_customer_travel_booking('TEST-ACTIONS-new') then raise exception 'Another customer cancelled a booking'; end if;
end $$;
select set_config('request.jwt.claim.sub','a06ca600-0000-4000-8000-000000000001',true);
do $$
declare s text; denied boolean := false;
begin
  if not public.cancel_customer_travel_booking('TEST-ACTIONS-new') then raise exception 'Owner could not cancel new request'; end if;
  if public.cancel_customer_travel_booking('TEST-ACTIONS-new') then raise exception 'Repeated cancellation changed a request'; end if;
  foreach s in array array['contacted','quoted','confirmed','completed','cancelled'] loop
    if public.cancel_customer_travel_booking('TEST-ACTIONS-' || s) then raise exception 'Customer cancelled advanced status %',s; end if;
  end loop;
  if public.cancel_customer_travel_booking('TEST-ACTIONS-missing') then raise exception 'Missing booking cancelled'; end if;
  begin perform public.delete_admin_travel_booking(gen_random_uuid()); exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'Customer could invoke admin deletion'; end if;
  denied := false;
  begin delete from public.travel_booking_requests where booking_reference='TEST-ACTIONS-contacted'; exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'Customer has direct DELETE privileges'; end if;
end $$;
reset role;
do $$ begin
  if (select status from public.travel_booking_requests where booking_reference='TEST-ACTIONS-new') <> 'cancelled' then raise exception 'Cancellation was not persisted'; end if;
end $$;
select set_config('request.jwt.claim.sub','a06ca600-0000-4000-8000-000000000002',true);
set local role authenticated;
do $$
declare booking_id uuid;
begin
  update public.travel_booking_requests set status='contacted'
    where booking_reference='TEST-ACTIONS-new' and status='new';
  if found then raise exception 'Stale admin update overwrote customer cancellation'; end if;
  select id into strict booking_id from public.travel_booking_requests where booking_reference='TEST-ACTIONS-new';
  if not public.delete_admin_travel_booking(booking_id) then raise exception 'Admin could not delete booking'; end if;
  if public.delete_admin_travel_booking(booking_id) then raise exception 'Repeated deletion reported success'; end if;
  if exists(select 1 from public.travel_booking_requests where id=booking_id) then raise exception 'Deleted booking retained'; end if;
end $$;
reset role;
set local role anon;
do $$
declare denied boolean := false;
begin
  begin perform public.cancel_customer_travel_booking('TEST-ACTIONS-contacted'); exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'Guest could invoke cancellation'; end if;
  denied := false;
  begin perform public.delete_admin_travel_booking(gen_random_uuid()); exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'Guest could invoke deletion'; end if;
end $$;
reset role;
rollback;
