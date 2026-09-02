import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { inr, packages } from "@/lib/data";
import { usePlan } from "@/lib/plan-store";
import { Button, QuantitySelector, SectionHeader, cx } from "@/components/ui-kit";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Catering Packages — Essential to Aala Signature | Majlise Aala" },
      {
        name: "description",
        content:
          "Curated Halal catering packages priced per guest, from Essential to the flagship Aala Signature feast.",
      },
      { property: "og:title", content: "Curated Catering Packages | Majlise Aala" },
      {
        property: "og:description",
        content: "Balanced Halal menus priced per guest for weddings and celebrations.",
      },
    ],
  }),
  component: PackagesPage,
});

function PackagesPage() {
  const { plan, update } = usePlan();
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
      <SectionHeader
        eyebrow="Easiest way to plan"
        title="Curated Catering Packages"
        subtitle="We've already balanced the menu for you. Pricing shown per guest."
      />

      <div className="mt-6 max-w-sm">
        <p className="eyebrow mb-3">Guests</p>
        <QuantitySelector
          size="lg"
          value={plan.guests}
          step={10}
          min={10}
          suffix="Guests"
          onChange={(v) => update({ guests: Math.max(10, v) })}
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {packages.map((p) => {
          const total = p.pricePerGuest * plan.guests;
          const selected = plan.packageId === p.id;
          return (
            <div
              key={p.id}
              className={cx(
                "flex flex-col rounded-[20px] border p-6 sm:p-8",
                p.signature ? "border-gold bg-champagne/40" : "border-border bg-card shadow-[var(--shadow-card)]",
                selected && "border-primary",
              )}
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  {p.signature && (
                    <span className="eyebrow block" style={{ color: "var(--gold)" }}>
                      Flagship
                    </span>
                  )}
                  <h2 className="font-display text-[30px] leading-tight">{p.name}</h2>
                  <p className="mt-1.5 text-[14px] text-muted-foreground">{p.tagline}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[24px] font-bold leading-none">{inr(p.pricePerGuest)}</p>
                  <p className="text-[12px] text-muted-text">per guest</p>
                </div>
              </div>

              <ul className="mt-6 grid flex-1 gap-2 text-[14px] sm:grid-cols-2">
                {p.includes.map((i) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--gold)" }} />
                    {i}
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-[14px] bg-surface p-4">
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-muted-foreground">
                    Estimated food total • {plan.guests} guests
                  </span>
                  <span className="text-[18px] font-bold">{inr(total)}</span>
                </div>
                <p className="mt-1 text-[12px] text-muted-text">
                  Final price will be confirmed by our catering team.
                </p>
              </div>

              <p className="mt-4 text-[12px] text-muted-text">Minimum {p.minGuests} guests</p>

              <Button
                size="lg"
                full
                className="mt-5"
                variant={p.signature ? "primary" : "outline"}
                onClick={() => {
                  update({ packageId: p.id, mode: "package" });
                  navigate({ to: "/my-menu" });
                }}
              >
                {selected ? "Selected — Review Plan" : "View Package"}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-[20px] border border-border bg-card p-6 text-center sm:p-8">
        <h3 className="font-display text-[26px]">Prefer to choose every dish yourself?</h3>
        <p className="mt-2 text-[14px] text-muted-foreground">
          Build your own menu with recommended quantities for your guest count.
        </p>
        <Link to="/plan" className="mt-5 inline-block">
          <Button size="lg" variant="outline">
            Build My Own Menu
          </Button>
        </Link>
      </div>
    </main>
  );
}
