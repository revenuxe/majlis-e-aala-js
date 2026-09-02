import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Trash2 } from "lucide-react";
import { inr, mannsFor, packages } from "@/lib/data";
import { dishById, usePlan } from "@/lib/plan-store";
import {
  Button,
  EmptyState,
  QuantitySelector,
  SectionHeader,
  DietMark,
} from "@/components/ui-kit";

export const Route = createFileRoute("/my-menu")({
  head: () => ({
    meta: [
      { title: "Your Catering Plan | Majlise Aala" },
      {
        name: "description",
        content:
          "Review your Halal catering plan: dishes, quantities, services and an estimated total for your event.",
      },
      { property: "og:title", content: "Your Catering Plan | Majlise Aala" },
      {
        property: "og:description",
        content: "Review dishes, quantities and estimated pricing for your celebration.",
      },
    ],
  }),
  component: MyMenu,
});

function MyMenu() {
  const { plan, foodTotal, setQuantity, removeItem } = usePlan();
  const pkg = packages.find((p) => p.id === plan.packageId);
  const hasPlan = plan.mode === "package" ? !!pkg : plan.items.length > 0;

  const buffet = plan.services.includes("Buffet Setup") ? 5000 : 0;
  const staff = plan.services.includes("Serving Staff") ? 6000 : 0;
  const delivery = 1500;
  const total = foodTotal + buffet + staff + delivery;

  const whatsappText = encodeURIComponent(
    [
      "MAJLISE AALA Catering Enquiry",
      `Event: ${plan.occasion ?? "—"}`,
      `Guests: ${plan.guests}`,
      `Date: ${plan.date || "To be confirmed"}`,
      `Menu: ${
        pkg
          ? `${pkg.name} package`
          : plan.items
              .map((i) => `${dishById(i.dishId)?.name} x${i.quantity}`)
              .join(", ") || "—"
      }`,
      `Estimated Total: ${inr(total)}`,
    ].join("\n"),
  );

  if (!hasPlan) {
    return (
      <main className="mx-auto max-w-[720px] px-5 py-10 sm:px-8">
        <EmptyState
          title="Your menu is waiting."
          note="Start creating a feast for your celebration."
          action={
            <Link to="/menu">
              <Button size="lg">Explore Menu</Button>
            </Link>
          }
        />
      </main>
    );
  }

  const grouped = plan.items.reduce<Record<string, typeof plan.items>>((acc, item) => {
    const cat = dishById(item.dishId)?.categoryId ?? "Other";
    (acc[cat] ||= []).push(item);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-[860px] px-5 py-8 pb-32 sm:px-8">
      <SectionHeader eyebrow="Catering plan" title="Your Catering Plan" />

      <div className="mt-6 rounded-[16px] border border-border bg-card p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-text">
          {plan.occasion ?? "Celebration"}
        </p>
        <p className="mt-1 font-display text-[26px]">
          {plan.date ? new Date(plan.date).toDateString() : "Date to be confirmed"}
        </p>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {plan.guests} Guests · {plan.servingStyle}
        </p>
      </div>

      {pkg ? (
        <div className="mt-5 rounded-[16px] border border-gold bg-champagne/40 p-5">
          <p className="eyebrow" style={{ color: "var(--gold)" }}>
            Selected package
          </p>
          <h3 className="mt-2 font-display text-[26px]">{pkg.name}</h3>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {pkg.sections.map((s) => s.title).join(" • ")}
          </p>
          <p className="mt-3 text-[16px] font-semibold">
            {inr(pkg.pricePerMann)} / Mann × {mannsFor(plan.guests)} ({plan.guests} guests)
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <section key={cat}>
              <p className="eyebrow">{cat}</p>
              <div className="mt-3 divide-y divide-border overflow-hidden rounded-[16px] border border-border bg-card">
                {items.map((item) => {
                  const dish = dishById(item.dishId);
                  if (!dish) return null;
                  return (
                    <div key={item.dishId} className="p-4">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <DietMark diet={dish.diet} />
                            <span className="truncate text-[15px] font-semibold">{dish.name}</span>
                          </span>
                          <span className="mt-1 block text-[13px] text-muted-foreground">
                            {item.quantity} × {dish.serves.replace("Serves ", "servings for ")}
                          </span>
                        </span>
                        <span className="text-[15px] font-semibold">
                          {inr(dish.price * item.quantity)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <QuantitySelector
                          size="sm"
                          value={item.quantity}
                          onChange={(v) => setQuantity(item.dishId, v)}
                        />
                        <button
                          onClick={() => removeItem(item.dishId)}
                          className="press flex items-center gap-1.5 text-[13px] text-muted-foreground"
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-[20px] border border-border bg-card p-5 sm:p-6">
        <p className="eyebrow">Estimate</p>
        <dl className="mt-4 space-y-2.5 text-[14px]">
          <Row label="Food" value={inr(foodTotal)} />
          {buffet > 0 && <Row label="Buffet Setup" value={inr(buffet)} />}
          {staff > 0 && <Row label="Serving Team" value={inr(staff)} />}
          <Row label="Delivery" value={inr(delivery)} />
        </dl>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-[15px] font-semibold">Estimated Total</span>
          <span className="text-[22px] font-bold">{inr(total)}</span>
        </div>
        <p className="mt-2 text-[12px] text-muted-text">
          Final pricing will be confirmed after reviewing your event requirements.
        </p>
      </div>

      <div className="mt-6 grid gap-3">
        <Link to="/plan">
          <Button size="lg" full>
            Continue to Event Details
          </Button>
        </Link>
        <a href={`https://wa.me/919000000000?text=${whatsappText}`} target="_blank" rel="noreferrer">
          <Button size="lg" variant="outline" full>
            <MessageCircle className="h-4 w-4" /> Send My Menu on WhatsApp
          </Button>
        </a>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
