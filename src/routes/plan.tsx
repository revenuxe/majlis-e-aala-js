import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, X } from "lucide-react";
import { useState } from "react";
import { dishes, inr, occasions, packageTotalFor, packages } from "@/lib/data";
import { recommendedTrays, usePlan } from "@/lib/plan-store";
import { BrandMark } from "@/components/Brand";
import { Button, ChoiceCard, DietMark, QuantitySelector, cx } from "@/components/ui-kit";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Plan Your Catering — 6 Simple Steps | Majlise Aala" },
      {
        name: "description",
        content:
          "Tell us your occasion, date and guest count. Choose a package or build your own Halal menu, then request confirmation. No account needed.",
      },
      { property: "og:title", content: "Plan Your Catering | Majlise Aala" },
      {
        property: "og:description",
        content: "Plan Halal catering for your celebration in a few simple steps.",
      },
    ],
  }),
  component: PlanFlow,
});

const stepTitles = [
  "Occasion",
  "Date & Guests",
  "Package or Menu",
  "Food Selection",
  "Services",
  "Review & Contact",
];

const serviceOptions = [
  "Buffet Setup",
  "Serving Staff",
  "Live Counters",
  "Tables",
  "Disposable Dinnerware",
  "Drinking Water",
];

function PlanFlow() {
  const [step, setStep] = useState(0);
  const { plan, update, foodTotal, items: _u } = usePlan() as never as ReturnType<typeof usePlan> & {
    items?: never;
  };
  const navigate = useNavigate();

  const next = () => setStep((s) => Math.min(5, s + 1));
  const back = () => (step === 0 ? navigate({ to: "/" }) : setStep((s) => s - 1));

  const canContinue = (() => {
    if (step === 0) return !!plan.occasion;
    if (step === 1) return plan.guests > 0;
    if (step === 2) return plan.mode !== null;
    if (step === 3) return plan.mode === "package" ? !!plan.packageId : plan.items.length > 0;
    if (step === 5) return plan.contact.name.trim() !== "" && plan.contact.phone.trim().length >= 8;
    return true;
  })();

  const helperText = (() => {
    if (step === 0 && !plan.occasion) return "Please choose the occasion you're planning for.";
    if (step === 2 && !plan.mode) return "Choose a package, or build your own menu.";
    if (step === 3 && plan.mode === "custom" && plan.items.length === 0)
      return "Please add at least one dish to continue.";
    if (step === 5 && !canContinue) return "Please share your name and mobile number.";
    return null;
  })();

  const primaryLabel = [
    "Continue",
    "See Options",
    "Continue to Menu",
    "Continue",
    "Review My Catering",
    "Confirm Catering Request",
  ][step]!;

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto grid max-w-[720px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <button
            onClick={back}
            aria-label="Go back"
            className="press grid h-10 w-10 place-items-center rounded-full border border-border bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-text">
              Step {step + 1} of 6
            </p>
            <p className="truncate text-[15px] font-semibold">{stepTitles[step]}</p>
          </div>
          <Link
            to="/"
            aria-label="Close"
            className="press grid h-10 w-10 place-items-center rounded-full border border-border bg-card"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>
        <div className="h-[3px] w-full bg-surface">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${((step + 1) / 6) * 100}%`, background: "var(--primary)" }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-5 py-8">
        {step === 0 && <StepOccasion />}
        {step === 1 && <StepDateGuests />}
        {step === 2 && <StepChoice onPick={() => setStep(3)} />}
        {step === 3 && <StepFood />}
        {step === 4 && <StepServices />}
        {step === 5 && <StepReview total={foodTotal} />}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 backdrop-blur-md">
        <div className="mx-auto max-w-[720px]">
          {helperText && (
            <p className="mb-3 text-center text-[13px] text-muted-foreground">{helperText}</p>
          )}
          <Button
            size="lg"
            full
            disabled={!canContinue}
            onClick={() => {
              if (step === 5) {
                update({});
                navigate({ to: "/my-menu" });
              } else next();
            }}
          >
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepHeading({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-3">
        <BrandMark size={26} />
        <span className="gold-rule" />
      </div>
      <h1 className="font-display text-[32px] leading-tight sm:text-[38px]">{title}</h1>
      {note && <p className="mt-2 text-[15px] text-muted-foreground">{note}</p>}
    </div>
  );
}

function StepOccasion() {
  const { plan, update } = usePlan();
  return (
    <>
      <StepHeading title="What's the occasion?" note="We'll shape the menu around it." />
      <div className="grid gap-3 sm:grid-cols-2">
        {occasions.map((o) => (
          <button
            key={o.id}
            onClick={() => update({ occasion: o.id })}
            className={cx(
              "press grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border p-3 text-left",
              plan.occasion === o.id ? "border-primary bg-champagne/40" : "border-border bg-card",
            )}
          >
            <img src={o.image} alt="" loading="lazy" className="h-16 w-16 rounded-[10px] object-cover" />
            <span className="min-w-0 truncate text-[16px] font-semibold">{o.name}</span>
            <span
              className={cx(
                "grid h-6 w-6 place-items-center rounded-full border",
                plan.occasion === o.id ? "border-primary bg-primary" : "border-border",
              )}
            >
              {plan.occasion === o.id && (
                <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
              )}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function StepDateGuests() {
  const { plan, update } = usePlan();
  return (
    <>
      <StepHeading title="When is it, and how many guests?" />
      <label className="eyebrow block">Event date</label>
      <input
        type="date"
        value={plan.date}
        onChange={(e) => update({ date: e.target.value })}
        className="mt-3 h-14 w-full rounded-[12px] border border-border bg-card px-4 text-[16px] outline-none focus:border-gold"
      />
      <p className="eyebrow mt-8">Number of guests</p>
      <div className="mt-3">
        <QuantitySelector
          size="lg"
          value={plan.guests}
          step={10}
          min={10}
          suffix="Guests"
          onChange={(v) => update({ guests: Math.max(10, v) })}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {[25, 50, 100, 200, 300, 500].map((g) => (
          <button
            key={g}
            onClick={() => update({ guests: g })}
            className={cx(
              "press h-11 rounded-full px-5 text-[14px] font-medium",
              plan.guests === g ? "bg-primary text-primary-foreground" : "border border-border bg-card",
            )}
          >
            {g === 500 ? "500+" : g}
          </button>
        ))}
      </div>
      <p className="mt-6 text-[13px] text-muted-foreground">
        An approximate number is fine — you can change it later.
      </p>
    </>
  );
}

function StepChoice({ onPick }: { onPick: () => void }) {
  const { plan, update } = usePlan();
  return (
    <>
      <StepHeading title="How would you like to plan?" />
      <button
        onClick={() => {
          update({ mode: "package" });
          onPick();
        }}
        className={cx(
          "press w-full rounded-[20px] border p-6 text-left",
          plan.mode === "package" ? "border-primary bg-champagne/40" : "border-gold bg-champagne/25",
        )}
      >
        <span className="eyebrow" style={{ color: "var(--gold)" }}>
          Recommended
        </span>
        <span className="mt-2 block font-display text-[26px]">Choose a Package</span>
        <span className="mt-2 block text-[14px] text-muted-foreground">
          Quickest way to plan your catering. We've already balanced the menu for you.
        </span>
      </button>

      <button
        onClick={() => {
          update({ mode: "custom" });
          onPick();
        }}
        className={cx(
          "press mt-4 w-full rounded-[20px] border p-6 text-left",
          plan.mode === "custom" ? "border-primary bg-champagne/40" : "border-border bg-card",
        )}
      >
        <span className="block font-display text-[26px]">Build My Own Menu</span>
        <span className="mt-2 block text-[14px] text-muted-foreground">
          Choose every dish yourself, category by category.
        </span>
      </button>
    </>
  );
}

function StepFood() {
  const { plan, update, addItem, setQuantity, quantityOf } = usePlan();

  if (plan.mode === "package") {
    return (
      <>
        <StepHeading
          title="Pick your package"
          note={`Prices shown for ${plan.guests} guests.`}
        />
        <div className="grid gap-3">
          {packages.map((p) => (
            <ChoiceCard
              key={p.id}
              title={`${p.name} — ${inr(p.pricePerMann)} / Mann`}
              note={`${p.sections.map((s) => s.title).join(" • ")} · Estimated ${inr(
                packageTotalFor(p, plan.guests),
              )} for ${plan.guests} guests`}
              selected={plan.packageId === p.id}
              onClick={() => update({ packageId: p.id })}
            />
          ))}
        </div>
      </>
    );
  }

  const groups = ["Starters", "Kebabs", "Biryani", "Main Course", "Breads", "Desserts", "Drinks"];
  const rec = recommendedTrays(plan.guests);

  return (
    <>
      <StepHeading
        title="Choose your dishes"
        note={`For ${plan.guests} guests we suggest 2 starters, 2 mains, 1 biryani, 1 bread and 1 dessert.`}
      />
      <div className="space-y-8">
        {groups.map((g) => {
          const list = dishes.filter((d) => d.categoryId === g);
          if (list.length === 0) return null;
          return (
            <section key={g}>
              <p className="eyebrow">{g}</p>
              <div className="mt-3 grid gap-2">
                {list.map((d) => {
                  const qty = quantityOf(d.id);
                  const selected = qty > 0;
                  return (
                    <div
                      key={d.id}
                      className={cx(
                        "rounded-[14px] border p-4",
                        selected ? "border-primary bg-champagne/40" : "border-border bg-card",
                      )}
                    >
                      <button
                        onClick={() => (selected ? setQuantity(d.id, 0) : addItem(d.id, rec))}
                        className="press grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-left"
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <DietMark diet={d.diet} />
                            <span className="truncate text-[15px] font-semibold">{d.name}</span>
                          </span>
                          <span className="mt-1 block text-[13px] text-muted-foreground">
                            {inr(d.price)} · {d.serves}
                          </span>
                        </span>
                        <span
                          className={cx(
                            "grid h-7 w-7 place-items-center rounded-full border",
                            selected ? "border-primary bg-primary" : "border-border",
                          )}
                        >
                          {selected && (
                            <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
                          )}
                        </span>
                      </button>
                      {selected && (
                        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border pt-4">
                          <span className="min-w-0 text-[13px] text-muted-foreground">
                            Recommended {rec} trays
                          </span>
                          <QuantitySelector
                            size="sm"
                            value={qty}
                            onChange={(v) => setQuantity(d.id, v)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function StepServices() {
  const { plan, update } = usePlan();
  const toggle = (s: string) =>
    update({
      services: plan.services.includes(s)
        ? plan.services.filter((x) => x !== s)
        : [...plan.services, s],
    });
  return (
    <>
      <StepHeading title="Anything else you need?" note="All optional — add only what helps." />
      <div className="grid gap-2">
        {serviceOptions.map((s) => (
          <ChoiceCard
            key={s}
            title={s}
            selected={plan.services.includes(s)}
            onClick={() => toggle(s)}
          />
        ))}
      </div>
    </>
  );
}

function StepReview({ total }: { total: number }) {
  const { plan, update } = usePlan();
  const pkg = packages.find((p) => p.id === plan.packageId);

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    type = "text",
    placeholder = "",
  ) => (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-14 w-full rounded-[12px] border border-border bg-card px-4 text-[16px] outline-none focus:border-gold"
      />
    </label>
  );

  return (
    <>
      <StepHeading title="Almost done" note="Tell us where to send your catering plan." />

      <div className="rounded-[16px] border border-border bg-card p-5">
        <p className="eyebrow">Your plan</p>
        <p className="mt-2 font-display text-[24px] capitalize">
          {plan.occasion ?? "Celebration"} • {plan.guests} guests
        </p>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {plan.date ? new Date(plan.date).toDateString() : "Date to be confirmed"} ·{" "}
          {plan.servingStyle}
        </p>
        <div className="mt-4 border-t border-border pt-4 text-[14px]">
          {pkg ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{pkg.name} package</span>
              <span className="font-semibold">{inr(total)}</span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{plan.items.length} dishes selected</span>
              <span className="font-semibold">{inr(total)}</span>
            </div>
          )}
          <p className="mt-2 text-[12px] text-muted-text">
            Estimated price. Final pricing will be confirmed by our catering team.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {field("Your name", plan.contact.name, (v) =>
          update({ contact: { ...plan.contact, name: v } }),
        )}
        {field(
          "Mobile / WhatsApp",
          plan.contact.phone,
          (v) => update({ contact: { ...plan.contact, phone: v, whatsapp: v } }),
          "tel",
          "10-digit mobile number",
        )}
        {field(
          "Venue area",
          plan.venue.area,
          (v) => update({ venue: { ...plan.venue, area: v } }),
          "text",
          "e.g. Frazer Town",
        )}
      </div>

      <p className="mt-5 text-[13px] text-muted-foreground">
        No account needed. We'll call or WhatsApp you to confirm the details.
      </p>
    </>
  );
}
