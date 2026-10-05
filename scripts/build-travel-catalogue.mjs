// Normalise the complete catalogue supplied by the owner on 6 October 2026.
// This script only writes local, reviewable seed data and its transactional migration.
import fs from "node:fs";
import assert from "node:assert/strict";
const catalogue = [];
const pricingNote =
  "Prices vary with travel dates, airline, hotel availability, room sharing, visa requirements and season. Final price is confirmed in your written quotation before booking.";
const exclusions = [
  "Personal expenses and shopping",
  "Room upgrades and private transport unless listed",
  "Extra baggage and optional activities",
  "Services not listed in your written quotation",
];
const umrahCore = [
  "Return airfare",
  "Umrah visa",
  "Travel insurance",
  "Makkah accommodation",
  "Madinah accommodation",
  "Airport transfers",
  "Makkah–Madinah transport",
  "Return airport transfer",
  "Makkah and Madinah ziyarat",
  "Umrah guidance",
  "Group coordinator",
  "Zamzam where permitted by airline and Saudi regulations",
];
const hajjCore = [
  "Return airfare",
  "Hajj visa / approved processing",
  "Makkah and Madinah accommodation",
  "Mina accommodation",
  "Arafat and Muzdalifah arrangements",
  "Mashaer transportation",
  "Meals",
  "Group coordinator",
  "Moallim / religious guidance",
  "Ziyarat",
  "Airport transfers",
  "Hajj kit",
  "Zamzam where permitted",
  "Emergency assistance",
];
function add(category, name, duration, price, places, inclusions, options = {}) {
  const slug =
    options.slug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const pilgrimage = category === "umrah" || category === "hajj";
  const stops = places.split(" → ");
  catalogue.push({
    slug,
    category,
    name,
    duration,
    price_per_adult: price,
    pricing_mode: price == null ? "on_request" : options.seasonal ? "seasonal" : "starting",
    price_basis: options.basis || "Per adult; room sharing confirmed in quotation",
    pricing_note: options.note ? `${options.note} ${pricingNote}` : pricingNote,
    collection: options.collection || "core",
    places,
    tagline: options.tagline || (pilgrimage ? "Guided with care" : "Muslim-friendly travel"),
    description:
      options.description ||
      `Explore ${places} with a journey planned around your family, travel dates and preferred pace. Exact services and arrangements are confirmed in your written quotation.`,
    image_url: options.image || (pilgrimage ? "/travel/makkah.jpg" : null),
    highlights: options.highlights || inclusions.slice(0, 4),
    inclusions,
    exclusions: options.exclusions || [
      ...exclusions,
      "Meals, flights and visas unless explicitly listed",
    ],
    itinerary:
      options.itinerary ||
      (category === "hajj"
        ? [
            [
              "Prepare through the appropriate route",
              "Verify eligibility, authorisation, visa processing and the approved operator arrangements.",
            ],
            [
              "Review your stay and pilgrimage arrangements",
              "Confirm hotels, room occupancy, Mina, Arafat, Muzdalifah and Mashaer transport in writing.",
            ],
            [
              "Complete your guided pilgrimage",
              "The exact sequence and schedule follow the approved Hajj programme.",
            ],
            [
              "Return arrangements",
              "Confirm departure, transfers and baggage details with your coordinator.",
            ],
          ]
        : stops.map((stop, index) => [
            stop,
            `${index === 0 ? "Begin" : "Continue"} your journey in ${stop}. Activities, nights and transfers follow the final agreed itinerary.`,
          ])),
    cancellation_terms:
      "Deposit, payment schedule, supplier cancellation charges and refund terms will be provided in your written quotation before confirmation.",
    is_active: true,
    sort_order: catalogue.length * 10,
  });
}
add(
  "umrah",
  "Umrah Economy",
  "14 Days / 13 Nights",
  89999,
  "Makkah → Madinah",
  ["Return economy airfare from Bengaluru", ...umrahCore.slice(1)],
  {
    basis: "Per adult · 4/5 sharing",
    highlights: [
      "4/5 sharing",
      "Flights, visa & insurance",
      "Makkah & Madinah stays",
      "Guided ziyarat",
    ],
    exclusions: [
      "Personal expenses",
      "Shopping",
      "Laundry",
      "Room service",
      "Private taxi",
      "Extra baggage",
      "Room upgrade",
      "Optional excursions",
      "Meals unless specifically mentioned",
    ],
  },
);
add(
  "umrah",
  "Umrah Standard",
  "14 Days / 13 Nights",
  104999,
  "Makkah → Madinah",
  [...umrahCore, "3/4-star hotels, exact names confirmed", "Breakfast"],
  {
    basis: "Per adult · 4 sharing",
    highlights: ["4 sharing", "3/4-star hotel plan", "Breakfast included", "Guided ziyarat"],
    exclusions: [
      "Lunch and dinner",
      "Personal expenses",
      "Shopping",
      "Laundry",
      "Room service",
      "Private transportation",
      "Extra baggage",
      "Optional activities",
    ],
  },
);
add(
  "umrah",
  "Umrah Comfort",
  "14 Days / 13 Nights",
  119999,
  "Makkah → Madinah",
  [
    "Return direct / selected economy airfare",
    ...umrahCore.slice(1),
    "4-star hotels, exact names confirmed",
    "Closer Makkah and Madinah accommodation, distances confirmed",
    "Breakfast and dinner",
    "Basic laundry",
  ],
  {
    basis: "Per adult · 4 sharing",
    highlights: ["4 sharing", "Closer hotel preferences", "Breakfast & dinner", "Basic laundry"],
    exclusions: [...exclusions, "Lunch", "Medical expenses"],
  },
);
add(
  "umrah",
  "Umrah Premium",
  "14 Days / 13 Nights",
  149999,
  "Makkah → Madinah",
  [
    ...umrahCore,
    "Premium 4/5-star hotels, names and distances confirmed",
    "Breakfast and dinner",
    "Comfortable transfers",
    "Dedicated group leader",
    "Laundry",
    "Elderly assistance, arrangements confirmed",
  ],
  {
    basis: "Per adult · Double/triple sharing",
    highlights: [
      "Double/triple sharing",
      "4/5-star hotel plan",
      "Breakfast & dinner",
      "Elderly assistance",
    ],
    exclusions: [...exclusions, "Lunch", "Medical expenses"],
  },
);
add(
  "umrah",
  "Umrah Luxury",
  "10–14 Days",
  189999,
  "Makkah → Madinah",
  [
    "Premium airline",
    "5-star hotels",
    "Haram-facing / near-Haram accommodation where available",
    "Premium Madinah hotel",
    "Private / premium transfers",
    "Breakfast and dinner",
    "Ziyarat",
    "Dedicated coordinator",
    "Umrah guide",
    "Laundry",
    "Zamzam where permitted",
    "Elderly / family assistance, arrangements confirmed",
  ],
  {
    basis: "Per adult · Double sharing",
    highlights: ["Double sharing", "5-star hotel plan", "Premium transfers", "Family assistance"],
    exclusions: [
      ...exclusions,
      "Visa and insurance scope to be confirmed",
      "Lunch",
      "Medical expenses",
    ],
  },
);
add(
  "umrah",
  "Short Umrah",
  "8 Days / 7 Nights",
  99999,
  "Makkah → Madinah",
  ["Flight", "Visa", "Hotels", "Transfers", "Ziyarat", "Umrah guidance", "Insurance"],
  {
    description:
      "A focused journey for pilgrims who cannot take two weeks away. Spend meaningful time in Makkah and Madinah with the essentials arranged around your dates.",
  },
);
add(
  "umrah",
  "Family Umrah",
  "14 Days",
  109999,
  "Makkah → Madinah",
  [
    "Family room options",
    "Elderly assistance",
    "Wheelchair assistance on request and subject to availability",
    "Family-friendly hotel planning",
    "Flexible transportation arrangements",
  ],
  {
    highlights: [
      "Family room options",
      "Parents & children",
      "Gentler pace",
      "Assistance requests",
    ],
    note: "Flight, visa, meals and full service scope must be confirmed for the chosen family arrangement.",
  },
);
for (const [name, price] of [
  ["First Ashra", 149999],
  ["Second Ashra", 169999],
  ["Last Ashra", 219999],
  ["Last 10 Nights", 249999],
])
  add(
    "umrah",
    `Ramadan Umrah — ${name}`,
    "12–15 Days",
    price,
    "Makkah → Madinah",
    [
      "Ramadan itinerary planning",
      "Makkah and Madinah accommodation planning",
      "Transfer and guidance arrangements to be confirmed",
    ],
    {
      slug: `ramadan-umrah-${name.toLowerCase().replaceAll(" ", "-")}`,
      seasonal: true,
      collection: "ramadan",
      tagline: "Seasonal Ramadan journey",
      note: "Seasonal guide only; Ramadan dates, hotels and flights must be re-quoted. Last ten nights and Laylatul Qadr arrangements are subject to availability.",
    },
  );
