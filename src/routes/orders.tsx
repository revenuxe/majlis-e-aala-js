"use client";
import Link from "next/link";
import { CalendarDays, ChevronRight, Loader2, MapPin, PackageX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button, EmptyState, SectionHeader, cx } from "@/components/ui-kit";

import { TravelBookingHistory } from "@/components/TravelBookingHistory";
import { BookingTracking } from "@/components/BookingTracking";

type CustomerOrder = {
  booking_reference: string;
  occasion: string | null;
  event_date: string | null;
  guests: number;
  estimated_total: number;
  status: string;
  venue: { area?: string; pincode?: string } | null;
};

const statusLabel = (status: string) => (status === "new" ? "Pending" : status);

export default function OrdersPage() {
  const [service, setService] = useState<"catering" | "travel">("catering");
  const [userId, setUserId] = useState<string | null>(null);
  const generation = useRef(0);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    setError(null);
    setOrders([]);
    setUserId(null);
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (request !== generation.current) return;
      if (authError || !userData.user) {
        setAuthenticated(false);
        setSelectedReference(null);
        return;
      }
      setAuthenticated(true);
      setUserId(userData.user.id);
      const { data, error: failure } = await supabase
        .from("orders")
        .select("booking_reference, occasion, event_date, guests, estimated_total, status, venue")
        .eq("customer_id", userData.user.id)
        .order("created_at", { ascending: false });
      if (request !== generation.current) return;
      if (failure) throw failure;
      const rows = (data ?? []).filter((order) =>
        Boolean(order.booking_reference),
      ) as CustomerOrder[];
      setOrders(rows);
      const params = new URLSearchParams(location.search);
      const desired = params.get("service") === "travel" ? null : params.get("reference");
      setSelectedReference(
        (current) =>
          rows.find((row) => row.booking_reference === (current || desired))?.booking_reference ||
          desired ||
          rows[0]?.booking_reference ||
          null,
      );
    } catch {
      if (request === generation.current)
        setError("Could not load your catering bookings. Please try again.");
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(location.search);
    if (params.get("service") === "travel") setService("travel");
    void load();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      queueMicrotask(() => {
        if (active) void load();
      });
    });
    const focus = () => void load();
    window.addEventListener("focus", focus);
    return () => {
      active = false;
      // This is a request generation counter, not a DOM ref.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++;
      listener.subscription.unsubscribe();
      window.removeEventListener("focus", focus);
    };
  }, [load]);

  const selected = orders.find((order) => order.booking_reference === selectedReference);
  const cancel = async () => {
    if (!selected || selected.status !== "new" || cancelling) return;
    setCancelling(true);
    setError(null);
    try {
      const { data, error: cancelError } = await supabase.rpc("cancel_customer_booking", {
        p_booking_reference: selected.booking_reference,
      });
      if (cancelError || !data) {
        setError(
          "This catering booking could not be cancelled. Refresh its status or contact our team.",
        );
        return;
        return;
      }
      await load();
    } catch {
      setError("Could not cancel your catering booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <main className="mx-auto max-w-[860px] px-5 py-8 pb-32 sm:px-8">
      <SectionHeader
        eyebrow="Your bookings"
        title="Booking tracking"
        subtitle="Select a booking to view its current status and details."
      />
      <div role="group" aria-label="Booking service" className="mt-6 flex gap-2">
        {(["catering", "travel"] as const).map((item) => (
          <button
            key={item}
            aria-pressed={service === item}
            onClick={() => {
              setService(item);
              const params = new URLSearchParams(location.search);
              params.set("service", item);
              params.delete("reference");
              history.replaceState(null, "", `${location.pathname}?${params}`);
            }}
            className={cx(
              "min-h-11 rounded-full border px-4 text-sm font-semibold",
              service === item
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card",
            )}
          >
            {item === "travel" ? "Travel Booking" : "Catering Booking"}
          </button>
        ))}
      </div>
      {authenticated === false ? (
        <div className="mt-6 rounded-[18px] border border-border bg-card p-6 text-center shadow-card">
          <h2 className="font-display text-[26px]">Sign in to view your orders</h2>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Your booking history is available securely in your account.
          </p>
          <Link href="/profile" className="mt-5 inline-block">
            <Button size="lg">Sign in or create account</Button>
          </Link>
        </div>
      ) : service === "travel" && userId ? (
        <TravelBookingHistory key={userId} userId={userId} tracking />
      ) : loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : error && orders.length === 0 ? (
        <div role="alert" className="mt-6 rounded-xl border p-5">
          <p>{error}</p>
          <button className="mt-3 underline" onClick={() => void load()}>
            Try again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No bookings yet"
            note="Your submitted catering bookings will appear here."
          />
        </div>
      ) : (
        <>
          {selectedReference && !selected && (
            <p role="alert" className="mt-5 rounded-xl border p-4 text-sm">
              This catering booking could not be found in your account. Choose one of your bookings
              below.
            </p>
          )}
          <div className="mt-5 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl">Catering Booking</h2>
            <button className="text-sm underline" onClick={() => void load()}>
              Refresh catering status
            </button>
          </div>
          <div className="no-scrollbar -mx-5 mt-6 flex gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0">
            {orders.map((order) => (
              <button
                key={order.booking_reference}
                onClick={() => {
                  setSelectedReference(order.booking_reference);
                  const params = new URLSearchParams(location.search);
                  params.set("service", "catering");
                  params.set("reference", order.booking_reference);
                  history.replaceState(null, "", `${location.pathname}?${params}`);
                }}
                className={cx(
                  "w-[245px] shrink-0 rounded-[18px] border p-5 text-left transition-colors sm:w-auto",
                  selectedReference === order.booking_reference
                    ? "border-gold bg-champagne/35"
                    : "border-border bg-card",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-[21px]">{order.occasion ?? "Catering booking"}</p>
                  <span className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em]">
                    {statusLabel(order.status)}
                  </span>
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  {order.event_date
                    ? new Date(`${order.event_date}T00:00:00`).toDateString()
                    : "Date to be confirmed"}
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">{order.guests} guests</p>
              </button>
            ))}
          </div>
          {selected && (
            <OrderDetail
              order={selected}
              cancelling={cancelling}
              error={error}
              onCancel={() => void cancel()}
            />
          )}
        </>
      )}
    </main>
  );
}

function OrderDetail({
  order,
  cancelling,
  error,
  onCancel,
}: {
  order: CustomerOrder;
  cancelling: boolean;
  error: string | null;
  onCancel: () => void;
}) {
  const canCancel = order.status === "new";
  return (
    <section className="mt-6 rounded-[20px] border border-border bg-card p-5 shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Catering Booking status</p>
          <h2 className="mt-1 font-display text-[28px] capitalize">{statusLabel(order.status)}</h2>
        </div>
        <ChevronRight className="mt-2 h-5 w-5 text-gold" />
      </div>
      <BookingTracking service="catering" status={order.status} />
      <div className="mt-6 grid gap-4 border-y border-border py-5 text-[14px]">
        <p className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-gold" />
          {order.event_date
            ? new Date(`${order.event_date}T00:00:00`).toDateString()
            : "Date to be confirmed"}{" "}
          · {order.guests} guests
        </p>
        {order.venue?.area && (
          <p className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-gold" />
            {order.venue.area}
            {order.venue.pincode ? ` · ${order.venue.pincode}` : ""}
          </p>
        )}
      </div>
      <p className="mt-4 font-mono text-[11px] text-muted-text">{order.booking_reference}</p>
      {canCancel ? (
        <div className="mt-5">
          <p className="mb-3 text-[13px] text-muted-foreground">
            You can cancel while this booking is pending.
          </p>
          <Button variant="outline" full disabled={cancelling} onClick={onCancel}>
            {cancelling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PackageX className="h-4 w-4" />
            )}
            {cancelling ? "Cancelling..." : "Cancel booking"}
          </Button>
        </div>
      ) : (
        <p className="mt-5 text-[13px] text-muted-foreground">
          This booking can no longer be cancelled online. Please contact us if you need help.
        </p>
      )}
      {error && <p className="mt-3 text-[13px] text-destructive">{error}</p>}
    </section>
  );
}
