"use client";
import Link from "next/link";
import { CalendarDays, ChevronRight, Loader2, MapPin, PackageX } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button, EmptyState, SectionHeader, cx } from "@/components/ui-kit";
import { usePlan } from "@/lib/plan-store";

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
  const { bookings } = usePlan();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setAuthenticated(false);
      setLoading(false);
      return;
    }
    setAuthenticated(true);
    const { data, error: loadError } = await supabase
      .from("orders")
      .select("booking_reference, occasion, event_date, guests, estimated_total, status, venue")
      .eq("customer_id", userData.user.id)
      .order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    const databaseOrders = (data ?? []).filter((order): order is CustomerOrder =>
      Boolean(order.booking_reference),
    );
    const localOrders: CustomerOrder[] = bookings.map((booking) => ({
      booking_reference: booking.reference,
      occasion: booking.occasion,
      event_date: booking.eventDate || null,
      guests: booking.guests,
      estimated_total: 0,
      status: booking.status,
      venue: null,
    }));
    const nextOrders = [
      ...databaseOrders,
      ...localOrders.filter(
        (localOrder) =>
          !databaseOrders.some(
            (databaseOrder) => databaseOrder.booking_reference === localOrder.booking_reference,
          ),
      ),
    ];
    setOrders(nextOrders);
    setSelectedReference((current) => current ?? nextOrders[0]?.booking_reference ?? null);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // `load` reads current bookings; intentionally rerun only when they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const selected = orders.find((order) => order.booking_reference === selectedReference);
  const cancel = async () => {
    if (!selected || selected.status !== "new" || cancelling) return;
    setCancelling(true);
    setError(null);
    const { data, error: cancelError } = await supabase.rpc("cancel_customer_booking", {
      p_booking_reference: selected.booking_reference,
    });
    if (cancelError || !data) {
      setError(cancelError?.message ?? "This booking can no longer be cancelled.");
    }
    setCancelling(false);
    await load();
  };

  return (
    <main className="mx-auto max-w-[860px] px-5 py-8 pb-32 sm:px-8">
      <SectionHeader
        eyebrow="Your catering"
        title="Orders"
        subtitle="Select a booking to view its current status and details."
      />
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
      ) : loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
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
          <div className="no-scrollbar -mx-5 mt-6 flex gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0">
            {orders.map((order) => (
              <button
                key={order.booking_reference}
                onClick={() => setSelectedReference(order.booking_reference)}
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
          <p className="eyebrow">Booking status</p>
          <h2 className="mt-1 font-display text-[28px] capitalize">{statusLabel(order.status)}</h2>
        </div>
        <ChevronRight className="mt-2 h-5 w-5 text-gold" />
      </div>
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