const combos = [
  [
    "Dubai",
    16,
    149999,
    "Dubai",
    [
      "Umrah package",
      "Dubai hotel",
      "Dubai visa",
      "Dubai city tour",
      "Desert safari",
      "Burj Khalifa",
      "Airport transfers",
      "Dubai sightseeing",
    ],
  ],
  [
    "Turkey",
    18,
    219999,
    "Istanbul → Bursa",
    [
      "Umrah",
      "Turkey visa assistance",
      "Flights",
      "Hotels",
      "Istanbul sightseeing",
      "Bursa",
      "Bosphorus",
      "Halal meals",
      "Muslim-friendly guide",
    ],
  ],
  [
    "Egypt",
    17,
    199999,
    "Cairo",
    [
      "Umrah",
      "Cairo and Islamic history sightseeing",
      "Pyramids",
      "Islamic Cairo",
      "Hotels",
      "Transfers",
    ],
  ],
  [
    "Azerbaijan",
    16,
    179999,
    "Baku",
    ["Umrah and Baku itinerary planning; exact service scope confirmed in quotation"],
  ],
  [
    "Iraq",
    18,
    199999,
    "Baghdad → Karbala → Najaf",
    [
      "Umrah and specialist ziyarat itinerary planning",
      "Visa and security arrangements reviewed for each departure",
    ],
  ],
  [
    "Al-Aqsa + Jordan",
    20,
    229999,
    "Amman → Jerusalem / Al-Aqsa",
    [
      "Umrah and heritage itinerary planning",
      "Visa, entry and route availability reviewed for each departure",
    ],
  ],
];
for (const [destination, days, price, places, includes] of combos)
  add(
    "umrah",
    `Umrah + ${destination}`,
    `${days} Days / ${days - 1} Nights`,
    price,
    `Makkah → Madinah → ${places}`,
    includes,
    {
      collection: "combo",
      tagline: "Umrah & beyond",
      note:
        destination === "Egypt"
          ? "Nile cruise is optional and quoted separately."
          : ["Iraq", "Al-Aqsa + Jordan"].includes(destination)
            ? "Specialist heritage enquiry; operation depends on confirmed visas, entry conditions and route arrangements."
            : undefined,
    },
  );
