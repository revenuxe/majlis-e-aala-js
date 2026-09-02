import { useState } from "react";
import { Minus, Plus } from "lucide-react";
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
  const recommended = recommendedTrays(plan.guests);

  return (
    <>
      <article className="overflow-hidden rounded-[16px] border border-border bg-card shadow-[var(--shadow-card)]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full text-left"
          aria-label={`View ${dish.name}`}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <img
              src={dish.image}
              alt={dish.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            {dish.tags?.[0] && (
              <span className="absolute left-3 top-3">
                <TagLabel tag={dish.tags[0]} />
              </span>
            )}
          </div>
        </button>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <DietMark diet={dish.diet} />
            <h3 className="min-w-0 truncate text-[16px] font-semibold">{dish.name}</h3>
          </div>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {dish.description}
          </p>
          <p className="mt-2 text-[12px] text-muted-text">{dish.serves}</p>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <span className="min-w-0 text-[16px] font-bold">{inr(dish.price)}</span>
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
              <Button size="sm" onClick={() => setOpen(true)}>
                ADD
              </Button>
            )}
          </div>
        </div>
      </article>

      <DishSheet dish={dish} open={open} onClose={() => setOpen(false)} recommended={recommended} />
    </>
  );
}

function DishSheet({
  dish,
  open,
  onClose,
  recommended,
}: {
  dish: Dish;
  open: boolean;
  onClose: () => void;
  recommended: number;
}) {
  const { addItem, setQuantity, quantityOf } = usePlan();
  const existing = quantityOf(dish.id);
  const [size, setSize] = useState("Serves 5");
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
  const sizeMultiplier = size === "Serves 10" ? 1.9 : size === "Serves 20" ? 3.6 : size === "Party Tray" ? 5.2 : 1;
  const unit =
    Math.round(dish.price * sizeMultiplier) +
    addons.reduce((s, a) => s + (addonPrices[a] ?? 0), 0);
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

      <p className="eyebrow mt-6">Choose size</p>
      <div className="mt-3 grid gap-2">
        {["Serves 5", "Serves 10", "Serves 20", "Party Tray"].map((s) => (
          <ChoiceCard key={s} title={s} selected={size === s} onClick={() => setSize(s)} />
        ))}
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
            note={`+ ${inr(addonPrices[a])}`}
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
          <p className="text-[13px] text-muted-foreground">Recommended {recommended} for your guests</p>
        </div>
        <QuantitySelector value={qty} onChange={(v) => setQty(Math.max(1, v))} min={1} />
      </div>
    </BottomSheet>
  );
}
