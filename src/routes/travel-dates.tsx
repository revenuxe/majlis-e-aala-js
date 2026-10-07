"use client";
import { readTravelDateChoice, saveTravelDateChoice } from "@/lib/travel-date-choice";
import { TravelBatchSummary } from "@/components/TravelBatchSummary";
import { TravelChildAges } from "@/components/TravelChildAges";
import { TravelFlowProgress } from "@/components/TravelFlowProgress";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/Brand";
import { TravelStepFooter } from "@/components/TravelStepFooter";
import { useTravelTravellers } from "@/hooks/use-travel-travellers";
import { useTravelCatalog } from "@/hooks/use-travel-catalog";
import { travelDate } from "@/lib/travel-booking";
import { travelCategories, type TravelCategory } from "@/lib/travel";
const selectClass =
  "mt-2 h-12 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-gold";
export default function TravelDates() {
  const router = useRouter();
  const catalog = useTravelCatalog();
  const {
    adults,
    children,
    seniors,
    childAges,
    setChildAge,
    ready: travellersReady,
  } = useTravelTravellers();
  const [showChildAges, setShowChildAges] = useState(false);
  useEffect(() => {
    if (!showChildAges) return;
    const field = document.querySelector<HTMLSelectElement>("#missing-child-ages select");
    field?.focus({ preventScroll: true });
    field?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showChildAges]);
  const [category, setCategory] = useState<TravelCategory | "">("");
  const [packageId, setPackageId] = useState("");
  const [flightId, setFlightId] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPackageId(params.get("package") || "");
    setFlightId(params.get("flight") || "");
    const requested = params.get("category");
    if (travelCategories.some((item) => item.id === requested))
      setCategory(requested as TravelCategory);
    const cached = readTravelDateChoice(params.get("package") || "");
    if (params.get("datesSelected") !== "1" && cached)
      Object.entries(cached).forEach(([key, value]) => params.set(key, value));
    if (params.get("datesSelected") === "1") {
      setDatesEdited(true);
      setBatchId(params.get("departure") || "");
      setDepartureCity((params.get("city") || "Bengaluru").slice(0, 80));
      setTravelDateValue(params.get("date") || "");
      setTravelMonth(params.get("month") || "");
      setFlexibleDates(params.get("flexible") !== "false");
    }
    setReady(true);
  }, []);
  const [batchId, setBatchId] = useState("");
  const [datesEdited, setDatesEdited] = useState(false);
  const [departureCity, setDepartureCity] = useState("Bengaluru");
  const [travelDateValue, setTravelDateValue] = useState("");
  const [travelMonth, setTravelMonth] = useState("");
  const [flexibleDates, setFlexibleDates] = useState(true);
  const now = new Date();
  const minimumTravelDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const batches = catalog.departures
    .filter(
      (batch) =>
        batch.is_active &&
        batch.start_date >= minimumTravelDate &&
        (!batch.capacity || batch.capacity >= adults + children) &&
        batch.package_id === packageId &&
        catalog.packages.some((pkg) => pkg.id === packageId && pkg.category === category),
    )
    .sort((a, b) => a.start_date.localeCompare(b.start_date) || a.id.localeCompare(b.id));
  const nextBatch = batches[0];
  const selectedBatch = batches.find((batch) => batch.id === batchId);
  const resolvingDates =
    !ready ||
    !travellersReady ||
    catalog.loading ||
    (!datesEdited && !catalog.departuresError && !!nextBatch && batchId !== nextBatch.id);
  useEffect(() => {
    if (
      !ready ||
      !travellersReady ||
      datesEdited ||
      catalog.loading ||
      catalog.departuresError ||
      !nextBatch
    )
      return;
    setBatchId(nextBatch.id);
    setTravelDateValue(nextBatch.start_date);
    setDepartureCity(nextBatch.departure_city);
    setFlexibleDates(false);
  }, [ready, travellersReady, datesEdited, catalog.loading, catalog.departuresError, nextBatch]);

  useEffect(() => {
    if (resolvingDates || catalog.departuresError || !packageId) return;
    const choice = {
      departure: selectedBatch?.id || "",
      city: departureCity,
      date: travelDateValue,
      month: travelMonth,
      flexible: String(flexibleDates) as "true" | "false",
      datesSelected: "1" as const,
    };
    saveTravelDateChoice(packageId, choice);
    const url = new URL(window.location.href);
    Object.entries(choice).forEach(([key, value]) => url.searchParams.set(key, value));
    window.history.replaceState(window.history.state, "", url);
  }, [
    ready,
    resolvingDates,
    catalog.departuresError,
    packageId,
    catalog.loading,
    selectedBatch,
    departureCity,
    travelDateValue,
    travelMonth,
    flexibleDates,
  ]);

  function continueToPackages() {
    if (childAges.some((age) => age < 0)) {
      setShowChildAges(true);
      setError("");
      document
        .getElementById("missing-child-ages")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (batchId && (!selectedBatch || catalog.departuresError)) {
      setError("This batch is unavailable. Choose a batch or keep your preferred dates.");
      return;
    }
    if (!catalog.packages.some((pkg) => pkg.id === packageId && pkg.category === category)) {
      setError("Choose an available package before choosing its travel dates.");
      return;
    }
    if (departureCity.trim().length < 2) {
      setError("Enter your departure city.");
      return;
    }
    if (!flexibleDates && (!travelDateValue || travelDateValue < minimumTravelDate)) {
      setError("Choose today or a future travel date.");
      return;
    }
    if (flexibleDates && travelMonth && travelMonth < minimumTravelDate.slice(0, 7)) {
      setError("Choose a current or future month.");
      return;
    }
    const params = new URLSearchParams({
      childAges: childAges.join(","),
      travellers: String(adults),
      children: String(children),
      seniors: String(Math.min(seniors, adults)),
      departure: selectedBatch?.id || "",
      city: departureCity.trim(),
      date: travelDateValue,
      month: travelMonth,
      flexible: String(flexibleDates),
      datesSelected: "1",
      category,
      package: packageId,
      flight: flightId,
      step: "4",
    });
    router.push("/travel/plan?" + params);
  }
  return (
    <div className="min-h-screen bg-background pb-48">
      <header className="border-b border-border bg-card px-5 py-5">
        <Link href="/">
          <BrandLogo className="h-8" />
        </Link>
      </header>
      <main className="mx-auto max-w-xl px-5 py-5">
        <Link
          href={category ? "/travel/packages/" + category : "/travel/packages"}
          className="mb-5 flex min-h-16 w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold shadow-sm transition-colors hover:border-gold/50 hover:bg-champagne/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-champagne/60 text-gold">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex-1">Back to packages</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Link>
        <TravelFlowProgress step={3} />
        <p className="mt-3 text-sm font-semibold">
          {catalog.packages.find((pkg) => pkg.id === packageId)?.name || "Select a package first"}
        </p>
        <section
          className="mt-4 space-y-3 rounded-2xl border border-border bg-surface/40 p-4"
          aria-labelledby="catalogue-travel-dates"
        >
          <h2 id="catalogue-travel-dates" className="font-display text-[25px]">
            Choose your travel dates
          </h2>
          {resolvingDates ? (
            <div role="status" aria-live="polite" className="min-h-[230px] space-y-4 py-2">
              <p className="text-sm text-muted-foreground">Loading your travel dates…</p>
              <div aria-hidden="true" className="h-12 rounded-xl bg-border/50" />
              <div aria-hidden="true" className="h-28 rounded-xl bg-border/30" />
            </div>
          ) : (
            <>
              <label className="block text-sm font-semibold">
                Select next batch
                <select
                  className={selectClass}
                  value={selectedBatch?.id || ""}
                  disabled={catalog.loading || !!catalog.departuresError}
                  onChange={(e) => {
                    setDatesEdited(true);
                    const batch = batches.find((item) => item.id === e.target.value);
                    setBatchId(batch?.id || "");
                    if (batch) {
                      setTravelDateValue(batch.start_date);
                      setDepartureCity(batch.departure_city);
                      setFlexibleDates(false);
                    }
                  }}
                >
                  <option value="">Keep my preferred dates</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {travelDate(batch.start_date)} · {batch.departure_city} ·{" "}
                      {catalog.packages.find((pkg) => pkg.id === batch.package_id)?.name}
                    </option>
                  ))}
                </select>
              </label>
              {!catalog.loading && !catalog.departuresError && batches.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No upcoming batches for this package and group size. Share your preferred dates
                  below.
                </p>
              )}
              {catalog.departuresError && (
                <p role="alert" className="text-xs">
                  Could not load batches.{" "}
                  <button
                    type="button"
                    className="min-h-11 underline"
                    onClick={() => void catalog.reload()}
                  >
                    Retry
                  </button>
                </p>
              )}
              {selectedBatch ? (
                <div className="space-y-3">
                  <TravelBatchSummary batch={selectedBatch} />
                  <button
                    type="button"
                    className="min-h-11 w-full rounded-xl border border-gold/40 bg-card px-4 py-2 text-sm font-semibold"
                    onClick={() => {
                      setBatchId("");
                      setDatesEdited(true);
                      setError("");
                    }}
                  >
                    Choose preferred dates
                  </button>
                </div>
              ) : (
                <div id="preferred-date-fields" className="space-y-3">
                  <p className="text-sm font-semibold">Confirm your preferred dates</p>
                  {selectedBatch && (
                    <p className="text-xs text-muted-foreground">
                      Your batch date and city are filled in. Editing them requests a different
                      arrangement.
                    </p>
                  )}
                  <label className="block text-sm font-semibold">
                    Departure city
                    <input
                      className={selectClass}
                      maxLength={80}
                      value={departureCity}
                      onChange={(e) => {
                        setDepartureCity(e.target.value);
                        setBatchId("");
                        setDatesEdited(true);
                      }}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[true, false].map((flexible) => (
                      <button
                        key={String(flexible)}
                        type="button"
                        aria-pressed={flexibleDates === flexible}
                        className={`min-h-12 rounded-xl border px-3 py-2 text-sm font-semibold ${flexibleDates === flexible ? "border-primary bg-champagne/50" : "border-border bg-card"}`}
                        onClick={() => {
                          setFlexibleDates(flexible);
                          setBatchId("");
                          setDatesEdited(true);
                        }}
                      >
                        {flexible ? "My dates are flexible" : "I have a date in mind"}
                      </button>
                    ))}
                  </div>
                  <label className="block text-sm font-semibold">
                    {flexibleDates ? "Preferred month (optional)" : "Travel date"}
                    <input
                      className={selectClass}
                      type={flexibleDates ? "month" : "date"}
                      min={flexibleDates ? minimumTravelDate.slice(0, 7) : minimumTravelDate}
                      value={flexibleDates ? travelMonth : travelDateValue}
                      onChange={(e) => {
                        if (flexibleDates) setTravelMonth(e.target.value);
                        else setTravelDateValue(e.target.value);
                        setBatchId("");
                        setDatesEdited(true);
                      }}
                    />
                  </label>
                </div>
              )}
            </>
          )}
        </section>
        {showChildAges && children > 0 && (
          <section
            id="missing-child-ages"
            aria-labelledby="child-ages-title"
            className="mt-4 rounded-xl border border-border bg-card p-4"
          >
            <h2 id="child-ages-title" className="text-base font-semibold">
              Children’s ages
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add their ages at travel to help us quote the right fares.
            </p>
            <TravelChildAges ages={childAges} onChange={setChildAge} />
          </section>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </main>
      <TravelStepFooter travellers={adults + children}>
        <button
          type="button"
          disabled={resolvingDates}
          onClick={continueToPackages}
          className="min-h-14 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground"
        >
          {resolvingDates
            ? "Loading travel dates…"
            : selectedBatch
              ? "Continue to preferences"
              : "Confirm travel dates"}
        </button>
      </TravelStepFooter>
    </div>
  );
}
