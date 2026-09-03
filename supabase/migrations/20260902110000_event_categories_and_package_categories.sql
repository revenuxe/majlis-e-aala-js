create table public.event_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.event_categories to anon;
grant select, insert, update, delete on public.event_categories to authenticated;
grant all on public.event_categories to service_role;
alter table public.event_categories enable row level security;
create policy "public read active event categories" on public.event_categories for select to anon using (is_active);
create policy "auth read event categories" on public.event_categories for select to authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "admins write event categories" on public.event_categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger event_categories_updated_at before update on public.event_categories for each row execute function public.update_updated_at_column();

alter table public.packages
  add column if not exists event_category_id uuid references public.event_categories(id) on delete set null;

create index if not exists packages_event_category_id_idx on public.packages(event_category_id);
