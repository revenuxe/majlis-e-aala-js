-- Replace the retired Nikah package with the approved Aala Classic menu.
-- Menu data is stored in package_sections/package_section_items so it is editable
-- from Admin → Packages and shared by the public package and landing pages.
do $$
declare
  v_nikah_id uuid;
  v_package_id uuid;
  v_section_id uuid;
begin
  insert into public.event_categories (slug, name, is_active, sort_order)
  values ('nikah', 'Nikah', true, 0)
  on conflict (slug) do update
    set name = excluded.name, is_active = true
  returning id into v_nikah_id;

  -- Retire the old package. Existing order records retain their historical
  -- booking data; their optional package reference is set to null by the FK.
  delete from public.packages
  where slug = 'aala-zarf' or lower(name) = 'aala zarf';

  insert into public.packages (
    slug, name, tagline, price_per_mann, guests_per_mann, event_category_id,
    food_preference, included_services, service_options, signature, is_active, sort_order
  ) values (
    'aala-classic', 'Aala Classic',
    'A complete Nikah feast with refreshments, service and a special groom table.',
    130000, 100, v_nikah_id, 'mixed',
    array['Crockery', 'Service', 'Mineral Water'],
    array['Buffet Setup', 'Serving Staff'], false, true, 0
  )
  on conflict (slug) do update set
    name = excluded.name,
    tagline = excluded.tagline,
    price_per_mann = excluded.price_per_mann,
    guests_per_mann = excluded.guests_per_mann,
    event_category_id = excluded.event_category_id,
    food_preference = excluded.food_preference,
    included_services = excluded.included_services,
    service_options = excluded.service_options,
    is_active = true,
    sort_order = excluded.sort_order
  returning id into v_package_id;

  delete from public.package_sections where package_id = v_package_id;

  insert into public.package_sections (package_id, title, sort_order)
  values (v_package_id, 'Welcome Drink', 0)
  returning id into v_section_id;
  insert into public.package_section_items (section_id, label, sort_order) values
    (v_section_id, 'Mango Badam', 0),
    (v_section_id, 'Arabian Grape', 1);

  insert into public.package_sections (package_id, title, sort_order)
  values (v_package_id, 'Starter', 1)
  returning id into v_section_id;
  insert into public.package_section_items (section_id, label, sort_order) values
    (v_section_id, 'Chicken Keshnu Kabab', 0);

  insert into public.package_sections (package_id, title, sort_order)
  values (v_package_id, 'Main Course', 2)
  returning id into v_section_id;
  insert into public.package_section_items (section_id, label, sort_order) values
    (v_section_id, 'Butter Chicken Gravy', 0),
    (v_section_id, 'Rumali Roti', 1),
    (v_section_id, 'Coin Parota & Seviyan', 2),
    (v_section_id, 'Mutton Biryani', 3),
    (v_section_id, 'Brinjal Chutney', 4),
    (v_section_id, 'Curd Chutney', 5),
    (v_section_id, 'Mineral Water', 6),
    (v_section_id, 'Crockery', 7),
    (v_section_id, 'Service', 8);

  insert into public.package_sections (package_id, title, sort_order)
  values (v_package_id, 'Desserts', 3)
  returning id into v_section_id;
  insert into public.package_section_items (section_id, label, sort_order) values
    (v_section_id, 'Dal Sweet', 0),
    (v_section_id, 'Gajar Ka Halwa', 1);

  insert into public.package_sections (package_id, title, sort_order)
  values (v_package_id, 'Fun Food Counter', 4)
  returning id into v_section_id;
  insert into public.package_section_items (section_id, label, sort_order) values
    (v_section_id, 'Ice Cream', 0),
    (v_section_id, 'Soft Drink', 1),
    (v_section_id, 'Pan Beeda', 2);

  insert into public.package_sections (package_id, title, sort_order)
  values (v_package_id, 'Special Groom Table', 5)
  returning id into v_section_id;
  insert into public.package_section_items (section_id, label, sort_order) values
    (v_section_id, 'Fish Fry', 0),
    (v_section_id, 'Teetar', 1),
    (v_section_id, 'Mutton Chops', 2),
    (v_section_id, 'Lolly Pop Chicken', 3),
    (v_section_id, 'Leg Fry', 4);
end $$;
