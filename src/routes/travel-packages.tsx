"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
import { BrandLogo } from "@/components/Brand";
import { TravelNavigation } from "@/components/TravelNavigation";
import { TravelSavedPackagesLink } from "@/components/TravelSavedPackages";
import { TravelCountBanner } from "@/components/TravelCountBanner";
import { TravelPackageChoice } from "@/components/TravelPackageChoice";
import { TravelPackageGroups } from "@/components/TravelPackageGroups";
import { packageGroupKeys } from "@/lib/travel-package-groups";
import { useTravelCatalog } from "@/hooks/use-travel-catalog";
import {
  filterTravelPackages,
  initialCatalogueFilter,
  travelMoney,
  type TravelPackage,
} from "@/lib/travel-booking";
import { travelCategories, type TravelCategory } from "@/lib/travel";

const settings = {
  umrah: {
    title: "Your Umrah, thoughtfully planned.",
    note: "Compare sharing options, Ramadan journeys and Umrah combinations.",
    collections: [
      ["core", "Classic Umrah"],
      ["ramadan", "Ramadan"],
      ["combo", "Umrah + holiday"],
    ],
    budgets: [100000, 150000, 200000, 250000],
  },
  hajj: {
    title: "Your Hajj, guided with care.",
    note: "Explore Hajj tiers and preferred durations. Each enquiry depends on the authorised programme and operator arrangements.",
    collections: [],
    budgets: [500000, 600000, 750000, 1000000],
  },
  international: {
    title: "Discover a little further.",
    note: "Muslim-friendly holidays and heritage journeys, shaped around your family.",
    collections: [
      ["core", "Holidays"],
      ["ziyarat", "Ziyarat & heritage"],
    ],
    budgets: [50000, 75000, 100000, 150000],
  },
  domestic: {
    title: "Explore India, at your pace.",
    note: "Family escapes, halal-friendly travel and meaningful heritage journeys.",
    collections: [
      ["core", "Holidays"],
      ["ziyarat", "Domestic Ziyarat"],
    ],
    budgets: [20000, 25000, 35000, 50000],
  },
} as const;
const selectClass =
  "mt-2 h-12 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-gold";
