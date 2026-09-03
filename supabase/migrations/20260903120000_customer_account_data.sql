create table if not exists public.customer_drafts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Venue', address text not null default '', area text not null default '', city text not null default 'Bengaluru', pincode text not null default '', landmark text not null default '', is_default boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.customer_notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, message text not null, is_read boolean not null default false, created_at timestamptz not null default now()
);
alter table public.customer_drafts enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.customer_notifications enable row level security;
create policy "customers manage their draft" on public.customer_drafts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "customers manage addresses" on public.customer_addresses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "customers read notifications" on public.customer_notifications for select to authenticated using (user_id = auth.uid());
create trigger customer_drafts_updated_at before update on public.customer_drafts for each row execute function public.update_updated_at_column();
create trigger customer_addresses_updated_at before update on public.customer_addresses for each row execute function public.update_updated_at_column();
