import type { Journey, TravelCategory } from "./travel";

export type TravelPackage = {
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
  cancellation_terms: string;
  is_active: boolean;
  sort_order: number;
};
export type TravelDeparture = {
  id: string;
  package_id: string;
  departure_city: string;
  start_date: string;
  end_date: string;
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
    name?: string;
    inclusions?: string[];
    exclusions?: string[];
    cancellation_terms?: string;
  };
  estimated_adult_total: number | null;
  quoted_total: number | null;
  notes: string;
  admin_notes: string;
  status: "new" | "contacted" | "quoted" | "confirmed" | "completed" | "cancelled";
  created_at: string;
};
export type TravelDraft = {
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
  departureId: string | null;
  room: "shared" | "twin" | "private";
  stay: "standard" | "comfort" | "premium";
  assistance: string[];
  notes: string;
  name: string;
  phone: string;
  email: string;
  consent: boolean;
};
export const initialTravelDraft: TravelDraft = {
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
  departureId: null,
  room: "shared",
  stay: "comfort",
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
    maximumFractionDigits: 0,
  }).format(value);
export const travelDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${value}T12:00:00`),
  );
export function packageJourney(pkg: TravelPackage): Journey {
  return {
    id: pkg.id,
    category: pkg.category,
    name: pkg.name,
    label: pkg.tagline,
    places: pkg.places,
    duration: pkg.duration,
    image: pkg.image_url || "/travel/makkah.jpg",
    description: pkg.description,
    highlights: pkg.highlights,
    itinerary: pkg.itinerary,
  };
}
