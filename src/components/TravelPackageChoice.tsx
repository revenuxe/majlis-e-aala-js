"use client";
import { useId, useState, type ReactNode } from "react";
import { Check, ChevronDown, Heart } from "lucide-react";
import { cx } from "@/components/ui-kit";
import { travelMoney, type TravelPackage } from "@/lib/travel-booking";
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
}: {
  pkg: TravelPackage;
  selected?: boolean;
  adults: number;
  children?: number;
  seniors?: number;
  onSelect: () => void;
  selectLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const { items, savePackage } = useSavedTravelPackages();
  const isSaved = items.some((item) => item.packageId === pkg.id);
  const detailsId = useId();
  const price = pkg.pricing_mode === "on_request" ? null : pkg.price_per_adult;
  const roomBasis = pkg.price_basis
    .replace(/\b(\d+)\s*\/\s*(\d+)\s+sharing\b/gi, "$1 to $2 people sharing one room")
    .replace(/\b(\d+)\s+sharing\b/gi, "$1 people sharing one room");
  return (
    <article
      className={cx(
        "self-start overflow-hidden rounded-[28px] border bg-card shadow-card",
        selected ? "border-primary ring-1 ring-primary/20" : "border-border",
      )}
    >
      <div className="p-4 pb-3 sm:p-5 sm:pb-3">
        <h3 className="font-display text-[28px] leading-tight">{pkg.name}</h3>
        {isSaved && (
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gold">
            <Heart size={14} className="fill-gold/20" />
            Saved
          </span>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border pb-3 text-sm leading-snug text-muted-foreground">
          <p className="rounded-md bg-surface px-2.5 py-1.5 font-semibold text-foreground">
            {pkg.duration}
          </p>
          <p className="min-w-0">{pkg.places}</p>
        </div>
        {pkg.inclusions.length > 0 && (
          <ul
            aria-label="Key package inclusions"
            className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface/40 text-sm leading-snug"
          >
            {pkg.inclusions.slice(0, 3).map((item, index) => (
              <li key={index} className="flex min-h-11 items-start gap-2 px-3 py-2.5">
                <Check size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="relative mt-4">
          <div className="w-full rounded-[16px] bg-surface px-4 py-3 text-left">
            <div>
              {price != null && (
                <span className="mb-1 block text-sm font-semibold text-muted-foreground">
                  Starting adult total
                </span>
              )}
              <span className="block text-[25px] font-bold leading-tight">
                {price == null ? "Price on request" : `From ${travelMoney(Number(price) * adults)}`}
              </span>
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
              <details className="group/pricing mt-2">
                <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg border border-gold/40 bg-champagne/50 px-2.5 py-2 text-sm font-semibold leading-relaxed text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold [&::-webkit-details-marker]:hidden">
                  {price == null
                    ? "View pricing breakdown"
                    : `From ${travelMoney(Number(price))} per adult`}
                  <ChevronDown
                    size={16}
                    className="shrink-0 transition-transform group-open/pricing:rotate-180"
                  />
                </summary>
                <dl className="mt-3 space-y-3 rounded-xl border border-gold/25 bg-card p-3 text-sm leading-relaxed">
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
                    <dt className="font-semibold">Senior citizens · {Math.min(seniors, adults)}</dt>
                    <dd className="text-muted-foreground">
                      Already counted among your adults. Adult rate applies.
                    </dd>
                  </div>
                </dl>
              </details>
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
              `Hello, I'd like to enquire about the ${pkg.name} package (${pkg.duration}, ${pkg.places}) for ${adults} ${adults === 1 ? "adult" : "adults"}${children > 0 ? ` and ${children} ${children === 1 ? "child" : "children"}` : ""}${seniors > 0 ? `, including ${Math.min(seniors, adults)} senior ${Math.min(seniors, adults) === 1 ? "citizen" : "citizens"}` : ""}. Please share availability and a quotation.`,
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
              adults,
              children,
              seniors: Math.min(seniors, adults),
            });
            onSelect();
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