for (const [tier, price] of [
  ["Economy", 499999],
  ["Comfort", 599999],
  ["Premium", 749999],
  ["VIP", 999999],
])
  add(
    "hajj",
    `Hajj ${tier}`,
    "21 / 25 / 30 / 35 Days — programme confirmed",
    price,
    "Makkah → Mina → Arafat → Muzdalifah → Madinah",
    hajjCore,
    {
      basis: "Per adult · Programme and sharing confirmed",
      note: "Enquiry only. Subject to the applicable Saudi/Indian Hajj authorisation and approved operator arrangements; no place is reserved by this request.",
      exclusions: [
        "Personal shopping",
        "Personal expenses",
        "Private transportation",
        "Room upgrades",
        "Optional excursions",
        "Medical expenses",
        "Excess baggage",
        "Services outside package",
      ],
    },
  );
for (const days of [21, 25, 30, 35])
  add(
    "hajj",
    `${days}-Day Hajj`,
    `${days} Days`,
    null,
    "Makkah → Mina → Arafat → Muzdalifah → Madinah",
    hajjCore,
    {
      note: "Select a preferred duration; category, authorised programme and price are confirmed individually.",
      exclusions: [...exclusions, "Medical expenses"],
    },
  );
const international = [
  [
    "Dubai Essentials",
    5,
    49999,
    "Dubai",
    [
      "Flight",
      "Visa",
      "Hotel",
      "Breakfast",
      "Airport transfer",
      "Dubai city tour",
      "Desert safari",
      "Burj Khalifa",
    ],
  ],
  [
    "Dubai Premium",
    6,
    69999,
    "Dubai",
    [
      "Flight",
      "Visa",
      "Hotel",
      "Breakfast",
      "Airport transfer",
      "Dubai city tour",
      "Desert safari",
      "Burj Khalifa",
    ],
  ],
  [
    "Istanbul",
    6,
    79999,
    "Istanbul",
    [
      "Istanbul and Ottoman / Islamic heritage planning",
      "Halal food options",
      "Hotels",
      "Transfers",
    ],
  ],
  [
    "Turkey Highlights",
    8,
    109999,
    "Istanbul → Cappadocia → Bursa",
    [
      "Istanbul",
      "Cappadocia",
      "Bursa",
      "Bosphorus",
      "Ottoman / Islamic heritage",
      "Halal food options",
      "Hotels",
      "Transfers",
    ],
  ],
  [
    "Baku",
    5,
    59999,
    "Baku",
    ["Baku Old City", "Mosque / Islamic heritage", "Gobustan", "Hotels", "Breakfast", "Transfers"],
  ],
  [
    "Azerbaijan Explorer",
    6,
    69999,
    "Baku → Gabala / Shahdag",
    [
      "Baku Old City",
      "Mosque / Islamic heritage",
      "Gobustan",
      "Gabala / Shahdag, route confirmed",
      "Hotels",
      "Breakfast",
      "Transfers",
    ],
  ],
  [
    "Kuala Lumpur",
    5,
    49999,
    "Kuala Lumpur → Genting Highlands → Putrajaya",
    [
      "Kuala Lumpur",
      "Genting Highlands",
      "Putrajaya",
      "Batu Caves",
      "Halal food options",
      "Hotels",
      "Transfers",
    ],
  ],
  [
    "Malaysia Family",
    6,
    59999,
    "Kuala Lumpur → Genting Highlands → Putrajaya",
    [
      "Kuala Lumpur",
      "Genting Highlands",
      "Putrajaya",
      "Batu Caves",
      "Halal food options",
      "Hotels",
      "Transfers",
    ],
  ],
  ["Bali", 6, 59999, "Bali", []],
  ["Bali Premium", 7, 79999, "Bali", []],
  ["Singapore", 5, 69999, "Singapore", []],
  ["Singapore Family", 6, 79999, "Singapore", []],
  ["Bangkok + Pattaya", 5, 49999, "Bangkok → Pattaya", []],
  ["Thailand Family", 6, 59999, "Bangkok → Pattaya", []],
  [
    "Cairo",
    6,
    79999,
    "Cairo",
    [
      "Islamic Cairo",
      "Al-Azhar and historic mosques",
      "Pyramids",
      "Nile and Muslim heritage itinerary planning",
    ],
  ],
  [
    "Egypt Heritage",
    7,
    99999,
    "Cairo → Nile heritage route",
    [
      "Islamic Cairo",
      "Al-Azhar and historic mosques",
      "Pyramids",
      "Nile and Muslim heritage itinerary planning",
    ],
  ],
  [
    "Jordan Heritage",
    6,
    89999,
    "Amman → Petra → Dead Sea",
    ["Amman", "Petra", "Dead Sea", "Islamic heritage", "Aqaba where applicable"],
  ],
  [
    "Tashkent + Samarkand",
    6,
    69999,
    "Tashkent → Samarkand → Bukhara",
    [
      "Tashkent",
      "Samarkand",
      "Bukhara",
      "Islamic architecture",
      "Mosques and madrasas",
      "Halal food",
    ],
  ],
  [
    "Morocco Heritage",
    8,
    119999,
    "Marrakech → Casablanca → Rabat → Fes",
    ["Marrakech", "Casablanca", "Rabat", "Fes", "Islamic architecture and mosques", "Halal food"],
  ],
  [
    "Saudi Islamic Heritage",
    7,
    89999,
    "Jeddah → Madinah → AlUla → Riyadh",
    ["Saudi heritage itinerary planning; separate from Umrah"],
  ],
  [
    "Iraq Ziyarat",
    8,
    99999,
    "Baghdad → Karbala → Najaf → Kadhimiya",
    [
      "Specialist ziyarat itinerary planning",
      "Samarra visit where permitted and operationally available",
    ],
  ],
  [
    "Al-Aqsa & Jordan",
    9,
    129999,
    "Amman → Jerusalem / Al-Aqsa → Bethlehem → Dead Sea",
    ["Heritage itinerary planning", "Entry and route availability checked for each departure"],
  ],
  [
    "Muslim-Friendly Europe",
    8,
    139999,
    "Paris → Switzerland → Milan",
    [
      "Halal restaurant planning",
      "Muslim-friendly hotel preferences",
      "Prayer-friendly itinerary",
      "Mosque visits where practical",
    ],
  ],
];
for (const [name, days, price, places, includes] of international)
  add(
    "international",
    name,
    `${days} Days / ${days - 1} Nights`,
    price,
    places,
    includes.length
      ? includes
      : ["Destination itinerary planning; exact inclusions confirmed in quotation"],
    {
      image: name.startsWith("Dubai") ? "/travel/dubai.jpg" : undefined,
      collection: name === "Iraq Ziyarat" || name === "Al-Aqsa & Jordan" ? "ziyarat" : "core",
      note:
        name === "Iraq Ziyarat" || name === "Al-Aqsa & Jordan"
          ? "Specialist enquiry subject to confirmed visa, entry and operational arrangements."
          : undefined,
    },
  );
