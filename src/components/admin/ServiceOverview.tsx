"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Loader2, Package, Users, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/admin";
import { EmptyRow, StatCard } from "./AdminUI";

type Enquiry = {
  id: string;
  booking_reference: string | null;
  customer_name: string;
  status: string;
  people: number;
  value: number | null;
  description: string;
};
type Overview = { enquiries: Enquiry[]; packages: number; secondary: number };
const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function ServiceOverview({
  service,
  onViewAll,
}: {
  service: "catering" | "travel";
  onViewAll: () => void;
}) {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setData(null);
    setError(false);
    async function load() {
      const travel = service === "travel";
      // Fetch every page: overview totals must not stop at the latest 50 requests
      // or Supabase's default row limit. Only summary fields are requested.
      const enquiries: Enquiry[] = [];
      for (let offset = 0; ; offset += 500) {
        const result = travel
          ? await supabase
              .from("travel_booking_requests")
              .select(
                "id,booking_reference,customer_name,status,adults,children,estimated_adult_total,quoted_total,package_snapshot,category",
              )
              .order("created_at", { ascending: false })
              .order("id")
              .range(offset, offset + 499)
          : await supabase
              .from("orders")
              .select("id,booking_reference,customer_name,status,guests,estimated_total,occasion")
              .order("created_at", { ascending: false })
              .order("id")
              .range(offset, offset + 499);
        if (!active) return;
        if (result.error) throw result.error;
        const rows = result.data ?? [];
        for (const row of rows) {
          if ("adults" in row) {
            const snapshot = row.package_snapshot as { name?: string } | null;
            enquiries.push({
              ...row,
              people: row.adults + row.children,
              value: row.quoted_total ?? row.estimated_adult_total,
              description: snapshot?.name || `Custom ${row.category} journey`,
            });
          } else {
            enquiries.push({
              ...row,
              people: row.guests || 0,
              value: row.estimated_total,
              description: row.occasion || "Event",
            });
          }
        }
        if (rows.length < 500) break;
      }
      const [packages, secondary] = await Promise.all([
        supabase
          .from(travel ? "travel_packages" : "packages")
          .select("id", { count: "exact", head: true }),
        supabase
          .from(travel ? "travel_departures" : "menu_items")
          .select("id", { count: "exact", head: true }),
      ]);
      if (packages.error || secondary.error) throw packages.error || secondary.error;
      if (active)
        setData({ enquiries, packages: packages.count ?? 0, secondary: secondary.count ?? 0 });
    }
    void load().catch(() => {
      if (active) setError(true);
    });
    return () => {
      active = false;
    };
  }, [service, retry]);
  if (error)
    return (
      <div role="alert" className="rounded-2xl border border-border bg-card p-5">
        <p>We couldn't load the {service} overview.</p>
        <button
          type="button"
          onClick={() => setRetry((value) => value + 1)}
          className="mt-2 min-h-11 font-semibold underline"
        >
          Retry
        </button>
      </div>
    );
  if (!data)
    return (
      <div role="status" className="flex items-center justify-center gap-2 py-16">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading {service} overview…
      </div>
    );
  const open = data.enquiries.filter((item) => !["completed", "cancelled"].includes(item.status));
  const pipeline = open.reduce((sum, item) => sum + Number(item.value || 0), 0);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="New enquiries"
          value={String(data.enquiries.filter((item) => item.status === "new").length)}
          sub={`${data.enquiries.length} total`}
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <StatCard
          label="Open pipeline"
          value={inr(pipeline)}
          sub={
            service === "travel"
              ? "Quotes or adult estimates · open requests"
              : "Estimated value · open enquiries"
          }
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label={service === "travel" ? "Travellers" : "Guests"}
          value={String(data.enquiries.reduce((sum, item) => sum + item.people, 0))}
          sub="Across all enquiries"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Listings"
          value={`${data.packages} / ${data.secondary}`}
          sub={service === "travel" ? "Packages / departures" : "Packages / dishes"}
          icon={<Package className="h-4 w-4" />}
        />
      </div>
      <div className="rounded-[20px] border border-border bg-card p-4 shadow-card sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-[22px]">Latest {service} enquiries</h2>
          <button
            type="button"
            onClick={onViewAll}
            className="min-h-11 text-sm font-semibold text-gold"
          >
            View all
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {data.enquiries.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="break-words text-[15px] font-semibold">{item.customer_name}</p>
                <p className="break-words text-sm text-muted-foreground">
                  {item.booking_reference} · {item.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.people} {service === "travel" ? "travellers" : "guests"}
                </p>
              </div>
              <span className="rounded-full bg-champagne px-3 py-1 text-xs font-semibold">
                {statusLabels[item.status] || item.status}
              </span>
            </div>
          ))}
          {!data.enquiries.length && <EmptyRow text={`No ${service} enquiries yet.`} />}
        </div>
      </div>
    </div>
  );
}
