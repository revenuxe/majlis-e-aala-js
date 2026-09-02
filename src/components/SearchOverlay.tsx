import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { dishes, inr, packages, menuFilters } from "@/lib/data";
import { DietMark } from "./ui-kit";

const popular = [
  "Chicken Biryani",
  "Mutton Biryani",
  "Chicken 65",
  "Seekh Kebab",
  "Shahi Tukda",
];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return null;
    return {
      dishes: dishes.filter((d) => d.name.toLowerCase().includes(term)),
      categories: menuFilters.filter((c) => c.toLowerCase().includes(term)),
      packages: packages.filter((p) => p.name.toLowerCase().includes(term)),
    };
  }, [q]);

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
            placeholder="Search biryani, kebabs, desserts..."
            className="h-12 w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-muted-text"
          />
        </div>
        <button onClick={onClose} aria-label="Close search" className="press grid h-11 w-11 place-items-center rounded-full border border-border bg-card">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-auto w-full max-w-[720px] flex-1 overflow-y-auto px-4 py-6">
        {!results && (
          <>
            <p className="eyebrow">Popular searches</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {popular.map((p) => (
                <button
                  key={p}
                  onClick={() => setQ(p.split(" ")[0] ?? p)}
                  className="press rounded-full border border-border bg-card px-4 py-2.5 text-[14px]"
                >
                  {p}
                </button>
              ))}
            </div>
          </>
        )}

        {results && (
          <div className="space-y-8">
            <section>
              <p className="eyebrow">Dishes</p>
              <div className="mt-3 divide-y divide-border overflow-hidden rounded-[16px] border border-border bg-card">
                {results.dishes.length === 0 && (
                  <p className="p-4 text-[14px] text-muted-foreground">
                    No dishes matched. Try “biryani” or “kebab”.
                  </p>
                )}
                {results.dishes.map((d) => (
                  <div key={d.id} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 p-3">
                    <img src={d.image} alt="" loading="lazy" className="h-12 w-12 rounded-[10px] object-cover" />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <DietMark diet={d.diet} />
                        <span className="truncate text-[15px] font-semibold">{d.name}</span>
                      </span>
                      <span className="block truncate text-[13px] text-muted-foreground">{d.serves}</span>
                    </span>
                    <span className="text-[14px] font-semibold">{inr(d.price)}</span>
                  </div>
                ))}
              </div>
            </section>

            {results.categories.length > 0 && (
              <section>
                <p className="eyebrow">Categories</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {results.categories.map((c) => (
                    <Link
                      key={c}
                      to="/menu"
                      onClick={onClose}
                      className="press rounded-full border border-border bg-card px-4 py-2.5 text-[14px]"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.packages.length > 0 && (
              <section>
                <p className="eyebrow">Packages</p>
                <div className="mt-3 grid gap-2">
                  {results.packages.map((p) => (
                    <Link
                      key={p.id}
                      to="/packages"
                      onClick={onClose}
                      className="press rounded-[14px] border border-border bg-card p-4 text-[15px] font-semibold"
                    >
                      {p.name} — {inr(p.pricePerMann)} / Mann
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
