"use client";

import { useState } from "react";
import { Check, ArrowRight, MapPin, MoonStar } from "lucide-react";
import { travelCategories } from "@/lib/travel";
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
    {
      id: "all",
      label: "All packages",
      image: travelCategories.find((item) => item.id === packages[0]?.category)?.image || null,
      count: packages.length,
    },
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
          {destination ? "Choose a destination" : "Package categories"}
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
                "group relative min-h-[222px] w-[min(190px,75%)] shrink-0 snap-start overflow-hidden rounded-[22px] border-2 bg-primary text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-card motion-reduce:transition-none",
                isActive ? "border-gold shadow-sm" : "border-gold/35 hover:border-gold",
              )}
            >
              <span
                className={cx(
                  "absolute inset-0 grid place-items-center overflow-hidden text-gold",
                  group.id === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-gold",
                )}
              >
                <GroupImage key={group.image} src={group.image} label={group.label} />
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"
              />
              <span
                className={cx(
                  "absolute inset-x-3 bottom-3 rounded-2xl px-3 py-3",
                  isActive ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
                )}
              >
                <span className="block break-words font-display text-lg leading-tight">
                  {group.label}
                </span>
                <span className="mt-1 block text-xs leading-4 tabular-nums opacity-75">
                  {group.count} {group.count === 1 ? "package" : "packages"}
                </span>
              </span>
              <span className="absolute left-3 top-3 rounded-full bg-card px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-foreground">
                {isActive ? "Selected" : "Choose"}
              </span>
              <span
                className={cx(
                  "absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full",
                  isActive ? "bg-gold text-primary" : "bg-card text-foreground",
                )}
                aria-hidden="true"
              >
                {isActive ? <Check size={18} /> : <ArrowRight size={18} />}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
