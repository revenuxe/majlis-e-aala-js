alter table public.orders
  add column if not exists customer_id uuid references auth.users(id) on delete set null;

create index if not exists orders_customer_id_created_at_idx
  on public.orders (customer_id, created_at desc);

drop policy if exists "customers read their orders" on public.orders;
create policy "customers read their orders"
  on public.orders for select to authenticated
  using (customer_id = auth.uid());

create or replace function public.submit_booking(p_booking jsonb)
returns table (booking_reference text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reference text;
  v_attempt integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Please sign in before submitting a booking.';
  end if;
  if coalesce(length(trim(p_booking->>'customer_name')), 0) < 2 then
    raise exception 'Please provide your name.';
  end if;
  if coalesce(length(regexp_replace(p_booking->>'phone', '\D', '', 'g')), 0) < 8 then
    raise exception 'Please provide a valid phone number.';
  end if;
  if coalesce((p_booking->>'guests')::integer, 0) < 1 then
    raise exception 'Please provide a valid guest count.';
  end if;

  loop
    v_attempt := v_attempt + 1;
    v_reference := 'MA-' || to_char(current_date, 'YYMMDD') || '-' ||
      upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    begin
      insert into public.orders (
        customer_id, booking_reference, customer_name, phone, email, occasion, event_date,
        guests, mode, package_id, items, services, estimated_total, notes,
        food_preference, serving_style, venue, status
      ) values (
        auth.uid(), v_reference, trim(p_booking->>'customer_name'), trim(p_booking->>'phone'),
        nullif(trim(p_booking->>'email'), ''), nullif(trim(p_booking->>'occasion'), ''),
        nullif(p_booking->>'event_date', '')::date, (p_booking->>'guests')::integer,
        coalesce(nullif(p_booking->>'mode', ''), 'package'), nullif(p_booking->>'package_id', '')::uuid,
        coalesce(p_booking->'items', '[]'::jsonb), coalesce(p_booking->'services', '[]'::jsonb),
        greatest(coalesce((p_booking->>'estimated_total')::numeric, 0), 0),
        nullif(trim(p_booking->>'notes'), ''), nullif(trim(p_booking->>'food_preference'), ''),
        nullif(trim(p_booking->>'serving_style'), ''), coalesce(p_booking->'venue', '{}'::jsonb), 'new'
      );
      return query select v_reference;
      return;
    exception when unique_violation then
      if v_attempt >= 3 then raise; end if;
    end;
  end loop;
end;
$$;

create or replace function public.cancel_customer_booking(p_booking_reference text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
  set status = 'cancelled'
  where booking_reference = p_booking_reference
    and customer_id = auth.uid()
    and status = 'new';
  return found;
end;
$$;

revoke all on function public.cancel_customer_booking(text) from public;
grant execute on function public.cancel_customer_booking(text) to authenticated;
