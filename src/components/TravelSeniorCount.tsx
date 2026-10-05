"use client";
import { QuantitySelector } from "@/components/ui-kit";
export function TravelSeniorCount({
  adults,
  value,
  onChange,
}: {
  adults: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="min-w-0 rounded-[18px] border border-gold/40 bg-champagne/20 p-4">
      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm font-semibold leading-relaxed">
        <input
          type="checkbox"
          checked={value > 0}
          onChange={(event) => onChange(event.target.checked ? 1 : 0)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-black"
        />
        <span className="min-w-0">
          Travelling with senior citizens <span className="whitespace-nowrap">(60+)</span>
        </span>
      </label>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Included in your adult count. Tell us how many need senior-friendly planning.
      </p>
      {value > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold">Number of senior travellers</p>
          <QuantitySelector
            compact
            min={1}
            value={value}
            suffix="Senior travellers"
            onChange={(count) => onChange(Math.max(1, Math.min(adults, count)))}
          />
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Included in your {adults} {adults === 1 ? "adult" : "adults"}. Choose assistance during
            booking.
          </p>
        </div>
      )}
    </div>
  );
}
