-- Travel carousel uses the same editor contract as catering, with independent rows.
create table public.travel_hero_carousels (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null default '',
  title text not null check (length(trim(title)) > 0),
  desktop_image_url text not null check (length(trim(desktop_image_url)) > 0),
  mobile_image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index travel_hero_carousels_active_sort_idx
  on public.travel_hero_carousels (is_active, sort_order, created_at);
grant select on public.travel_hero_carousels to anon;
grant select, insert, update, delete on public.travel_hero_carousels to authenticated;
grant all on public.travel_hero_carousels to service_role;
alter table public.travel_hero_carousels enable row level security;
create policy "public read active travel hero slides" on public.travel_hero_carousels
  for select to anon using (is_active);
create policy "auth read travel hero slides" on public.travel_hero_carousels
  for select to authenticated using (is_active or public.has_role(auth.uid(), 'admin'));
create policy "admins write travel hero slides" on public.travel_hero_carousels
  for all to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create trigger travel_hero_carousels_updated_at before update on public.travel_hero_carousels
  for each row execute function public.update_updated_at_column();

-- Root-relative images resolve on localhost and on the production website.
-- Move the existing travel hero content into editable database records.
insert into public.travel_hero_carousels
  (eyebrow, title, desktop_image_url, mobile_image_url, sort_order)
values
  ('Majlise Aala Tours & Travels', 'Sacred journeys. Thoughtfully planned.',
    '/travel/makkah-courtyard.jpg', null, 0),
  ('Majlise Aala Tours & Travels', 'A journey of faith, at your pace.',
    '/travel/madinah.jpg', null, 1),
  ('Majlise Aala Tours & Travels', 'Beautiful escapes. Lasting memories.',
    '/travel/kerala.jpg', null, 2);
