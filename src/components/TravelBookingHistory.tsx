"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, RefreshCw, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui-kit";
import { travelDate, travelMoney } from "@/lib/travel-booking";
import { BookingTracking } from "@/components/BookingTracking";
import { travelCategories } from "@/lib/travel";
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
const statuses: Record<string, string> = {
  new: "Request received",
  contacted: "Planning your journey",
  quoted: "Quote ready",
  confirmed: "Confirmed",
  completed: "Journey completed",
  cancelled: "Cancelled",
};
function dateLabel(row: TravelHistory) {
  return row.preferred_date
    ? travelDate(row.preferred_date)
    : row.preferred_month
      ? new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(
          new Date(`${row.preferred_month}-01T00:00:00`),
        )
      : "Dates to be planned";
}
export function TravelBookingHistory({
  userId,
  reference,
  standalone = false,
}: {
  userId: string;
  reference?: string;
  standalone?: boolean;
}) {
  const [rows, setRows] = useState<TravelHistory[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [more, setMore] = useState(false);
  const [retry, setRetry] = useState(0);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const hasNewRequests = rows.some((row) => row.status === "new");
  useEffect(() => {
    if (!hasNewRequests) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && !cancelling) {
        setPage(0);
        setRetry((n) => n + 1);
      }
    }, 30000);
    return () => window.clearInterval(timer);
  }, [hasNewRequests, cancelling]);
  async function cancelBooking(bookingReference: string) {
    if (cancelling || !window.confirm("Cancel this travel request?")) return;
    setCancelling(bookingReference);
    setActionError(null);
    try {
      const { data, error: failure } = await supabase.rpc("cancel_customer_travel_booking", {
        p_booking_reference: bookingReference,
      });
      if (failure) throw failure;
      if (data) {
        setRows((previous) =>
          previous.map((row) =>
            row.booking_reference === bookingReference ? { ...row, status: "cancelled" } : row,
          ),
        );
      } else {
        setActionError(
          "This request can no longer be cancelled. Its status may have changed. Contact travel support for help.",
        );
      }
      setPage(0);
      setRetry((n) => n + 1);
    } catch {
      setActionError("Could not cancel your travel request. Please try again.");
    } finally {
      setCancelling(null);
    }
  }
  useEffect(() => {
    const focus = () => {
      setPage(0);
      setRetry((n) => n + 1);
    };
    window.addEventListener("focus", focus);
    return () => window.removeEventListener("focus", focus);
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    void (async () => {
      try {
        const result = reference
          ? await supabase.rpc("get_my_travel_booking", { p_booking_reference: reference })
          : await supabase.rpc("get_my_travel_bookings", { p_limit: 25, p_offset: page * 25 });
        if (result.error) throw result.error;
        if (!active) return;
        const data = result.data || [];
        setRows((previous) =>
          reference || page === 0
            ? data
            : [
                ...previous,
                ...data.filter(
                  (row) => !previous.some((old) => old.booking_reference === row.booking_reference),
                ),
              ],
        );
        setMore(!reference && data.length === 25);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, reference, page, retry]);
  const selected = reference ? rows.find((row) => row.booking_reference === reference) : null;
  return (
    <section className="mt-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {!standalone ? (
          <h2 className="font-display text-[28px]">Travel bookings</h2>
        ) : (
          <p className="eyebrow">{reference ? "Travel booking status" : "Your journeys"}</p>
        )}
        <button
          disabled={loading}
          onClick={() => {
            setPage(0);
            setRetry((n) => n + 1);
          }}
          className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-[12px] font-semibold disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh status
        </button>
      </div>
      {actionError && (
        <p role="alert" className="mb-4 rounded-xl border border-border p-4 text-sm">
          {actionError}
        </p>
      )}
      {error ? (
        <div role="alert" className="rounded-2xl border border-border bg-card p-5 text-sm">
          Could not load your travel bookings.{" "}
          <button onClick={() => setRetry((n) => n + 1)} className="min-h-11 underline">
            Try again
          </button>
        </div>
      ) : loading && !rows.length ? (
        <p role="status" className="py-10 text-sm text-muted-foreground">
          Loading your travel bookings…
        </p>
      ) : (
        <>
          {reference && !selected && !loading ? (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-2xl">Booking unavailable</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                This reference could not be found in your account. Check that you signed in with the
                account used to book.
              </p>
              <Link
                href="/travel/bookings"
                className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold underline"
              >
                View your travel bookings
              </Link>
            </div>
          ) : null}
          {!reference && !rows.length && !loading ? (
            <div className="rounded-[24px] border border-border bg-card p-7 text-center">
              <h2 className="font-display text-[28px]">Your next journey starts here</h2>
              <p className="mt-3 text-[13px] text-muted-foreground">
                Travel requests made while signed in will appear here.
              </p>
              <Link
                href="/travel/packages"
                className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white"
              >
                Find your journey
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : null}
          <div className={reference ? "" : "grid items-start gap-4 sm:grid-cols-2"}>
            {(reference ? (selected ? [selected] : []) : rows).map((row) => (
              <article
                key={row.booking_reference}
                className="overflow-hidden rounded-[24px] border border-border bg-card"
              >
                <div className="border-b border-border bg-surface px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="eyebrow">
                      {travelCategories.find((category) => category.id === row.category)?.name ||
                        row.category}
                    </p>
                    <span className="rounded-full border border-gold/25 bg-champagne/50 px-3 py-1.5 text-[11px] font-semibold">
                      {statuses[row.status] || row.status}
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-[26px] leading-tight">
                    {row.package_name}
                  </h2>
                </div>
                <div className="p-5">
                  <div className="space-y-3 text-[13px]">
                    <p className="flex items-center gap-2">
                      <Users size={16} className="shrink-0 text-gold" />
                      {row.adults} {row.adults === 1 ? "adult" : "adults"}
                      {row.children
                        ? ` · ${row.children} ${row.children === 1 ? "child" : "children"}`
                        : ""}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={16} className="shrink-0 text-gold" />
                      <span>From {row.departure_city}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarDays size={16} className="shrink-0 text-gold" />
                      {dateLabel(row)}
                    </p>
                  </div>
                  <p className="mt-4 break-all text-[10px] text-muted-foreground">
                    Reference: {row.booking_reference}
                  </p>
                  {row.quoted_total !== null && (
                    <p className="mt-4 text-sm">
                      Your quotation{" "}
                      <span className="ml-2 font-semibold">
                        {travelMoney(Number(row.quoted_total))}
                      </span>
                    </p>
                  )}
                  {!reference && (
                    <Link
                      href={`/travel/bookings/${encodeURIComponent(row.booking_reference)}`}
                      className="mt-5 flex min-h-12 items-center justify-between rounded-xl bg-primary px-4 text-[13px] font-semibold text-white"
                    >
                      View booking & status
                      <ArrowRight size={16} />
                    </Link>
                  )}
                  {reference && (
                    <>
                      <BookingTracking service="travel" status={row.status} />
                      <p className="mt-6 border-t border-border pt-4 text-[12px] leading-relaxed text-muted-foreground">
                        Our travel team confirms dates, availability and final pricing. For changes
                        or cancellations, contact us with your reference.
                      </p>
                      <a
                        href="tel:+919886285028"
                        className="mt-3 inline-flex min-h-11 items-center rounded-full border border-border px-4 text-[13px] font-semibold"
                      >
                        Contact travel support
                      </a>
                    </>
                  )}
                  {row.status === "new" && (
                    <button
                      type="button"
                      disabled={loading || cancelling !== null}
                      onClick={() => void cancelBooking(row.booking_reference)}
                      className="mt-4 inline-flex min-h-11 items-center rounded-full border border-destructive px-4 text-[13px] font-semibold text-destructive disabled:opacity-50"
                    >
                      {cancelling === row.booking_reference
                        ? "Cancelling…"
                        : "Cancel travel request"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          {!loading && more && (
            <Button className="mt-5" onClick={() => setPage((n) => n + 1)}>
              Load older bookings
            </Button>
          )}
        </>
      )}
    </section>
  );
}
