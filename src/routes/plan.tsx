"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- booking RPC is defined in the database migration. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  LockKeyhole,
  Package,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { inr, packageTotalFor } from "@/lib/data";
import { recommendedTrays, usePlan } from "@/lib/plan-store";
import { supabase } from "@/integrations/supabase/client";
import { BrandMark } from "@/components/Brand";
import {
  Button,
  ChoiceCard,
  DietMark,
  QuantitySelector,
  SectionHeader,
  cx,
} from "@/components/ui-kit";

const routeMetadata = {
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
};

const stepTitles = [
  "Event Category",
  "Date & Guests",
  "Packages",
  "Preferences",
  "What’s included",
  "Optional add-ons",
  "Sign in",
  "Review & Contact",
];

const CUSTOMER_PROFILE_STORAGE_KEY = "majlise-aala-customer-profile";

type SavedCustomerProfile = {
  contact: { name: string; phone: string; whatsapp: string; email: string };
  venue: { address: string; area: string; city: string; pincode: string; landmark: string };
};

function savedProfileKey(userId: string) {
  return `${CUSTOMER_PROFILE_STORAGE_KEY}:${userId}`;
}

function profileFromUser(user: User): SavedCustomerProfile | null {
  try {
    const localProfile = window.localStorage.getItem(savedProfileKey(user.id));
    if (localProfile) return JSON.parse(localProfile) as SavedCustomerProfile;
  } catch {
    // Local storage is an additional offline fallback; auth metadata remains available.
  }

  const data = user.user_metadata ?? {};
  if (!data["customer_profile"] || typeof data["customer_profile"] !== "object") return null;
  return data["customer_profile"] as SavedCustomerProfile;
}

const serviceOptions = [
  "Buffet Setup",
  "Serving Staff",
  "Live Counters",
  "Tables",
  "Disposable Dinnerware",
  "Drinking Water",
];

