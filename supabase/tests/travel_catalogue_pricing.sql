-- All test writes are rolled back. This creates no persistent customer bookings.
begin;
do $$
declare
  payload jsonb;
  result public.travel_booking_requests%rowtype;
  pkg public.travel_packages%rowtype;
  ref text;
  denied boolean;
begin
  if (select count(*) from public.travel_packages where is_active) < 63 then raise exception 'Catalogue is incomplete'; end if;
  if (select count(*) from public.travel_packages where collection = 'ramadan' and pricing_mode = 'seasonal' and is_active) <> 4 then raise exception 'Ramadan prices must be marked seasonal'; end if;
  if (select count(*) from public.travel_packages where category = 'hajj' and price_per_adult is null and is_active) <> 4 then raise exception 'Duration-only Hajj options need individual quotes'; end if;
  if exists(select 1 from public.travel_packages where is_active and (cardinality(inclusions) = 0 or cardinality(exclusions) = 0 or jsonb_array_length(itinerary) = 0)) then raise exception 'Package details missing'; end if;
  if exists(select 1 from public.travel_catalogue_imports i, jsonb_array_elements(i.previous_catalogue) old where i.import_key = 'owner-catalogue-20261006' and not exists(select 1 from public.travel_packages p where p.id = (old->>'id')::uuid)) then raise exception 'An original package ID was lost'; end if;
  select * into strict pkg from public.travel_packages where slug = 'umrah-economy';
  if pkg.price_per_adult <> 89999 or pkg.price_basis <> 'Per adult · 4/5 sharing' then raise exception 'Economy rate or sharing basis incorrect'; end if;
  payload := jsonb_build_object('request_token',gen_random_uuid(),'customer_name','Pricing test','phone','910000000090',
    'contact_consent',true,'category','umrah','departure_city','Bengaluru','dates_flexible',true,
    'adults',3,'children',1,'child_ages',jsonb_build_array(5),'package_id',pkg.id,
    'price_per_adult',1,'estimated_adult_total',1,'price_basis','Invented private-room rate',
    'preferences',jsonb_build_object('room','private','stay','premium','seniors',2,'pace','relaxed'));
  select booking_reference into ref from public.submit_travel_booking(payload);
  select * into strict result from public.travel_booking_requests where booking_reference = ref;
  if result.estimated_adult_total <> 269997 or result.package_snapshot->>'price_basis' <> pkg.price_basis or result.package_snapshot->>'pricing_mode' <> 'starting' or (result.package_snapshot->>'price_per_adult')::numeric <> 89999 then raise exception 'Server must use catalog prices and basis, not forged client rates'; end if;
  update public.travel_packages set price_per_adult = 99999, price_basis = 'Updated basis' where id = pkg.id;
  if (select package_snapshot->>'price_basis' from public.travel_booking_requests where booking_reference = ref) <> pkg.price_basis then raise exception 'Historical pricing snapshot changed'; end if;
  denied := false;
  begin update public.travel_packages set pricing_mode='on_request' where id=pkg.id; exception when check_violation then denied:=true; end;
  if not denied then raise exception 'Contradictory price mode accepted'; end if;
  select * into strict pkg from public.travel_packages where slug = 'ramadan-umrah-first-ashra';
  payload := payload || jsonb_build_object('request_token',gen_random_uuid(),'package_id',pkg.id,'children',0,'child_ages','[]'::jsonb);
  select booking_reference into ref from public.submit_travel_booking(payload);
  select * into strict result from public.travel_booking_requests where booking_reference = ref;
  if result.estimated_adult_total <> 449997 or result.package_snapshot->>'pricing_mode' <> 'seasonal' then raise exception 'Seasonal guide metadata lost'; end if;
  select * into strict pkg from public.travel_packages where slug = '21-day-hajj';
  payload := payload || jsonb_build_object('request_token',gen_random_uuid(),'package_id',pkg.id,'category','hajj');
  select booking_reference into ref from public.submit_travel_booking(payload);
  select * into strict result from public.travel_booking_requests where booking_reference = ref;
  if result.estimated_adult_total is not null or result.package_snapshot->>'pricing_mode' <> 'on_request' then raise exception 'Quote-only request must not invent a price'; end if;
end;
$$;
set local role anon;
do $$
declare denied boolean := false;
begin
  begin perform 1 from public.travel_catalogue_imports; exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'Anonymous users must not read import backups'; end if;
end;
$$;
reset role;
rollback;
select 'Catalogue counts, preserved IDs, sharing basis, server pricing, seasonal guides, quote-only requests and private import backups passed; all writes rolled back.' as result;
