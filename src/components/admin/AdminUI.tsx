import { useEffect, useRef, useState, type ReactNode } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cx } from "@/components/ui-kit";
import { uploadImage } from "@/lib/admin";
import { toast } from "sonner";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

const inputBase =
  "w-full rounded-[12px] border border-border bg-card px-3.5 py-3 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-text focus:border-gold";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputBase, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(inputBase, "min-h-[90px]", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(inputBase, "appearance-none pr-9", props.className)} />;
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="press flex w-full items-center justify-between rounded-[12px] border border-border bg-card px-3.5 py-3 text-left"
    >
      <span className="text-[14px] font-medium">{label}</span>
      <span
        className={cx(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-border",
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-card transition-all",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

/** Image URL field with optional upload to storage. */
export function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <TextInput
          value={value}
          placeholder="Paste an image URL…"
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="press grid h-[46px] w-[52px] shrink-0 place-items-center rounded-[12px] border border-border bg-surface text-gold disabled:opacity-50"
          aria-label="Upload image"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            onChange(await uploadImage(file));
            toast.success("Image uploaded");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
      {value ? (
        <div className="flex items-center gap-3 rounded-[12px] border border-border bg-surface p-2">
          <img
            src={value}
            alt="Preview"
            className="h-16 w-24 rounded-[8px] object-cover"
            loading="lazy"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="press ml-auto rounded-[10px] px-3 py-2 text-[13px] font-semibold text-destructive"
          >
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Mobile-first sheet that becomes a centered modal on desktop. */
export function Sheet({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
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
    <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/45 backdrop-blur-[2px]"
      />
      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[24px] bg-background shadow-float sm:max-w-[640px] sm:rounded-[22px]">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="truncate font-display text-[21px]">{title}</h2>
          <button onClick={onClose} className="press rounded-full p-2 hover:bg-surface">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-border bg-card px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-surface text-gold">
          {icon}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-3 font-display text-[28px] leading-none">{value}</p>
      {sub && <p className="mt-1.5 text-[12px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function EmptyRow({ text }: { text: string }) {
  return (
    <div className="rounded-[16px] border border-dashed border-border bg-surface/60 px-5 py-10 text-center text-[14px] text-muted-foreground">
      {text}
    </div>
  );
}