const domestic = [
  [
    "Kashmir Essentials",
    5,
    24999,
    "Srinagar → Gulmarg → Pahalgam → Sonamarg",
    ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg", "Dal Lake", "Houseboat", "Halal meals"],
  ],
  [
    "Kashmir Premium",
    6,
    34999,
    "Srinagar → Gulmarg → Pahalgam → Sonamarg",
    ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg", "Dal Lake", "Houseboat", "Halal meals"],
  ],
  [
    "Kerala Highlights",
    5,
    24999,
    "Kochi → Munnar → Thekkady → Alleppey",
    ["Kochi", "Munnar", "Thekkady", "Alleppey", "Halal food", "Hotels", "Transport"],
  ],
  [
    "Kerala Family",
    6,
    34999,
    "Kochi → Munnar → Thekkady → Alleppey",
    ["Kochi", "Munnar", "Thekkady", "Alleppey", "Halal food", "Hotels", "Transport"],
  ],
  [
    "Hyderabad Heritage",
    4,
    19999,
    "Hyderabad",
    ["Charminar", "Mecca Masjid", "Golconda", "Chowmahalla", "Muslim heritage", "Halal food tour"],
  ],
  [
    "Lucknow Muslim Heritage",
    4,
    21999,
    "Lucknow",
    ["Bara Imambara", "Chota Imambara", "Rumi Darwaza", "Islamic architecture", "Halal food"],
  ],
  [
    "Islamic & Mughal Heritage",
    4,
    24999,
    "Delhi → Agra",
    ["Jama Masjid", "Red Fort", "Humayun's Tomb", "Agra", "Taj Mahal", "Muslim heritage"],
  ],
  [
    "Goa Family",
    5,
    24999,
    "Goa",
    ["Family-friendly hotels", "Halal food", "Beaches", "Sightseeing", "Private transport"],
  ],
  ["Ooty Family Escape", 4, 19999, "Ooty", []],
  ["Andaman", 6, 39999, "Andaman", []],
  ["Manali", 6, 29999, "Manali", []],
  ["Shimla + Manali", 7, 34999, "Shimla → Manali", []],
  [
    "Rajasthan Heritage",
    6,
    34999,
    "Jaipur → Ajmer → Pushkar → Jodhpur",
    ["Heritage itinerary planning across Jaipur, Ajmer, Pushkar and Jodhpur"],
  ],
  [
    "Ajmer Ziyarat",
    3,
    14999,
    "Ajmer",
    ["Ajmer Sharif", "Dargah assistance", "Transport", "Hotel", "Meals", "Local ziyarat"],
  ],
  [
    "Multi-Ziyarat India",
    6,
    29999,
    "Delhi → Ajmer → Jaipur → Agra",
    ["Multi-city ziyarat and heritage itinerary planning"],
  ],
];
for (const [name, days, price, places, includes] of domestic)
  add(
    "domestic",
    name,
    `${days} Days / ${days - 1} Nights`,
    price,
    places,
    includes.length
      ? includes
      : ["Destination itinerary planning; exact inclusions confirmed in quotation"],
    {
      image: name.startsWith("Kerala") ? "/travel/kerala.jpg" : undefined,
      collection: name === "Ajmer Ziyarat" || name === "Multi-Ziyarat India" ? "ziyarat" : "core",
      tagline: "Muslim-friendly India",
    },
  );
