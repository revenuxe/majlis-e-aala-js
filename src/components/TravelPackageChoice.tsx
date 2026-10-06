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
  return (
    <article
      className={cx(
        "self-start overflow-hidden rounded-[28px] border bg-card shadow-card",
        selected ? "border-primary ring-1 ring-primary/20" : "border-border",
      )}
    >
      <div className="p-5 sm:p-6">
        <h3 className="font-display text-[32px] leading-tight">{pkg.name}</h3>
        {isSaved && (
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gold">
            <Heart size={14} className="fill-gold/20" />
            Saved
          </span>
        )}
        <div className="relative mt-7">
          <div className="grid min-h-24 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] bg-surface px-5 py-4 text-left">
            <div>
              <span className="block text-[25px] font-bold leading-tight">
                {price == null ? "Price on request" : `From ${travelMoney(Number(price) * adults)}`}
              </span>
              <span className="mt-2 block text-[13px] font-semibold leading-relaxed">
                {adults + children} {adults + children === 1 ? "traveller" : "travellers"} ·{" "}
                {adults} {adults === 1 ? "adult" : "adults"}
                {children > 0 ? ` + ${children} ${children === 1 ? "child" : "children"}` : ""}
              </span>
              {seniors > 0 && (
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  Includes {Math.min(seniors, adults)} senior{" "}
                  {Math.min(seniors, adults) === 1 ? "citizen" : "citizens"} within the adult count
                </span>
              )}
              <span className="mt-1 block text-[13px] font-semibold">
                {price == null
                  ? "Personalised quotation"
                  : "Adult starting estimate · child fares extra"}
              </span>
              <details className="group/pricing mt-3">
                <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg border border-gold/40 bg-champagne/50 px-2.5 py-2 text-[12px] font-semibold leading-relaxed text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold [&::-webkit-details-marker]:hidden">
                  {price == null
                    ? "View pricing breakdown"
                    : `From ${travelMoney(Number(price))} per adult`}
                  <ChevronDown
                    size={16}
                    className="shrink-0 transition-transform group-open/pricing:rotate-180"
                  />
                </summary>
                <dl className="mt-3 space-y-3 rounded-xl border border-gold/25 bg-card p-3 text-[13px] leading-relaxed">
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
                      Included in the adult count above, at the adult rate. No additional person
                      charge.
                    </dd>
                  </div>
                </dl>
              </details>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {pkg.price_basis}
              </span>
              {pkg.pricing_mode === "seasonal" && (
                <span className="mt-1 block text-xs font-semibold text-gold">
                  Seasonal starting guide
                </span>
              )}
            </div>
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={detailsId}
              aria-label={`Details for ${pkg.name}`}
              onClick={() => setExpanded(!expanded)}
              className={cx(
                "grid h-12 w-12 shrink-0 place-items-center self-start rounded-full border border-border bg-card transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                expanded && "rotate-180 border-gold/50",
              )}
            >
              <ChevronDown size={22} />
            </button>
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
        <p className="mt-5 text-[11px] leading-[1.6] text-muted-foreground">
          {price == null
            ? "Quote tailored to your group and room preferences."
            : "Estimate based on your selected room sharing."}{" "}
          Child fares and upgrades are quoted separately. Final pricing depends on travel dates and
          availability.
        </p>
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
          <p className="font-semibold text-foreground">{pkg.price_basis}</p>
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
      <div className="px-5 pb-5 pt-2 sm:px-6 sm:pb-6">
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
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[16px] bg-primary px-4 text-[15px] font-semibold text-white"
        >
          {selectLabel || (selected ? "Selected package" : "Select package")}
          {selected && <Check size={18} />}
        </button>
      </div>
    </article>
  );
}
