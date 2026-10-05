"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui-kit";
import { travelDate, travelMoney } from "@/lib/travel-booking";

type TravelHistory = {
  booking_reference: string;
  category: string;
  package_name: string;
  departure_city: string;
  preferred_date: string | null;
  preferred_month: string | null;
  adults: number;
  children: number;
  status: string;
  quoted_total: number | null;
  created_at: string;
};
export function TravelBookingHistory({ userId }: { userId: string }) {
  const [rows, setRows] = useState<TravelHistory[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [more, setMore] = useState(false);
  const [retry, setRetry] = useState(0);
  const reload = useCallback(() => setRetry((n) => n + 1), []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    void (async () => {
      try {
        const { data, error: failure } = await supabase.rpc("get_my_travel_bookings", {
          p_limit: 25,
          p_offset: page * 25,
        });
        if (failure) throw failure;
        if (!active) return;
        setRows((previous) => (page === 0 ? data || [] : [...previous, ...(data || [])]));
        setMore((data || []).length === 25);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, page, retry]);
  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Your travel requests</p>
        <Link href="/travel/plan" className="text-sm font-semibold underline">
          Plan another journey
        </Link>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Requests made while signed in appear here. Our team confirms final availability and
        arrangements.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <article
            key={row.booking_reference}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <p className="text-xs uppercase text-gold">{row.category}</p>
            <h3 className="mt-2 font-semibold">{row.package_name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {row.adults} adults{row.children ? ` · ${row.children} children` : ""} ·{" "}
              {row.departure_city}
            </p>
            <p className="mt-2 text-sm">
              {row.preferred_date
                ? travelDate(row.preferred_date)
                : row.preferred_month || "Flexible dates"}
            </p>
            <p className="mt-3 break-all font-mono text-xs">{row.booking_reference}</p>
            <span className="mt-3 inline-block rounded-full bg-surface px-3 py-1 text-xs font-semibold capitalize">
              {row.status}
            </span>
            {row.quoted_total !== null && (
              <p className="mt-3 text-sm">Quotation: {travelMoney(Number(row.quoted_total))}</p>
            )}
          </article>
        ))}
      </div>
      {loading && (
        <p role="status" className="mt-4 text-sm">
          Loading your travel requests…
        </p>
      )}
      {error && (
        <div role="alert" className="mt-4 text-sm">
          Could not load your travel requests.{" "}
          <button onClick={reload} className="underline">
            Try again
          </button>
        </div>
      )}
      {!loading && !error && !rows.length && (
        <p className="mt-4 text-sm text-muted-foreground">
          Your next signed-in travel request will appear here.
        </p>
      )}
      {!loading && !error && more && (
        <Button className="mt-4" onClick={() => setPage((n) => n + 1)}>
          Load older requests
        </Button>
      )}
    </section>
  );
}
