import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dishes, packageTotalFor, packages, type Dish } from "./data";

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

const initialState: PlanState = {
  occasion: null,
  date: "",
  guests: 100,
  packageId: null,
  mode: null,
  foodPreference: "mixed",
  servingStyle: "Buffet",
  services: ["Buffet Setup"],
  items: [],
  contact: { name: "", phone: "", whatsapp: "", email: "" },
  venue: { address: "", area: "", city: "Bengaluru", pincode: "", landmark: "" },
};

interface PlanContextValue {
  plan: PlanState;
  update: (patch: Partial<PlanState>) => void;
  addItem: (dishId: string, quantity?: number) => void;
  setQuantity: (dishId: string, quantity: number) => void;
  removeItem: (dishId: string) => void;
  quantityOf: (dishId: string) => number;
  itemCount: number;
  foodTotal: number;
  reset: () => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

const STORAGE_KEY = "majlise-aala-plan";

export function recommendedTrays(guests: number) {
  return Math.max(1, Math.ceil(guests / 5));
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlanState>(initialState);

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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {
      /* ignore */
    }
  }, [plan]);

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
      const dish = dishes.find((d) => d.id === item.dishId);
      return sum + (dish ? dish.price * item.quantity : 0);
    }, 0);

    const pkg = packages.find((p) => p.id === plan.packageId);
    const packageTotal = pkg ? packageTotalFor(pkg, plan.guests) : 0;

    return {
      plan,
      update,
      addItem,
      setQuantity,
      removeItem,
      quantityOf,
      itemCount: plan.items.length,
      foodTotal: plan.mode === "package" ? packageTotal : foodTotal,
      reset: () => setPlan(initialState),
    };
  }, [plan]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function dishById(id: string): Dish | undefined {
  return dishes.find((d) => d.id === id);
}
