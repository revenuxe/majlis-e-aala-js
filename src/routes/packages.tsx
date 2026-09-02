import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import {
  GUESTS_PER_MANN,
  inr,
  mannsFor,
  packageTotalFor,
  packages,
  perGuestFor,
  type CateringPackage,
} from "@/lib/data";
import { usePlan } from "@/lib/plan-store";
import { Button, QuantitySelector, SectionHeader, cx } from "@/components/ui-kit";

export const Route = createFileRoute("/packages")({
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
});

function PackagesPage() {
  const { plan, update } = usePlan();
  const navigate = useNavigate();
  const [active, setActive] = useState(packages[0].id);
  const manns = mannsFor(plan.guests);
  const current = packages.find((p) => p.id === active) ?? packages[0];

  const choose = (p: CateringPackage) => {
    update({ packageId: p.id, mode: "package" });
    navigate({ to: "/my-menu" });
  };

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
      <SectionHeader
        eyebrow="Easiest way to plan"
        title="Catering Packages"
        subtitle={`Quoted per Mann — one Mann serves ${GUESTS_PER_MANN} guests, crockery and service included.`}
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
            {manns} Mann ({manns * GUESTS_PER_MANN} plates)
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
          <Link to="/plan" className="mt-3 block">
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
                <span className="eyebrow mb-1.5 flex items-center gap-1.5" style={{ color: "var(--gold)" }}>
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
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--gold)" }} />
                    <span className="min-w-0">
                      {s.title}
                      <span className="text-muted-text"> · {s.items.length} items</span>
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

function PackageDetail({ pkg, guests }: { pkg: CateringPackage; guests: number }) {
  return (
    <div
      className={cx(
        "rounded-[20px] border p-5 sm:p-7",
        pkg.signature ? "border-gold bg-champagne/30" : "border-border bg-card shadow-[var(--shadow-card)]",
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

      <p className="mt-5 text-[12px] text-muted-text">
        Serving {guests} guests · Crockery, mineral water and service staff included.
      </p>
    </div>
  );
}
