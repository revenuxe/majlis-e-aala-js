"use client";
import type { TravelCatalogueFilter } from "@/lib/travel-booking";
import type { TravelCategory } from "@/lib/travel";

const inputClass =
  "mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-gold";
export function TravelCatalogueControls({
  value,
  onChange,
  count,
  search = true,
  category,
}: {
  value: TravelCatalogueFilter;
  onChange: (value: TravelCatalogueFilter) => void;
  count: number;
  search?: boolean;
  category?: TravelCategory | "";
}) {
  return (
    <div>
      <details className="group rounded-2xl border border-border bg-background">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          <span>
            Search & filter packages{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </span>
          <span aria-hidden="true" className="transition-transform group-open:rotate-180">
            ⌄
          </span>
        </summary>
        <div className="grid gap-4 border-t border-border p-4 sm:grid-cols-3">
          {search && (
            <label className="text-xs font-semibold sm:col-span-3">
              Find your journey
              <input
                type="search"
                value={value.search}
                onChange={(e) => onChange({ ...value, search: e.target.value })}
                placeholder="Package or destination"
                className={inputClass}
              />
            </label>
          )}
          {category !== "hajj" && (
            <label className="text-xs font-semibold">
              Journey collection
              <select
                value={value.collection}
                onChange={(e) => onChange({ ...value, collection: e.target.value })}
                className={inputClass}
              >
                <option value="all">All collections</option>
                <option value="core">Classic journeys</option>
                {category === "umrah" && <option value="combo">Umrah combos</option>}
                {category === "umrah" && <option value="ramadan">Ramadan</option>}
                {category !== "umrah" && <option value="ziyarat">Ziyarat & heritage</option>}
              </select>
            </label>
          )}
          <label className="text-xs font-semibold">
            Starting budget per adult
            <select
              value={value.budget}
              onChange={(e) => onChange({ ...value, budget: e.target.value })}
              className={inputClass}
            >
              <option value="">Any budget</option>
              {category === "hajj" ? (
                <>
                  <option value="500000">Up to ₹5,00,000</option>
                  <option value="750000">Up to ₹7,50,000</option>
                  <option value="1000000">Up to ₹10,00,000</option>
                </>
              ) : category === "domestic" ? (
                <>
                  <option value="20000">Up to ₹20,000</option>
                  <option value="30000">Up to ₹30,000</option>
                  <option value="50000">Up to ₹50,000</option>
                </>
              ) : (
                <>
                  <option value="50000">Up to ₹50,000</option>
                  <option value="100000">Up to ₹1,00,000</option>
                  <option value="150000">Up to ₹1,50,000</option>
                  <option value="250000">Up to ₹2,50,000</option>
                </>
              )}
            </select>
          </label>
          <label className="text-xs font-semibold">
            Sort by
            <select
              value={value.sort}
              onChange={(e) =>
                onChange({ ...value, sort: e.target.value as TravelCatalogueFilter["sort"] })
              }
              className={inputClass}
            >
              <option value="recommended">Recommended order</option>
              <option value="price-low">Starting price: low to high</option>
              <option value="price-high">Starting price: high to low</option>
            </select>
          </label>
        </div>
      </details>
      <p aria-live="polite" className="mt-3 text-xs text-muted-foreground">
        {count} {count === 1 ? "journey" : "journeys"} found.{" "}
        {value.budget && "Price-on-request journeys are excluded by this budget filter."}
      </p>
    </div>
  );
}
