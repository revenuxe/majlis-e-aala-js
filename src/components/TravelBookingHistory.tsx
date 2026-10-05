"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui-kit";
import { travelDate, travelMoney } from "@/lib/travel-booking";
import { BookingTracking } from "@/components/BookingTracking";

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
export function TravelBookingHistory({
  userId,
  tracking = false,
}: {
  userId: string;
  tracking?: boolean;
}) {
  const [rows, setRows] = useState<TravelHistory[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [more, setMore] = useState(false);
  const [retry, setRetry] = useState(0);
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const [direct, setDirect] = useState<TravelHistory | null>(null);
  const [directError, setDirectError] = useState(false);
  useEffect(() => {
    if (!tracking) return;
    const ref = new URLSearchParams(location.search).get("reference");
    if (!ref) return;
    let active = true;
    setSelectedReference(ref);
    void supabase
      .rpc("get_my_travel_booking", { p_booking_reference: ref })
      .then(({ data, error }) => {
        if (!active) return;
        setDirect(data?.[0] || null);
        setDirectError(!!error || !data?.length);
      });
    return () => {
      active = false;
    };
  }, [userId, tracking, retry]);
  const reload = useCallback(() => setRetry((n) => n + 1), []);
  useEffect(() => {
    const focus = () => {
      setPage(0);
      reload();
    };
    window.addEventListener("focus", focus);
    return () => window.removeEventListener("focus", focus);
  }, [reload]);
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
  const selected =
    rows.find((row) => row.booking_reference === selectedReference) ||
    (direct?.booking_reference === selectedReference ? direct : null) ||
    (!selectedReference ? rows[0] : null);
  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Your travel requests</p>
        <Link href="/travel/plan" className="text-sm font-semibold underline">
          Plan another journey
        </Link>
      </div>
      <h2 className="mt-2 font-display text-[28px]">Travel Booking</h2>
      {tracking && (
        <button
          className="mt-2 text-sm underline"
          disabled={loading}
          onClick={() => {
            setPage(0);
            reload();
          }}
        >
          Refresh travel status
        </button>
      )}
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
            <p className="mb-2 text-xs font-semibold text-gold">Travel Booking</p>
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
            {tracking ? (
              <button
                aria-pressed={selected?.booking_reference === row.booking_reference}
                className="mt-4 min-h-11 text-sm font-semibold underline"
                onClick={() => {
                  setSelectedReference(row.booking_reference);
                  setDirectError(false);
                  const params = new URLSearchParams(location.search);
                  params.set("service", "travel");
                  params.set("reference", row.booking_reference);
                  history.replaceState(null, "", `${location.pathname}?${params}`);
                }}
              >
                Track this travel booking
              </button>
            ) : (
              <Link
                href={`/orders?service=travel&reference=${encodeURIComponent(row.booking_reference)}`}
                className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold underline"
              >
                Track travel booking
              </Link>
            )}
          </article>
        ))}
      </div>
      {directError && (
        <p role="alert" className="mt-4 text-sm">
          This travel booking could not be found in your account. Choose a booking below or refresh
          to try again.
        </p>
      )}
      {tracking && selected && (
        <section
          className="mt-5 rounded-2xl border border-border bg-card p-5"
          aria-label="Selected travel booking"
        >
          <p className="eyebrow">Travel Booking tracking</p>
          <h3 className="mt-2 font-display text-2xl">{selected.package_name}</h3>
          <p className="mt-2 break-all font-mono text-xs">{selected.booking_reference}</p>
          <BookingTracking service="travel" status={selected.status} />
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            Dates and prices are confirmed by our travel team. For changes or cancellations, contact
            the team with this reference.
          </p>
          <a className="mt-3 inline-block text-sm underline" href="tel:+919886285028">
            Contact travel support
          </a>
        </section>
      )}
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
