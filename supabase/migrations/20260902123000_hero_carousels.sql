create table public.hero_carousels (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null default '',
  title text not null,
  desktop_image_url text not null,
  mobile_image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index hero_carousels_active_sort_idx on public.hero_carousels (is_active, sort_order);
grant select on public.hero_carousels to anon;
grant select, insert, update, delete on public.hero_carousels to authenticated;
grant all on public.hero_carousels to service_role;
alter table public.hero_carousels enable row level security;
create policy "public read active hero slides" on public.hero_carousels for select to anon using (is_active);
create policy "auth read hero slides" on public.hero_carousels for select to authenticated using (is_active or public.has_role(auth.uid(), 'admin'));
create policy "admins write hero slides" on public.hero_carousels for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger hero_carousels_updated_at before update on public.hero_carousels for each row execute function public.update_updated_at_column();
