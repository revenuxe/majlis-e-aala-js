"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowUpRight, CalendarDays, MapPin, Phone, RefreshCw, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button, cx } from "@/components/ui-kit";
import { Field, ImageField, Select, Sheet, TextArea, TextInput, Toggle } from "./AdminUI";
import { travelCategories } from "@/lib/travel";
import { travelSaveError } from "@/lib/travel-admin-errors";
import { useAdminState } from "./AdminWorkspace";
import {
  packageAdultPrice,
  assistanceOptions,
  travelDate,
  travelMoney,
  type TravelPackage,
  type TravelDeparture,
  type TravelRequest,
} from "@/lib/travel-booking";

const db = supabase;
const statuses = ["new", "contacted", "quoted", "confirmed", "completed", "cancelled"] as const;
const statusLabels: Record<TravelRequest["status"], string> = {
  new: "Received",
  contacted: "Planning",
  quoted: "Quoted",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};
const statusColors: Record<TravelRequest["status"], string> = {
  new: "bg-amber-50 text-amber-800 border-amber-200",
  contacted: "bg-blue-50 text-blue-800 border-blue-200",
  quoted: "bg-violet-50 text-violet-800 border-violet-200",
  confirmed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  completed: "bg-surface text-muted-foreground border-border",
  cancelled: "bg-red-50 text-red-800 border-red-200",
};
const blankPackage: Omit<TravelPackage, "id"> = {
  flight_options: [],
  slug: "",
  category: "umrah",
  name: "",
  tagline: "",
  places: "",
  duration: "",
  description: "",
  image_url: null,
  highlights: [],
  inclusions: [],
  exclusions: [],
  itinerary: [],
  price_per_adult: null,
  pricing_mode: "on_request",
  price_basis: "Per adult; room sharing confirmed in quotation",
  pricing_note:
    "Prices vary with travel dates, airline, hotel availability, room sharing and season. Final price is confirmed in your written quotation before booking.",
  collection: "core",
  cancellation_terms: "Cancellation terms will be provided with your written quotation.",
  is_active: false,
  sort_order: 0,
};
const lines = (value: string) =>
  value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
const inputDate = () => new Date().toISOString().slice(0, 10);

