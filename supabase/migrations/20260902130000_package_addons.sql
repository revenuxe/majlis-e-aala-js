alter table public.menu_items add column if not exists is_addon boolean not null default false;
create index if not exists menu_items_addon_active_idx on public.menu_items (is_addon, is_active, sort_order);
