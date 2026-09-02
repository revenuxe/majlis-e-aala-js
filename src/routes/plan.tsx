import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Package, UtensilsCrossed, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { dishes, inr, occasions, packageTotalFor, packages } from "@/lib/data";
import { recommendedTrays, usePlan } from "@/lib/plan-store";
import { BrandMark } from "@/components/Brand";
import { Button, ChoiceCard, DietMark, QuantitySelector, cx } from "@/components/ui-kit";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Plan Your Catering — 7 Simple Steps | Majlise Aala" },
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
  "Preferences",
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

  const next = () => setStep((s) => Math.min(6, s + 1));
  const back = () => (step === 0 ? navigate({ to: "/" }) : setStep((s) => s - 1));

  const canContinue = (() => {
    if (step === 0) return !!plan.occasion;
    if (step === 1) return plan.guests > 0;
    if (step === 3) return plan.mode !== null;
    if (step === 4) return plan.mode === "package" ? !!plan.packageId : plan.items.length > 0;
    if (step === 6) return plan.contact.name.trim() !== "" && plan.contact.phone.trim().length >= 8;
    return true;
  })();

  const helperText = (() => {
    if (step === 0 && !plan.occasion) return "Please choose the occasion you're planning for.";
    if (step === 3 && !plan.mode) return "Choose a package, or build your own menu.";
    if (step === 4 && plan.mode === "custom" && plan.items.length === 0)
      return "Please add at least one dish to continue.";
    if (step === 6 && !canContinue) return "Please share your name and mobile number.";
    return null;
  })();

  const primaryLabel = [
    "Continue",
    "Continue",
    "Continue",
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
              Step {step + 1} of 7
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
            style={{ width: `${((step + 1) / 7) * 100}%`, background: "var(--primary)" }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-5 py-8">
        {step === 0 && <StepOccasion />}
        {step === 1 && <StepDateGuests />}
        {step === 2 && <StepPreferences />}
        {step === 3 && <StepChoice onPick={() => setStep(4)} />}
        {step === 4 && <StepFood />}
        {step === 5 && <StepServices />}
        {step === 6 && <StepReview total={foodTotal} />}
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
      <div className="grid grid-cols-2 gap-3">
        {occasions.map((o) => {
          const selected = plan.occasion === o.id;
          return (
            <button
              key={o.id}
              onClick={() => update({ occasion: o.id })}
              className={cx(
                "press group relative overflow-hidden rounded-[14px] border text-left",
                selected ? "border-primary" : "border-border bg-card",
              )}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                <img
                  src={o.image}
                  alt=""
                  loading="lazy"
                  className={cx(
                    "h-full w-full object-cover transition-transform duration-300",
                    selected ? "opacity-100" : "opacity-90 group-hover:opacity-100",
                  )}
                />
                <span
                  className={cx(
                    "absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full border-2 transition-colors",
                    selected ? "border-primary bg-primary" : "border-white/80 bg-black/30 backdrop-blur-sm",
                  )}
                >
                  {selected && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
                </span>
              </div>
              <span className="block px-3 py-2.5 text-[14px] font-semibold leading-tight">
                {o.name}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepDateGuests() {
  const { plan, update } = usePlan();
  const [customMode, setCustomMode] = useState(false);
  const presets = [25, 50, 100, 200, 300, 500];
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
          onChange={(v) => {
            update({ guests: Math.max(10, v) });
            setCustomMode(false);
          }}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {presets.map((g) => (
          <button
            key={g}
            onClick={() => {
              setCustomMode(false);
              update({ guests: g });
            }}
            className={cx(
              "press h-11 rounded-full px-5 text-[14px] font-medium",
              !customMode && plan.guests === g
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card",
            )}
          >
            {g === 500 ? "500+" : g}
          </button>
        ))}
        <button
          onClick={() => setCustomMode(true)}
          className={cx(
            "press h-11 rounded-full px-5 text-[14px] font-medium",
            customMode ? "bg-primary text-primary-foreground" : "border border-border bg-card",
          )}
        >
          Custom
        </button>
      </div>
      {customMode && (
        <div className="mt-4 max-w-xs duration-300 animate-in fade-in slide-in-from-bottom-2">
          <label className="eyebrow" htmlFor="plan-custom-guests">
            Enter exact guest count
          </label>
          <input
            id="plan-custom-guests"
            type="number"
            inputMode="numeric"
            min={10}
            autoFocus
            value={Number.isNaN(plan.guests) ? "" : plan.guests}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              update({ guests: Number.isNaN(v) ? 0 : Math.max(0, v) });
            }}
            placeholder="e.g. 750"
            className="mt-2 h-14 w-full rounded-[14px] border border-border bg-card px-4 text-center text-[18px] font-semibold tabular-nums outline-none focus:border-gold"
          />
          <p className="mt-2 text-[12px] text-muted-foreground">
            Minimum 10 guests. We'll bill per Mann (100 guests), rounded up.
          </p>
        </div>
      )}
      <p className="mt-6 text-[13px] text-muted-foreground">
        An approximate number is fine — you can change it later.
      </p>
    </>
  );
}

function StepPreferences() {
  const { plan, update } = usePlan();
  return (
    <>
      <StepHeading
        title="Food preference & service"
        note="Tell us how your guests like to eat."
      />

      <p className="eyebrow mt-2">Food preference</p>
      <div className="mt-3 grid gap-2">
        {([
          { id: "nonveg", label: "Non-Veg", desc: "Chicken, mutton & seafood" },
          { id: "veg", label: "Vegetarian", desc: "Pure veg, no egg" },
          { id: "mixed", label: "Mixed", desc: "Both veg & non-veg" },
        ] as const).map((f) => {
          const selected = plan.foodPreference === f.id;
          return (
            <button
              key={f.id}
              onClick={() => update({ foodPreference: f.id })}
              className={cx(
                "press flex items-center gap-3 rounded-[14px] border p-4 text-left",
                selected ? "border-primary bg-champagne/40" : "border-border bg-card",
              )}
            >
              <span
                className={cx(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                  selected ? "border-primary bg-primary" : "border-border",
                )}
              >
                {selected && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">{f.label}</span>
                <span className="block text-[12px] text-muted-foreground">{f.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="eyebrow mt-6">Serving style</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {["Buffet", "Packed Meals", "Live Counter", "Traditional Service"].map((s) => {
          const selected = plan.servingStyle === s;
          return (
            <button
              key={s}
              onClick={() => update({ servingStyle: s })}
              className={cx(
                "press flex items-center gap-2.5 rounded-[14px] border p-3.5 text-left",
                selected ? "border-primary bg-champagne/40" : "border-border bg-card",
              )}
            >
              <span
                className={cx(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                  selected ? "border-primary bg-primary" : "border-border",
                )}
              >
                {selected && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
              </span>
              <span className="min-w-0 text-[14px] font-medium leading-tight">{s}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}



function StepChoice({ onPick }: { onPick: () => void }) {
  const { plan, update } = usePlan();
  const pick = (mode: "package" | "custom") => {
    update({ mode });
    onPick();
  };

  const card = (
    key: "package" | "custom",
    badge: string | null,
    title: string,
    desc: string,
    icon: React.ReactNode,
  ) => {
    const selected = plan.mode === key;
    return (
      <button
        key={key}
        onClick={() => pick(key)}
        className={cx(
          "press group relative flex items-center gap-4 rounded-[18px] border p-4 text-left transition-colors sm:p-5",
          selected ? "border-primary bg-champagne/40" : "border-border bg-card hover:border-gold/60",
        )}
      >
        <span
          className={cx(
            "grid h-12 w-12 shrink-0 place-items-center rounded-[12px] transition-colors",
            selected ? "bg-primary text-primary-foreground" : "bg-surface text-gold",
          )}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          {badge && (
            <span className="mb-1 inline-block rounded-full bg-surface px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-gold">
              {badge}
            </span>
          )}
          <span className="block font-display text-[19px] leading-tight sm:text-[21px]">{title}</span>
          <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">{desc}</span>
        </span>
        <span className="shrink-0 self-center text-[12px] font-medium text-gold">
          {selected ? "Selected" : "Choose this"}
        </span>
      </button>
    );
  };

  return (
    <>
      <StepHeading title="How would you like to plan?" />
      <div className="grid gap-3">
        {card(
          "package",
          "Recommended",
          "Choose a Package",
          "Quickest way to plan. We've balanced the menu for you.",
          <Package className="h-5 w-5" />,
        )}
        {card(
          "custom",
          null,
          "Build My Own Menu",
          "Choose every dish yourself, category by category.",
          <UtensilsCrossed className="h-5 w-5" />,
        )}
      </div>
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
