"use client";
import { QuantitySelector } from "@/components/ui-kit";
import type { TravelCategory } from "@/lib/travel";
import { travelCategories } from "@/lib/travel";

export function TravelCountBanner({
  category,
  adults,
  children,
  onChange,
  editing = false,
  onAdults,
  onChildren,
}: {
  category: TravelCategory | "";
  adults: number;
  children: number;
  onChange: () => void;
  editing?: boolean;
  onAdults?: (value: number) => void;
  onChildren?: (value: number) => void;
}) {
  const journey = travelCategories.find((item) => item.id === category);
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-primary p-6 text-white shadow-lg sm:p-9">
      {/* Decorative image mirrors the catering package banner. */}
      <img
        src={journey?.image || "/travel/makkah.jpg"}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/35" />
      <div className="relative">
        <button onClick={onChange} className="min-h-11 text-left text-sm font-semibold text-gold">
          ← Edit journey or travellers
        </button>
        <h2 className="mt-2 font-display text-[36px] leading-tight">
          {journey?.name || "Travel"} Packages
        </h2>
        <p className="mt-3 text-sm text-white/80">Journeys tailored to your group.</p>
        <div className="mt-6 rounded-[22px] border border-gold/35 bg-card p-5 text-foreground">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-muted-foreground">
                Your traveller count
              </p>
              <p className="mt-2 text-[16px] font-semibold">
                {adults + children} travellers{" "}
                <span className="font-normal text-muted-foreground">
                  · {adults} adults{children ? `, ${children} children` : ""}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Adult estimates update instantly. Children are quoted separately.
              </p>
            </div>
            <button
              onClick={onChange}
              aria-expanded={editing}
              className="min-h-11 shrink-0 rounded-full border border-gold/50 bg-surface px-4 text-sm font-semibold"
            >
              {editing ? "Done" : "Change"}
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
