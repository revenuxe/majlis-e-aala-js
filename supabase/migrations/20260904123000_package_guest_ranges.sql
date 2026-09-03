-- A package can serve a practical guest range instead of one fixed number.
alter table public.packages
  add column if not exists guest_count_from integer,
  add column if not exists guest_count_to integer;

update public.packages
set guest_count_from = coalesce(guest_count_from, guests_per_mann),
    guest_count_to = coalesce(guest_count_to, guests_per_mann)
where guest_count_from is null or guest_count_to is null;

alter table public.packages
  alter column guest_count_from set not null,
  alter column guest_count_to set not null;

alter table public.packages
  drop constraint if exists packages_guest_count_range_check;

alter table public.packages
  add constraint packages_guest_count_range_check
  check (guest_count_from > 0 and guest_count_to >= guest_count_from);

-- Aala Classic is a ₹1,30,000 package designed for 300–350 guests.
update public.packages
set guest_count_from = 300,
    guest_count_to = 350,
    guests_per_mann = 350
where slug = 'aala-classic';