assert.equal(catalogue.length, 63);
assert.equal(new Set(catalogue.map((p) => p.slug)).size, catalogue.length);
for (const p of catalogue) {
  assert(p.inclusions.length);
  assert(p.exclusions.length);
  assert(p.itinerary.length);
  assert(p.price_per_adult === null || p.price_per_adult > 0);
}
fs.mkdirSync("supabase/seed-data", { recursive: true });
fs.writeFileSync(
  "supabase/seed-data/travel-catalogue-20261006.json",
  JSON.stringify(
    { source: "Owner-supplied complete catalogue, 6 October 2026", packages: catalogue },
    null,
    2,
  ) + "\n",
);
const schema = `begin;
alter table public.travel_packages add column if not exists pricing_mode text not null default 'on_request';
alter table public.travel_packages add column if not exists price_basis text not null default 'Per adult; sharing confirmed in quotation';
alter table public.travel_packages add column if not exists pricing_note text not null default '${pricingNote}';
alter table public.travel_packages add column if not exists collection text not null default 'core';
update public.travel_packages set pricing_mode = case when price_per_adult is null then 'on_request' else 'starting' end;
alter table public.travel_packages add constraint travel_pricing_mode_check check (pricing_mode in ('starting','seasonal','on_request'));
alter table public.travel_packages add constraint travel_pricing_consistency_check check ((pricing_mode = 'on_request' and price_per_adult is null) or (pricing_mode in ('starting','seasonal') and price_per_adult is not null and price_per_adult >= 0));
alter table public.travel_packages add constraint travel_collection_check check (collection in ('core','combo','ramadan','ziyarat'));
alter table public.travel_packages add constraint travel_price_copy_check check (length(trim(price_basis)) between 1 and 200 and length(pricing_note) <= 1000);
-- Restricted before-image: restores the catalogue without touching customer requests.
create table public.travel_catalogue_imports (import_key text primary key, source_name text not null, imported_at timestamptz not null default now(), previous_catalogue jsonb not null);
alter table public.travel_catalogue_imports enable row level security;
revoke all on public.travel_catalogue_imports from anon, authenticated;
grant select on public.travel_catalogue_imports to authenticated;
create policy "Admins inspect catalogue imports" on public.travel_catalogue_imports for select to authenticated using (public.has_role(auth.uid(),'admin'));
insert into public.travel_catalogue_imports(import_key,source_name,previous_catalogue) select 'owner-catalogue-20261006','Owner-supplied complete catalogue, 6 October 2026',coalesce(jsonb_agg(to_jsonb(p)),'[]'::jsonb) from public.travel_packages p;
-- Rename original ideas in place so their UUIDs and linked bookings/departures survive.
update public.travel_packages p set slug = map.new_slug from (values
  ('classic-umrah','umrah-economy'),('private-umrah','family-umrah'),('hajj-planning','hajj-economy'),('dubai-discovery','dubai-essentials'),('kerala-retreat','kerala-highlights')
) map(old_slug,new_slug) where p.slug = map.old_slug and not exists(select 1 from public.travel_packages q where q.slug = map.new_slug);
`;
const columns = Object.keys(catalogue[0]);
const textArrays = ["highlights", "inclusions", "exclusions"];
const definitions = columns
  .map(
    (k) =>
      `${k} ${textArrays.includes(k) ? "text[]" : k === "itinerary" ? "jsonb" : k === "price_per_adult" ? "numeric" : k === "is_active" ? "boolean" : k === "sort_order" ? "integer" : "text"}`,
  )
  .join(",\n  ");
