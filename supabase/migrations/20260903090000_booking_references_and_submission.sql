-- A public booking is created only through submit_booking. This keeps customer
-- details private while still allowing anonymous visitors to place an enquiry.
alter table public.orders
  add column if not exists booking_reference text,
  add column if not exists food_preference text,
  add column if not exists serving_style text,
  add column if not exists venue jsonb not null default '{}'::jsonb;

create unique index if not exists orders_booking_reference_key
  on public.orders (booking_reference)
  where booking_reference is not null;

drop policy if exists "anyone can submit enquiry" on public.orders;
drop policy if exists "auth can submit enquiry" on public.orders;

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
        booking_reference, customer_name, phone, email, occasion, event_date,
        guests, mode, package_id, items, services, estimated_total, notes,
        food_preference, serving_style, venue, status
      )
      values (
        v_reference,
        trim(p_booking->>'customer_name'),
        trim(p_booking->>'phone'),
        nullif(trim(p_booking->>'email'), ''),
        nullif(trim(p_booking->>'occasion'), ''),
        nullif(p_booking->>'event_date', '')::date,
        (p_booking->>'guests')::integer,
        coalesce(nullif(p_booking->>'mode', ''), 'package'),
        nullif(p_booking->>'package_id', '')::uuid,
        coalesce(p_booking->'items', '[]'::jsonb),
        coalesce(p_booking->'services', '[]'::jsonb),
        greatest(coalesce((p_booking->>'estimated_total')::numeric, 0), 0),
        nullif(trim(p_booking->>'notes'), ''),
        nullif(trim(p_booking->>'food_preference'), ''),
        nullif(trim(p_booking->>'serving_style'), ''),
        coalesce(p_booking->'venue', '{}'::jsonb),
        'new'
      );
      return query select v_reference;
      return;
    exception when unique_violation then
      if v_attempt >= 3 then raise; end if;
    end;
  end loop;
end;
$$;

revoke all on function public.submit_booking(jsonb) from public;
grant execute on function public.submit_booking(jsonb) to anon, authenticated;
