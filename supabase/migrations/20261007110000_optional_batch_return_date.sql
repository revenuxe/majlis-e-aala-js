begin;
alter table public.travel_departures alter column end_date drop not null;
notify pgrst, 'reload schema';
commit;
