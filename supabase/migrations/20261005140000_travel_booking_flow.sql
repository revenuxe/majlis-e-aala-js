-- Transactional and retry-safe after an interrupted CLI application.
begin;
create table if not exists public.travel_packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (length(trim(slug)) > 0),
  category text not null check (category in ('umrah','hajj','international','domestic')),
  name text not null check (length(trim(name)) > 0),
  tagline text not null default '',
  places text not null default '',
  duration text not null default '',
  description text not null default '',
  image_url text,
  highlights text[] not null default '{}',
  inclusions text[] not null default '{}',
  exclusions text[] not null default '{}',
  itinerary jsonb not null default '[]' check (jsonb_typeof(itinerary) = 'array'),
  price_per_adult numeric(12,2) check (price_per_adult >= 0),
  cancellation_terms text not null default 'Cancellation terms will be provided with your written quotation.',
  is_active boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.travel_departures (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.travel_packages(id) on delete restrict,
  departure_city text not null check (length(trim(departure_city)) > 0),
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  capacity integer check (capacity > 0 and capacity <= 10000),
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.travel_booking_requests (
  id uuid primary key default gen_random_uuid(),
  request_token uuid not null unique,
  booking_reference text not null unique default ('MAT-' || to_char(current_date, 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null check (length(trim(customer_name)) between 2 and 100),
  phone text not null,
  email text,
  category text not null check (category in ('umrah','hajj','international','domestic')),
  package_id uuid references public.travel_packages(id) on delete restrict,
  departure_id uuid references public.travel_departures(id) on delete restrict,
  departure_city text not null,
  preferred_date date,
  preferred_month text,
  dates_flexible boolean not null default true,
  adults integer not null check (adults between 1 and 100),
  children integer not null default 0 check (children between 0 and 20 and adults + children <= 100),
  child_ages integer[] not null default '{}',
  preferences jsonb not null default '{}',
  package_snapshot jsonb not null default '{}',
  estimated_adult_total numeric(14,2),
  quoted_total numeric(14,2) check (quoted_total >= 0),
  notes text not null default '',
  admin_notes text not null default '',
  contact_consent_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new','contacted','quoted','confirmed','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status not in ('quoted','confirmed') or quoted_total is not null)
);
create index if not exists travel_packages_catalog_idx on public.travel_packages(is_active, category, sort_order);
create index if not exists travel_departures_package_date_idx on public.travel_departures(package_id, start_date);
create index if not exists travel_requests_created_idx on public.travel_booking_requests(created_at desc);
create index if not exists travel_requests_phone_created_idx on public.travel_booking_requests(phone, created_at desc);
create index if not exists travel_requests_customer_idx on public.travel_booking_requests(customer_id);
create index if not exists travel_requests_package_idx on public.travel_booking_requests(package_id);
create index if not exists travel_requests_departure_idx on public.travel_booking_requests(departure_id);

grant select on public.travel_packages, public.travel_departures to anon;
grant select, insert, update, delete on public.travel_packages, public.travel_departures to authenticated;
revoke all on public.travel_booking_requests from anon, authenticated;
grant select on public.travel_booking_requests to authenticated;
grant update (status, quoted_total, admin_notes) on public.travel_booking_requests to authenticated;
grant all on public.travel_packages, public.travel_departures, public.travel_booking_requests to service_role;
alter table public.travel_packages enable row level security;
alter table public.travel_departures enable row level security;
alter table public.travel_booking_requests enable row level security;
drop policy if exists "read active travel packages" on public.travel_packages;
create policy "read active travel packages" on public.travel_packages for select to anon, authenticated
  using (is_active or public.has_role(auth.uid(), 'admin'));
drop policy if exists "admins manage travel packages" on public.travel_packages;
create policy "admins manage travel packages" on public.travel_packages for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "read available travel departures" on public.travel_departures;
create policy "read available travel departures" on public.travel_departures for select to anon, authenticated
  using ((is_active and start_date >= current_date and exists (select 1 from public.travel_packages p where p.id = package_id and p.is_active)) or public.has_role(auth.uid(), 'admin'));
drop policy if exists "admins manage travel departures" on public.travel_departures;
create policy "admins manage travel departures" on public.travel_departures for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admins read travel requests" on public.travel_booking_requests;
create policy "admins read travel requests" on public.travel_booking_requests for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admins update travel requests" on public.travel_booking_requests;
create policy "admins update travel requests" on public.travel_booking_requests for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
drop trigger if exists travel_packages_updated_at on public.travel_packages;
create trigger travel_packages_updated_at before update on public.travel_packages for each row execute function public.update_updated_at_column();
drop trigger if exists travel_departures_updated_at on public.travel_departures;
create trigger travel_departures_updated_at before update on public.travel_departures for each row execute function public.update_updated_at_column();
drop trigger if exists travel_requests_updated_at on public.travel_booking_requests;
create trigger travel_requests_updated_at before update on public.travel_booking_requests for each row execute function public.update_updated_at_column();

-- Guest submissions only go through this validated function. Prices and snapshots
-- are read from the catalogue, never trusted from the browser.
create or replace function public.submit_travel_booking(p_booking jsonb)
returns table(booking_reference text)
language plpgsql security definer set search_path = public as $$
declare
  v_token uuid;
  v_phone text;
  v_name text;
  v_category text;
  v_adults integer;
  v_children integer;
  v_ages integer[];
  v_package public.travel_packages%rowtype;
  v_departure public.travel_departures%rowtype;
  v_existing public.travel_booking_requests%rowtype;
  v_date date;
  v_month text;
  v_city text;
  v_preferences jsonb;
  v_reference text;
begin
  if jsonb_typeof(p_booking) <> 'object' or octet_length(p_booking::text) > 12000 then raise exception 'Please review your travel request.'; end if;
  v_token := (p_booking->>'request_token')::uuid;
  if v_token is null then raise exception 'Please refresh and try again.'; end if;
  v_phone := regexp_replace(coalesce(p_booking->>'phone',''), '[^0-9]', '', 'g');
  v_name := trim(coalesce(p_booking->>'customer_name',''));
  if length(v_name) not between 2 and 100 or length(v_phone) not between 8 and 15 then raise exception 'Please provide your name and a valid mobile number.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_phone, 0));
  select * into v_existing from public.travel_booking_requests r where r.request_token = v_token;
  if found then
    if v_existing.phone <> v_phone then raise exception 'Please start a new travel request.'; end if;
    return query select v_existing.booking_reference;
    return;
  end if;
  if (select count(*) from public.travel_booking_requests r where r.phone = v_phone and r.created_at > now() - interval '1 hour') >= 5 then raise exception 'Please contact our team to continue planning.'; end if;
  if coalesce((p_booking->>'contact_consent')::boolean,false) is not true then raise exception 'Please allow our team to contact you about this request.'; end if;
  if nullif(trim(p_booking->>'email'),'') is not null and trim(p_booking->>'email') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Please check your email address.'; end if;
  v_category := p_booking->>'category';
  if v_category is null or v_category not in ('umrah','hajj','international','domestic') then raise exception 'Please choose your journey.'; end if;
  v_adults := (p_booking->>'adults')::integer;
  v_children := coalesce((p_booking->>'children')::integer,0);
  if v_adults is null or v_adults < 1 or v_children < 0 or v_children > 20 or v_adults + v_children > 100 then raise exception 'Please check your traveller count.'; end if;
  if jsonb_typeof(coalesce(p_booking->'child_ages','[]')) <> 'array' then raise exception 'Please check children’s ages.'; end if;
  select coalesce(array_agg(age::integer),'{}'::integer[]) into v_ages from jsonb_array_elements_text(coalesce(p_booking->'child_ages','[]')) age;
  if cardinality(v_ages) <> v_children or exists(select 1 from unnest(v_ages) age where age is null or age < 0 or age > 17) then raise exception 'Please tell us each child’s age (0–17).'; end if;
  v_city := trim(coalesce(p_booking->>'departure_city',''));
  if length(v_city) not between 2 and 80 then raise exception 'Please tell us your departure city.'; end if;
  v_date := nullif(p_booking->>'preferred_date','')::date;
  v_month := nullif(p_booking->>'preferred_month','');
  if v_date < current_date then raise exception 'Please choose a future travel date.'; end if;
  if v_month is not null and (v_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' or v_month < to_char(current_date,'YYYY-MM')) then raise exception 'Please choose a current or future month.'; end if;
  if not coalesce((p_booking->>'dates_flexible')::boolean,true) and v_date is null then raise exception 'Please choose your travel date or select flexible dates.'; end if;
  if nullif(p_booking->>'package_id','') is not null then
    select * into v_package from public.travel_packages p where p.id = (p_booking->>'package_id')::uuid and p.is_active and p.category = v_category for share;
    if not found then raise exception 'This package is no longer available. Please choose another.'; end if;
  end if;
  if nullif(p_booking->>'departure_id','') is not null then
    select * into v_departure from public.travel_departures d where d.id = (p_booking->>'departure_id')::uuid and d.package_id = v_package.id and d.is_active and d.start_date >= current_date for share;
    if not found then raise exception 'This departure is no longer available. Please choose another.'; end if;
    if v_departure.capacity is not null and v_adults + v_children > v_departure.capacity then raise exception 'Please contact our team about a larger group.'; end if;
    v_date := v_departure.start_date;
    v_city := v_departure.departure_city;
  end if;
  v_preferences := coalesce(p_booking->'preferences','{}');
  if jsonb_typeof(v_preferences) <> 'object'
    or coalesce(v_preferences->>'room','shared') not in ('shared','twin','private')
    or coalesce(v_preferences->>'stay','comfort') not in ('standard','comfort','premium')
    or jsonb_typeof(coalesce(v_preferences->'assistance','[]')) <> 'array'
    or exists(select 1 from jsonb_array_elements_text(coalesce(v_preferences->'assistance','[]')) item where item is null or item not in ('mobility','nearby-hotel','guidance','child-seat'))
    then raise exception 'Please review your travel preferences.'; end if;
  if length(coalesce(p_booking->>'notes','')) > 2000 or length(coalesce(p_booking->>'email','')) > 254 then raise exception 'Please shorten your contact details or notes.'; end if;
  insert into public.travel_booking_requests (
    request_token, customer_id, customer_name, phone, email, category, package_id, departure_id,
    departure_city, preferred_date, preferred_month, dates_flexible, adults, children, child_ages,
    preferences, package_snapshot, estimated_adult_total, notes
  ) values (
    v_token, auth.uid(), v_name, v_phone, nullif(trim(p_booking->>'email'),''), v_category, v_package.id, v_departure.id,
    v_city, v_date, v_month, case when v_departure.id is not null then false else coalesce((p_booking->>'dates_flexible')::boolean,true) end,
    v_adults, v_children, v_ages,
    jsonb_build_object('room',coalesce(v_preferences->>'room','shared'),'stay',coalesce(v_preferences->>'stay','comfort'),'assistance',coalesce(v_preferences->'assistance','[]')),
    case when v_package.id is null then jsonb_build_object('name','Custom journey') else jsonb_build_object('name',v_package.name,'slug',v_package.slug,'places',v_package.places,'duration',v_package.duration,'inclusions',v_package.inclusions,'exclusions',v_package.exclusions,'itinerary',v_package.itinerary,'price_per_adult',v_package.price_per_adult,'cancellation_terms',v_package.cancellation_terms) end,
    v_package.price_per_adult * v_adults, coalesce(p_booking->>'notes','')
  ) returning travel_booking_requests.booking_reference into v_reference;
  return query select v_reference;
end;
$$;
revoke all on function public.submit_travel_booking(jsonb) from public;
grant execute on function public.submit_travel_booking(jsonb) to anon, authenticated;

-- Existing itinerary ideas become editable, quote-only catalogue records.
insert into public.travel_packages (slug,category,name,tagline,places,duration,description,image_url,highlights,itinerary,is_active,sort_order) values
('classic-umrah','umrah','The Essential Umrah','A thoughtful first journey','Makkah & Madinah','Suggested 10–14 days','Time for worship, a comfortable rhythm, and a stay in both holy cities. Shape the journey around your family and your preferred dates.','/travel/makkah.jpg',ARRAY['Makkah & Madinah stays','Airport & intercity transfers','Visa and permit guidance','Room sharing options']::text[],'[["Arrive & settle in","Discuss flight options, arrival transfers and your preferred hotel in Makkah."],["Time in Makkah","Allow time for Umrah and worship, with optional visits discussed in your itinerary."],["Continue to Madinah","Plan your transfer and stay near the Prophet’s Mosque. Rawdah access is subject to official appointment availability."],["Return home","Confirm your final transfer, baggage allowance and return flight before booking."]]'::jsonb,true,0),
('private-umrah','umrah','Umrah, at Your Pace','For families & private groups','Makkah & Madinah','Flexible duration','A more personal itinerary with room preferences, a gentler pace and the practical details that matter when travelling with parents or children.','/travel/madinah.jpg',ARRAY['Private itinerary planning','Hotel distance preferences','Family room requests','Accessibility requests']::text[],'[["Your priorities","Share your dates, group size, mobility needs and preferred pace."],["Your stay","Compare hotel names, actual walking distances and room occupancy before you choose."],["Your journey","Discuss private or shared transfers, meals and optional visits."],["Your confirmation","Review a written itinerary, inclusions, cancellation terms and total quotation."]]'::jsonb,true,1),
('hajj-planning','hajj','Your Hajj Preparation','Guidance & planning','Makkah, Mina, Arafat & Muzdalifah','Seasonal pilgrimage','Start with the correct application route, current eligibility and official arrangements. Hajj enquiries are handled separately from Umrah.','/travel/makkah.jpg',ARRAY['Official application resources','Document preparation','Health requirement checklist','Questions for your operator']::text[],'[["Check the official route","Review Haj Committee of India guidance or the applicable authorised operator route."],["Prepare your documents","Verify passport, application and medical requirements using the current official guidance."],["Understand arrangements","Request written details for accommodation, transport, camp arrangements and assistance."],["Confirm before payment","Hajj requires the appropriate authorisation. An enquiry does not reserve a place or confirm eligibility."]]'::jsonb,true,2),
('dubai-discovery','international','Dubai & Beyond','City escapes','Dubai & Abu Dhabi','Suggested 5–7 days','Modern skylines, a slower evening by the water and time to explore. Choose the balance of sightseeing and relaxation that suits you.','/travel/dubai.jpg',ARRAY['Hotel preferences','Flight options','Optional city experiences','Visa guidance']::text[],'[["Arrive in Dubai","Choose your hotel area and arrival transfer."],["Discover the city","Discuss sightseeing, waterfront walks and optional attractions."],["Explore further","Add an Abu Dhabi visit or a free day at your own pace."],["Head home","Arrange your return transfer and flight."]]'::jsonb,true,3),
('kerala-retreat','domestic','A Little Time in Kerala','Nature & slower days','Kochi, Munnar & Alleppey','Suggested 5–6 days','Tea-covered hills, peaceful backwaters and a change of pace. An easy starting point for a family holiday or a private getaway.','/travel/kerala.jpg',ARRAY['Flexible sightseeing','Stay preferences','Private vehicle requests','Houseboat options']::text[],'[["A warm welcome in Kochi","Begin with a comfortable arrival and time to settle in."],["Into the hills","Explore Munnar with a route and pace matched to your group."],["By the backwaters","Discuss a houseboat experience or a relaxed stay near Alleppey."],["Return refreshed","Plan the drive back around your flight or train."]]'::jsonb,true,4);

commit;
