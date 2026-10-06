"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { z } from "zod";

const storageKey = "ma-travel-saved-packages-v1";
const savedPackageSchema = z
  .object({
    packageId: z.string().uuid(),
    adults: z.number().int().min(1).max(100),
    children: z.number().int().min(0).max(20),
    seniors: z.number().int().min(0).max(100),
    savedAt: z.number().finite().nonnegative(),
  })
  .refine((item) => item.adults + item.children <= 100 && item.seniors <= item.adults);
const schema = z.array(savedPackageSchema).max(50);
export type SavedTravelPackage = z.infer<typeof savedPackageSchema>;
type Selection = Omit<SavedTravelPackage, "savedAt">;
type SavedPackagesContext = {
  items: SavedTravelPackage[];
  ready: boolean;
  savePackage: (selection: Selection) => void;
  removePackage: (id: string) => void;
};
const Context = createContext<SavedPackagesContext | null>(null);

function readSaved(): SavedTravelPackage[] {
  try {
    const result = schema.safeParse(JSON.parse(localStorage.getItem(storageKey) || "[]"));
    return result.success
      ? [...new Map(result.data.map((item) => [item.packageId, item])).values()]
      : [];
  } catch {
    return [];
  }
}

export function TravelSavedPackagesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SavedTravelPackage[]>([]);
  const [ready, setReady] = useState(false);
  const records = useRef<SavedTravelPackage[]>([]);
  const hydrated = useRef(false);
  useEffect(() => {
    const sync = () => {
      records.current = readSaved();
      hydrated.current = true;
      setItems(records.current);
      setReady(true);
    };
    sync();
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) sync();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const write = useCallback((next: SavedTravelPackage[]) => {
    records.current = next;
    hydrated.current = true;
    setItems(next);
    setReady(true);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Saving still works for this visit when browser storage is unavailable.
    }
  }, []);
  const savePackage = useCallback(
    (selection: Selection) => {
      const parsed = savedPackageSchema.safeParse({ ...selection, savedAt: Date.now() });
      if (!parsed.success) return;
      const current = hydrated.current ? records.current : readSaved();
      const existing = current.find((item) => item.packageId === selection.packageId);
      if (
        existing &&
        existing.adults === selection.adults &&
        existing.children === selection.children &&
        existing.seniors === selection.seniors
      )
        return;
      write(
        [parsed.data, ...current.filter((item) => item.packageId !== selection.packageId)].slice(
          0,
          50,
        ),
      );
    },
    [write],
  );
  const removePackage = useCallback(
    (id: string) => {
      write(
        (hydrated.current ? records.current : readSaved()).filter((item) => item.packageId !== id),
      );
    },
    [write],
  );
  return (
    <Context.Provider value={{ items, ready, savePackage, removePackage }}>
      {children}
    </Context.Provider>
  );
}

export function useSavedTravelPackages() {
  const value = useContext(Context);
  if (!value) throw new Error("Travel saved packages require the travel layout");
  return value;
}

export function TravelSavedPackagesLink() {
  const { items } = useSavedTravelPackages();
  return (
    <Link
      href="/travel/saved"
      aria-label={`Saved travel packages${items.length ? `, ${items.length} saved` : ""}`}
      className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground hover:border-gold"
    >
      <Heart
        size={20}
        strokeWidth={1.75}
        className={items.length ? "fill-gold/20 text-gold" : ""}
      />
      {items.length > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
        >
          {items.length}
        </span>
      )}
    </Link>
  );
}
