"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase custom tables are migrated ahead of generated types. */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { packageTotalFor, type CateringPackage, type Dish, type Occasion } from "./data";

export interface PlanItem {
  dishId: string;
  quantity: number;
}

export interface PlanState {
  occasion: string | null;
  date: string;
  guests: number;
  packageId: string | null;
  mode: "package" | "custom" | null;
  foodPreference: "nonveg" | "veg" | "mixed";
  servingStyle: string;
  services: string[];
  items: PlanItem[];
  contact: { name: string; phone: string; whatsapp: string; email: string };
  venue: { address: string; area: string; city: string; pincode: string; landmark: string };
}

export interface BookingSummary {
  reference: string;
  occasion: string;
  eventDate: string;
  guests: number;
  packageName: string;
  status: "new" | "contacted" | "quoted" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}
export interface CateringAddOn {
  id: string;
  name: string;
  description: string;
  eventCategoryIds: string[];
  packageIds: string[];
}

const initialState: PlanState = {
  occasion: null,
  date: "",
  guests: 100,
  packageId: null,
  mode: null,
  foodPreference: "mixed",
  servingStyle: "Traditional Service",
  services: ["Buffet Setup"],
  items: [],
  contact: { name: "", phone: "", whatsapp: "", email: "" },
  venue: { address: "", area: "", city: "Bengaluru", pincode: "", landmark: "" },
};

