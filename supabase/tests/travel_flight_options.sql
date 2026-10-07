-- Run after both flight migrations. All changes are rolled back.
begin;
do $$
declare v_package public.travel_packages%rowtype;
begin
  select * into strict v_package from public.travel_packages where slug = 'umrah-economy';
  if v_package.price_per_adult <> 100000 or jsonb_array_length(v_package.flight_options) <> 2
    or v_package.flight_options->0->>'airline' <> 'Air India Express'
    or (v_package.flight_options->1->>'price_per_adult')::numeric <> 110000 then
    raise exception 'Umrah Economy airline seed is incorrect';
  end if;
  update public.travel_packages set flight_options = '[{"id":"test","airline":"Test airline","price_per_adult":120000,"notes":""}]' where id = v_package.id;
  if (select price_per_adult from public.travel_packages where id = v_package.id) <> 120000 then
    raise exception 'Starting price was not recalculated';
  end if;
  begin
    update public.travel_packages set flight_options = '[{"id":"test","airline":"Test airline","price_per_adult":-1,"notes":""}]' where id = v_package.id;
    raise exception using errcode = 'XX000', message = 'Negative price was accepted';
  exception when sqlstate 'P0001' then null;
  end;
  update public.travel_packages set pricing_mode = 'on_request' where id = v_package.id;
  if (select price_per_adult from public.travel_packages where id = v_package.id) is not null then
    raise exception 'On-request package retained a starting price';
  end if;
end;
$$;
rollback;
