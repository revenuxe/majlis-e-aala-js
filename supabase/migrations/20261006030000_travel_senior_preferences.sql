begin;

create or replace function public.submit_travel_booking(p_booking jsonb)
returns table(booking_reference text)
language plpgsql security definer set search_path = public as $$
declare
  v_token uuid;
  v_phone text;
  v_name text;
  v_category text;
  v_adults integer;
  v_children integer;
  v_ages integer[];
  v_package public.travel_packages%rowtype;
  v_departure public.travel_departures%rowtype;
  v_existing public.travel_booking_requests%rowtype;
  v_date date;
  v_month text;
  v_city text;
  v_preferences jsonb;
  v_reference text;
  v_seniors integer;
begin
  if jsonb_typeof(p_booking) <> 'object' or octet_length(p_booking::text) > 12000 then raise exception 'Please review your travel request.'; end if;
  v_token := (p_booking->>'request_token')::uuid;
  if v_token is null then raise exception 'Please refresh and try again.'; end if;
  v_phone := regexp_replace(coalesce(p_booking->>'phone',''), '[^0-9]', '', 'g');
  v_name := trim(coalesce(p_booking->>'customer_name',''));
  if length(v_name) not between 2 and 100 or length(v_phone) not between 8 and 15 then raise exception 'Please provide your name and a valid mobile number.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_phone, 0));
  select * into v_existing from public.travel_booking_requests r where r.request_token = v_token;
  if found then
    if v_existing.phone <> v_phone then raise exception 'Please start a new travel request.'; end if;
    return query select v_existing.booking_reference;
    return;
  end if;
  if (select count(*) from public.travel_booking_requests r where r.phone = v_phone and r.created_at > now() - interval '1 hour') >= 5 then raise exception 'Please contact our team to continue planning.'; end if;
  if coalesce((p_booking->>'contact_consent')::boolean,false) is not true then raise exception 'Please allow our team to contact you about this request.'; end if;
  if nullif(trim(p_booking->>'email'),'') is not null and trim(p_booking->>'email') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Please check your email address.'; end if;
  v_category := p_booking->>'category';
  if v_category is null or v_category not in ('umrah','hajj','international','domestic') then raise exception 'Please choose your journey.'; end if;
  v_adults := (p_booking->>'adults')::integer;
  v_children := coalesce((p_booking->>'children')::integer,0);
  if v_adults is null or v_adults < 1 or v_children < 0 or v_children > 20 or v_adults + v_children > 100 then raise exception 'Please check your traveller count.'; end if;
  if jsonb_typeof(coalesce(p_booking->'child_ages','[]')) <> 'array' then raise exception 'Please check children’s ages.'; end if;
  select coalesce(array_agg(age::integer),'{}'::integer[]) into v_ages from jsonb_array_elements_text(coalesce(p_booking->'child_ages','[]')) age;
  if cardinality(v_ages) <> v_children or exists(select 1 from unnest(v_ages) age where age is null or age < 0 or age > 17) then raise exception 'Please tell us each child’s age (0–17).'; end if;
  v_city := trim(coalesce(p_booking->>'departure_city',''));
  if length(v_city) not between 2 and 80 then raise exception 'Please tell us your departure city.'; end if;
  v_date := nullif(p_booking->>'preferred_date','')::date;
  v_month := nullif(p_booking->>'preferred_month','');
  if v_date < current_date then raise exception 'Please choose a future travel date.'; end if;
  if v_month is not null and (v_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' or v_month < to_char(current_date,'YYYY-MM')) then raise exception 'Please choose a current or future month.'; end if;
  if not coalesce((p_booking->>'dates_flexible')::boolean,true) and v_date is null then raise exception 'Please choose your travel date or select flexible dates.'; end if;
  if nullif(p_booking->>'package_id','') is not null then
    select * into v_package from public.travel_packages p where p.id = (p_booking->>'package_id')::uuid and p.is_active and p.category = v_category for share;
    if not found then raise exception 'This package is no longer available. Please choose another.'; end if;
  end if;
  if nullif(p_booking->>'departure_id','') is not null then
    select * into v_departure from public.travel_departures d where d.id = (p_booking->>'departure_id')::uuid and d.package_id = v_package.id and d.is_active and d.start_date >= current_date for share;
    if not found then raise exception 'This departure is no longer available. Please choose another.'; end if;
    if v_departure.capacity is not null and v_adults + v_children > v_departure.capacity then raise exception 'Please contact our team about a larger group.'; end if;
    v_date := v_departure.start_date;
    v_city := v_departure.departure_city;
  end if;
  v_preferences := coalesce(p_booking->'preferences','{}');
  if jsonb_typeof(v_preferences) <> 'object'
    or coalesce(v_preferences->>'room','shared') not in ('shared','twin','private')
    or coalesce(v_preferences->>'stay','comfort') not in ('standard','comfort','premium')
    or jsonb_typeof(coalesce(v_preferences->'assistance','[]')) <> 'array'
    or exists(select 1 from jsonb_array_elements_text(coalesce(v_preferences->'assistance','[]')) item where item is null or item not in ('mobility','nearby-hotel','guidance','child-seat'))
    then raise exception 'Please review your travel preferences.'; end if;
  if coalesce(v_preferences->>'seniors','0') !~ '^[0-9]{1,3}$' then raise exception 'Please check your senior traveller count.'; end if;
  v_seniors := coalesce(v_preferences->>'seniors','0')::integer;
  if v_seniors > v_adults or coalesce(v_preferences->>'pace','balanced') not in ('balanced','relaxed') then raise exception 'Please review your senior travellers and travel pace.'; end if;
  if length(coalesce(p_booking->>'notes','')) > 2000 or length(coalesce(p_booking->>'email','')) > 254 then raise exception 'Please shorten your contact details or notes.'; end if;
  insert into public.travel_booking_requests (
    request_token, customer_id, customer_name, phone, email, category, package_id, departure_id,
    departure_city, preferred_date, preferred_month, dates_flexible, adults, children, child_ages,
    preferences, package_snapshot, estimated_adult_total, notes
  ) values (
    v_token, auth.uid(), v_name, v_phone, nullif(trim(p_booking->>'email'),''), v_category, v_package.id, v_departure.id,
    v_city, v_date, v_month, case when v_departure.id is not null then false else coalesce((p_booking->>'dates_flexible')::boolean,true) end,
    v_adults, v_children, v_ages,
    jsonb_build_object('seniors',v_seniors,'pace',coalesce(v_preferences->>'pace','balanced'),'room',coalesce(v_preferences->>'room','shared'),'stay',coalesce(v_preferences->>'stay','comfort'),'assistance',coalesce(v_preferences->'assistance','[]')),
    case when v_package.id is null then jsonb_build_object('name','Custom journey') else jsonb_build_object('name',v_package.name,'slug',v_package.slug,'places',v_package.places,'duration',v_package.duration,'inclusions',v_package.inclusions,'exclusions',v_package.exclusions,'itinerary',v_package.itinerary,'price_per_adult',v_package.price_per_adult,'cancellation_terms',v_package.cancellation_terms) end,
    v_package.price_per_adult * v_adults, coalesce(p_booking->>'notes','')
  ) returning travel_booking_requests.booking_reference into v_reference;
  return query select v_reference;
end;
$$;
revoke all on function public.submit_travel_booking(jsonb) from public;
grant execute on function public.submit_travel_booking(jsonb) to anon, authenticated;


commit;
