begin;
create or replace function public.get_my_travel_booking(p_booking_reference text)
returns table (
  booking_reference text, category text, package_name text, departure_city text,
  preferred_date date, preferred_month text, dates_flexible boolean,
  adults integer, children integer, status text, estimated_adult_total numeric,
  quoted_total numeric, created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select r.booking_reference, r.category, coalesce(r.package_snapshot->>'name','Custom journey'),
    r.departure_city, r.preferred_date, r.preferred_month, r.dates_flexible,
    r.adults, r.children, r.status, r.estimated_adult_total, r.quoted_total, r.created_at
  from public.travel_booking_requests r
  where auth.uid() is not null and r.customer_id = auth.uid()
    and r.booking_reference = p_booking_reference;
$$;
revoke all on function public.get_my_travel_booking(text) from public, anon;
grant execute on function public.get_my_travel_booking(text) to authenticated;
commit;
