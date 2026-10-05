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
    <div className="rounded-[20px] border border-gold/40 bg-champagne/20 p-5">
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
        <input
          type="checkbox"
          checked={value > 0}
          onChange={(event) => onChange(event.target.checked ? 1 : 0)}
          className="h-5 w-5 accent-black"
        />
        Travelling with senior citizens (60+)
      </label>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Included in your adult count. Tell us how many need senior-friendly planning.
      </p>
      {value > 0 && (
        <div className="mt-4">
          <QuantitySelector
            min={1}
            value={value}
            suffix="Senior travellers"
            onChange={(count) => onChange(Math.max(1, Math.min(adults, count)))}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Up to {adults} adults. Assistance preferences are available during booking.
          </p>
        </div>
      )}
    </div>
  );
}
