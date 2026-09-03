"use client";
import { useState } from "react";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import type { Dish } from "@/lib/data";
import { inr } from "@/lib/data";
import { usePlan, recommendedTrays } from "@/lib/plan-store";
import { BottomSheet, Button, ChoiceCard, DietMark, QuantitySelector, cx } from "./ui-kit";

function TagLabel({ tag }: { tag: string }) {
  const label = tag === "bestseller" ? "BESTSELLER" : tag === "premium" ? "PREMIUM" : "MOST LOVED";
  return (
    <span
      className="rounded-full px-2 py-[3px] text-[10px] font-bold tracking-[0.12em]"
      style={{ background: "var(--champagne)", color: "var(--foreground)" }}
    >
      {label}
    </span>
  );
}

export function FoodCard({ dish }: { dish: Dish }) {
  const { addItem, setQuantity, quantityOf, plan } = usePlan();
  const [open, setOpen] = useState(false);
  const qty = quantityOf(dish.id);
  const recommended = recommendedTrays(plan.guests, dish.serves);

  return (
    <>
      <article className="group overflow-hidden rounded-[22px] border border-border bg-card shadow-[0_10px_24px_rgba(45,34,21,0.08)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_32px_rgba(45,34,21,0.14)]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full text-left"
          aria-label={`View ${dish.name}`}
        >
          <div className="relative aspect-square w-full overflow-hidden bg-surface sm:aspect-[4/3]">
            <img
              src={dish.image}
              alt={dish.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {dish.tags && dish.tags.length > 0 && (
              <span className="absolute left-3 top-3">
                <TagLabel tag={String(dish.tags[0])} />
              </span>
            )}
          </div>
        </button>
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <DietMark diet={dish.diet} />
            <h3 className="min-w-0 truncate text-[14px] font-semibold sm:text-[16px]">
              {dish.name}
            </h3>
          </div>
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground sm:text-[13px]">
            {dish.description}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-[10px] text-muted-text sm:text-[12px]">{dish.serves}</p>
            <span className="hidden rounded-full bg-champagne px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-foreground sm:inline">
              Made fresh
            </span>
          </div>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <span className="min-w-0 text-[15px] font-bold sm:text-[17px]">{inr(dish.price)}</span>
            {qty > 0 ? (
              <span className="inline-flex h-10 items-center rounded-[12px] bg-primary text-primary-foreground">
                <button
                  aria-label="Decrease"
                  className="press grid h-10 w-10 place-items-center"
                  onClick={() => setQuantity(dish.id, qty - 1)}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-6 text-center text-[14px] font-semibold tabular-nums">
                  {qty}
                </span>
                <button
                  aria-label="Increase"
                  className="press grid h-10 w-10 place-items-center"
                  onClick={() => setQuantity(dish.id, qty + 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </span>
            ) : (
              <Button
                size="sm"
                onClick={() => setOpen(true)}
                className="h-8 px-2 text-[11px] sm:h-9 sm:px-3 sm:text-sm"
              >
                Add <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </article>

      <DishSheet
        dish={dish}
        open={open}
        onClose={() => setOpen(false)}
        recommended={recommended}
        guests={plan.guests}
      />
    </>
  );
}

function DishSheet({
  dish,
  open,
  onClose,
  recommended,
  guests,
}: {
  dish: Dish;
  open: boolean;
  onClose: () => void;
  recommended: number;
  guests: number;
}) {
  const { addItem, setQuantity, quantityOf } = usePlan();
  const existing = quantityOf(dish.id);
  const [spice, setSpice] = useState("Medium");
  const [addons, setAddons] = useState<string[]>([]);
  const [qty, setQty] = useState(existing || recommended);
  const [notes, setNotes] = useState("");

  const addonPrices: Record<string, number> = {
    "Extra Chicken": 250,
    "Boiled Eggs": 90,
    Raita: 60,
    Salan: 60,
  };
  const unit = dish.price + addons.reduce((s, a) => s + (addonPrices[a] ?? 0), 0);
  const total = unit * qty;

  const toggleAddon = (a: string) =>
    setAddons((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={dish.name}
      footer={
        <Button
          size="lg"
          full
          onClick={() => {
            if (existing) setQuantity(dish.id, qty);
            else addItem(dish.id, qty);
            onClose();
          }}
        >
          Add to Menu • {inr(total)}
        </Button>
      }
    >
      <div className="overflow-hidden rounded-[16px]">
        <img
          src={dish.image}
          alt={dish.name}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover"
        />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <DietMark diet={dish.diet} />
        <span className="text-[13px] text-muted-foreground">
          {dish.diet === "veg" ? "Vegetarian" : "Non-vegetarian"} • {dish.serves}
        </span>
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{dish.description}</p>

      <p className="eyebrow mt-6">Serving size</p>
      <div className="mt-3 grid gap-2">
        <ChoiceCard title={dish.serves} selected />
      </div>

      <p className="eyebrow mt-6">Spice level</p>
      <div className="mt-3 flex gap-2">
        {["Mild", "Medium", "Spicy"].map((s) => (
          <button
            key={s}
            onClick={() => setSpice(s)}
            className={cx(
              "press h-11 flex-1 rounded-[12px] border text-[14px] font-medium",
              spice === s ? "border-primary bg-champagne/50" : "border-border bg-card",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="eyebrow mt-6">Add-ons</p>
      <div className="mt-3 grid gap-2">
        {Object.keys(addonPrices).map((a) => (
          <ChoiceCard
            key={a}
            title={a}
            note={`+ ${inr(addonPrices[a] ?? 0)}`}
            selected={addons.includes(a)}
            onClick={() => toggleAddon(a)}
          />
        ))}
      </div>

      <p className="eyebrow mt-6">Special instructions</p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Anything our kitchen should know?"
        className="mt-3 w-full rounded-[12px] border border-border bg-card p-3 text-[15px] outline-none focus:border-gold"
      />

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">Quantity</p>
          <p className="text-[13px] text-muted-foreground">
            Recommended {recommended} for {guests} guests
          </p>
        </div>
        <QuantitySelector value={qty} onChange={(v) => setQty(Math.max(1, v))} min={1} />
      </div>
    </BottomSheet>
  );
}
