alter table public.packages
  add column if not exists service_options text[] not null default '{}';
