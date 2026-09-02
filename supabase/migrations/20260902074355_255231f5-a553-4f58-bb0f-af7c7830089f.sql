
-- roles
create type public.app_role as enum ('admin','moderator','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role from auth.users where email = 'admin@mea.com'
on conflict do nothing;

-- shared updated_at
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- packages
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  price_per_mann numeric not null default 0,
  guests_per_mann integer not null default 100,
  image_url text,
  signature boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.packages to anon;
grant select, insert, update, delete on public.packages to authenticated;
grant all on public.packages to service_role;
alter table public.packages enable row level security;
create policy "public read active packages" on public.packages for select to anon using (is_active);
create policy "auth read packages" on public.packages for select to authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "admins write packages" on public.packages for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger packages_updated_at before update on public.packages for each row execute function public.update_updated_at_column();

create table public.package_sections (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.package_sections to anon;
grant select, insert, update, delete on public.package_sections to authenticated;
grant all on public.package_sections to service_role;
alter table public.package_sections enable row level security;
create policy "public read sections" on public.package_sections for select to anon using (true);
create policy "auth read sections" on public.package_sections for select to authenticated using (true);
create policy "admins write sections" on public.package_sections for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger package_sections_updated_at before update on public.package_sections for each row execute function public.update_updated_at_column();

create table public.package_section_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.package_sections(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.package_section_items to anon;
grant select, insert, update, delete on public.package_section_items to authenticated;
grant all on public.package_section_items to service_role;
alter table public.package_section_items enable row level security;
create policy "public read section items" on public.package_section_items for select to anon using (true);
create policy "auth read section items" on public.package_section_items for select to authenticated using (true);
create policy "admins write section items" on public.package_section_items for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger package_section_items_updated_at before update on public.package_section_items for each row execute function public.update_updated_at_column();

-- menu
create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.menu_categories to anon;
grant select, insert, update, delete on public.menu_categories to authenticated;
grant all on public.menu_categories to service_role;
alter table public.menu_categories enable row level security;
create policy "public read categories" on public.menu_categories for select to anon using (is_active);
create policy "auth read categories" on public.menu_categories for select to authenticated using (true);
create policy "admins write categories" on public.menu_categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger menu_categories_updated_at before update on public.menu_categories for each row execute function public.update_updated_at_column();

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  description text not null default '',
  price numeric not null default 0,
  serves text not null default '',
  diet text not null default 'nonveg',
  image_url text,
  tags text[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.menu_items to anon;
grant select, insert, update, delete on public.menu_items to authenticated;
grant all on public.menu_items to service_role;
alter table public.menu_items enable row level security;
create policy "public read menu items" on public.menu_items for select to anon using (is_active);
create policy "auth read menu items" on public.menu_items for select to authenticated using (true);
create policy "admins write menu items" on public.menu_items for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger menu_items_updated_at before update on public.menu_items for each row execute function public.update_updated_at_column();

-- orders / enquiries
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  occasion text,
  event_date date,
  guests integer not null default 0,
  mode text,
  package_id uuid references public.packages(id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  services jsonb not null default '[]'::jsonb,
  estimated_total numeric not null default 0,
  notes text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.orders to anon;
grant select, insert, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "anyone can submit enquiry" on public.orders for insert to anon with check (true);
create policy "auth can submit enquiry" on public.orders for insert to authenticated with check (true);
create policy "admins read orders" on public.orders for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admins delete orders" on public.orders for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger orders_updated_at before update on public.orders for each row execute function public.update_updated_at_column();
