import type { Journey, TravelCategory } from "./travel";
import { packageGroupKeys } from "./travel-package-groups";

export type FlightOption = {
  id: string;
  airline: string;
  price_per_adult: number | null;
  notes: string;
};
export type TravelPackage = {
  flight_options?: FlightOption[];
  id: string;
  slug: string;
  category: TravelCategory;
  name: string;
  tagline: string;
  places: string;
  duration: string;
  description: string;
  image_url: string | null;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: [string, string][];
  price_per_adult: number | null;
  pricing_mode: "starting" | "seasonal" | "on_request";
  price_basis: string;
  pricing_note: string;
  collection: "core" | "combo" | "ramadan" | "ziyarat";
  cancellation_terms: string;
  is_active: boolean;
  sort_order: number;
};
export type TravelDeparture = {
  id: string;
  package_id: string;
  departure_city: string;
  start_date: string;
  end_date: string | null;
  capacity: number | null;
  is_active: boolean;
  notes: string;
};
export type TravelRequest = {
  id: string;
  booking_reference: string;
  customer_name: string;
  phone: string;
  email: string | null;
  category: TravelCategory;
  package_id: string | null;
  departure_id: string | null;
  departure_city: string;
  preferred_date: string | null;
  preferred_month: string | null;
  dates_flexible: boolean;
  adults: number;
  children: number;
  child_ages: number[];
  preferences: {
    room: string;
    stay: string;
    assistance: string[];
    seniors?: number;
    pace?: string;
  };
  package_snapshot: {
    flight_option?: FlightOption | null;
    name?: string;
    inclusions?: string[];
    exclusions?: string[];
    cancellation_terms?: string;
    price_per_adult?: number | null;
    price_basis?: string;
    pricing_mode?: string;
    pricing_note?: string;
  };
  estimated_adult_total: number | null;
  quoted_total: number | null;
  notes: string;
  admin_notes: string;
  status: "new" | "contacted" | "quoted" | "confirmed" | "completed" | "cancelled";
  created_at: string;
};
export type TravelDraft = {
  batchSelectionMade: boolean;
  category: TravelCategory | "";
  departureCity: string;
  datesFlexible: boolean;
  date: string;
  month: string;
  adults: number;
  children: number;
  childAges: number[];
  seniors: number;
  pace: "balanced" | "relaxed";
  packageId: string | null;
  flightOptionId: string | null;
  departureId: string | null;
  room: "package" | "shared" | "twin" | "private";
  stay: "package" | "standard" | "comfort" | "premium";
  assistance: string[];
  notes: string;
  name: string;
  phone: string;
  email: string;
  consent: boolean;
};
export const initialTravelDraft: TravelDraft = {
  batchSelectionMade: false,
  category: "",
  departureCity: "Bengaluru",
  datesFlexible: true,
  date: "",
  month: "",
  adults: 2,
  children: 0,
  childAges: [],
  seniors: 0,
  pace: "balanced",
  packageId: null,
  flightOptionId: null,
  departureId: null,
  room: "package",
  stay: "package",
  assistance: [],
  notes: "",
  name: "",
  phone: "",
  email: "",
  consent: false,
};
export const assistanceOptions = [
  {
    id: "mobility",
    label: "Mobility assistance",
    note: "Discuss accessible transfers or wheelchair needs.",
  },
  {
    id: "nearby-hotel",
    label: "A hotel closer to key places",
    note: "Especially helpful for parents and young children.",
  },
  {
    id: "guidance",
    label: "Guidance during the journey",
    note: "Ask about a guide or pilgrimage orientation.",
  },
  {
    id: "child-seat",
    label: "Child seat for transfers",
    note: "Availability and suitability will be confirmed.",
  },
];
export const travelMoney = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
export function packageAdultPrice(
  pkg: Pick<TravelPackage, "pricing_mode" | "price_per_adult" | "flight_options">,
): number | null {
  if (pkg.pricing_mode === "on_request") return null;
  if (!pkg.flight_options?.length) return pkg.price_per_adult;
  const prices = pkg.flight_options.flatMap((option) =>
    option.price_per_adult == null ? [] : [option.price_per_adult],
  );
  return prices.length ? Math.min(...prices) : null;
}
export const travelDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(`${value}T12:00:00`))
    .replace(/\s+/g, "-");
export function packageJourney(pkg: TravelPackage): Journey {
  return {
    id: pkg.id,
    category: pkg.category,
    name: pkg.name,
    label: pkg.tagline,
    places: pkg.places,
    duration: pkg.duration,
    image: pkg.image_url || "/travel/journey-placeholder.svg",
    description: pkg.description,
    highlights: pkg.highlights,
    itinerary: pkg.itinerary,
  };
}

export type TravelCatalogueFilter = {
  group?: string;
  search: string;
  collection: string;
  budget: string;
  sort: "recommended" | "price-low" | "price-high";
};
export const initialCatalogueFilter: TravelCatalogueFilter = {
  search: "",
  collection: "all",
  budget: "",
  sort: "recommended",
  group: "all",
};
export function filterTravelPackages(packages: TravelPackage[], filter: TravelCatalogueFilter) {
  const group =
    filter.group && packages.some((item) => packageGroupKeys(item).includes(filter.group!))
      ? filter.group
      : "all";
  const result = packages.filter(
    (pkg) =>
      `${pkg.name} ${pkg.places} ${pkg.description}`
        .toLowerCase()
        .includes(filter.search.trim().toLowerCase()) &&
      (filter.collection === "all" || pkg.collection === filter.collection) &&
      (group === "all" || packageGroupKeys(pkg).includes(group)) &&
      (!filter.budget ||
        (packageAdultPrice(pkg) != null &&
          Number(packageAdultPrice(pkg)) <= Number(filter.budget))),
  );
  if (filter.sort !== "recommended")
    result.sort((a, b) => {
      if (packageAdultPrice(a) == null) return packageAdultPrice(b) == null ? 0 : 1;
      if (packageAdultPrice(b) == null) return -1;
      const difference = Number(packageAdultPrice(a)) - Number(packageAdultPrice(b));
      return filter.sort === "price-low" ? difference : -difference;
    });
  return result;
}