export function TravelListingsPanel({ mode = "listings" }: { mode?: "listings" | "orders" }) {
  const [tab, setTab] = useAdminState<"packages" | "departures" | "requests">(
    `travel:${mode}:tab`,
    mode === "orders" ? "requests" : "packages",
  );
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [packageSearch, setPackageSearch] = useAdminState(`travel:${mode}:packageSearch`, "");
  const [packageCategory, setPackageCategory] = useAdminState(`travel:${mode}:packageCategory`, "");
  const [batchCategory, setBatchCategory] = useAdminState("travel:batchCategory", "");
  const [departures, setDepartures] = useState<TravelDeparture[]>([]);
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [limit, setLimit] = useAdminState(`travel:${mode}:limit`, 50);
  const [status, setStatus] = useAdminState(`travel:${mode}:status`, "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pkg, setPkg] = useAdminState<TravelPackage | Omit<TravelPackage, "id"> | null>(
    `travel:${mode}:pkg`,
    null,
  );
  const [itinerary, setItinerary] = useAdminState(`travel:${mode}:itinerary`, "");
  const [dep, setDep] = useAdminState<TravelDeparture | Omit<TravelDeparture, "id"> | null>(
    `travel:${mode}:dep`,
    null,
  );
  const [request, setRequest] = useAdminState<TravelRequest | null>(`travel:${mode}:request`, null);
  const [originalRequest, setOriginalRequest] = useAdminState<TravelRequest | null>(
    `travel:${mode}:originalRequest`,
    null,
  );
  const loadVersion = useRef(0);
  const load = useCallback(async () => {
    const version = ++loadVersion.current;
    setLoading(true);
    setError(false);
    setRequests([]);
    try {
      let query = db
        .from("travel_booking_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit + 1);
      if (status) query = query.eq("status", status);
      const [p, d, r] = await Promise.all([
        mode === "orders"
          ? Promise.resolve({ data: [], error: null })
          : db.from("travel_packages").select("*").order("sort_order").order("name"),
        mode === "orders"
          ? Promise.resolve({ data: [], error: null })
          : db.from("travel_departures").select("*").order("start_date", { ascending: false }),
        query,
      ]);
      if (p.error || d.error || r.error) throw p.error || d.error || r.error;
      if (version !== loadVersion.current) return;
      setPackages((p.data || []) as unknown as TravelPackage[]);
      setDepartures(d.data || []);
      setRequests((r.data || []) as unknown as TravelRequest[]);
    } catch {
      if (version === loadVersion.current) setError(true);
    } finally {
      if (version === loadVersion.current) setLoading(false);
    }
  }, [limit, status, mode]);
  useEffect(() => {
    void load();
    return () => {
      // Invalidate pending requests when the filter changes or the panel unmounts.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      loadVersion.current++;
    };
  }, [load]);
  async function save(kind: "package" | "departure" | "request") {
    if (busy) return;
    setBusy(true);
    try {
      let result;
      if (kind === "package" && pkg) {
        if (!pkg.name.trim() || !pkg.slug.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pkg.slug))
          throw new Error("Enter a name and a slug using lowercase letters, numbers and hyphens.");
        const flightOptions = (pkg.flight_options || []).map((option) => ({
          ...option,
          airline: option.airline.trim(),
          notes: option.notes.trim(),
        }));
        if (
          flightOptions.length > 10 ||
          flightOptions.some(
            (option) =>
              !option.id ||
              !option.airline ||
              option.airline.length > 100 ||
              option.notes.length > 500 ||
              (option.price_per_adult != null &&
                (!Number.isFinite(option.price_per_adult) || option.price_per_adult < 0)),
          )
        )
          throw new Error(
            "Enter a valid airline and package price for each flight option (maximum 10).",
          );
        const adultPrice = packageAdultPrice(pkg);
        if (
          pkg.price_per_adult !== null &&
          (!Number.isFinite(pkg.price_per_adult) || pkg.price_per_adult < 0)
        )
          throw new Error("Enter a valid adult price or leave it blank for a quotation.");
        if (pkg.pricing_mode !== "on_request" && adultPrice == null)
          throw new Error("Add a starting price or choose price on request.");
        if (
          !pkg.price_basis.trim() ||
          pkg.price_basis.length > 200 ||
          pkg.pricing_note.length > 1000
        )
          throw new Error(
            "Add the price basis (up to 200 characters) and keep the pricing note under 1,000 characters.",
          );
        if (!Number.isInteger(pkg.sort_order) || pkg.sort_order < 0)
          throw new Error("Display order must be a positive whole number or zero.");
        const stages = lines(itinerary).map((line) => {
          const i = line.indexOf("|");
          if (i < 1 || !line.slice(i + 1).trim())
            throw new Error("Each itinerary line needs a title | description.");
          return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
        });
        const { id, ...data } = pkg as TravelPackage;
        const payload = {
          ...data,
          flight_options: flightOptions,
          price_per_adult: adultPrice,
          price_basis: data.price_basis.trim(),
          name: data.name.trim(),
          slug: data.slug.trim(),
          itinerary: stages,
          highlights: data.highlights.map((v) => v.trim()).filter(Boolean),
          inclusions: data.inclusions.map((v) => v.trim()).filter(Boolean),
          exclusions: data.exclusions.map((v) => v.trim()).filter(Boolean),
        };
        result = id
          ? await db.from("travel_packages").update(payload).eq("id", id).select("id")
          : await db.from("travel_packages").insert(payload).select("id");
        if (!result.error && !result.data?.length)
          throw new Error(
            "This package was deleted or your account cannot update it. Refresh and check your administrator access.",
          );
      } else if (kind === "departure" && dep) {
        if (
          !dep.package_id ||
          dep.departure_city.trim().length < 2 ||
          !dep.start_date ||
          (dep.end_date != null && dep.end_date < dep.start_date)
        )
          throw new Error("Choose a package, departure city and a valid batch date range.");
        if (!packages.some((item) => item.id === dep.package_id))
          throw new Error("Choose an available package for this batch.");
        if (!("id" in dep) && dep.start_date < inputDate())
          throw new Error("Choose today or a future travel date for a new batch.");
        if (
          dep.capacity !== null &&
          (!Number.isInteger(dep.capacity) || dep.capacity < 1 || dep.capacity > 10000)
        )
          throw new Error("Group capacity must be a whole number between 1 and 10,000.");
        const { id, ...data } = dep as TravelDeparture;
        result = id
          ? await db.from("travel_departures").update(data).eq("id", id).select("id")
          : await db.from("travel_departures").insert(data).select("id");
        if (!result.error && !result.data?.length)
          throw new Error(
            "This batch was deleted or your account cannot update it. Refresh and try again.",
          );
      } else if (kind === "request" && request) {
        if (
          request.quoted_total !== null &&
          (!Number.isFinite(request.quoted_total) || request.quoted_total < 0)
        )
          throw new Error("Enter a valid quotation total.");
        if (["quoted", "confirmed"].includes(request.status) && request.quoted_total === null)
          throw new Error(
            "Enter the agreed quotation total before marking this request quoted or confirmed.",
          );
        result = await db
          .from("travel_booking_requests")
          .update({
            status: request.status,
            quoted_total: request.quoted_total,
            admin_notes: request.admin_notes,
          })
          .eq("id", request.id)
          .eq("status", originalRequest?.status || request.status)
          .select("id");
        if (!result.error && !result.data?.length)
          throw new Error(
            "This booking changed or was deleted. Close it and refresh before updating.",
          );
      }
      if (result?.error) throw new Error(travelSaveError(result.error));
      toast.success("Travel listing saved");
      setPkg(null);
      setDep(null);
      setRequest(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }
  async function deleteRequest() {
    if (
      !request ||
      busy ||
      !window.confirm(
        `Permanently delete travel booking ${request.booking_reference}? This cannot be undone.`,
      )
    )
      return;
    setBusy(true);
    try {
      const { data, error: failure } = await db.rpc("delete_admin_travel_booking", {
        p_booking_id: request.id,
      });
      if (failure) throw failure;
      if (!data) throw new Error("This travel booking was already deleted. Refresh the list.");
      setRequest(null);
      toast.success("Travel booking deleted");
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not delete this travel booking. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  const close = () => {
    if (!busy) {
      setPkg(null);
      setDep(null);
      setRequest(null);
    }
  };
  return (
    <div className="space-y-5">
      {mode === "listings" && (
        <div className="flex flex-wrap gap-2">
          {(["packages", "departures", "requests"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cx(
                "rounded-full border px-4 py-2 text-sm font-semibold capitalize",
                tab === key ? "bg-primary text-primary-foreground" : "bg-card",
              )}
            >
              {key === "departures" ? "Batches" : key}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <div role="alert" className="rounded-xl border p-4">
          Could not load travel {mode === "orders" ? "orders" : "listings"}.{" "}
          <button className="underline" onClick={() => void load()}>
            Try again
          </button>
        </div>
      ) : null}
      {loading ? (
        <p role="status">Loading travel {mode === "orders" ? "orders" : "listings"}…</p>
      ) : null}
      {tab === "packages" && (
        <>
          <Button
            onClick={() => {
              setPkg({ ...blankPackage });
              setItinerary("");
            }}
          >
            Add travel package
          </Button>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Find a package">
              <TextInput
                type="search"
                value={packageSearch}
                onChange={(e) => setPackageSearch(e.target.value)}
                placeholder="Package name or destination"
              />
            </Field>
            <Field label="Package category">
              <Select value={packageCategory} onChange={(e) => setPackageCategory(e.target.value)}>
                <option value="">All categories</option>
                {travelCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {packages
              .filter(
                (item) =>
                  (!packageCategory || item.category === packageCategory) &&
                  `${item.name} ${item.places}`
                    .toLowerCase()
                    .includes(packageSearch.trim().toLowerCase()),
              )
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setPkg({ ...item });
                    setItinerary(item.itinerary.map((stage) => stage.join(" | ")).join("\n"));
                  }}
                  className="rounded-2xl border bg-card p-5 text-left"
                >
                  <p className="text-xs uppercase text-muted-foreground">
                    {item.category} · {item.is_active ? "Visible" : "Hidden"}
                  </p>
                  <h3 className="mt-2 font-display text-2xl">{item.name}</h3>
                  <p className="mt-2 text-sm">
                    {item.duration} ·{" "}
                    {item.price_per_adult === null
                      ? "Quotation required"
                      : `${item.pricing_mode === "seasonal" ? "Seasonal guide from" : "From"} ${travelMoney(Number(item.price_per_adult))}`}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.price_basis}</p>
                  {item.flight_options?.map((option) => (
                    <p key={option.id} className="mt-1 text-xs">
                      {option.airline} ·{" "}
                      {item.pricing_mode === "on_request" || option.price_per_adult == null
                        ? "Quotation required"
                        : travelMoney(option.price_per_adult)}
                    </p>
                  ))}
                  <p className="mt-3 text-xs text-gold">Edit package →</p>
                </button>
              ))}
          </div>
          {!loading && !packages.length && <p>No travel packages.</p>}
        </>
      )}
      {tab === "departures" && (
        <>
          <Button
            disabled={!packages.length}
            onClick={() =>
              setDep({
                package_id:
                  packages.find((p) => !batchCategory || p.category === batchCategory)?.id || "",
                departure_city: "Bengaluru",
                start_date: inputDate(),
                end_date: null,
                capacity: null,
                is_active: true,
                notes: "",
              })
            }
          >
            Add batch
          </Button>
          <Field label="Filter batches by category">
            <Select value={batchCategory} onChange={(e) => setBatchCategory(e.target.value)}>
              <option value="">All categories</option>
              {travelCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            {departures
              .filter(
                (item) =>
                  !batchCategory ||
                  packages.find((p) => p.id === item.package_id)?.category === batchCategory,
              )
              .map((item) => (
                <button
                  key={item.id}
                  className="rounded-2xl border bg-card p-5 text-left"
                  onClick={() => setDep({ ...item })}
                >
                  <h3 className="font-semibold">
                    {packages.find((p) => p.id === item.package_id)?.name || "Travel package"}
                  </h3>
                  <p className="mt-2 text-sm">
                    {item.departure_city} · {travelDate(item.start_date)}
                    {item.end_date ? ` – ${travelDate(item.end_date)}` : ""}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.is_active ? "Active" : "Hidden"} ·{" "}
                    {item.capacity
                      ? `Maximum group size: ${item.capacity}`
                      : "Group size on request"}
                  </p>
                </button>
              ))}
          </div>
          {!loading &&
            !departures.some(
              (item) =>
                !batchCategory ||
                packages.find((p) => p.id === item.package_id)?.category === batchCategory,
            ) && <p>No batches in this category yet.</p>}
        </>
      )}
      {tab === "requests" && (
        <>
          <div className="flex items-center justify-between gap-3">
            <div
              role="group"
              aria-label="Travel booking status"
              className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto"
            >
              {["", ...statuses].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={status === value}
                  onClick={() => {
                    setStatus(value);
                    setLimit(50);
                  }}
                  className={cx(
                    "min-h-10 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold transition-colors",
                    status === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-gold",
                  )}
                >
                  {value ? statusLabels[value as TravelRequest["status"]] : "All"}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => void load()}
              aria-label="Refresh travel bookings"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="grid items-start gap-4 md:grid-cols-2">
            {requests.slice(0, limit).map((item) => (
              <article
                key={item.id}
                className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-card"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-all font-mono text-[10px] leading-5 text-muted-foreground">
                      {item.booking_reference}
                    </p>
                    <span
                      className={cx(
                        "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                        statusColors[item.status],
                      )}
                    >
                      {statusLabels[item.status]}
                    </span>
                  </div>
                  <h3 className="mt-3 break-words text-lg font-semibold leading-snug">
                    {item.customer_name}
                  </h3>
                  <p className="mt-1 break-words text-sm text-muted-foreground">
                    {item.package_snapshot.name || `Custom ${item.category} journey`}
                  </p>
                  <div className="mt-5 space-y-2.5 text-[13px]">
                    <p className="flex items-start gap-2.5">
                      <MapPin size={15} className="mt-0.5 shrink-0 text-gold" />
                      <span className="min-w-0 break-words">{item.departure_city}</span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <CalendarDays size={15} className="mt-0.5 shrink-0 text-gold" />
                      <span>
                        {item.preferred_date
                          ? travelDate(item.preferred_date)
                          : item.preferred_month
                            ? new Intl.DateTimeFormat("en-IN", {
                                month: "short",
                                year: "numeric",
                              }).format(new Date(`${item.preferred_month}-01T00:00:00`))
                            : "Flexible dates"}
                      </span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <Users size={15} className="mt-0.5 shrink-0 text-gold" />
                      <span>
                        {item.adults} {item.adults === 1 ? "adult" : "adults"}
                        {item.children
                          ? ` · ${item.children} ${item.children === 1 ? "child" : "children"}`
                          : ""}
                      </span>
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <span className="text-[11px] text-muted-foreground">
                      Received {travelDate(item.created_at.slice(0, 10))}
                    </span>
                    <span className="text-sm font-semibold">
                      {item.quoted_total !== null
                        ? travelMoney(Number(item.quoted_total))
                        : "Not quoted"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t border-border bg-surface/50 px-5 py-3">
                  <a
                    href={`tel:+${item.phone}`}
                    aria-label={`Call ${item.customer_name}`}
                    className="inline-flex min-h-11 min-w-0 flex-1 items-center gap-2 text-[13px] font-medium hover:text-gold"
                  >
                    <Phone size={15} className="shrink-0" />
                    <span className="truncate">{item.phone}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setOriginalRequest(item);
                      setRequest({ ...item });
                    }}
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground"
                  >
                    Manage
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!loading && !error && !requests.length && (
            <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">
              No travel bookings
              {status
                ? ` marked ${statusLabels[status as TravelRequest["status"]].toLowerCase()}`
                : " yet"}
              .
            </div>
          )}
          {requests.length > limit && (
            <Button onClick={() => setLimit((n) => n + 50)}>Load more requests</Button>
          )}
        </>
      )}
      <Sheet
        open={!!pkg}
        title={pkg && "id" in pkg ? "Edit travel package" : "New travel package"}
        onClose={close}
        footer={
          <Button disabled={busy} full onClick={() => void save("package")}>
            {busy ? "Saving…" : "Save package"}
          </Button>
        }
      >
        {pkg && (
          <div className="space-y-4">
            <Field label="Name">
              <TextInput
                value={pkg.name}
                onChange={(e) =>
                  setPkg({
                    ...pkg,
                    name: e.target.value,
                    slug: !("id" in pkg)
                      ? e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                      : pkg.slug,
                  })
                }
              />
            </Field>
            <Field label="Slug">
              <TextInput
                value={pkg.slug}
                onChange={(e) => setPkg({ ...pkg, slug: e.target.value })}
              />
            </Field>
            <Field label="Journey category">
              <Select
                value={pkg.category}
                onChange={(e) =>
                  setPkg({ ...pkg, category: e.target.value as TravelPackage["category"] })
                }
              >
                {travelCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            {(["tagline", "places", "duration", "description", "cancellation_terms"] as const).map(
              (key) => (
                <Field key={key} label={key.replaceAll("_", " ")}>
                  <TextArea
                    value={pkg[key]}
                    onChange={(e) => setPkg({ ...pkg, [key]: e.target.value })}
                  />
                </Field>
              ),
            )}
            <Field label="Image">
              <ImageField
                value={pkg.image_url || ""}
                onChange={(v) => setPkg({ ...pkg, image_url: v || null })}
              />
            </Field>
            {(["highlights", "inclusions", "exclusions"] as const).map((key) => (
              <Field key={key} label={key} hint="One item per line">
                <TextArea
                  value={pkg[key].join("\n")}
                  onChange={(e) => setPkg({ ...pkg, [key]: e.target.value.split("\n") })}
                />
              </Field>
            ))}
            <Field label="Itinerary" hint="One stage per line: Title | description">
              <TextArea value={itinerary} onChange={(e) => setItinerary(e.target.value)} />
            </Field>
            <div className="space-y-3 rounded-2xl border border-border p-4">
              <p className="font-semibold">Flight options</p>
              <p className="text-xs text-muted-foreground">
                Enter the full package price per adult with each airline, including package
                services. The lowest priced option becomes the starting price. Blank prices require
                a quotation.
              </p>
              {(pkg.flight_options || []).map((option, index) => (
                <div key={option.id} className="space-y-2 rounded-xl bg-surface p-3">
                  <Field label={"Airline " + (index + 1)}>
                    <TextInput
                      maxLength={100}
                      placeholder="Air India Express"
                      value={option.airline}
                      onChange={(e) =>
                        setPkg({
                          ...pkg,
                          flight_options: pkg.flight_options!.map((item) =>
                            item.id === option.id ? { ...item, airline: e.target.value } : item,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="Full package price per adult (INR)">
                    <TextInput
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="100000"
                      value={option.price_per_adult ?? ""}
                      onChange={(e) =>
                        setPkg({
                          ...pkg,
                          pricing_mode:
                            e.target.value && pkg.pricing_mode === "on_request"
                              ? "starting"
                              : pkg.pricing_mode,
                          flight_options: pkg.flight_options!.map((item) =>
                            item.id === option.id
                              ? {
                                  ...item,
                                  price_per_adult:
                                    e.target.value === "" ? null : Number(e.target.value),
                                }
                              : item,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="Flight note (optional)">
                    <TextInput
                      maxLength={500}
                      placeholder="Return economy flight; baggage confirmed in quotation"
                      value={option.notes}
                      onChange={(e) =>
                        setPkg({
                          ...pkg,
                          flight_options: pkg.flight_options!.map((item) =>
                            item.id === option.id ? { ...item, notes: e.target.value } : item,
                          ),
                        })
                      }
                    />
                  </Field>
                  <button
                    type="button"
                    className="min-h-11 text-sm text-destructive"
                    onClick={() =>
                      setPkg({
                        ...pkg,
                        flight_options: pkg.flight_options!.filter((item) => item.id !== option.id),
                      })
                    }
                  >
                    Remove flight option
                  </button>
                </div>
              ))}
              <Button
                disabled={(pkg.flight_options || []).length >= 10}
                onClick={() =>
                  setPkg({
                    ...pkg,
                    flight_options: [
                      ...(pkg.flight_options || []),
                      { id: crypto.randomUUID(), airline: "", price_per_adult: null, notes: "" },
                    ],
                  })
                }
              >
                Add flight option
              </Button>
            </div>
            <Field
              label="Indicative adult price (INR)"
              hint={
                pkg.flight_options?.length
                  ? "Calculated from flight options when saved"
                  : "Blank = quotation required"
              }
            >
              <TextInput
                type="number"
                min="0"
                step="0.01"
                disabled={!!pkg.flight_options?.length}
                value={
                  pkg.flight_options?.length
                    ? (packageAdultPrice(pkg) ?? "")
                    : (pkg.price_per_adult ?? "")
                }
                onChange={(e) =>
                  setPkg({
                    ...pkg,
                    price_per_adult: e.target.value === "" ? null : Number(e.target.value),
                    pricing_mode:
                      e.target.value === ""
                        ? "on_request"
                        : pkg.pricing_mode === "on_request"
                          ? "starting"
                          : pkg.pricing_mode,
                  })
                }
              />
            </Field>
            <Field label="Price presentation">
              <Select
                value={pkg.pricing_mode}
                onChange={(e) =>
                  setPkg({
                    ...pkg,
                    pricing_mode: e.target.value as TravelPackage["pricing_mode"],
                    price_per_adult: e.target.value === "on_request" ? null : pkg.price_per_adult,
                  })
                }
              >
                <option value="starting">Starting price</option>
                <option value="seasonal">Seasonal starting guide</option>
                <option value="on_request">Price on request</option>
              </Select>
            </Field>
            <Field label="Price basis" hint="e.g. Per adult, 4 sharing">
              <TextInput
                maxLength={200}
                value={pkg.price_basis}
                onChange={(e) => setPkg({ ...pkg, price_basis: e.target.value })}
              />
            </Field>
            <Field label="Pricing note">
              <TextArea
                maxLength={1000}
                value={pkg.pricing_note}
                onChange={(e) => setPkg({ ...pkg, pricing_note: e.target.value })}
              />
            </Field>
            <Field label="Journey collection">
              <Select
                value={pkg.collection}
                onChange={(e) =>
                  setPkg({ ...pkg, collection: e.target.value as TravelPackage["collection"] })
                }
              >
                <option value="core">Classic journeys</option>
                <option value="combo">Umrah combos</option>
                <option value="ramadan">Ramadan</option>
                <option value="ziyarat">Ziyarat & heritage</option>
              </Select>
            </Field>
            <Field label="Display order">
              <TextInput
                type="number"
                min="0"
                value={pkg.sort_order}
                onChange={(e) => setPkg({ ...pkg, sort_order: Number(e.target.value) })}
              />
            </Field>
            <Toggle
              checked={pkg.is_active}
              label="Show on travel website"
              onChange={(v) => setPkg({ ...pkg, is_active: v })}
            />
          </div>
        )}
      </Sheet>
      <Sheet
        open={!!dep}
        title={dep && "id" in dep ? "Edit batch" : "New batch"}
        onClose={close}
        footer={
          <Button full disabled={busy} onClick={() => void save("departure")}>
            {busy ? "Saving…" : "Save batch"}
          </Button>
        }
      >
        {dep && (
          <div className="space-y-4">
            <Field label="Journey category">
              <Select
                value={packages.find((p) => p.id === dep.package_id)?.category || ""}
                onChange={(e) =>
                  setDep({
                    ...dep,
                    package_id: packages.find((p) => p.category === e.target.value)?.id || "",
                  })
                }
              >
                <option value="" disabled>
                  Choose category
                </option>
                {travelCategories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    disabled={!packages.some((p) => p.category === category.id)}
                  >
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Package"
              hint="This batch is offered for this package; its category is inherited from the package."
            >
              <Select
                value={dep.package_id}
                onChange={(e) => setDep({ ...dep, package_id: e.target.value })}
              >
                {packages
                  .filter(
                    (p) =>
                      p.category === packages.find((item) => item.id === dep.package_id)?.category,
                  )
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Departure city">
              <TextInput
                value={dep.departure_city}
                onChange={(e) => setDep({ ...dep, departure_city: e.target.value })}
              />
            </Field>
            {(["start_date", "end_date"] as const).map((key) => (
              <Field
                key={key}
                label={key === "start_date" ? "Travel date" : "Return date (optional)"}
              >
                <TextInput
                  type="date"
                  value={dep[key] ?? ""}
                  onChange={(e) =>
                    setDep({
                      ...dep,
                      [key]: key === "end_date" ? e.target.value || null : e.target.value,
                    })
                  }
                />
              </Field>
            ))}
            <Field label="Maximum group size" hint="Optional">
              <TextInput
                type="number"
                min="1"
                max="10000"
                value={dep.capacity ?? ""}
                onChange={(e) =>
                  setDep({
                    ...dep,
                    capacity: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </Field>
            <Field label="Public notes">
              <TextArea
                value={dep.notes}
                onChange={(e) => setDep({ ...dep, notes: e.target.value })}
              />
            </Field>
            <Toggle
              label="Offer this batch"
              checked={dep.is_active}
              onChange={(v) => setDep({ ...dep, is_active: v })}
            />
          </div>
        )}
      </Sheet>
      <Sheet
        open={!!request}
        title={request?.booking_reference || "Travel request"}
        onClose={close}
        footer={
          <div className="space-y-3">
            <Button full disabled={busy} onClick={() => void save("request")}>
              {busy ? "Please wait…" : "Update request"}
            </Button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void deleteRequest()}
              className="min-h-11 w-full rounded-xl border border-destructive px-4 text-sm font-semibold text-destructive disabled:opacity-50"
            >
              Delete travel booking
            </button>
          </div>
        }
      >
        {request && (
          <div className="space-y-5">
            <div className="rounded-xl bg-surface p-4 text-sm leading-7">
              <p className="font-semibold">{request.customer_name}</p>
              <a className="underline" href={`tel:+${request.phone}`}>
                {request.phone}
              </a>
              {request.email && (
                <p>
                  <a className="underline" href={`mailto:${request.email}`}>
                    {request.email}
                  </a>
                </p>
              )}
              <p>{request.package_snapshot.name || `Custom ${request.category} journey`}</p>
              <p>
                {request.departure_city} ·{" "}
                {request.preferred_date
                  ? travelDate(request.preferred_date)
                  : request.preferred_month || "Flexible dates"}
              </p>
              <p>
                {request.adults} adults, {request.children} children
                {request.children ? ` (ages ${request.child_ages.join(", ")})` : ""}
              </p>
              <p>
                Senior travellers: {request.preferences.seniors ?? 0} (included in adults) - Pace:{" "}
                {request.preferences.pace || "balanced"}
                <br />
                Room:{" "}
                {request.preferences.room === "package"
                  ? "As selected package"
                  : request.preferences.room}{" "}
                · Stay:{" "}
                {request.preferences.stay === "package"
                  ? "As selected package"
                  : request.preferences.stay}
              </p>
              <p>
                {request.preferences.assistance
                  .map((id) => assistanceOptions.find((o) => o.id === id)?.label || id)
                  .join(", ") || "No special assistance requested"}
              </p>
              <p className="whitespace-pre-wrap">{request.notes || "No additional notes"}</p>
              {request.package_snapshot.flight_option && (
                <p>Preferred flight: {request.package_snapshot.flight_option.airline}</p>
              )}
              <p>Price basis: {request.package_snapshot.price_basis || "Confirmed in quotation"}</p>
              <p className="text-xs">{request.package_snapshot.pricing_note}</p>
              <p>
                Adult estimate:{" "}
                {request.estimated_adult_total === null
                  ? "Quotation required"
                  : travelMoney(Number(request.estimated_adult_total))}
              </p>
            </div>
            {(["inclusions", "exclusions"] as const).map((key) => (
              <div key={key}>
                <h3 className="font-semibold capitalize">{key} at request time</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {(request.package_snapshot[key] || []).map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              {request.package_snapshot.cancellation_terms ||
                "Custom journey terms to be agreed with customer."}
            </p>
            <Field label="Status">
              <Select
                value={request.status}
                onChange={(e) =>
                  setRequest({ ...request, status: e.target.value as TravelRequest["status"] })
                }
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Final quotation total (INR)">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={request.quoted_total ?? ""}
                onChange={(e) =>
                  setRequest({
                    ...request,
                    quoted_total: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </Field>
            <Field label="Internal admin notes">
              <TextArea
                value={request.admin_notes}
                onChange={(e) => setRequest({ ...request, admin_notes: e.target.value })}
              />
            </Field>
          </div>
        )}
      </Sheet>
    </div>
  );
}
