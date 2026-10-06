"use client";
import { useState } from "react";
import { Check, Grid2X2, MapPin, MoonStar } from "lucide-react";
import type { TravelPackage } from "@/lib/travel-booking";
import { travelPackageGroups } from "@/lib/travel-package-groups";
import { cx } from "./ui-kit";

function GroupImage({ src, label }: { src: string | null; label: string }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  ) : /umrah|hajj|ramadan|ziyarat/i.test(label) ? (
    <MoonStar size={22} />
  ) : (
    <MapPin size={22} />
  );
}

export function TravelPackageGroups({
  packages,
  value,
  onChange,
  loading = false,
}: {
  packages: TravelPackage[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}) {
  const groups = travelPackageGroups(packages);
  const destination =
    packages[0]?.category === "domestic" || packages[0]?.category === "international";
  const active = groups.some((group) => group.id === value) ? value : "all";
  const items = [
    { id: "all", label: "All packages", image: null as string | null, count: packages.length },
    ...groups,
  ];
  return (
    <section
      aria-label="Package categories"
      aria-busy={loading}
      className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {destination ? "Choose a destination" : "Choose your journey"}
        </h2>
        <span className="rounded-full bg-surface px-2.5 py-1 text-xs tabular-nums text-muted-foreground">
          {loading ? "Loading…" : `${packages.length} packages`}
        </span>
      </div>
      <div
        className="flex snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain scroll-px-1 px-1 pb-3 pt-1"
        role="group"
        aria-label="Filter packages by category"
      >
        {items.map((group) => {
          const isActive = active === group.id;
          return (
            <button
              key={group.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(group.id)}
              className={cx(
                "relative flex min-h-[100px] w-[min(220px,80%)] shrink-0 snap-start items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-card motion-reduce:transition-none",
                isActive
                  ? "border-gold bg-gold/10 shadow-sm"
                  : "border-border bg-card hover:border-gold/50 hover:bg-surface",
              )}
            >
              <span
                className={cx(
                  "grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg sm:h-12 sm:w-12",
                  group.id === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-gold",
                )}
              >
                {group.id === "all" ? (
                  <Grid2X2 size={22} />
                ) : (
                  <GroupImage key={group.image} src={group.image} label={group.label} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block break-words text-[13px] font-semibold leading-5 text-foreground sm:text-sm">
                  {group.label}
                </span>
                <span className="mt-1 block text-xs leading-4 tabular-nums text-muted-foreground">
                  {group.count} {group.count === 1 ? "package" : "packages"}
                </span>
              </span>
              {isActive && (
                <span
                  className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-primary"
                  aria-hidden="true"
                >
                  <Check size={11} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
