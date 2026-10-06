"use client";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cx } from "@/components/ui-kit";
import { travelCategories, type TravelCategory } from "@/lib/travel";
export function TravelJourneyCards({
  onSelect,
  selected,
  scrollable = false,
}: {
  onSelect: (category: TravelCategory) => void;
  selected?: TravelCategory;
  scrollable?: boolean;
}) {
  return (
    <div
      className={cx(
        "mt-4 gap-3 sm:gap-4",
        scrollable
          ? "flex snap-x snap-proximity overflow-x-auto overscroll-x-contain px-1 pb-3 pt-1"
          : "grid grid-cols-2 lg:grid-cols-4",
      )}
    >
      {travelCategories.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          aria-pressed={selected === item.id}
          style={scrollable ? { width: 192, minWidth: 192, flex: "0 0 192px" } : undefined}
          className={cx(
            scrollable && "w-48 min-w-48 flex-none snap-start",
            "group relative min-h-[222px] cursor-pointer overflow-hidden rounded-[22px] border-2 bg-soft-black text-left shadow-[0_14px_30px_rgba(55,42,25,0.18)] transition-all duration-300 motion-safe:hover:-translate-y-1.5 hover:shadow-[0_24px_42px_rgba(55,42,25,0.28)] active:translate-y-0 active:scale-[0.975] sm:min-h-[280px] sm:rounded-[26px]",
            selected === item.id
              ? "border-gold ring-2 ring-gold/60"
              : "border-gold/35 hover:border-gold",
          )}
        >
          <Image
            src={item.image}
            alt=""
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/30" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span
            className={cx(
              "absolute left-3 top-3 z-10 inline-flex h-6 items-center gap-1 rounded-full px-2 text-[9px] font-bold uppercase tracking-[0.1em] shadow-sm sm:left-4 sm:top-4 sm:text-[10px]",
              selected === item.id ? "bg-gold text-primary" : "bg-card text-muted-foreground",
            )}
          >
            {selected === item.id ? "Selected" : "Choose"}
          </span>
          <span className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-card text-foreground shadow-[0_10px_20px_rgba(18,14,9,0.28)] transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-primary-foreground sm:right-5 sm:top-5 sm:h-12 sm:w-12">
            <ArrowRight size={16} />
          </span>
          <span
            className={cx(
              "absolute inset-x-3 bottom-3 z-10 flex min-h-14 items-center rounded-[16px] px-3 py-2 shadow-[0_8px_20px_rgba(18,14,9,0.14)] backdrop-blur-sm sm:inset-x-5 sm:bottom-5 sm:min-h-[72px] sm:rounded-[18px] sm:px-4",
              selected === item.id
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground",
            )}
          >
            <span className="block min-w-0 font-display text-[18px] leading-none sm:text-[26px]">
              {item.name}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