export default function PlanFlow() {
  const [step, setStep] = useState(0);
  const {
    plan,
    update,
    foodTotal,
    occasions,
    packages,
    catalogLoading,
    recordBooking,
    items: _u,
  } = usePlan() as never as ReturnType<typeof usePlan> & {
    items?: never;
  };
  const navigate = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<User | null>(null);

  const applySavedProfile = (user: User) => {
    const saved = profileFromUser(user);
    update({
      contact: {
        ...plan.contact,
        email: plan.contact.email || user.email || "",
        ...(saved?.contact ?? {}),
      },
      ...(saved ? { venue: { ...plan.venue, ...saved.venue } } : {}),
    });
  };

  useEffect(() => {
    const requestedStep = Number(new URLSearchParams(window.location.search).get("step"));
    if (Number.isInteger(requestedStep) && requestedStep >= 0 && requestedStep <= 7) {
      setStep(requestedStep);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [step]);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCustomer(data.user);
        applySavedProfile(data.user);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCustomer(session?.user ?? null);
      if (session?.user) applySavedProfile(session.user);
    });
    return () => listener.subscription.unsubscribe();
    // The listener intentionally establishes the profile once per authenticated session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = () => {
    if (step === 1) {
      update({ mode: "package" });
      setStep(2);
      return;
    }
    if (step === 5 && customer) {
      setStep(7);
      return;
    }
    setStep((s) => Math.min(7, s + 1));
  };
  const back = () => (step === 0 ? navigate.push("/") : setStep((s) => s - 1));

  const submitBooking = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    const occasionName = occasions.find((occasion) => occasion.id === plan.occasion)?.name ?? null;
    const { data, error } = await (supabase as any).rpc("submit_booking", {
      p_booking: {
        customer_name: plan.contact.name,
        phone: plan.contact.phone,
        email: plan.contact.email,
        occasion: occasionName,
        event_date: plan.date || null,
        guests: plan.guests,
        mode: plan.mode ?? "package",
        package_id: plan.packageId,
        items: plan.items,
        services: plan.services,
        estimated_total: foodTotal,
        food_preference: plan.foodPreference,
        serving_style: plan.servingStyle,
        venue: plan.venue,
      },
    });

    if (error || !data?.[0]?.booking_reference) {
      setSubmitError(error?.message ?? "We couldn't submit your booking. Please try again.");
      setSubmitting(false);
      return;
    }

    const reference = data[0].booking_reference as string;
    if (customer) {
      const profile: SavedCustomerProfile = { contact: plan.contact, venue: plan.venue };
      try {
        window.localStorage.setItem(savedProfileKey(customer.id), JSON.stringify(profile));
      } catch {
        // Auth metadata below still saves the profile when browser storage is unavailable.
      }
      await supabase.auth.updateUser({ data: { customer_profile: profile } });
    }
    recordBooking({
      reference,
      occasion: occasionName ?? "Celebration",
      eventDate: plan.date,
      guests: plan.guests,
      packageName: packages.find((pkg) => pkg.id === plan.packageId)?.name ?? "Catering package",
      status: "new",
      createdAt: new Date().toISOString(),
    });
    navigate.push(`/booking-confirmed?ref=${encodeURIComponent(reference)}`);
  };

  const canContinue = (() => {
    if (step === 0) return !!plan.occasion;
    if (step === 1) return plan.guests > 0;
    if (step === 2) return !catalogLoading && (plan.mode === "custom" || !!plan.packageId);
    if (step === 6) return !!customer;
    if (step === 7) return plan.contact.name.trim() !== "" && plan.contact.phone.trim().length >= 8;
    return true;
  })();

  const helperText = (() => {
    if (step === 0 && !plan.occasion) return "Please choose the occasion you're planning for.";
    if (step === 2 && catalogLoading) return "Loading the latest menu and packages…";
    if (step === 2 && plan.mode === "package" && !plan.packageId)
      return "Please select a catering package to continue.";
    if (step === 6 && !canContinue) return "Please sign in or create an account to continue.";
    if (step === 7 && !canContinue) return "Please share your name and mobile number.";
    return null;
  })();

  const primaryLabel = [
    "Continue",
    "View matching packages",
    "Continue",
    "Continue",
    "Continue",
    "Continue",
    "Continue to your details",
    "Confirm Catering Request",
  ][step]!;

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto grid max-w-[1280px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 sm:px-8">
          <button
            onClick={back}
            aria-label="Go back"
            className="press grid h-10 w-10 place-items-center rounded-full border border-border bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-text">
              Step {step + 1} of 8
            </p>
            <p className="truncate text-[15px] font-semibold">{stepTitles[step]}</p>
          </div>
          <Link
            href="/"
            aria-label="Close"
            className="press grid h-10 w-10 place-items-center rounded-full border border-border bg-card"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>
        <div className="h-[3px] w-full bg-surface">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${((step + 1) / 8) * 100}%`, background: "var(--primary)" }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8 lg:py-10">
        {step === 0 && <StepOccasion />}
        {step === 1 && <StepDateGuests />}
        {step === 2 && <StepFood />}
        {step === 3 && <StepPreferences />}
        {step === 4 && <StepServices />}
        {step === 5 && <StepAddOns />}
        {step === 6 && (
          <StepAuth
            customer={customer}
            onAuthenticated={(user) => {
              setCustomer(user);
              applySavedProfile(user);
            }}
          />
        )}
        {step === 7 && <StepReview total={foodTotal} />}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 backdrop-blur-md">
        <div className="mx-auto max-w-[1280px]">
          {helperText && (
            <p className="mb-3 text-center text-[13px] text-muted-foreground">{helperText}</p>
          )}
          {submitError && (
            <p className="mb-3 text-center text-[13px] text-destructive">{submitError}</p>
          )}
          <Button
            size="lg"
            full
            disabled={!canContinue || submitting}
            onClick={() => {
              if (step === 7) {
                void submitBooking();
              } else next();
            }}
          >
            {submitting ? "Submitting booking..." : primaryLabel}
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
  const { plan, update, occasions } = usePlan();
  return (
    <>
      <SectionHeader
        eyebrow="Choose your event category"
        title="What are you celebrating?"
        subtitle="Pick a category to see the packages created for it."
      />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {occasions.map((o) => {
          const selected = plan.occasion === o.id;
          return (
            <button
              key={o.id}
              onClick={() => update({ occasion: o.id, packageId: null })}
              aria-pressed={selected}
              className={cx(
                "group relative min-h-[222px] cursor-pointer overflow-hidden rounded-[22px] border-2 text-left shadow-[0_14px_30px_rgba(55,42,25,0.18)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_42px_rgba(55,42,25,0.28)] active:translate-y-0 active:scale-[0.975] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/40 sm:min-h-[280px] sm:rounded-[26px]",
                selected ? "border-gold ring-2 ring-gold/60" : "border-card hover:border-gold",
              )}
            >
              <img
                src={o.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/30" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span
                className={cx(
                  "absolute left-3 top-3 z-10 inline-flex h-6 items-center gap-1 rounded-full px-2 text-[9px] font-bold uppercase tracking-[0.1em] shadow-sm sm:left-4 sm:top-4 sm:text-[10px]",
                  selected ? "bg-gold text-primary" : "bg-card text-muted-foreground",
                )}
              >
                {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                {selected ? "Selected" : "Choose"}
              </span>
              <span
                className={cx(
                  "absolute inset-x-3 bottom-3 z-10 flex min-h-14 items-center rounded-[16px] px-3 py-2 shadow-[0_8px_20px_rgba(18,14,9,0.14)] backdrop-blur-sm sm:inset-x-5 sm:bottom-5 sm:min-h-[72px] sm:rounded-[18px] sm:px-4",
                  selected ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
                )}
              >
                <span className="block min-w-0 whitespace-nowrap font-display text-[18px] leading-none sm:text-[26px]">
                  {o.name}
                </span>
              </span>
              <span className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-card text-foreground shadow-[0_10px_20px_rgba(18,14,9,0.28)] transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-primary-foreground group-active:scale-90 sm:right-5 sm:top-5 sm:h-12 sm:w-12">
                <ArrowRight className="h-4 w-4" />
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
      <div className="mt-8 flex items-center justify-between gap-3">
        <p className="eyebrow">Number of guests</p>
        <span className="text-[12px] text-muted-foreground">Choose a preset or enter your own</span>
      </div>
      <div className="mt-3 rounded-[18px] border border-border bg-card p-2 shadow-[0_8px_18px_rgba(55,42,25,0.06)]">
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
      <div className="mt-4 grid grid-cols-3 gap-2">
        {presets.map((g) => (
          <button
            key={g}
            onClick={() => {
              setCustomMode(false);
              update({ guests: g });
            }}
            className={cx(
              "press flex h-14 flex-col items-center justify-center rounded-[14px] border text-[15px] font-semibold transition-colors",
              !customMode && plan.guests === g
                ? "border-primary bg-primary text-primary-foreground shadow-[0_8px_16px_rgba(35,29,22,0.16)]"
                : "border-border bg-card text-foreground hover:border-gold",
            )}
          >
            {g === 500 ? "500+" : g}
            <span
              className={cx(
                "mt-0.5 text-[10px] font-medium",
                !customMode && plan.guests === g ? "text-primary-foreground/70" : "text-muted-text",
              )}
            >
              guests
            </span>
          </button>
        ))}
      </div>
      <div
        className={cx(
          "mt-3 overflow-hidden rounded-[18px] border transition-colors",
          customMode ? "border-gold/50 bg-champagne/30" : "border-border bg-card hover:border-gold",
        )}
      >
        <button
          onClick={() => setCustomMode(true)}
          className="press flex h-14 w-full items-center justify-between px-4 text-left"
        >
          <span className="text-[15px] font-semibold">Custom guest count</span>
          <span className="text-[12px] text-muted-foreground">Enter an exact number</span>
        </button>
        {customMode && (
          <div className="border-t border-gold/25 px-4 pb-4 pt-3 duration-300 animate-in fade-in slide-in-from-bottom-2">
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
      </div>
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
      <StepHeading title="Food preference & service" note="Tell us how your guests like to eat." />

      <p className="eyebrow mt-2">Food preference</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {(
          [
            { id: "nonveg", label: "Non-Veg", desc: "Chicken, mutton & seafood" },
            { id: "veg", label: "Vegetarian", desc: "Pure veg, no egg" },
            { id: "mixed", label: "Mixed", desc: "Both veg & non-veg" },
          ] as const
        ).map((f) => {
          const selected = plan.foodPreference === f.id;
          return (
            <button
              key={f.id}
              onClick={() => update({ foodPreference: f.id })}
              className={cx(
                "press relative flex min-h-[112px] items-center gap-3 rounded-[15px] border p-3.5 text-left",
                f.id === "nonveg" && "col-span-2 min-h-[92px]",
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
                {f.id === "nonveg" && (
                  <span className="mb-1 inline-block rounded-full bg-gold px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.1em] text-primary">
                    Recommended
                  </span>
                )}
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
          selected
            ? "border-primary bg-champagne/40"
            : "border-border bg-card hover:border-gold/60",
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
          <span className="block font-display text-[19px] leading-tight sm:text-[21px]">
            {title}
          </span>
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
  const { plan, update, addItem, setQuantity, quantityOf, dishes, packages, catalogLoading } =
    usePlan();
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);
  const [expandedSectionKey, setExpandedSectionKey] = useState<string | null>(null);

  if (plan.mode === "package") {
    return (
      <>
        <StepHeading title="Pick your package" note={`Prices shown for ${plan.guests} guests.`} />
        <div className="grid gap-3">
          {catalogLoading && packages.length === 0 && <CatalogueLoading label="packages" />}
          {packages
            .filter((p) => !p.eventCategoryId || p.eventCategoryId === plan.occasion)
            .map((p) => (
              <article
                key={p.id}
                className={cx(
                  "overflow-hidden rounded-[16px] border bg-card",
                  plan.packageId === p.id
                    ? "border-primary ring-1 ring-primary/20"
                    : "border-border",
                )}
              >
                <div className="p-4">
                  <h2 className="font-display text-[25px] leading-tight">{p.name}</h2>
                  {p.tagline && (
                    <p className="mt-1 text-[13px] text-muted-foreground">{p.tagline}</p>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedPackageId((current) => (current === p.id ? null : p.id))
                    }
                    aria-expanded={expandedPackageId === p.id}
                    className="press mt-5 w-full overflow-hidden rounded-[16px] bg-surface text-left"
                  >
                    <span className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
                      <span>
                        <span className="block text-[24px] font-bold leading-none">
                          {inr(packageTotalFor(p, plan.guests))}
                        </span>
                        <span className="mt-1 block text-[12px] text-muted-foreground">
                          Package price · serves {p.guestCountFrom}–{p.guestCountTo} guests
                        </span>
                      </span>
                      <span
                        className={cx(
                          "grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-transform",
                          expandedPackageId === p.id && "rotate-180 border-gold/50 text-gold",
                        )}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </span>
                    </span>
                    <span className="flex items-center justify-between border-t border-border/80 px-4 py-2.5 text-[12px] font-semibold text-gold">
                      {expandedPackageId === p.id ? "Hide what’s included" : "View what’s included"}
                      <span>
                        {expandedPackageId === p.id ? "Tap to collapse" : "Tap to view menu items"}
                      </span>
                    </span>
                  </button>
                  <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                    Estimate for {plan.guests.toLocaleString("en-IN")} guests. Final menu
                    inclusions, quantities and service details are confirmed by our catering team.
                  </p>
                </div>
                {expandedPackageId === p.id && (
                  <div className="border-t border-border bg-surface/30">
                    <div className="border-b border-border bg-champagne/30 px-4 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-[.14em] text-gold">
                        What's included
                      </p>
                    </div>
                    {p.sections.length === 0 && (
                      <p className="px-4 py-3 text-[12px] text-muted-foreground">
                        Menu details are loading…
                      </p>
                    )}
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
                              "press flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left",
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
                <div className="border-t border-border p-4">
                  <Button
                    full
                    onClick={() =>
                      update({
                        packageId: p.id,
                        occasion: p.eventCategoryId ?? plan.occasion,
                        foodPreference: p.foodPreference ?? "mixed",
                        services: p.includedServices ?? [],
                      })
                    }
                  >
                    {plan.packageId === p.id ? "Selected package" : "Select package"}
                  </Button>
                </div>
              </article>
            ))}
          {!catalogLoading &&
            packages.filter((p) => !p.eventCategoryId || p.eventCategoryId === plan.occasion)
              .length === 0 && (
              <p className="rounded-[16px] border border-border bg-surface/50 p-4 text-sm text-muted-foreground">
                No package has been added for this occasion yet. Choose another occasion or ask us
                for a custom menu.
              </p>
            )}
        </div>
      </>
    );
  }

  const groups = ["Starters", "Kebabs", "Biryani", "Main Course", "Breads", "Desserts", "Drinks"];

  return (
    <>
      <StepHeading
        title="Choose your dishes"
        note={`For ${plan.guests} guests we suggest 2 starters, 2 mains, 1 biryani, 1 bread and 1 dessert.`}
      />
      <div className="space-y-8">
        {catalogLoading && dishes.length === 0 && <CatalogueLoading label="dishes" />}
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
                  const rec = recommendedTrays(plan.guests, d.serves);
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

function CatalogueLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-3 rounded-[16px] border border-border bg-surface/50 p-4 text-sm text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      Loading available {label}…
    </div>
  );
}

function StepServices() {
  const { plan, update, packages } = usePlan();
  const pkg = packages.find((item) => item.id === plan.packageId);
  if (plan.mode === "package" && pkg) {
    const included = pkg.includedServices ?? [];
    const excluded = pkg.excludedServices ?? [];
    return (
      <>
        <StepHeading
          title={`Inside your ${pkg.name}`}
          note="This is your package summary — nothing to choose on this step."
        />
        <div className="overflow-hidden rounded-[18px] border border-border bg-card shadow-card">
          <div className="border-b border-border bg-champagne/30 p-4">
            <p className="eyebrow">Included in your package</p>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Your selected menu and package essentials are shown below.
            </p>
          </div>
          <div className="divide-y divide-border">
            {pkg.sections.map((section) => (
              <div key={section.title} className="p-4">
                <p className="text-[15px] font-semibold">{section.title}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {section.items.length ? section.items.join(" · ") : "Included in your package"}
                </p>
              </div>
            ))}
            {included.map((service) => (
              <div key={service} className="flex items-center gap-3 p-4">
                <Check className="h-4 w-4 text-gold" />
                <span className="text-[14px] font-medium">{service}</span>
              </div>
            ))}
            {pkg.sections.length === 0 && included.length === 0 && (
              <p className="p-4 text-[14px] text-muted-foreground">
                Your catering team will confirm the package inclusions with you.
              </p>
            )}
          </div>
        </div>
      </>
    );
  }
  const toggle = (s: string) =>
    update({
      services: plan.services.includes(s)
        ? plan.services.filter((x) => x !== s)
        : [...plan.services, s],
    });
  return (
    <>
      <StepHeading title="Anything else you need?" note="All optional — add only what helps." />
      <div className="grid grid-cols-2 gap-3">
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

function StepAddOns() {
  const { plan, update, packages, addOns } = usePlan();
  const pkg = packages.find((item) => item.id === plan.packageId);
  const options = addOns
    .filter(
      (addOn) =>
        (!addOn.eventCategoryIds.length || addOn.eventCategoryIds.includes(plan.occasion ?? "")) &&
        (!addOn.packageIds.length || addOn.packageIds.includes(pkg?.id ?? "")),
    )
    .map((addOn) => ({ id: addOn.id, name: addOn.name, description: addOn.description }));
  const toggle = (service: string) =>
    update({
      services: plan.services.includes(service)
        ? plan.services.filter((item) => item !== service)
        : [...plan.services, service],
    });

  return (
    <>
      <StepHeading
        title="Anything else you need?"
        note="Add optional event services to your request. Final availability and pricing will be confirmed by our team."
      />
      <div className="grid grid-cols-2 gap-3">
        {options.map((addOn) => {
          const selected = plan.services.includes(addOn.name);
          return (
            <button
              key={addOn.id}
              type="button"
              onClick={() => toggle(addOn.name)}
              className={cx(
                "press relative min-h-[108px] rounded-[16px] border p-3.5 text-left",
                selected ? "border-gold bg-champagne/35" : "border-border bg-card",
              )}
            >
              <span className="block pr-1">
                <span className="block text-[15px] font-semibold">{addOn.name}</span>
                <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                  {addOn.description || "Optional service"}
                </span>
              </span>
              <span
                className={cx(
                  "absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full border-2",
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}
              >
                {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
        {options.length === 0 && (
          <p className="rounded-[15px] border border-border bg-card p-4 text-[14px] text-muted-foreground">
            No optional add-ons are available for this event and package.
          </p>
        )}
      </div>
    </>
  );
}

function StepAuth({
  customer,
  onAuthenticated,
}: {
  customer: User | null;
  onAuthenticated: (user: User) => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setBusy(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (!result.data.session) {
      setNotice("Check your inbox to confirm your email, then return here to sign in.");
      return;
    }
    if (result.data.user) onAuthenticated(result.data.user);
  };

  if (customer) {
    return (
      <>
        <StepHeading
          title="You’re signed in"
          note="Your saved details will be ready on the next step."
        />
        <div className="rounded-[18px] border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-champagne text-gold">
              <Check className="h-5 w-5" strokeWidth={3} />
            </span>
            <div>
              <p className="font-semibold">{customer.email}</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Your booking details are protected.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="press mt-5 text-[13px] font-semibold text-gold"
          >
            Use a different account
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <StepHeading
        title={mode === "signin" ? "Welcome back" : "Save your booking details"}
        note="Sign in once and we’ll securely remember your contact and venue details for your next booking."
      />
      <div className="rounded-[20px] border border-border bg-card p-5 shadow-card sm:p-6">
        <div className="mb-6 grid grid-cols-2 rounded-[12px] bg-surface p-1">
          {(["signin", "signup"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setMode(option);
                setError(null);
                setNotice(null);
              }}
              className={cx(
                "rounded-[9px] px-3 py-2.5 text-[13px] font-semibold transition-colors",
                mode === option ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {option === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
        <form className="grid gap-4" onSubmit={submit}>
          <label className="block">
            <span className="eyebrow">Email address</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 h-14 w-full rounded-[12px] border border-border bg-background px-4 text-[16px] outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="eyebrow">Password</span>
            <input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              className="mt-2 h-14 w-full rounded-[12px] border border-border bg-background px-4 text-[16px] outline-none focus:border-gold"
            />
          </label>
          {error && <p className="text-[13px] text-destructive">{error}</p>}
          {notice && <p className="text-[13px] text-muted-foreground">{notice}</p>}
          <Button type="submit" size="lg" full disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LockKeyhole className="h-4 w-4" />
            )}
            {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>
      </div>
    </>
  );
}

function StepReview({ total }: { total: number }) {
  const { plan, update, packages, occasions } = usePlan();
  const pkg = packages.find((p) => p.id === plan.packageId);
  const occasionName = occasions.find((occasion) => occasion.id === plan.occasion)?.name;

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
          {occasionName ?? "Celebration"} • {plan.guests} guests
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
          <div className="mt-3 rounded-[12px] border border-gold/30 bg-champagne/25 p-3 text-[12px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Estimated amount only. </span>
            Final pricing is confirmed after we review the guest count, menu changes, add-ons, food
            preferences, service requirements and venue or delivery details with you.
          </div>
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
        <div className="grid gap-4 sm:grid-cols-2">
          {field(
            "Venue area",
            plan.venue.area,
            (v) => update({ venue: { ...plan.venue, area: v } }),
            "text",
            "e.g. Frazer Town",
          )}
          {field(
            "Pincode",
            plan.venue.pincode,
            (v) => update({ venue: { ...plan.venue, pincode: v } }),
            "text",
            "e.g. 560005",
          )}
        </div>
      </div>

      <p className="mt-5 text-[13px] text-muted-foreground">
        No account needed. We'll call or WhatsApp you to confirm the details.
      </p>
    </>
  );
}
