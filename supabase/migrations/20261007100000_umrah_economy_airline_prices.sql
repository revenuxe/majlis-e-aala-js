-- Full package prices per adult supplied by the owner.
begin;
update public.travel_packages
set flight_options = '[{"id":"air-india-express","airline":"Air India Express","price_per_adult":100000,"notes":""},{"id":"saudi-airlines","airline":"Saudi Airlines","price_per_adult":110000,"notes":""}]'::jsonb,
    pricing_mode = 'starting',
    price_per_adult = 100000
where slug = 'umrah-economy' and category = 'umrah';
commit;
