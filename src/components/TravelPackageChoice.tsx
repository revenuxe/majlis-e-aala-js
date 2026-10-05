"use client";
import { Check, Clock3, MapPin, ArrowRight } from "lucide-react";
import { cx } from "@/components/ui-kit";
import { TravelPrice } from "@/components/TravelPrice";
import { type TravelPackage } from "@/lib/travel-booking";

export function TravelPackageChoice({
  pkg,
  selected,
  adults,
  onSelect,
}: {
  pkg: TravelPackage;
  selected: boolean;
  adults: number;
  onSelect: () => void;
}) {
  return (
    <article
      className={cx(
        "overflow-hidden rounded-[24px] border-2 bg-card",
        selected ? "border-primary shadow-lg" : "border-border",
      )}
    >
      <div className="relative h-52 overflow-hidden sm:h-60">
        {/* Catalog images can be managed by the administrator. */}
        <img
          src={pkg.image_url || "/travel/journey-placeholder.svg"}
          alt={pkg.places}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-background/95 px-3 py-1 text-xs font-semibold">
          {pkg.tagline}
        </span>
        {selected && (
          <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
            <Check size={14} /> Selected
          </span>
        )}
        <div className="absolute inset-x-5 bottom-5 text-white">
          <h2 className="font-display text-[30px] leading-tight">{pkg.name}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm">
            <MapPin size={14} />
            {pkg.places}
          </p>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Clock3 size={15} />
          {pkg.duration}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pkg.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {pkg.highlights.slice(0, 3).map((item) => (
            <span key={item} className="rounded-full bg-surface px-3 py-2 text-xs">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-5">
          <TravelPrice pkg={pkg} adults={selected ? adults : undefined} compact />
        </div>
        <button
          type="button"
          aria-pressed={selected}
          onClick={onSelect}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white"
        >
          {selected ? "Selected for your journey" : "Choose this journey"}
          {selected ? <Check size={17} /> : <ArrowRight size={17} />}
        </button>
        <details className="mt-4 border-t border-border pt-3">
          <summary className="cursor-pointer py-2 text-sm font-semibold">
            Discover the itinerary & what’s included
          </summary>
          <ol className="mt-4 space-y-4">
            {pkg.itinerary.map(([title, text], index) => (
              <li key={index} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-champagne text-xs font-semibold">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="my-5 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold">Included</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {pkg.inclusions.join(" · ") || "Confirmed in your written quotation."}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Not included</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {pkg.exclusions.join(" · ") || "Confirmed in your written quotation."}
              </p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{pkg.cancellation_terms}</p>
          <div className="mt-5 rounded-xl bg-surface p-4">
            <h3 className="text-sm font-semibold">Your quotation checklist</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Check these details with our team before confirming your journey.
            </p>
            <ul className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
              {(pkg.category === "umrah" || pkg.category === "hajj"
                ? [
                    "Flight route, baggage and departure airport",
                    "Hotel names, room sharing and distance to the Haram",
                    "Visa arrangements and applicable insurance",
                    "Meals, airport transfers and intercity travel",
                    "Guidance, ziyarat and permit arrangements",
                    "Senior assistance, walking distances and hotel access",
                  ]
                : [
                    "Travel tickets and luggage allowance",
                    "Hotel names, room sharing and meal plan",
                    "Airport transfers and sightseeing transport",
                    "Activities, entry tickets and free time",
                    "Visa requirements where applicable",
                    "Senior assistance and accessible arrangements",
                  ]
              ).map((item) => (
                <li key={item} className="flex gap-2 leading-relaxed">
                  <Check size={13} className="mt-0.5 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Services are included only when listed in your final written quotation.
            </p>
          </div>
        </details>
      </div>
    </article>
  );
}
