"use client";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { inr } from "@/lib/data";
import { usePlan } from "@/lib/plan-store";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const { packages } = usePlan();
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return term
      ? packages.filter((p) =>
          `${p.name} ${p.tagline} ${p.sections.flatMap((section) => [section.title, ...section.items]).join(" ")}`
            .toLowerCase()
            .includes(term),
        )
      : null;
  }, [q, packages]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-background animate-in fade-in duration-150">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 rounded-[12px] border border-border bg-card px-3">
          <Search className="h-[18px] w-[18px] shrink-0 text-muted-text" strokeWidth={1.75} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search catering packages..."
            className="h-12 w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-muted-text"
          />
        </div>
        <button
          onClick={onClose}
          aria-label="Close search"
          className="press grid h-11 w-11 place-items-center rounded-full border border-border bg-card"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mx-auto w-full max-w-[720px] flex-1 overflow-y-auto px-4 py-6">
        {!results ? (
          <>
            <p className="eyebrow">Available packages</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {packages.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setQ(p.name)}
                  className="press rounded-full border border-border bg-card px-4 py-2.5 text-[14px]"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </>
        ) : (
          <section>
            <p className="eyebrow">Packages</p>
            <div className="mt-3 grid gap-2">
              {results.length ? (
                results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/packages?q=${encodeURIComponent(q.trim())}`}
                    onClick={onClose}
                    className="press rounded-[14px] border border-border bg-card p-4 text-[15px] font-semibold"
                  >
                    {p.name} — {inr(p.pricePerMann)} / Mann
                  </Link>
                ))
              ) : (
                <p className="rounded-[14px] border border-border bg-card p-4 text-[14px] text-muted-foreground">
                  No packages matched your search.
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