const upsert = `insert into public.travel_packages (${columns.join(", ")})
select ${columns.join(", ")} from jsonb_to_recordset($catalogue$${JSON.stringify(catalogue)}$catalogue$::jsonb) as packages(
  ${definitions}
)
on conflict(slug) do update set ${columns
  .filter((k) => k !== "slug")
  .map((k) => `${k} = excluded.${k}`)
  .join(",\n  ")};
`;
let rpc = fs.readFileSync(
  "supabase/migrations/20261006030000_travel_senior_preferences.sql",
  "utf8",
);
rpc = rpc.slice(rpc.indexOf("create or replace function"), rpc.indexOf("\ncommit;"));
rpc = rpc.replace(
  "'price_per_adult',v_package.price_per_adult",
  "'price_per_adult',v_package.price_per_adult,'price_basis',v_package.price_basis,'pricing_mode',v_package.pricing_mode,'pricing_note',v_package.pricing_note,'duration',v_package.duration",
);
// The earlier snapshot already includes duration: do not introduce duplicate JSON keys.
rpc = rpc.replace(
  "'pricing_note',v_package.pricing_note,'duration',v_package.duration",
  "'pricing_note',v_package.pricing_note",
);
fs.writeFileSync(
  "supabase/migrations/20261006040000_owner_travel_catalogue.sql",
  schema + upsert + rpc + "\ncommit;\n",
);
console.log(
  `Prepared ${catalogue.length} packages: ${JSON.stringify(Object.fromEntries(["umrah", "hajj", "international", "domestic"].map((c) => [c, catalogue.filter((p) => p.category === c).length])))}. No remote writes.`,
);
