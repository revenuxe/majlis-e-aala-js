alter table public.packages
  add column if not exists food_preference text not null default 'mixed'
    check (food_preference in ('veg', 'nonveg', 'mixed')),
  add column if not exists included_services text[] not null default '{}',
  add column if not exists excluded_services text[] not null default '{}';