interface PlanContextValue {
  plan: PlanState;
  dishes: Dish[];
  packages: CateringPackage[];
  occasions: Occasion[];
  catalogLoading: boolean;
  update: (patch: Partial<PlanState>) => void;
  addItem: (dishId: string, quantity?: number) => void;
  setQuantity: (dishId: string, quantity: number) => void;
  removeItem: (dishId: string) => void;
  quantityOf: (dishId: string) => number;
  itemCount: number;
  foodTotal: number;
  bookings: BookingSummary[];
  addOns: CateringAddOn[];
  recordBooking: (booking: BookingSummary) => void;
  reset: () => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

const STORAGE_KEY = "majlise-aala-plan";
const BOOKINGS_STORAGE_KEY = "majlise-aala-bookings";
// Bump this whenever the catalogue structure or seeded package data changes,
// so customers never keep a retired package in local storage.
const CATALOG_CACHE_KEY = "majlise-aala-catalog-v2";
const CATALOG_CACHE_TTL = 5 * 60 * 1000;

export function servingsPerUnit(serves: string) {
  const values = [...serves.matchAll(/\d+/g)].map((match) => Number(match[0]));
  return Math.max(1, ...values);
}

export function recommendedTrays(guests: number, serves = "Serves 5") {
  return Math.max(1, Math.ceil(guests / servingsPerUnit(serves)));
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlanState>(initialState);
  const [catalogDishes, setCatalogDishes] = useState<Dish[]>([]);
  const [catalogPackages, setCatalogPackages] = useState<CateringPackage[]>([]);
  const [catalogOccasions, setCatalogOccasions] = useState<Occasion[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [addOns, setAddOns] = useState<CateringAddOn[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setPlan({ ...initialState, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (raw) setBookings(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user || cancelled) return;
      const profile = user.user_metadata["customer_profile"] as
        { contact?: PlanState["contact"]; venue?: PlanState["venue"] } | undefined;
      const { data: draft } = await (supabase as any)
        .from("customer_drafts")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const savedPlan = draft?.plan as Partial<PlanState> | undefined;
      setPlan((current) => ({
        ...current,
        ...savedPlan,
        contact: {
          ...current.contact,
          ...savedPlan?.contact,
          ...profile?.contact,
          email: profile?.contact?.email || current.contact.email || user.email || "",
        },
        venue: { ...current.venue, ...savedPlan?.venue, ...profile?.venue },
      }));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CATALOG_CACHE_KEY);
      if (!raw) return;
      const cached = JSON.parse(raw) as {
        dishes?: Dish[];
        packages?: CateringPackage[];
        occasions?: Occasion[];
      };
      if (cached.dishes?.length) setCatalogDishes(cached.dishes);
      if (cached.packages?.length) setCatalogPackages(cached.packages);
      if (cached.occasions?.length) setCatalogOccasions(cached.occasions);
    } catch {
      /* cache is optional */
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const cached = JSON.parse(window.localStorage.getItem(CATALOG_CACHE_KEY) ?? "null") as {
          savedAt?: number;
        } | null;
        if (cached?.savedAt && Date.now() - cached.savedAt < CATALOG_CACHE_TTL) return;
      } catch {
        /* refresh from the network */
      }
      try {
        const [
          categoriesResult,
          itemsResult,
          packagesResult,
          sectionsResult,
          sectionItemsResult,
          eventCategoriesResult,
          addOnsResult,
        ] = await Promise.all([
          supabase.from("menu_categories").select("id, name").order("sort_order"),
          supabase.from("menu_items").select("*").order("sort_order"),
          supabase.from("packages").select("*").order("sort_order"),
          supabase.from("package_sections").select("*").order("sort_order"),
          supabase.from("package_section_items").select("*").order("sort_order"),
          supabase.from("event_categories").select("*").order("sort_order"),
          (supabase as any).from("add_ons").select("*").eq("is_active", true).order("sort_order"),
        ]);

        if (
          categoriesResult.error ||
          itemsResult.error ||
          packagesResult.error ||
          sectionsResult.error ||
          sectionItemsResult.error ||
          eventCategoriesResult.error
        ) {
          return;
        }

        const categoryNames = new Map(
        categoriesResult.data.map((category) => [category.id, category.name]),
      );
        setCatalogOccasions(
        eventCategoriesResult.data.map((category) => ({
          id: category.id,
          name: category.name,
          image: category.image_url || "",
        })),
      );
        if (!addOnsResult.error)
        setAddOns(
          (addOnsResult.data ?? []).map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            eventCategoryIds: item.event_category_ids ?? [],
            packageIds: item.package_ids ?? [],
          })),
        );
        setCatalogDishes(
        itemsResult.data.map((item) => ({
          id: item.id,
          name: item.name,
          categoryId: item.category_id ? (categoryNames.get(item.category_id) ?? "Other") : "Other",
          description: item.description,
          price: item.price,
          serves: item.serves,
          diet: item.diet === "veg" ? "veg" : "nonveg",
          image: item.image_url || "",
          tags: item.tags.filter((tag): tag is NonNullable<Dish["tags"]>[number] =>
            ["bestseller", "premium", "most-loved"].includes(tag),
          ),
        })),
      );
        setCatalogPackages(
        packagesResult.data.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          tagline: pkg.tagline,
          pricePerMann: pkg.price_per_mann,
          guestsPerMann: pkg.guests_per_mann,
          guestCountFrom: pkg.guest_count_from ?? pkg.guests_per_mann,
          guestCountTo: pkg.guest_count_to ?? pkg.guests_per_mann,
          eventCategoryId: pkg.event_category_id,
          foodPreference:
            pkg.food_preference === "veg" || pkg.food_preference === "nonveg"
              ? pkg.food_preference
              : "mixed",
          includedServices: pkg.included_services,
          excludedServices: pkg.excluded_services,
          serviceOptions: pkg.service_options,
          signature: pkg.signature,
          sections: sectionsResult.data
            .filter((section) => section.package_id === pkg.id)
            .map((section) => ({
              title: section.title,
              items: sectionItemsResult.data
                .filter((item) => item.section_id === section.id)
                .map((item) => item.label),
            })),
        })),
        );
      } finally {
        setCatalogLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!catalogDishes.length && !catalogPackages.length && !catalogOccasions.length) return;
    try {
      window.localStorage.setItem(
        CATALOG_CACHE_KEY,
        JSON.stringify({
          savedAt: Date.now(),
          dishes: catalogDishes,
          packages: catalogPackages,
          occasions: catalogOccasions,
        }),
      );
    } catch {
      /* cache is optional */
    }
  }, [catalogDishes, catalogOccasions, catalogPackages]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {
      /* ignore */
    }
  }, [plan]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void supabase.auth.getUser().then(({ data }) => {
        if (!data.user) return;
        void (supabase as any)
          .from("customer_drafts")
          .upsert({ user_id: data.user.id, plan, updated_at: new Date().toISOString() });
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [plan]);

  useEffect(() => {
    try {
      window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch {
      /* ignore */
    }
  }, [bookings]);

  const value = useMemo<PlanContextValue>(() => {
    const update = (patch: Partial<PlanState>) => setPlan((p) => ({ ...p, ...patch }));

    const addItem = (dishId: string, quantity?: number) =>
      setPlan((p) => {
        const qty = quantity ?? recommendedTrays(p.guests);
        if (p.items.some((i) => i.dishId === dishId)) return p;
        return { ...p, items: [...p.items, { dishId, quantity: qty }] };
      });

    const setQuantity = (dishId: string, quantity: number) =>
      setPlan((p) => ({
        ...p,
        items:
          quantity <= 0
            ? p.items.filter((i) => i.dishId !== dishId)
            : p.items.map((i) => (i.dishId === dishId ? { ...i, quantity } : i)),
      }));

    const removeItem = (dishId: string) =>
      setPlan((p) => ({ ...p, items: p.items.filter((i) => i.dishId !== dishId) }));

    const quantityOf = (dishId: string) =>
      plan.items.find((i) => i.dishId === dishId)?.quantity ?? 0;

    const foodTotal = plan.items.reduce((sum, item) => {
      const dish = catalogDishes.find((d) => d.id === item.dishId);
      return sum + (dish ? dish.price * item.quantity : 0);
    }, 0);

    const pkg = catalogPackages.find((p) => p.id === plan.packageId);
    const packageTotal = pkg ? packageTotalFor(pkg, plan.guests) : 0;

    return {
      plan,
      dishes: catalogDishes,
      packages: catalogPackages,
      occasions: catalogOccasions,
      catalogLoading,
      update,
      addItem,
      setQuantity,
      removeItem,
      quantityOf,
      itemCount: plan.items.length,
      foodTotal: plan.mode === "package" ? packageTotal : foodTotal,
      bookings,
      addOns,
      recordBooking: (booking) =>
        setBookings((current) => [
          booking,
          ...current.filter((item) => item.reference !== booking.reference),
        ]),
      reset: () => setPlan(initialState),
    };
  }, [addOns, bookings, catalogDishes, catalogLoading, catalogOccasions, catalogPackages, plan]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
