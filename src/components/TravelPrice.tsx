import { travelMoney, type TravelPackage } from "@/lib/travel-booking";

type PricePackage = Pick<
  TravelPackage,
  "price_per_adult" | "price_basis" | "pricing_mode" | "pricing_note"
>;
export function TravelPrice({
  pkg,
  adults,
  compact = false,
}: {
  pkg: PricePackage;
  adults?: number | undefined;
  compact?: boolean;
}) {
  const price = pkg.pricing_mode === "on_request" ? null : pkg.price_per_adult;
  const seasonal = pkg.pricing_mode === "seasonal";
  return (
    <div className="rounded-2xl bg-surface p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {seasonal
          ? "Seasonal starting guide"
          : price == null
            ? "Personal quotation"
            : "Starting price"}
      </p>
      <p className={compact ? "mt-1 text-[24px] font-semibold" : "mt-1 text-[30px] font-semibold"}>
        {price == null ? "Price on request" : <>From {travelMoney(Number(price))}</>}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {pkg.price_basis || "Per adult; room sharing confirmed in quotation"}
      </p>
      {adults != null && price != null && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-sm font-semibold">
            {travelMoney(Number(price) * adults)} for {adults} {adults === 1 ? "adult" : "adults"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Starting estimate at the displayed sharing basis. Children, room changes and extras are
            quoted separately.
          </p>
        </div>
      )}
      {price == null && (
        <p className="mt-2 text-xs text-muted-foreground">
          Share your dates and preferences for a written quotation.
        </p>
      )}
      {compact ? (
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer py-1 font-semibold">How pricing works</summary>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            {pkg.pricing_note || "Final price is confirmed before booking."}
          </p>
        </details>
      ) : (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {pkg.pricing_note || "Final price is confirmed before booking."}
        </p>
      )}
    </div>
  );
}
