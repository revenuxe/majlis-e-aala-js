-- Packages can be offered for multiple event categories. An empty assignment
-- deliberately means the package is available for every event.
create table if not exists public.package_event_categories (
  package_id uuid not null references public.packages(id) on delete cascade,
  event_category_id uuid not null references public.event_categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (package_id, event_category_id)
);

create index if not exists package_event_categories_event_category_id_idx
  on public.package_event_categories(event_category_id);

-- Preserve all existing single-category assignments during the upgrade.
insert into public.package_event_categories (package_id, event_category_id)
select id, event_category_id
from public.packages
where event_category_id is not null
on conflict do nothing;

grant select on public.package_event_categories to anon;
grant select, insert, update, delete on public.package_event_categories to authenticated;
grant all on public.package_event_categories to service_role;

alter table public.package_event_categories enable row level security;

create policy "public read package event categories"
  on public.package_event_categories for select to anon using (true);
create policy "auth read package event categories"
  on public.package_event_categories for select to authenticated using (true);
create policy "admins write package event categories"
  on public.package_event_categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
