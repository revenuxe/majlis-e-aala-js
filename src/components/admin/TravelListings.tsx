"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button, cx } from "@/components/ui-kit";
import { Field, ImageField, Select, Sheet, TextArea, TextInput, Toggle } from "./AdminUI";
import { travelCategories } from "@/lib/travel";
import {
  assistanceOptions,
  travelDate,
  travelMoney,
  type TravelPackage,
  type TravelDeparture,
  type TravelRequest,
} from "@/lib/travel-booking";

const db = supabase;
const statuses = ["new", "contacted", "quoted", "confirmed", "completed", "cancelled"] as const;
const blankPackage: Omit<TravelPackage, "id"> = {
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
  const [tab, setTab] = useState<"packages" | "departures" | "requests">(
    mode === "orders" ? "requests" : "packages",
  );
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [departures, setDepartures] = useState<TravelDeparture[]>([]);
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [limit, setLimit] = useState(50);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pkg, setPkg] = useState<TravelPackage | Omit<TravelPackage, "id"> | null>(null);
  const [itinerary, setItinerary] = useState("");
  const [dep, setDep] = useState<TravelDeparture | Omit<TravelDeparture, "id"> | null>(null);
  const [request, setRequest] = useState<TravelRequest | null>(null);
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
    setBusy(true);
    try {
      let result;
      if (kind === "package" && pkg) {
        if (!pkg.name.trim() || !pkg.slug.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pkg.slug))
          throw new Error("Enter a name and a slug using lowercase letters, numbers and hyphens.");
        if (
          pkg.price_per_adult !== null &&
          (!Number.isFinite(pkg.price_per_adult) || pkg.price_per_adult < 0)
        )
          throw new Error("Enter a valid adult price or leave it blank for a quotation.");
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
          name: data.name.trim(),
          slug: data.slug.trim(),
          itinerary: stages,
          highlights: data.highlights.map((v) => v.trim()).filter(Boolean),
          inclusions: data.inclusions.map((v) => v.trim()).filter(Boolean),
          exclusions: data.exclusions.map((v) => v.trim()).filter(Boolean),
        };
        result = id
          ? await db.from("travel_packages").update(payload).eq("id", id)
          : await db.from("travel_packages").insert(payload);
      } else if (kind === "departure" && dep) {
        if (
          !dep.package_id ||
          dep.departure_city.trim().length < 2 ||
          !dep.start_date ||
          !dep.end_date ||
          dep.end_date < dep.start_date
        )
          throw new Error("Choose a package, departure city and a valid date range.");
        if (
          dep.capacity !== null &&
          (!Number.isInteger(dep.capacity) || dep.capacity < 1 || dep.capacity > 10000)
        )
          throw new Error("Group capacity must be a whole number between 1 and 10,000.");
        const { id, ...data } = dep as TravelDeparture;
        result = id
          ? await db.from("travel_departures").update(data).eq("id", id)
          : await db.from("travel_departures").insert(data);
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
          .eq("id", request.id);
      }
      if (result?.error)
        throw new Error(
          result.error.code === "23505"
            ? "That package slug already exists. Choose another."
            : "Could not save changes. Please try again.",
        );
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
              {key}
            </button>
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        {mode === "orders"
          ? "Manage travel requests, customer quotations and booking status. Changes appear in the customer's Travel Booking tracking."
          : "Manage travel independently from catering. Packages without a price show quotation required. Departures are planning options; capacity does not reserve seats."}
      </p>
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
            {packages.map((item) => (
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
                    : `${travelMoney(Number(item.price_per_adult))} / adult`}
                </p>
                <p className="mt-3 text-xs text-gold">Edit package →</p>
              </button>
            ))}
          </div>
          {!loading && !packages.length && <p>No travel packages yet. Add your first journey.</p>}
        </>
      )}
      {tab === "departures" && (
        <>
          <Button
            disabled={!packages.length}
            onClick={() =>
              setDep({
                package_id: packages[0]?.id || "",
                departure_city: "Bengaluru",
                start_date: inputDate(),
                end_date: inputDate(),
                capacity: null,
                is_active: true,
                notes: "",
              })
            }
          >
            Add departure
          </Button>
          <div className="grid gap-3 sm:grid-cols-2">
            {departures.map((item) => (
              <button
                key={item.id}
                className="rounded-2xl border bg-card p-5 text-left"
                onClick={() => setDep({ ...item })}
              >
                <h3 className="font-semibold">
                  {packages.find((p) => p.id === item.package_id)?.name || "Travel package"}
                </h3>
                <p className="mt-2 text-sm">
                  {item.departure_city} · {travelDate(item.start_date)} –{" "}
                  {travelDate(item.end_date)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.is_active ? "Active" : "Hidden"} ·{" "}
                  {item.capacity ? `Maximum group size: ${item.capacity}` : "Group size on request"}
                </p>
              </button>
            ))}
          </div>
          {!loading && !departures.length && (
            <p>
              No scheduled departures yet. Customers can still request flexible or custom dates.
            </p>
          )}
        </>
      )}
      {tab === "requests" && (
        <>
          <Field label="Filter by status">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setLimit(50);
              }}
            >
              <option value="">All requests</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <div className="space-y-3">
            {requests.slice(0, limit).map((item) => (
              <button
                key={item.id}
                onClick={() => setRequest({ ...item })}
                className="flex w-full flex-wrap justify-between gap-3 rounded-2xl border bg-card p-5 text-left"
              >
                <div>
                  <p className="text-xs font-semibold text-gold">{item.booking_reference}</p>
                  <h3 className="mt-1 font-semibold">
                    {item.customer_name} ·{" "}
                    {item.package_snapshot.name || `Custom ${item.category} journey`}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.adults} adults{item.children ? `, ${item.children} children` : ""} ·{" "}
                    {item.departure_city} ·{" "}
                    {item.preferred_date
                      ? travelDate(item.preferred_date)
                      : item.preferred_month || "Flexible dates"}
                  </p>
                  <p className="mt-2 text-xs">
                    {item.phone} · {new Date(item.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
                <span className="h-fit rounded-full bg-surface px-3 py-1 text-xs capitalize">
                  {item.status}
                </span>
              </button>
            ))}
          </div>
          {!loading && !requests.length && <p>No requests match this filter.</p>}
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
            <Field
              label="Indicative adult price (INR)"
              hint="Leave blank for quotation required. Children and extras are quoted separately."
            >
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={pkg.price_per_adult ?? ""}
                onChange={(e) =>
                  setPkg({
                    ...pkg,
                    price_per_adult: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
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
        title={dep && "id" in dep ? "Edit departure" : "New departure"}
        onClose={close}
        footer={
          <Button full disabled={busy} onClick={() => void save("departure")}>
            {busy ? "Saving…" : "Save departure"}
          </Button>
        }
      >
        {dep && (
          <div className="space-y-4">
            <Field label="Package">
              <Select
                value={dep.package_id}
                onChange={(e) => setDep({ ...dep, package_id: e.target.value })}
              >
                {packages.map((p) => (
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
              <Field key={key} label={key.replaceAll("_", " ")}>
                <TextInput
                  type="date"
                  value={dep[key]}
                  onChange={(e) => setDep({ ...dep, [key]: e.target.value })}
                />
              </Field>
            ))}
            <Field
              label="Maximum group size"
              hint="Optional. This is not a live inventory of remaining seats."
            >
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
              label="Offer this departure"
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
          <Button full disabled={busy} onClick={() => void save("request")}>
            {busy ? "Saving…" : "Update request"}
          </Button>
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
                Senior travellers: {request.preferences.seniors ?? 0} (included in adults) ? Pace:{" "}
                {request.preferences.pace || "balanced"}
                <br />
                Room: {request.preferences.room} · Stay: {request.preferences.stay}
              </p>
              <p>
                {request.preferences.assistance
                  .map((id) => assistanceOptions.find((o) => o.id === id)?.label || id)
                  .join(", ") || "No special assistance requested"}
              </p>
              <p className="whitespace-pre-wrap">{request.notes || "No additional notes"}</p>
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
            <Field
              label="Final quotation total (INR)"
              hint="Include all agreed travellers and extras. Share the written quotation with the customer separately."
            >
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
