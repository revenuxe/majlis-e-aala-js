"use client";
import { Check, Minus, Plus, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ---------------- Buttons ---------------- */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "champagne";
  size?: "sm" | "md" | "lg";
  full?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  full,
  className,
  ...props
}: ButtonProps) {
  const base =
    "press inline-flex items-center justify-center gap-2 rounded-[12px] font-sans font-semibold disabled:opacity-40 disabled:pointer-events-none";
  const variants: Record<string, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-soft-black",
    outline: "border border-border bg-card text-foreground hover:bg-surface",
    ghost: "text-foreground hover:bg-surface",
    champagne: "bg-champagne text-foreground hover:bg-accent",
  };
  const sizes: Record<string, string> = {
    sm: "h-10 px-4 text-[14px]",
    md: "h-12 px-5 text-[15px]",
    lg: "h-14 px-6 text-[16px]",
  };
  return (
    <button
      className={cx(base, variants[variant], sizes[size], full && "w-full", className)}
      {...props}
    />
  );
}

/* ---------------- Section header ---------------- */

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 flex items-center gap-3">
            <span className="gold-rule" />
            <span className="eyebrow">{eyebrow}</span>
          </div>
        )}
        <h2 className="font-display text-[30px] leading-[1.1] sm:text-[36px]">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ---------------- Chips ---------------- */

export function Chip({
  active,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cx(
        "press h-11 shrink-0 rounded-full px-5 text-[14px] font-medium",
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card text-foreground",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------------- Diet indicator ---------------- */

export function DietMark({ diet }: { diet: "veg" | "nonveg" }) {
  const color = diet === "veg" ? "var(--halal)" : "var(--destructive)";
  return (
    <span
      className="inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[3px] border"
      style={{ borderColor: color }}
      title={diet === "veg" ? "Vegetarian" : "Non-vegetarian"}
    >
      <span className="sr-only">{diet === "veg" ? "Vegetarian" : "Non-vegetarian"}</span>
      <span className="h-[7px] w-[7px] rounded-full" style={{ background: color }} />
    </span>
  );
}

/* ---------------- Quantity ---------------- */

export function QuantitySelector({
  value,
  onChange,
  suffix,
  step = 1,
  min = 0,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
  min?: number;
  size?: "sm" | "md" | "lg";
}) {
  const h = size === "lg" ? "h-14" : size === "sm" ? "h-10" : "h-12";
  const btn = size === "lg" ? "w-14" : size === "sm" ? "w-10" : "w-12";
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commitDraft = () => {
    const next = Number.parseInt(draft, 10);
    const safeValue = Number.isNaN(next) ? value : Math.max(min, next);
    onChange(safeValue);
    setDraft(String(safeValue));
  };

  return (
    <div
      className={cx(
        "inline-flex items-center justify-between rounded-[12px] border border-border bg-card",
        h,
        size === "lg" && "w-full",
      )}
    >
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(min, value - step))}
        className={cx("press grid h-full place-items-center text-foreground", btn)}
      >
        <Minus className="h-4 w-4" strokeWidth={2} />
      </button>
      <label className="flex min-w-0 items-center justify-center px-2 text-[15px] font-semibold tabular-nums">
        <span className="sr-only">Quantity</span>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          aria-label={suffix ? `${suffix} quantity` : "Quantity"}
          className="w-16 bg-transparent text-right outline-none"
        />
        {suffix && <span className="ml-1 whitespace-nowrap">{suffix}</span>}
      </label>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(value + step)}
        className={cx("press grid h-full place-items-center text-foreground", btn)}
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

/* ---------------- Selectable card ---------------- */

export function ChoiceCard({
  selected,
  title,
  note,
  onClick,
  right,
}: {
  selected?: boolean;
  title: string;
  note?: string;
  onClick?: () => void;
  right?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "press grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border p-4 text-left",
        selected
          ? "border-primary bg-champagne/50"
          : "border-border bg-card hover:border-muted-text",
      )}
    >
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold">{title}</span>
        {note && <span className="mt-0.5 block text-[13px] text-muted-foreground">{note}</span>}
      </span>
      {right ?? (
        <span
          className={cx(
            "grid h-6 w-6 place-items-center rounded-full border",
            selected ? "border-primary bg-primary" : "border-border",
          )}
        >
          {selected && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />}
        </span>
      )}
    </button>
  );
}

/* ---------------- Bottom sheet ---------------- */

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-[rgba(17,17,17,0.45)] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative flex max-h-[88vh] w-full flex-col rounded-t-[24px] bg-card shadow-[var(--shadow-float)] duration-300 animate-in slide-in-from-bottom sm:max-w-lg sm:rounded-[20px]">
        <div className="flex justify-center pt-3">
          <span className="h-1 w-10 rounded-full bg-border" />
        </div>
        {title && (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 pb-3 pt-3">
            <h3 className="min-w-0 truncate font-display text-[24px]">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="press grid h-9 w-9 place-items-center rounded-full border border-border"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && (
          <div className="border-t border-border bg-card px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Misc ---------------- */

export function HalalBadge({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[12px] font-semibold tracking-[0.08em] text-foreground",
        className,
      )}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: "var(--halal)" }} />
      100% HALAL CATERING
    </span>
  );
}

export function EmptyState({
  title,
  note,
  action,
}: {
  title: string;
  note: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-border bg-card px-6 py-14 text-center">
      <span className="gold-rule mx-auto block" />
      <h3 className="mt-5 font-display text-[26px]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xs text-[14px] text-muted-foreground">{note}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[16px] border border-border bg-card p-3">
      <div className="h-28 rounded-[12px] bg-surface" />
      <div className="mt-3 h-4 w-2/3 rounded bg-surface" />
      <div className="mt-2 h-3 w-full rounded bg-surface" />
    </div>
  );
}
