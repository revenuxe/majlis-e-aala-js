-- Transcribed from the supplied 2025-05-09.webp package brochure.
-- Keep these admin drafts inactive and unassigned: active packages with no event
-- assignments are offered for every occasion by the current customer catalogue.
-- The brochure specifies prices per Mann, not a total guest range. Use the
-- existing Aala Classic range (300-350) as an editable draft default.
-- The Family Grand Table's 30 members are not the package's total guest count.
-- Re-running this import never overwrites subsequent dashboard edits.
do $$
declare
  v_package jsonb;
  v_section jsonb;
  v_package_id uuid;
  v_section_id uuid;
  v_sort_order integer;
  v_section_order integer;
begin
  select coalesce(max(sort_order), -1) + 1 into v_sort_order from public.packages;

  for v_package in select value from jsonb_array_elements($menu$[
    {
      "slug": "aala-supreme",
      "name": "Aala Supreme",
      "price": 125000,
      "sections": [
        {"title": "Main Course (2 Starters)", "items": [
          "Chicken Karaipak",
          "Double Dum Kabab",
          "Methi Chicken Gravy / Butter Chicken",
          "Coin Parota / Tandoori Kulcha",
          "Rumali Roti / Seviyan"
        ]},
        {"title": "Biryani", "items": [
          "Mutton Biryani", "Brinjal Curry / Dalcha", "Curd Chutney"
        ]},
        {"title": "Desserts (2 Sweets)", "items": [
          "Carrot Halwa", "Pineapple Special Sweet"
        ]},
        {"title": "Refreshment Stations", "items": [
          "Ice Cream", "Pan Beeda", "Soft Drink", "Tea Counter",
          "Popcorn", "Sugar Candy", "Fruit Stall"
        ]},
        {"title": "Family Grand Table (30 Members)", "items": [
          "Mutton Chops", "Fish Fry", "Teetar Fry", "Tandoori Chicken",
          "Kalmi Chicken", "Chicken Paal", "Cool Drinks"
        ]}
      ]
    },
    {
      "slug": "aala-deluxe",
      "name": "Aala Deluxe",
      "price": 150000,
      "sections": [
        {"title": "Main Course (3 Starters)", "items": [
          "Chicken Tandoori / Chicken Seekh",
          "Fish Fry",
          "Methi Chicken Gravy / Malai Chicken",
          "Hyderabadi Chicken / Pepper Chicken",
          "Tandoori Kulcha / Reshmi Roti",
          "Rumali Roti / Seviyan"
        ]},
        {"title": "Biryani", "items": [
          "Mutton Biryani", "Brinjal Curry / Dalcha", "Curd Raita"
        ]},
        {"title": "Desserts (2 Sweets)", "items": [
          "Muzaffar / Hyderabadi Firni", "Pineapple Special Sweet"
        ]},
        {"title": "Refreshment Stations", "items": [
          "Ice Cream / Gulkhan", "Pan Beeda", "Soft Drink", "Tea Counter",
          "Popcorn", "Sugar Candy", "Fruit Stall"
        ]},
        {"title": "Family Grand Table (30 Members)", "items": [
          "Mutton Chops", "Fish Fry", "Teetar Fry", "Tandoori Chicken",
          "Kalmi Chicken", "Chicken Paal", "Cool Drinks"
        ]}
      ]
    },
    {
      "slug": "aala-royal",
      "name": "Aala Royal",
      "price": 175000,
      "sections": [
        {"title": "Main Course (3 Starters)", "items": [
          "Chicken Tandoori / Mutton Seekh / Fish Fry",
          "Methi Chicken Gravy / Malai Chicken",
          "Hyderabadi Chicken / Pepper Chicken",
          "Tandoori Kulcha / Reshmi Roti",
          "Rumali Roti / Seviyan"
        ]},
        {"title": "Biryani", "items": [
          "Mutton Biryani", "Brinjal Curry / Dalcha", "Curd Raita"
        ]},
        {"title": "Desserts (2 Sweets)", "items": [
          "Carrot Halwa", "Muzaffar / Hyderabadi Firni", "Pineapple Special Sweet"
        ]},
        {"title": "Refreshment Stations", "items": [
          "Ice Cream / Shahi Tukda", "Pan Beeda", "Soft Drink", "Tea Counter",
          "Popcorn", "Sugar Candy", "Fruit Stall"
        ]},
        {"title": "Family Grand Table (30 Members)", "items": [
          "Mutton Mandi", "Fish Fry", "Teetar Fry", "Tandoori Chicken",
          "Kalmi Chicken", "Chicken Paal", "Cool Drinks"
        ]}
      ]
    }
  ]$menu$::jsonb)
  loop
    v_package_id := null;
    insert into public.packages (
      slug, name, price_per_mann, guests_per_mann, guest_count_from, guest_count_to,
      event_category_id, food_preference, is_active, signature, sort_order
    ) values (
      v_package->>'slug', v_package->>'name', (v_package->>'price')::numeric,
      350, 300, 350, null, 'nonveg', false, false, v_sort_order
    )
    on conflict (slug) do nothing
    returning id into v_package_id;

    if v_package_id is null then
      continue;
    end if;

    v_section_order := 0;
    for v_section in select value from jsonb_array_elements(v_package->'sections')
    loop
      insert into public.package_sections (package_id, title, sort_order)
      values (v_package_id, v_section->>'title', v_section_order)
      returning id into v_section_id;

      insert into public.package_section_items (section_id, label, sort_order)
      select v_section_id, item.label, (item.ordinality - 1)::integer
      from jsonb_array_elements_text(v_section->'items') with ordinality as item(label, ordinality);

      v_section_order := v_section_order + 1;
    end loop;

    -- Deliberately do not insert into public.package_event_categories.
    v_sort_order := v_sort_order + 1;
  end loop;
end $$;
