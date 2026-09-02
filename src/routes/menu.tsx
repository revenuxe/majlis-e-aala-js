import { createFileRoute, Link } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { dishes, menuFilters } from "@/lib/data";
import { usePlan } from "@/lib/plan-store";
import { FoodCard } from "@/components/FoodCard";
import {
  BottomSheet,
  Button,
  ChoiceCard,
  Chip,
  EmptyState,
  SectionHeader,
} from "@/components/ui-kit";

export const Route = createFileRoute("/menu")({
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
});

function MenuPage() {
  const [category, setCategory] = useState<string>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [diet, setDiet] = useState<string[]>([]);
  const [onlyBestsellers, setOnlyBestsellers] = useState(false);
  const { itemCount } = usePlan();

  const list = useMemo(
    () =>
      dishes.filter((d) => {
        if (category !== "All" && d.categoryId !== category) return false;
        if (diet.includes("Veg") && d.diet !== "veg") return false;
        if (diet.includes("Non-Veg") && d.diet !== "nonveg") return false;
        if (onlyBestsellers && !d.tags?.includes("bestseller")) return false;
        return true;
      }),
    [category, diet, onlyBestsellers],
  );

  const toggleDiet = (v: string) =>
    setDiet((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p.filter((x) => x !== (v === "Veg" ? "Non-Veg" : "Veg")), v]));

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
      <SectionHeader
        eyebrow="Our kitchen"
        title="Explore the Menu"
        subtitle="Crafted for gatherings big and small."
      />

      <div className="sticky top-16 z-40 -mx-5 mt-6 bg-background/90 px-5 py-3 backdrop-blur-md sm:mx-0 sm:px-0 lg:top-[84px]">
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
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((d) => (
            <FoodCard key={d.id} dish={d} />
          ))}
        </div>
      )}

      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-[104px] z-50 px-5 lg:bottom-6">
          <div className="mx-auto max-w-md">
            <Link to="/my-menu">
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
