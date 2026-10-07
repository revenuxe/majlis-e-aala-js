"use client";
import { useId, useState, type ReactNode } from "react";
import { Check, ChevronDown, Heart, Plane } from "lucide-react";
import { cx } from "@/components/ui-kit";
import { packageAdultPrice, travelMoney, type TravelPackage } from "@/lib/travel-booking";
import { useSavedTravelPackages } from "@/components/TravelSavedPackages";
import { travelWhatsApp } from "@/lib/travel";
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group/section border-b border-border last:border-0">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-card transition-transform group-open/section:rotate-180">
          <ChevronDown size={16} />
        </span>
      </summary>
      <div className="border-t border-border bg-surface/40 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </details>
  );
}
export function TravelPackageChoice({
  pkg,
  selected = false,
  adults,
  children = 0,
  seniors = 0,
  onSelect,
  selectLabel,
  flightOptionId,
  onFlightChange,
}: {
  pkg: TravelPackage;
  selected?: boolean;
  adults: number;
  children?: number;
  seniors?: number;
  onSelect: (flightOptionId: string | null) => void;
  flightOptionId?: string | null;
  onFlightChange?: (id: string) => void;
  selectLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const { items, savePackage } = useSavedTravelPackages();
  const isSaved = items.some((item) => item.packageId === pkg.id);
  const detailsId = useId();
  const [localFlightId, setLocalFlightId] = useState<string | null>(null);
  const flights = pkg.flight_options || [];
  const cheapestFlight =
    flights.find((option) => option.price_per_adult === packageAdultPrice(pkg)) || flights[0];
  const savedFlightId = items.find((item) => item.packageId === pkg.id)?.flightOptionId;
  const chosenFlight =
    flights.find((option) => option.id === (flightOptionId ?? localFlightId ?? savedFlightId)) ||
    cheapestFlight;
  const price =
    pkg.pricing_mode === "on_request"
      ? null
      : chosenFlight
        ? chosenFlight.price_per_adult
        : packageAdultPrice(pkg);
  const roomBasis = pkg.price_basis
    .replace(/\b(\d+)\s*\/\s*(\d+)\s+sharing\b/gi, "$1 to $2 people sharing one room")
    .replace(/\b(\d+)\s+sharing\b/gi, "$1 people sharing one room");
  return (
    <article
      className={cx(
        "package-card self-start overflow-hidden rounded-[28px] border bg-card",
        selected ? "package-card-featured border-gold ring-2 ring-gold/30" : "border-border",
      )}
    >
      <div className="p-4 pb-3 sm:p-5 sm:pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 break-words font-display text-[26px] leading-tight sm:text-[28px]">
            {pkg.name}
          </h3>
          {isSaved && (
            <span className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-champagne/50 px-2 py-1 text-[11px] font-semibold text-gold">
              <Heart size={13} className="fill-gold/20" aria-hidden="true" />
              Saved
            </span>
          )}
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border pb-2.5 text-sm leading-snug text-muted-foreground">
          <p className="rounded-md bg-surface px-2.5 py-1.5 font-semibold text-foreground">
            {pkg.duration}
          </p>
          <p className="min-w-0">{pkg.places}</p>
        </div>
        {pkg.inclusions.length > 0 && (
          <details className="group/inclusions mt-3 overflow-hidden rounded-xl border border-border bg-surface/30">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <Check size={16} className="shrink-0 text-gold" aria-hidden="true" />
                What’s included
                <span className="text-xs font-normal text-muted-foreground">
                  ({pkg.inclusions.length})
                </span>
              </span>
              <ChevronDown
                size={16}
                className="shrink-0 transition-transform group-open/inclusions:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <ul
              aria-label="Package inclusions"
              className="divide-y divide-border/60 border-t border-border px-3 text-xs leading-relaxed"
            >
              {pkg.inclusions.map((item, index) => (
                <li key={index} className="flex min-w-0 items-start gap-2 py-2">
                  <Check size={12} className="mt-1 shrink-0 text-gold" aria-hidden="true" />
                  <span className="min-w-0 break-words">{item}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
        <div className="relative mt-3">
          <div className="w-full rounded-[16px] border border-gold/25 bg-surface px-3 py-3 text-left sm:px-4">
            <div>
              <div className="space-y-3">
                <div className="min-w-0" aria-live="polite" aria-atomic="true">
                  {price != null && (
                    <span className="mb-1 block text-sm font-semibold text-muted-foreground">
                      Estimated total for {adults} {adults === 1 ? "adult" : "adults"}
                    </span>
                  )}
                  <span className="block text-[25px] font-bold leading-tight">
                    {price == null
                      ? "Price on request"
                      : `From ${travelMoney(Number(price) * adults)}`}
                  </span>
                  {price != null && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {travelMoney(Number(price))} per adult × {adults}
                    </p>
                  )}
                  <span className="mt-1 block text-sm font-medium leading-snug">
                    {adults + children} {adults + children === 1 ? "traveller" : "travellers"} ·{" "}
                    {adults} {adults === 1 ? "adult" : "adults"}
                    {children > 0 ? ` + ${children} ${children === 1 ? "child" : "children"}` : ""}
                  </span>
                  {seniors > 0 && (
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      Includes {Math.min(seniors, adults)} senior{" "}
                      {Math.min(seniors, adults) === 1 ? "citizen" : "citizens"} in adults
                    </span>
                  )}
                  {children > 0 && (
                    <span className="mt-1 block text-sm text-muted-foreground">
                      Children quoted separately
                    </span>
                  )}
                </div>
              </div>
              {chosenFlight && (
                <label
                  htmlFor={detailsId + "-flight"}
                  className="mb-1.5 mt-2.5 flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Plane size={14} className="text-gold" aria-hidden="true" />
                  {flights.length > 1 ? "Choose airline · price updates below" : "Package airline"}
                </label>
              )}
              <div
                className={cx(
                  "mt-2 grid items-start gap-2",
                  chosenFlight ? "grid-cols-2" : "grid-cols-1",
                )}
              >
                {chosenFlight && (
                  <div className="min-w-0">
                    <div className="relative">
                      <select
                        id={detailsId + "-flight"}
                        value={chosenFlight?.id || ""}
                        disabled={!chosenFlight}
                        onChange={(event) => {
                          setLocalFlightId(event.target.value);
                          onFlightChange?.(event.target.value);
                        }}
                        className="h-12 w-full min-w-0 appearance-none rounded-xl border border-gold/35 bg-card py-2 pl-3 pr-7 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-default disabled:text-muted-foreground"
                      >
                        {!chosenFlight && <option value="">Airline on request</option>}
                        {flights.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.airline}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                )}
                <details className="group/pricing min-w-0">
                  <summary
                    aria-label={
                      price == null
                        ? "View pricing breakdown"
                        : `${travelMoney(Number(price))} per adult. View pricing breakdown`
                    }
                    className="flex min-h-12 w-full cursor-pointer list-none items-center justify-between gap-1 rounded-xl border border-gold/40 bg-champagne/50 px-2 py-1.5 text-xs font-semibold leading-snug text-foreground sm:px-2.5 sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold [&::-webkit-details-marker]:hidden"
                  >
                    {price == null ? (
                      "View pricing breakdown"
                    ) : (
                      <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                        <span className="text-[15px] font-bold leading-tight tracking-tight text-foreground sm:text-[17px]">
                          {travelMoney(Number(price))}
                        </span>
                        <span className="text-[10px] font-normal leading-tight text-muted-foreground sm:text-[11px]">
                          per adult
                        </span>
                      </span>
                    )}
                    <ChevronDown
                      size={16}
                      className="shrink-0 transition-transform group-open/pricing:rotate-180"
                    />
                  </summary>
                  <dl
                    className={cx(
                      "mt-3 space-y-3 rounded-xl border border-gold/25 bg-card p-4 text-sm leading-relaxed",
                      chosenFlight && "relative -left-[calc(100%+0.5rem)] w-[calc(200%+0.5rem)]",
                    )}
                  >
                    <div>
                      <dt className="font-semibold">Adults · {adults}</dt>
                      <dd className="text-muted-foreground">
                        {price == null
                          ? "Price on request"
                          : `From ${travelMoney(Number(price))} per person`}
                      </dd>
                      {price != null && (
                        <dd className="mt-1 font-medium">
                          {adults} × {travelMoney(Number(price))} ={" "}
                          {travelMoney(Number(price) * adults)}
                        </dd>
                      )}
                    </div>
                    <div className="border-t border-border pt-3">
                      <dt className="font-semibold">Children · {children}</dt>
                      <dd className="text-muted-foreground">
                        Per-child fare quoted separately based on age.
                      </dd>
                    </div>
                    <div className="border-t border-border pt-3">
                      <dt className="font-semibold">
                        Senior citizens · {Math.min(seniors, adults)}
                      </dt>
                      <dd className="text-muted-foreground">
                        Already counted among your adults. Adult rate applies.
                      </dd>
                    </div>
                  </dl>
                </details>
              </div>
              {chosenFlight?.notes && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {chosenFlight.notes}
                </p>
              )}
              <span className="mt-2 block pr-5 text-sm leading-snug text-muted-foreground">
                {roomBasis}
              </span>
              {pkg.pricing_mode === "seasonal" && (
                <span className="mt-1 block text-xs font-semibold text-gold">
                  Seasonal starting guide
                </span>
              )}
            </div>
          </div>
          <a
            href={travelWhatsApp(
              `Hello, I'd like to enquire about the ${pkg.name} package (${pkg.duration}, ${pkg.places}) for ${adults} ${adults === 1 ? "adult" : "adults"}${children > 0 ? ` and ${children} ${children === 1 ? "child" : "children"}` : ""}${seniors > 0 ? `, including ${Math.min(seniors, adults)} senior ${Math.min(seniors, adults) === 1 ? "citizen" : "citizens"}` : ""}.${chosenFlight ? ` Preferred airline: ${chosenFlight.airline}${price == null ? "" : ` (${travelMoney(price)} per adult)`}.` : ""} Please share availability and a quotation.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Enquire on WhatsApp about ${pkg.name} (opens in a new tab)`}
            title="Enquire on WhatsApp"
            className="absolute -bottom-3 -right-3 grid h-12 w-12 place-items-center rounded-full border border-gold bg-[#111111] text-gold shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            <span
              aria-hidden="true"
              className="h-6 w-6 bg-current"
              style={{
                mask: "url(/whatsapp.svg) center / contain no-repeat",
                WebkitMask: "url(/whatsapp.svg) center / contain no-repeat",
              }}
            />
          </a>
        </div>
        <p className="mt-4 text-[13px] leading-snug text-muted-foreground">
          Final price varies by date and room.
        </p>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-gold/25 bg-surface px-4 py-3 text-sm font-semibold transition-colors hover:border-gold/50 hover:bg-champagne/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {expanded ? "Hide package details" : "View package details"}
          <ChevronDown
            size={18}
            className={cx("shrink-0 transition-transform", expanded && "rotate-180")}
          />
        </button>
      </div>
      <div id={detailsId} hidden={!expanded} className="border-y border-border">
        <Section title="Journey overview">
          <p className="font-semibold text-foreground">{pkg.places}</p>
          <p className="mt-1">{pkg.duration}</p>
          <p className="mt-3">{pkg.description}</p>
          <ul className="mt-3 list-disc space-y-1 pl-4">
            {pkg.highlights.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </Section>
        <Section title="Itinerary">
          {pkg.itinerary.length ? (
            pkg.itinerary.map(([title, text], index) => (
              <details key={index} className="group/stage border-b border-border last:border-0">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  <span>
                    {index + 1}. {title}
                  </span>
                  <ChevronDown
                    size={16}
                    className="shrink-0 transition-transform group-open/stage:rotate-180"
                  />
                </summary>
                <p className="pb-4">{text}</p>
              </details>
            ))
          ) : (
            <p>Your itinerary will be confirmed in your quotation.</p>
          )}
        </Section>
        <Section title="Included in the package plan">
          <ul className="list-disc space-y-2 pl-4">
            {pkg.inclusions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </Section>
        <Section title="Not included">
          <ul className="list-disc space-y-2 pl-4">
            {pkg.exclusions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </Section>
        <Section title="Pricing & room sharing">
          <p className="font-semibold text-foreground">{roomBasis}</p>
          <p className="mt-3">{pkg.pricing_note}</p>
          <p className="mt-3">
            Children, room changes and extras are quoted separately. Final price is confirmed before
            booking.
          </p>
        </Section>
        <Section title="Payment & cancellation">
          <p>{pkg.cancellation_terms}</p>
        </Section>
      </div>
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <button
          type="button"
          aria-pressed={selected}
          onClick={() => {
            savePackage({
              packageId: pkg.id,
              flightOptionId: chosenFlight?.id ?? null,
              adults,
              children,
              seniors: Math.min(seniors, adults),
            });
            onSelect(chosenFlight?.id ?? null);
          }}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-primary px-4 py-3 text-[15px] font-semibold text-white"
        >
          {selectLabel || (selected ? "Selected package" : "Select package")}
          {selected && <Check size={18} />}
        </button>
        <p className="mt-2 text-center text-sm text-muted-foreground">No payment required</p>
      </div>
    </article>
  );
}
