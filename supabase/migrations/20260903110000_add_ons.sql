create table if not exists public.add_ons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  event_category_ids uuid[] not null default '{}',
  package_ids uuid[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.add_ons enable row level security;
grant select on public.add_ons to anon, authenticated;
grant insert, update, delete on public.add_ons to authenticated;
create policy "public reads active add ons" on public.add_ons for select using (is_active or public.has_role(auth.uid(), 'admin'));
create policy "admins manage add ons" on public.add_ons for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger add_ons_updated_at before update on public.add_ons for each row execute function public.update_updated_at_column();
