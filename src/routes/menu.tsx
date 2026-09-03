"use client";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { menuFilters } from "@/lib/data";
import { usePlan } from "@/lib/plan-store";
import { FoodCard } from "@/components/FoodCard";
import { BottomSheet, Button, ChoiceCard, Chip, EmptyState } from "@/components/ui-kit";

const routeMetadata = {
  head: () => ({
    meta: [
      { title: "Catering Menu — Biryani, Kebabs & More | Majlise Aala" },
      {
        name: "description",
        content:
          "Browse the Majlise Aala Halal catering menu: dum biryani, kebabs, main courses, breads, desserts and live counters.",
      },
      { property: "og:title", content: "Catering Menu | Majlise Aala" },
      {
        property: "og:description",
        content: "Halal catering dishes crafted for gatherings big and small.",
      },
    ],
  }),
  component: MenuPage,
};

export default function MenuPage() {
  const [category, setCategory] = useState<string>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [diet, setDiet] = useState<string[]>([]);
  const [onlyBestsellers, setOnlyBestsellers] = useState(false);
  const { itemCount, dishes } = usePlan();

  const list = useMemo(
    () =>
      dishes.filter((d) => {
        if (category !== "All" && d.categoryId !== category) return false;
        if (diet.includes("Veg") && d.diet !== "veg") return false;
        if (diet.includes("Non-Veg") && d.diet !== "nonveg") return false;
        if (onlyBestsellers && !d.tags?.includes("bestseller")) return false;
        if (
          search.trim() &&
          !`${d.name} ${d.description}`.toLowerCase().includes(search.trim().toLowerCase())
        )
          return false;
        return true;
      }),
    [category, diet, dishes, onlyBestsellers, search],
  );

  const toggleDiet = (v: string) =>
    setDiet((p) =>
      p.includes(v)
        ? p.filter((x) => x !== v)
        : [...p.filter((x) => x !== (v === "Veg" ? "Non-Veg" : "Veg")), v],
    );

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
      <section className="relative overflow-hidden rounded-[30px] bg-primary px-5 pb-20 pt-6 text-primary-foreground shadow-[0_18px_36px_rgba(41,32,20,0.18)] sm:px-7 sm:pb-24 sm:pt-8">
        <span className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-gold/15" />
        <span className="pointer-events-none absolute -bottom-32 -left-16 h-56 w-72 rounded-[50%] border-[26px] border-primary-foreground/10" />
        <p className="relative text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
          The Majlise Aala kitchen
        </p>
        <div className="relative mt-3 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[34px] leading-[0.95] sm:text-[42px]">
              Build your event menu
            </h1>
            <p className="mt-2 max-w-md text-[14px] text-primary-foreground/75">
              Browse dishes, then shape a menu that suits your guests and occasion.
            </p>
          </div>
          <span className="hidden rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-2 text-[12px] font-semibold sm:block">
            Catering made simple
          </span>
        </div>
        <label className="relative mt-6 flex h-12 items-center gap-3 rounded-[16px] border border-primary-foreground/20 bg-primary-foreground/10 px-4 text-primary-foreground backdrop-blur-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search dishes for your event..."
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-primary-foreground/60"
          />
        </label>
      </section>

      <div className="sticky top-16 z-40 -mx-1 -mt-12 rounded-[24px] border border-border bg-card px-4 py-3 shadow-[0_12px_28px_rgba(55,42,25,0.12)] backdrop-blur-md sm:mx-0 sm:px-5 lg:top-[84px]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="no-scrollbar flex min-w-0 gap-2 overflow-x-auto">
            {menuFilters.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </div>
          <button
            onClick={() => setFiltersOpen(true)}
            className="press grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-card"
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nothing matches those filters."
            note="Try clearing a filter or choosing another category."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setDiet([]);
                  setOnlyBestsellers(false);
                  setCategory("All");
                }}
              >
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((d) => (
            <FoodCard key={d.id} dish={d} />
          ))}
        </div>
      )}

      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-[104px] z-50 px-5 lg:bottom-6">
          <div className="mx-auto max-w-md">
            <Link href="/my-menu">
              <Button size="lg" full>
                {itemCount} {itemCount === 1 ? "dish" : "dishes"} selected • Review My Catering
              </Button>
            </Link>
          </div>
        </div>
      )}

      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        footer={
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setDiet([]);
                setOnlyBestsellers(false);
              }}
            >
              Clear All
            </Button>
            <Button size="lg" onClick={() => setFiltersOpen(false)}>
              Show {list.length} Items
            </Button>
          </div>
        }
      >
        <p className="eyebrow mt-2">Food type</p>
        <div className="mt-3 grid gap-2">
          {["Veg", "Non-Veg"].map((v) => (
            <ChoiceCard
              key={v}
              title={v}
              selected={diet.includes(v)}
              onClick={() => toggleDiet(v)}
            />
          ))}
        </div>
        <p className="eyebrow mt-6">Popularity</p>
        <div className="mt-3 grid gap-2">
          <ChoiceCard
            title="Bestsellers only"
            selected={onlyBestsellers}
            onClick={() => setOnlyBestsellers((v) => !v)}
          />
        </div>
      </BottomSheet>
    </main>
  );
}
