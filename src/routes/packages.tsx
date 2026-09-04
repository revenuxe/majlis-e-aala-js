"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronDown, Search, Sparkles } from "lucide-react";
import {
  inr,
  mannsFor,
  packageGuestFit,
  packageGuestRange,
  packageTotalFor,
  perGuestFor,
  type CateringPackage,
} from "@/lib/data";
import { usePlan } from "@/lib/plan-store";
import { Button, QuantitySelector, SectionHeader, cx } from "@/components/ui-kit";

const routeMetadata = {
  head: () => ({
    meta: [
      { title: "Catering Packages — Classic to Royal | Majlise Aala" },
      {
        name: "description",
        content:
          "Halal catering packages quoted per Mann (100 guests): Classic, Supreme, Deluxe and Royal — with full menus, refreshment stations and grand table.",
      },
      { property: "og:title", content: "Catering Packages per Mann | Majlise Aala" },
      {
        property: "og:description",
        content:
          "Classic ₹1,00,000 to Royal ₹1,75,000 per Mann — complete Halal wedding catering menus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PackagesPage,
};

export default function PackagesPage() {
  const { plan, update, packages, occasions, catalogLoading } = usePlan();
  const navigate = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState("");
  const [search, setSearch] = useState("");
  const [editingGuests, setEditingGuests] = useState(false);
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);
  const [expandedSectionKey, setExpandedSectionKey] = useState<string | null>(null);
  useEffect(() => {
    if (packages.length > 0 && !packages.some((pkg) => pkg.id === active)) {
      setActive(packages[0]!.id);
    }
  }, [active, packages]);

  if (catalogLoading && packages.length === 0) {
    return <PackagesLoading />;
  }

  if (packages.length === 0) {
    return (
      <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
        <SectionHeader
          eyebrow="Catering packages"
          title="Packages are being prepared"
          subtitle="Our current packages will appear here once they have been added by the catering team."
        />
        <Link href="/plan" className="mt-7 inline-block">
          <Button size="lg">Plan a Custom Menu</Button>
        </Link>
      </main>
    );
  }

  const current = packages.find((p) => p.id === active) ?? packages[0]!;
  const manns = mannsFor(plan.guests, current.guestsPerMann);

  const choose = (p: CateringPackage) => {
    update({
      packageId: p.id,
      mode: "package",
      occasion: p.eventCategoryId ?? plan.occasion,
      foodPreference: p.foodPreference ?? "mixed",
      services: p.includedServices ?? [],
    });
    navigate.push("/my-menu");
  };

  const categorySlug = pathname.split("/")[2] ?? null;
  const occasion = categorySlug
    ? occasions.find((item) => item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === categorySlug)
    : null;
  const viewingPackages = searchParams.get("view") === "packages";
  const searchQuery = searchParams.get("q")?.trim() ?? "";
  const matchingPackages = searchQuery
    ? packages.filter((pkg) =>
        `${pkg.name} ${pkg.tagline} ${pkg.sections.flatMap((section) => [section.title, ...section.items]).join(" ")}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      )
    : [];

  if (searchQuery) {
    return (
      <main className="mx-auto max-w-[860px] px-5 py-8 pb-32 sm:px-8">
        <button
          onClick={() => navigate.push("/packages")}
          className="press text-[13px] font-semibold text-gold"
        >
          ← Browse event categories
        </button>
        <SectionHeader
          eyebrow="Package search"
          title={`Results for “${searchQuery}”`}
          subtitle={
            matchingPackages.length
              ? "Choose a result to view its price and full inclusions."
              : "Try an event name, package name, or an included menu item."
          }
        />
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {matchingPackages.map((pkg) => {
            const event = occasions.find((item) => item.id === pkg.eventCategoryId);
            const slug = event?.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => {
                  if (!event || !slug) return;
                  update({ occasion: event.id, packageId: null, mode: "package" });
                  navigate.push(`/packages/${slug}?view=packages`);
                }}
                className="press rounded-[20px] border border-border bg-card p-5 text-left shadow-card transition-colors hover:border-gold/60"
              >
                <p className="eyebrow text-gold">{event?.name ?? "Catering package"}</p>
                <h2 className="mt-2 font-display text-[27px] leading-tight">{pkg.name}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                  {pkg.tagline}
                </p>
                <p className="mt-4 text-[13px] font-semibold text-foreground">
                  {pkg.sections
                    .map((section) => section.title)
                    .slice(0, 4)
                    .join(" · ")}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold text-gold">
                  View package <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            );
          })}
          {!matchingPackages.length && (
            <div className="rounded-[20px] border border-border bg-card p-5 text-[14px] leading-relaxed text-muted-foreground">
              No packages matched that search. Browse by event category to see every available
              package.
            </div>
          )}
        </div>
      </main>
    );
  }

  if (!occasion) {
    return (
      <main className="mx-auto max-w-[860px] px-5 py-8 pb-32 sm:px-8">
        <SectionHeader
          eyebrow="Easiest way to plan"
          title="Choose your event"
          subtitle="Select an occasion first, then we’ll show packages designed for it."
        />
        <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {occasions.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                update({ occasion: item.id, packageId: null, mode: "package" });
                navigate.push(`/packages/${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
              }}
              className="group relative min-h-[222px] cursor-pointer overflow-hidden rounded-[22px] border-2 border-card text-left shadow-[0_14px_30px_rgba(55,42,25,0.18)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gold hover:shadow-[0_24px_42px_rgba(55,42,25,0.28)] active:translate-y-0 active:scale-[0.975] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/40 sm:min-h-[280px] sm:rounded-[26px]"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <span className="absolute inset-0 bg-champagne" />
              )}
              <span className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/30" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute left-3 top-3 z-10 inline-flex h-6 items-center gap-1 rounded-full bg-card px-2 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground shadow-sm sm:left-4 sm:top-4 sm:text-[10px]">
                Choose
              </span>
              <span className="absolute inset-x-3 bottom-3 z-10 flex min-h-14 items-center rounded-[16px] bg-card px-3 py-2 shadow-[0_8px_20px_rgba(18,14,9,0.14)] backdrop-blur-sm sm:inset-x-5 sm:bottom-5 sm:min-h-[72px] sm:rounded-[18px] sm:px-4">
                <span className="block min-w-0 whitespace-nowrap font-display text-[18px] leading-none sm:text-[26px]">
                  {item.name}
                </span>
              </span>
              <span className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-card text-foreground shadow-[0_10px_20px_rgba(18,14,9,0.28)] transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-primary-foreground group-active:scale-90 sm:right-5 sm:top-5 sm:h-12 sm:w-12">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  const eventPackages = packages
    .filter((item) => item.eventCategoryId === occasion.id)
    .sort((a, b) => {
      const priority = { within: 0, below: 1, above: 2 } as const;
      return priority[packageGuestFit(a, plan.guests)] - priority[packageGuestFit(b, plan.guests)];
    });

  if (!viewingPackages) {
    return (
      <main className="mx-auto max-w-[620px] px-5 py-8 pb-32 sm:px-8">
        <button
          onClick={() => navigate.push("/packages")}
          className="press text-[13px] font-semibold text-gold"
        >
          ← Change event
        </button>
        <SectionHeader
          eyebrow={occasion.name}
          title={`How many guests for the ${occasion.name}?`}
          subtitle="We’ll calculate the package estimate for your exact guest count."
        />
        <div className="mt-7 rounded-[20px] border border-border bg-card p-5 shadow-card">
          <p className="eyebrow">Guest count</p>
          <div className="mt-3 grid h-[70px] grid-cols-[64px_minmax(0,1fr)_64px] items-center rounded-[16px] border border-border bg-card">
            <button
              type="button"
              aria-label="Decrease guest count"
              onClick={() => update({ guests: Math.max(25, plan.guests - 25) })}
              className="press h-full text-[26px] text-muted-foreground"
            >
              −
            </button>
            <label className="flex min-w-0 items-center justify-center gap-1 text-[17px] font-semibold">
              <input
                type="number"
                inputMode="numeric"
                min={25}
                value={plan.guests || ""}
                onChange={(event) => {
                  const value = Number.parseInt(event.target.value, 10);
                  update({ guests: Number.isNaN(value) ? 0 : Math.max(0, value) });
                }}
                onBlur={() => update({ guests: Math.max(25, plan.guests || 25) })}
                className="w-20 bg-transparent text-center text-[17px] font-semibold outline-none"
                aria-label="Guest count"
              />
              <span>Guests</span>
            </label>
            <button
              type="button"
              aria-label="Increase guest count"
              onClick={() => update({ guests: plan.guests + 25 })}
              className="press h-full text-[26px] text-muted-foreground"
            >
              +
            </button>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {[50, 100, 200, 300, 500].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => update({ guests: count })}
                className={cx(
                  "press h-11 rounded-[11px] border text-[13px] font-semibold transition-colors",
                  plan.guests === count
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-foreground hover:border-gold",
                )}
              >
                {count === 500 ? "500+" : count}
              </button>
            ))}
          </div>
          <Button
            size="lg"
            full
            className="mt-6"
            onClick={() => navigate.push(`/packages/${categorySlug}?view=packages`)}
          >
            View {occasion.name} packages <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 pb-32 sm:px-8">
      <section className="relative overflow-hidden rounded-[28px] bg-primary px-5 pb-8 pt-6 text-primary-foreground shadow-[0_18px_36px_rgba(41,32,20,0.18)] sm:px-7 sm:pt-8">
        {occasion.image && (
          <img
            src={occasion.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}
        <span className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/45" />
        <span className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-gold/15" />
        <div className="relative">
          <button
            onClick={() => navigate.push(`/packages/${categorySlug}`)}
            className="press text-[13px] font-semibold text-gold"
          >
            ← Edit event or guests
          </button>
          <p className="hidden text-[11px] font-bold uppercase tracking-[.18em] text-gold">
            {occasion.name} catering · {plan.guests} guests
          </p>
          <h1 className="mt-3 font-display text-[30px] leading-tight sm:text-[38px]">
            {occasion.name} Catering
          </h1>
          <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-primary-foreground/75">
            Packages tailored for your celebration.
          </p>
          <div className="mt-5 rounded-[18px] border border-gold/40 bg-card p-4 text-foreground shadow-[0_8px_20px_rgba(0,0,0,0.16)] sm:px-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Your guest count</p>
                <p className="mt-1 text-[15px] font-semibold">
                  {plan.guests.toLocaleString("en-IN")} guests
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  All package estimates update instantly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingGuests((current) => !current)}
                aria-expanded={editingGuests}
                className="press shrink-0 rounded-full border border-gold/60 bg-champagne/45 px-4 py-2 text-[13px] font-bold text-foreground hover:border-gold"
              >
                {editingGuests ? "Done" : "Change"}
              </button>
            </div>
            {editingGuests && (
              <div className="mt-4 border-t border-gold/25 pt-4 animate-in fade-in slide-in-from-top-1">
                <QuantitySelector
                  size="lg"
                  value={plan.guests}
                  step={25}
                  min={25}
                  suffix="Guests"
                  onChange={(guests) => update({ guests: Math.max(25, guests) })}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {[50, 100, 200, 300, 500].map((guests) => (
                    <button
                      key={guests}
                      type="button"
                      onClick={() => update({ guests })}
                      className={cx(
                        "press rounded-full border px-3 py-1.5 text-[12px] font-semibold",
                        plan.guests === guests
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-surface hover:border-gold",
                      )}
                    >
                      {guests === 500 ? "500+" : guests}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="hidden">
        <p className="eyebrow">Your selection</p>
        <p className="mt-1 text-[15px] font-semibold">
          {occasion.name} · {plan.guests} guests
        </p>
      </div>
      <button onClick={() => navigate.push(`/packages/${categorySlug}`)} className="hidden">
        ← Edit event or guests
      </button>
      <div className="mt-10">
        <SectionHeader
          title="Choose a package"
          subtitle="Select the package that suits your celebration."
        />
      </div>
      {eventPackages.length > 1 && (
        <div className="mt-4 flex items-center justify-between rounded-[12px] border border-gold/25 bg-champagne/25 px-3 py-2.5 sm:hidden">
          <span className="text-[12px] font-semibold text-muted-foreground">
            Scroll to compare {eventPackages.length - 1} more package
            {eventPackages.length > 2 ? "s" : ""}
          </span>
          <span className="grid h-6 w-6 place-items-center rounded-full bg-card text-gold animate-bounce">
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {eventPackages.map((p) => (
          <article
            key={p.id}
            className={cx(
              "flex flex-col rounded-[22px] border p-5 shadow-card",
              p.signature ? "border-gold bg-champagne/35" : "border-border bg-card",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-[26px] leading-tight">{p.name}</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">{p.tagline}</p>
              </div>
              {p.signature && (
                <span className="rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-primary">
                  Popular
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setExpandedPackageId((current) => (current === p.id ? null : p.id))}
              aria-expanded={expandedPackageId === p.id}
              aria-label={expandedPackageId === p.id ? "Hide included menu" : "Show included menu"}
              className="press mt-5 grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] bg-surface px-4 py-3 text-left"
            >
              <span>
                <span className="block text-[22px] font-bold leading-none">
                  {inr(packageTotalFor(p, plan.guests))}
                </span>
                <span className="mt-1 block text-[12px] text-muted-foreground">
                  Package price · serves {packageGuestRange(p)}
                </span>
              </span>
              <span
                className={cx(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground transition-transform",
                  expandedPackageId === p.id && "rotate-180 border-gold/60 text-gold",
                )}
              >
                <ChevronDown className="h-5 w-5" strokeWidth={2.5} />
              </span>
            </button>
            <GuestCountNotice pkg={p} guests={plan.guests} />
            {expandedPackageId === p.id && (
              <>
                <div className="mt-4 flex-1 text-[13px] text-muted-foreground">
                  {p.sections.map((section) => section.title).join(" · ") ||
                    "Complete catering package"}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedPackageId((current) => (current === p.id ? null : p.id))
                  }
                  aria-expanded={expandedPackageId === p.id}
                  className="hidden"
                >
                  <span>
                    {expandedPackageId === p.id ? "Hide menu inclusions" : "View menu inclusions"}
                  </span>
                  <ChevronDown
                    className={cx(
                      "h-4 w-4 shrink-0 transition-transform",
                      expandedPackageId === p.id && "rotate-180",
                    )}
                  />
                </button>
                {expandedPackageId === "__legacy__" && expandedPackageId === p.id && (
                  <div className="mt-2 space-y-2 rounded-[12px] border border-border bg-surface/60 p-3 animate-in fade-in slide-in-from-top-1">
                    {p.sections.length > 0 ? (
                      p.sections.map((section) => (
                        <div key={section.title}>
                          <p className="text-[12px] font-semibold text-foreground">
                            {section.title}
                          </p>
                          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                            {section.items.length > 0
                              ? section.items.join(" · ")
                              : "Included in this package"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[12px] text-muted-foreground">
                        Menu inclusions will be confirmed by our catering team.
                      </p>
                    )}
                  </div>
                )}
                {p.sections.length > 0 && (
                  <div className="mt-5 overflow-hidden rounded-[16px] border border-gold/25 bg-card shadow-[0_8px_18px_rgba(55,42,25,0.06)]">
                    <div className="border-b border-border bg-champagne/30 px-4 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-[.14em] text-gold">
                        What’s included
                      </p>
                    </div>
                    {p.sections.map((section, index) => {
                      const key = `${p.id}:${section.title}`;
                      const expanded = expandedSectionKey === key;
                      return (
                        <div key={key} className="border-b border-border last:border-b-0">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedSectionKey((current) => (current === key ? null : key))
                            }
                            aria-expanded={expanded}
                            className={cx(
                              "press flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors",
                              expanded ? "bg-surface" : "bg-card hover:bg-surface/60",
                            )}
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-champagne text-[10px] font-bold text-gold">
                                {index + 1}
                              </span>
                              <span className="truncate text-[14px] font-semibold">
                                {section.title}
                              </span>
                            </span>
                            <span
                              className={cx(
                                "grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-transform",
                                expanded && "rotate-180 border-gold/50 text-gold",
                              )}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </span>
                          </button>
                          {expanded && (
                            <div className="border-t border-border bg-surface/50 px-4 py-3.5 animate-in fade-in slide-in-from-top-1">
                              {section.items.length > 0 ? (
                                <ul className="space-y-1.5 text-[13px] leading-relaxed text-muted-foreground">
                                  {section.items.map((item) => (
                                    <li key={item}>• {item}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-[12px] text-muted-foreground">
                                  Included in this package
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
            <Button full className="mt-6" onClick={() => choose(p)}>
              Select package
            </Button>
          </article>
        ))}
        {eventPackages.length === 0 && (
          <p className="rounded-[16px] border border-border bg-card p-5 text-[14px] text-muted-foreground">
            Packages for {occasion.name} are being prepared. Please choose another event or contact
            us for a custom menu.
          </p>
        )}
      </div>
    </main>
  );

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
      <SectionHeader
        eyebrow="Easiest way to plan"
        title="Catering Packages"
        subtitle="Set your guest count, then select the package that suits your celebration."
      />
      <div className="mt-6 max-w-xl rounded-[20px] border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
        <label className="eyebrow block">Select event category</label>
        <select
          value={plan.occasion ?? ""}
          onChange={(e) => update({ occasion: e.target.value || null, packageId: null })}
          className="mt-2 h-14 w-full rounded-[14px] border border-border bg-surface px-4 text-[16px] font-semibold outline-none focus:border-gold"
        >
          <option value="">All event categories</option>
          {occasions.map((occasion) => (
            <option key={occasion.id} value={occasion.id}>
              {occasion.name}
            </option>
          ))}
        </select>
        <p className="eyebrow mb-2 mt-5">How many guests?</p>
        <QuantitySelector
          size="lg"
          value={plan.guests}
          step={50}
          min={50}
          suffix="Guests"
          onChange={(v) => update({ guests: Math.max(50, v) })}
        />
        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packages"
            className="h-12 w-full rounded-[14px] border border-border bg-surface pl-11 pr-4 text-[14px] outline-none focus:border-gold"
          />
        </div>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {packages
          .filter(
            (p) =>
              (!plan.occasion || !p.eventCategoryId || p.eventCategoryId === plan.occasion) &&
              `${p.name} ${p.tagline}`.toLowerCase().includes(search.toLowerCase()),
          )
          .map((p) => (
            <article
              key={p.id}
              className={cx(
                "flex flex-col rounded-[22px] border p-5 shadow-[var(--shadow-card)]",
                p.signature ? "border-gold bg-champagne/35" : "border-border bg-card",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-[26px] leading-tight">{p.name}</h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">{p.tagline}</p>
                </div>
                {p.signature && (
                  <span className="shrink-0 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary">
                    Popular
                  </span>
                )}
              </div>
              <div className="mt-5 rounded-[14px] bg-surface px-4 py-3">
                <p className="text-[22px] font-bold leading-none">
                  {inr(packageTotalFor(p, plan.guests))}
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Package price · serves {packageGuestRange(p)}
                </p>
                <p className="hidden mt-1 text-[12px] text-muted-foreground">
                  {inr(p.pricePerMann)} per Mann · serves {p.guestsPerMann} guests
                </p>
              </div>
              <GuestCountNotice pkg={p} guests={plan.guests} />
              <div className="mt-5 flex-1 rounded-[12px] border border-border bg-surface px-4 py-3 text-[13px] text-muted-foreground">
                Complete catering package with service and event essentials. The catering team will
                confirm the final inclusions with you.
              </div>
              <Button full className="mt-6" onClick={() => choose(p)}>
                Select package
              </Button>
            </article>
          ))}
      </div>
    </main>
  );

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
      <SectionHeader
        eyebrow="Easiest way to plan"
        title="Catering Packages"
        subtitle={`Quoted per Mann — ${current.name} serves ${current.guestsPerMann} guests per Mann, including crockery and service.`}
      />

      {/* Guest control bar — app-style */}
      <div className="mt-6 grid gap-4 rounded-[20px] border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:grid-cols-[minmax(0,320px)_auto] sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <p className="eyebrow mb-2">Guests</p>
          <QuantitySelector
            size="lg"
            value={plan.guests}
            step={50}
            min={50}
            suffix="Guests"
            onChange={(v) => update({ guests: Math.max(50, v) })}
          />
        </div>
        <div className="rounded-[14px] bg-surface px-4 py-3 text-[13px] text-muted-foreground sm:text-right">
          <span className="block">
            {manns} Mann ({manns * current.guestsPerMann} plates)
          </span>
          <span className="block text-[12px] text-muted-text">
            Billing is rounded up to the next full Mann.
          </span>
        </div>
      </div>

      {/* Package tabs */}
      <div className="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        {packages.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            className={cx(
              "press shrink-0 rounded-full border px-4 py-2.5 text-[13px] font-semibold",
              active === p.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {p.name.replace(" Package", "")} · {inr(p.pricePerMann)}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <PackageDetail pkg={current} guests={plan.guests} />

        {/* Sticky summary rail */}
        <aside className="rounded-[20px] border border-border bg-card p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
          <p className="eyebrow">Estimated total</p>
          <p className="mt-2 font-display text-[34px] leading-none">
            {inr(packageTotalFor(current, plan.guests))}
          </p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            {current.name} · {manns} Mann · {plan.guests} guests
          </p>
          <p className="mt-1 text-[12px] text-muted-text">
            Approx. {inr(perGuestFor(current, plan.guests))} per guest
          </p>
          <Button size="lg" full className="mt-5" onClick={() => choose(current)}>
            Select This Package
          </Button>
          <Link href="/plan" className="mt-3 block">
            <Button size="lg" variant="outline" full>
              Customise Instead
            </Button>
          </Link>
          <p className="mt-4 text-[12px] text-muted-text">
            Final quote confirmed by our catering team after a quick call.
          </p>
        </aside>
      </div>

      {/* Compare grid */}
      <div className="mt-12">
        <SectionHeader eyebrow="Compare" title="All packages at a glance" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {packages.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActive(p.id);
                if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={cx(
                "press flex flex-col rounded-[20px] border p-5 text-left",
                p.signature
                  ? "border-gold bg-champagne/40"
                  : "border-border bg-card shadow-[var(--shadow-card)]",
                active === p.id && "border-primary",
              )}
            >
              {p.signature && (
                <span
                  className="eyebrow mb-1.5 flex items-center gap-1.5"
                  style={{ color: "var(--gold)" }}
                >
                  <Sparkles className="h-3.5 w-3.5" /> Flagship
                </span>
              )}
              <h3 className="font-display text-[24px] leading-tight">{p.name}</h3>
              <p className="mt-1.5 text-[13px] text-muted-foreground">{p.tagline}</p>
              <p className="mt-4 text-[22px] font-bold leading-none">
                {inr(p.pricePerMann)}
                <span className="text-[13px] font-medium text-muted-foreground"> / Mann</span>
              </p>
              <ul className="mt-4 flex-1 space-y-1.5 text-[13px] text-muted-foreground">
                {p.sections.map((s) => (
                  <li key={s.title} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      style={{ color: "var(--gold)" }}
                    />
                    <span className="min-w-0">
                      {s.title}
                      <span className="text-muted-text">
                        {" "}
                        · {s.items.length} {s.items.length === 1 ? "item" : "items"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

function PackagesLoading() {
  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8" aria-busy="true">
      <div className="h-4 w-28 animate-pulse rounded bg-surface" />
      <div className="mt-4 h-10 w-72 max-w-full animate-pulse rounded bg-surface" />
      <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-surface" />
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-[24px] bg-surface" />
        ))}
      </div>
    </main>
  );
}

function GuestCountNotice({ pkg, guests }: { pkg: CateringPackage; guests: number }) {
  const fit = packageGuestFit(pkg, guests);
  if (fit === "within") return null;
  const range = packageGuestRange(pkg);
  return (
    <div className="mt-3 rounded-[12px] border border-gold/35 bg-champagne/30 px-3 py-2.5 text-[12px] leading-relaxed text-muted-foreground">
      <span className="font-semibold text-foreground">
        {guests.toLocaleString("en-IN")} guests selected.{" "}
      </span>
      {fit === "below"
        ? `This package is normally planned for ${range}. Your displayed amount is a tailored estimate; some inclusions or quantities may change when our catering expert confirms the menu with you.`
        : `This package is normally planned for ${range}. Your displayed amount is scaled for the selected guest count; final quantities are confirmed with our catering expert.`}
    </div>
  );
}

function PackageDetail({ pkg, guests }: { pkg: CateringPackage; guests: number }) {
  return (
    <div
      className={cx(
        "rounded-[20px] border p-5 sm:p-7",
        pkg.signature
          ? "border-gold bg-champagne/30"
          : "border-border bg-card shadow-[var(--shadow-card)]",
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          {pkg.signature && (
            <span className="eyebrow block" style={{ color: "var(--gold)" }}>
              Flagship
            </span>
          )}
          <h2 className="font-display text-[30px] leading-tight sm:text-[38px]">{pkg.name}</h2>
          <p className="mt-1.5 text-[14px] text-muted-foreground">{pkg.tagline}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[24px] font-bold leading-none">{inr(pkg.pricePerMann)}</p>
          <p className="text-[12px] text-muted-text">per Mann</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {pkg.sections.map((s) => (
          <section key={s.title} className="rounded-[16px] bg-surface p-4">
            <p className="eyebrow" style={{ color: "var(--gold)" }}>
              {s.title}
            </p>
            <ul className="mt-2.5 space-y-1.5 text-[14px] text-foreground/85">
              {s.items.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: "var(--gold)" }}
                  />
                  <span className="min-w-0">{i}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {((pkg.includedServices?.length ?? 0) > 0 || (pkg.excludedServices?.length ?? 0) > 0) && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <section className="rounded-[16px] border border-gold/35 bg-champagne/30 p-4">
            <p className="eyebrow" style={{ color: "var(--gold)" }}>
              Included
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {pkg.includedServices?.join(" · ") || "Package menu items listed above"}
            </p>
          </section>
          <section className="rounded-[16px] border border-border bg-surface p-4">
            <p className="eyebrow">Not included</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {pkg.excludedServices?.join(" · ") || "No exclusions listed"}
            </p>
          </section>
        </div>
      )}

      <p className="mt-5 text-[12px] text-muted-text">
        Serving {guests} guests · Crockery, mineral water and service staff included.
      </p>
    </div>
  );
}
