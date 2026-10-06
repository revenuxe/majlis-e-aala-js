begin;

-- Additive migration: existing references, ownership and snapshots are preserved.
-- The status predicate is checked again under the UPDATE row lock, so a customer
-- cannot cancel a request that an administrator has already advanced.
create or replace function public.cancel_customer_travel_booking(p_booking_reference text)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update public.travel_booking_requests
  set status = 'cancelled'
  where booking_reference = p_booking_reference
    and customer_id = auth.uid()
    and auth.uid() is not null
    and status = 'new';
  return found;
end;
$$;
revoke all on function public.cancel_customer_travel_booking(text) from public, anon;
grant execute on function public.cancel_customer_travel_booking(text) to authenticated;

-- Deletion is available only through an explicitly admin-checked function.
-- Customers retain no direct UPDATE or DELETE privileges on booking records.
create or replace function public.delete_admin_travel_booking(p_booking_id uuid)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only administrators can delete travel bookings.' using errcode = '42501';
  end if;
  delete from public.travel_booking_requests where id = p_booking_id;
  return found;
end;
$$;
revoke all on function public.delete_admin_travel_booking(uuid) from public, anon;
grant execute on function public.delete_admin_travel_booking(uuid) to authenticated;
commit;
