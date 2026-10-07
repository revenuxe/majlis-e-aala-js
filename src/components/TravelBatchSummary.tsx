import { travelDate, type TravelDeparture } from "@/lib/travel-booking";
export function TravelBatchSummary({ batch }: { batch: TravelDeparture }) {
  return (
    <div className="rounded-xl border border-gold/30 bg-champagne/30 p-4 text-sm">
      <p className="font-semibold">Your selected batch</p>
      <p className="mt-1">
        {travelDate(batch.start_date)}
        {batch.end_date ? ` – ${travelDate(batch.end_date)}` : ""} · {batch.departure_city}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Availability will be confirmed by our team. Choose “Keep my preferred dates” above to
        request a different date.
      </p>
    </div>
  );
}