export default function TravelPackages({
  category,
  initialPackages,
}: {
  category: TravelCategory;
  initialPackages?: TravelPackage[];
}) {
  const router = useRouter();
  const catalog = useTravelCatalog(initialPackages);
  const config = settings[category];
  const name = travelCategories.find((item) => item.id === category)!.name;
  const [filter, setFilter] = useState(initialCatalogueFilter);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [limit, setLimit] = useState(6);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const seniorCount = Math.min(seniors, adults);
  const [editingCount, setEditingCount] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    const requestedAdults = Number(params.get("travellers"));
    const requestedChildren = Number(params.get("children"));
    if (Number.isInteger(requestedAdults) && requestedAdults >= 1 && requestedAdults <= 100) {
      setAdults(requestedAdults);
      const requestedSeniors = Number(params.get("seniors"));
      if (
        Number.isInteger(requestedSeniors) &&
        requestedSeniors >= 0 &&
        requestedSeniors <= requestedAdults
      )
        setSeniors(requestedSeniors);
      if (
        Number.isInteger(requestedChildren) &&
        requestedChildren >= 0 &&
        requestedChildren <= 20 &&
        requestedAdults + requestedChildren <= 100
      )
        setChildren(requestedChildren);
    }
    if (query) setFilter((current) => ({ ...current, search: query.slice(0, 150) }));
  }, []);
  const packages = catalog.packages.filter((pkg) => pkg.category === category);
  const destinations = [
    ...new Set(
      packages
        .flatMap(packageGroupKeys)
        .filter((key) => key.startsWith("destination:"))
        .map((key) => key.slice(12)),
    ),
  ].sort();
  const durations = [...new Set(packages.map((pkg) => pkg.duration))];
  const visible = filterTravelPackages(packages, filter).filter(
    (pkg) =>
      (!destination || packageGroupKeys(pkg).includes(`destination:${destination}`)) &&
      (!duration || pkg.duration === duration),
  );
  const activeCount =
    Number(filter.collection !== "all") +
    Number(Boolean(filter.group && filter.group !== "all")) +
    Number(Boolean(filter.budget)) +
    Number(Boolean(destination)) +
    Number(Boolean(duration));
  function reset() {
    setFilter(initialCatalogueFilter);
    setDestination("");
    setDuration("");
    setLimit(6);
  }
  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-12">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-5 py-5">
          <Link href="/" className="min-w-0">
            <BrandLogo className="h-8 max-w-full" />
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <TravelSavedPackagesLink />
            <Link href="/travel/bookings" className="hidden text-sm font-semibold sm:block">
              My bookings
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1200px] px-5 py-4 sm:px-8 sm:py-6">
        <div>
          <TravelCountBanner
            category={category}
            adults={adults}
            children={children}
            seniors={seniorCount}
            onSeniors={setSeniors}
            editing={editingCount}
            onBack={() =>
              router.push(
                `/travel/packages?step=journey&travellers=${adults}&children=${children}&seniors=${seniorCount}`,
              )
            }
            onChange={() => setEditingCount(!editingCount)}
            onAdults={setAdults}
            onChildren={setChildren}
          />
        </div>
        <h1 className="mt-5 font-display text-[32px] leading-tight sm:text-[38px]">
          Choose a package
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Select the package that suits your journey.
        </p>
        <div className="mt-4">
          <TravelPackageGroups
            packages={packages}
            value={filter.group || "all"}
            loading={catalog.loading}
            onChange={(group) => {
              setFilter({ ...filter, group, collection: "all" });
              setDestination("");
              setLimit(6);
            }}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3">
            <Search size={17} className="shrink-0 text-muted-foreground" />
            <input
              type="search"
              aria-label={`Search ${name} packages`}
              placeholder={`Search ${name} packages`}
              value={filter.search}
              onChange={(e) => {
                setFilter({ ...filter, search: e.target.value });
                setLimit(6);
              }}
              className="min-w-0 w-full bg-transparent text-sm outline-none"
            />
          </label>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            aria-expanded={filtersOpen}
            aria-controls="package-filters"
            className="flex min-h-12 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeCount > 0 && (
              <span className="rounded-full bg-primary px-2 text-xs text-white">{activeCount}</span>
            )}
          </button>
        </div>
        {filtersOpen && (
          <section
            id="package-filters"
            aria-label={`${name} filters`}
            className="mt-3 rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Refine your {name} journey</h2>
              <button
                aria-label="Close filters"
                onClick={() => setFiltersOpen(false)}
                className="grid h-11 w-11 place-items-center"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {config.collections.length > 0 && (
                <label className="text-xs font-semibold">
                  {category === "umrah" ? "Umrah journey type" : "Journey style"}
                  <select
                    value={filter.collection}
                    onChange={(e) => {
                      setFilter({ ...filter, collection: e.target.value });
                      setLimit(6);
                    }}
                    className={selectClass}
                  >
                    <option value="all">All styles</option>
                    {config.collections.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {(category === "international" || category === "domestic") && (
                <label className="text-xs font-semibold">
                  Destination
                  <select
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setLimit(6);
                    }}
                    className={selectClass}
                  >
                    <option value="">All destinations</option>
                    {destinations.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              )}
              {(category === "hajj" || category === "umrah") && (
                <label className="text-xs font-semibold">
                  Preferred duration
                  <select
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value);
                      setLimit(6);
                    }}
                    className={selectClass}
                  >
                    <option value="">Any duration</option>
                    {durations.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              )}
              <label className="text-xs font-semibold">
                Starting budget per adult
                <select
                  value={filter.budget}
                  onChange={(e) => {
                    setFilter({ ...filter, budget: e.target.value });
                    setLimit(6);
                  }}
                  className={selectClass}
                >
                  <option value="">Any budget</option>
                  {config.budgets.map((amount) => (
                    <option key={amount} value={amount}>
                      Up to {travelMoney(amount)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Starting rates vary with dates and sharing. Price-on-request packages are excluded
              when a budget is selected.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setFiltersOpen(false)}
                className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white"
              >
                Show {visible.length} packages
              </button>
              <button onClick={reset} className="min-h-11 px-3 text-sm underline">
                Clear filters
              </button>
            </div>
          </section>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {catalog.loading ? "Loading packages…" : `${visible.length} packages`}
            {activeCount > 0 && (
              <button onClick={reset} className="ml-3 underline">
                Clear filters
              </button>
            )}
          </p>
          <label className="flex items-center gap-2 text-xs">
            Sort
            <select
              aria-label="Sort packages"
              value={filter.sort}
              onChange={(e) => {
                setFilter({ ...filter, sort: e.target.value as typeof filter.sort });
                setLimit(6);
              }}
              className="h-11 max-w-[190px] rounded-xl border border-border bg-card px-2 text-xs"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </label>
        </div>
        {catalog.error && (
          <div role="alert" className="mt-6 rounded-xl border p-5">
            {catalog.error}
            <button onClick={() => void catalog.reload()} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}
        {!catalog.loading && !catalog.error && !visible.length && (
          <div className="mt-6 rounded-2xl border border-border p-7">
            <h2 className="font-display text-2xl">Let’s find your journey.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try another destination or a wider budget.
            </p>
            <button onClick={reset} className="mt-4 min-h-11 underline">
              Reset filters
            </button>
          </div>
        )}
        <div className="mt-4 grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.slice(0, limit).map((pkg) => (
            <TravelPackageChoice
              key={pkg.id}
              pkg={pkg}
              adults={adults}
              children={children}
              seniors={seniorCount}
              onSelect={() =>
                router.push(
                  `/travel/plan?category=${category}&package=${pkg.id}&travellers=${adults}&children=${children}&seniors=${seniorCount}`,
                )
              }
            />
          ))}
        </div>
        {visible.length > limit && (
          <button
            onClick={() => setLimit(limit + 6)}
            className="mt-6 min-h-12 w-full rounded-xl border border-border text-sm font-semibold"
          >
            Show more packages ({visible.length - limit} remaining)
          </button>
        )}
        <div className="mt-6 rounded-2xl bg-surface p-6">
          <h2 className="font-display text-2xl">Prefer a journey made for you?</h2>
          <Link
            href={`/travel/plan?category=${category}&travellers=${adults}&children=${children}&seniors=${seniorCount}`}
            className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
          >
            Plan a custom journey
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
      <TravelNavigation />
    </div>
  );
}
