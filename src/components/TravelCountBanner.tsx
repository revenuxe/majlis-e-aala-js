"use client";
import { TravelSeniorCount } from "@/components/TravelSeniorCount";
import { QuantitySelector } from "@/components/ui-kit";
import type { TravelCategory } from "@/lib/travel";
import { travelCategories } from "@/lib/travel";

export function TravelCountBanner({
  category,
  adults,
  children,
  seniors = 0,
  onSeniors,
  onChange,
  onBack,
  editing = false,
  onAdults,
  onChildren,
  compact = false,
}: {
  category: TravelCategory | "";
  adults: number;
  children: number;
  seniors?: number;
  onSeniors?: (value: number) => void;
  onChange: () => void;
  onBack?: () => void;
  editing?: boolean;
  onAdults?: (value: number) => void;
  onChildren?: (value: number) => void;
  compact?: boolean;
}) {
  const journey = travelCategories.find((item) => item.id === category);
  const seniorCount = Math.min(seniors, adults);
  const seniorSummary =
    seniorCount > 0
      ? `Includes ${seniorCount} senior ${seniorCount === 1 ? "citizen" : "citizens"} in the adult count`
      : null;
  if (compact) {
    return (
      <section
        aria-label="Your travellers"
        className="rounded-2xl border border-gold/30 bg-surface p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">
              {adults + children} {adults + children === 1 ? "traveller" : "travellers"} · {adults}{" "}
              {adults === 1 ? "adult" : "adults"}
              {children > 0 ? ` + ${children} ${children === 1 ? "child" : "children"}` : ""}
            </p>
            {seniorSummary && <p className="mt-1 text-sm text-muted-foreground">{seniorSummary}</p>}
          </div>
          <button
            type="button"
            onClick={onChange}
            className="min-h-11 rounded-xl border border-gold/40 bg-card px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Edit travellers
          </button>
        </div>
      </section>
    );
  }
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-primary px-5 pb-8 pt-6 text-primary-foreground shadow-[0_18px_36px_rgba(41,32,20,0.18)] sm:px-7 sm:pt-8">
      {/* Decorative image mirrors the catering package banner. */}
      <img
        src={journey?.image || "/travel/makkah.jpg"}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/45" />
      <span className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-gold/15" />
      <div className="relative">
        <button
          onClick={onBack || onChange}
          className="press text-left text-[13px] font-semibold text-gold"
        >
          ← Edit journey or travellers
        </button>
        <h2 className="mt-3 font-display text-[30px] leading-tight sm:text-[38px]">
          {journey?.name || "Travel"} Packages
        </h2>
        <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-primary-foreground/75">
          Packages tailored for your journey.
        </p>
        <div className="mt-5 rounded-[18px] border border-gold/40 bg-card p-4 text-foreground shadow-[0_8px_20px_rgba(0,0,0,0.16)] sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="eyebrow">Your traveller count</p>
              <p className="mt-1 text-[15px] font-semibold">
                {adults + children} {adults + children === 1 ? "traveller" : "travellers"}
              </p>
              {seniorSummary && (
                <p className="mt-1 text-sm text-muted-foreground">{seniorSummary}</p>
              )}
              <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-[11px]">
                All adult package estimates update instantly.
              </p>
            </div>
            <button
              onClick={onChange}
              aria-expanded={editing}
              className="press shrink-0 rounded-full border border-gold/60 bg-champagne/45 px-3 py-2 text-[13px] font-bold text-foreground hover:border-gold sm:px-4"
            >
              {editing ? "Done" : "Edit travellers"}
            </button>
          </div>
          {editing && onAdults && onChildren && (
            <div className="mt-5 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold">Adults · 18+</p>
                <QuantitySelector
                  min={1}
                  value={adults}
                  suffix="Adults"
                  onChange={(value) => onAdults(Math.max(1, Math.min(100 - children, value)))}
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Children · under 18</p>
                <QuantitySelector
                  min={0}
                  value={children}
                  suffix="Children"
                  onChange={(value) => onChildren(Math.max(0, Math.min(20, 100 - adults, value)))}
                />
              </div>
              {onSeniors && (
                <div className="sm:col-span-2">
                  <TravelSeniorCount adults={adults} value={seniors} onChange={onSeniors} />
                </div>
              )}
              <button
                type="button"
                onClick={onChange}
                className="press min-h-12 w-full rounded-[14px] bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:col-span-2"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
