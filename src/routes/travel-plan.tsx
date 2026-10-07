"use client";
import { TravelBatchSummary } from "@/components/TravelBatchSummary";
import { TravelFlowProgress } from "@/components/TravelFlowProgress";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, MapPin, Plane, Users } from "lucide-react";
import { z } from "zod";
import type { User } from "@supabase/supabase-js";
import { BrandMark } from "@/components/Brand";
import { TravelCountBanner } from "@/components/TravelCountBanner";
import { TravelPrice } from "@/components/TravelPrice";
import { TravelCatalogueControls } from "@/components/TravelCatalogueControls";
import { TravelPackageChoice } from "@/components/TravelPackageChoice";
import { TravelPackageGroups } from "@/components/TravelPackageGroups";
import { TravelJourneyCards } from "@/components/TravelJourneyCards";
import { TravelSavedPackagesLink } from "@/components/TravelSavedPackages";
import { BookingAuth } from "@/components/BookingAuth";
import { saveTravelProfile, travelProfileFromUser } from "@/lib/travel-profile";
import { Button, QuantitySelector, cx } from "@/components/ui-kit";
import { useTravelCatalog } from "@/hooks/use-travel-catalog";
import {
  readTravelTravellers,
  saveTravelTravellers,
  syncTravellerUrl,
} from "@/lib/travel-travellers";
import { supabase } from "@/integrations/supabase/client";
import { travelCategories, travelContact, travelWhatsApp } from "@/lib/travel";
import {
  packageAdultPrice,
  filterTravelPackages,
  initialCatalogueFilter,
  assistanceOptions,
  initialTravelDraft,
  type TravelPackage,
  travelDate,
  travelMoney,
  type TravelDraft,
} from "@/lib/travel-booking";

const AUTH_STEP = 5;
const REVIEW_STEP = 6;
const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-border bg-card px-4 text-[15px] outline-none focus:border-gold focus:ring-2 focus:ring-gold/20";
const savedDraftSchema = z.object({
  batchSelectionMade: z.boolean().default(false),
  category: z.enum(["", "umrah", "hajj", "international", "domestic"]),
  departureCity: z.string().max(80),
  datesFlexible: z.boolean(),
  date: z.string().max(10),
  month: z.string().max(7),
  adults: z.number().int().min(1).max(100),
  children: z.number().int().min(0).max(20),
  childAges: z.array(z.number().int().min(-1).max(17)).max(20),
  seniors: z.number().int().min(0).max(100).default(0),
  pace: z.enum(["balanced", "relaxed"]).default("balanced"),
  packageId: z.string().nullable(),
  flightOptionId: z.string().max(100).nullable().default(null),
  departureId: z.string().nullable(),
  room: z.enum(["package", "shared", "twin", "private"]),
  stay: z.enum(["package", "standard", "comfort", "premium"]),
  assistance: z.array(z.enum(["mobility", "nearby-hotel", "guidance", "child-seat"])),
});
function Field({ label, children, note }: { label: string; children: ReactNode; note?: string }) {
  return (
    <label className="block text-[14px] font-semibold">
      {label}
      {children}
      {note && (
        <span className="mt-2 block text-[12px] font-normal leading-relaxed text-muted-foreground">
          {note}
        </span>
      )}
    </label>
  );
}
function Choice({
  selected,
  onClick,
  title,
  note,
  compact = false,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  note?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx(
        "press flex min-h-20 w-full min-w-0 rounded-[18px] border-2 text-left",
        compact
          ? "flex-col-reverse items-start justify-end gap-2 p-3 sm:p-4"
          : "items-center justify-between gap-4 p-4",
        selected ? "border-primary bg-champagne/30" : "border-border bg-card hover:border-gold",
      )}
    >
      <span className="min-w-0">
        <span
          className={cx(
            "block font-semibold",
            compact ? "text-[13px] leading-snug sm:text-[15px]" : "text-[15px]",
          )}
        >
          {title}
        </span>
        {note && (
          <span
            className={cx(
              "mt-1 block leading-relaxed text-muted-foreground",
              compact ? "text-[11px] sm:text-[13px]" : "text-[13px]",
            )}
          >
            {note}
          </span>
        )}
      </span>
      <span
        className={cx(
          "grid h-6 w-6 shrink-0 place-items-center rounded-full border",
          compact && "self-end",
          selected ? "border-primary bg-primary text-white" : "border-border",
        )}
      >
        {selected && <Check size={14} />}
      </span>
    </button>
  );
}

export default function TravelPlan({ initialPackages }: { initialPackages?: TravelPackage[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<TravelDraft>(initialTravelDraft);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [reference, setReference] = useState<string | null>(null);
  const [requestToken, setRequestToken] = useState("");
  const [customer, setCustomer] = useState<User | null>(null);

  const applySavedProfile = (user: User) => {
    const saved = travelProfileFromUser(user);
    if (saved) {
      setDraft((d) => ({
        ...d,
        name: d.name || saved.name || "",
        phone: d.phone || saved.phone || "",
        email: d.email || saved.email || user.email || "",
      }));
    } else if (user.email) {
      setDraft((d) => ({ ...d, email: d.email || user.email || "" }));
    }
  };
  const catalog = useTravelCatalog(initialPackages);
  const [packageFilter, setPackageFilter] = useState(initialCatalogueFilter);
  const [packageLimit, setPackageLimit] = useState(6);
  const [changingPackage, setChangingPackage] = useState(false);
  const chosenPackage = catalog.packages.find((p) => p.id === draft.packageId);
  const chosenDeparture = catalog.departures.find((d) => d.id === draft.departureId);
  const matchingPackages = catalog.packages.filter((p) => p.category === draft.category);
  const filteredPackages = filterTravelPackages(matchingPackages, packageFilter);
  const today = new Date();
  const minimumDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const matchingDepartures = catalog.departures
    .filter(
      (d) =>
        d.is_active &&
        d.start_date >= minimumDate &&
        (draft.packageId
          ? d.package_id === draft.packageId
          : catalog.packages.some(
              (pkg) => pkg.id === d.package_id && pkg.category === draft.category,
            )) &&
        (!d.capacity || d.capacity >= draft.adults + draft.children),
    )
    .sort((a, b) => a.start_date.localeCompare(b.start_date) || a.id.localeCompare(b.id));
  const nextBatch = matchingDepartures[0];
  useEffect(() => {
    if (
      !ready ||
      step !== 3 ||
      catalog.loading ||
      catalog.departuresError ||
      !nextBatch ||
      draft.departureId ||
      draft.batchSelectionMade
    )
      return;
    setDraft((current) => {
      if (
        current.departureId ||
        current.batchSelectionMade ||
        (current.packageId != null && current.packageId !== nextBatch.package_id)
      )
        return current;
      return {
        ...current,
        packageId: current.packageId || nextBatch.package_id,
        departureId: nextBatch.id,
        date: nextBatch.start_date,
        departureCity: nextBatch.departure_city,
        datesFlexible: false,
        batchSelectionMade: true,
      };
    });
  }, [
    ready,
    step,
    catalog.loading,
    catalog.departuresError,
    nextBatch,
    draft.departureId,
    draft.batchSelectionMade,
  ]);
  const chosenFlight = chosenPackage?.flight_options?.find(
    (option) => option.id === draft.flightOptionId,
  );
  const adultPrice = chosenPackage
    ? chosenPackage.pricing_mode === "on_request"
      ? null
      : chosenFlight
        ? chosenFlight.price_per_adult
        : packageAdultPrice(chosenPackage)
    : null;
  const estimate = adultPrice == null ? null : adultPrice * draft.adults;
  const categoryName =
    travelCategories.find((c) => c.id === draft.category)?.name || "Your journey";
  function update(patch: Partial<TravelDraft>) {
    if (patch.category && patch.category !== draft.category) {
      setPackageFilter(initialCatalogueFilter);
      setPackageLimit(6);
    }
    setDraft((d) => {
      const next = { ...d, ...patch };
      if (patch.packageId !== undefined && patch.packageId !== d.packageId) {
        next.batchSelectionMade = patch.batchSelectionMade ?? false;
        next.flightOptionId = patch.flightOptionId ?? null;
        next.room = "package";
        next.stay = "package";
        if (patch.departureId === undefined) next.departureId = null;
      } else if (patch.departureId !== undefined) {
        next.batchSelectionMade = true;
      }
      return { ...next, seniors: Math.min(next.seniors, next.adults) };
    });
    setError(null);
  }
  useEffect(() => {
    let restored: TravelDraft = { ...initialTravelDraft, ...readTravelTravellers() };
    let hasSavedDraft = false;
    let savedFlowVersion = 4;
    try {
      const saved = JSON.parse(window.localStorage.getItem("ma-travel-draft-v1") || "null");
      const parsed = savedDraftSchema.safeParse(saved?.draft);
      if (parsed.success) {
        savedFlowVersion = saved.flowVersion;
        hasSavedDraft = true;
        restored = { ...restored, ...parsed.data };
        const storedStep = Number(saved.step);
        const oldStep = Number.isInteger(storedStep)
          ? Math.max(0, Math.min(REVIEW_STEP, storedStep))
          : 0;
        setStep(
          saved.flowVersion === 3
            ? [0, 3, 1, 2, 4, 5, 6][oldStep]!
            : saved.flowVersion === 2 || saved.flowVersion === 4
              ? oldStep
              : [1, 3, 0, 2, 4, 5, 6][oldStep]!,
        );
      }
    } catch {
      /* Draft storage is optional. */
    }
    try {
      const temporary = JSON.parse(sessionStorage.getItem("ma-travel-notes-session") || "null");
      if (
        temporary &&
        Date.now() - temporary.savedAt < 3600000 &&
        typeof temporary.notes === "string"
      )
        restored.notes = temporary.notes.slice(0, 2000);
    } catch {
      /* Optional, short-lived notes for an auth redirect. */
    }
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category");
    const requestedPackage = params.get("package");
    const newSelection =
      (travelCategories.some((c) => c.id === requestedCategory) &&
        requestedCategory !== restored.category) ||
      (!!requestedPackage &&
        /^[0-9a-f-]{36}$/i.test(requestedPackage) &&
        requestedPackage !== restored.packageId);
    if (
      travelCategories.some((c) => c.id === requestedCategory) &&
      (!hasSavedDraft || newSelection)
    ) {
      restored.category = requestedCategory as TravelDraft["category"];
      restored.packageId = null;
      restored.departureId = null;
      setStep(0);
    }
    if (
      requestedPackage &&
      /^[0-9a-f-]{36}$/i.test(requestedPackage) &&
      (!hasSavedDraft || newSelection)
    ) {
      restored.packageId = requestedPackage;
      restored.batchSelectionMade = false;
      restored.flightOptionId = params.get("flight")?.slice(0, 100) || null;
      restored.departureId = null;
      setStep(0);
    }
    const requestedTravellers = Number(params.get("travellers"));
    if (
      (!hasSavedDraft || newSelection) &&
      requestedTravellers >= 1 &&
      requestedTravellers <= 100 &&
      Number.isInteger(requestedTravellers)
    ) {
      restored.adults = requestedTravellers;
      restored.children = 0;
    }
    const requestedChildren = Number(params.get("children"));
    if (
      (!hasSavedDraft || newSelection) &&
      params.has("children") &&
      Number.isInteger(requestedChildren) &&
      requestedChildren >= 0 &&
      requestedChildren <= 20 &&
      requestedChildren + restored.adults <= 100
    ) {
      restored.children = requestedChildren;
      restored.childAges = Array.from(
        { length: requestedChildren },
        (_, index) => restored.childAges[index] ?? -1,
      );
    }
    restored.childAges = Array.from(
      { length: restored.children },
      (_, index) => restored.childAges[index] ?? -1,
    );
    const requestedSeniors = Number(params.get("seniors"));
    if (
      (!hasSavedDraft || newSelection) &&
      params.has("seniors") &&
      Number.isInteger(requestedSeniors) &&
      requestedSeniors >= 0 &&
      requestedSeniors <= restored.adults
    )
      restored.seniors = requestedSeniors;
    const requestedStep = Number(params.get("step"));
    if (
      hasSavedDraft &&
      !newSelection &&
      params.has("step") &&
      Number.isInteger(requestedStep) &&
      requestedStep >= 0 &&
      requestedStep <= REVIEW_STEP
    )
      setStep(savedFlowVersion === 3 ? [0, 3, 1, 2, 4, 5, 6][requestedStep]! : requestedStep);
    if (params.has("childAges") && (!hasSavedDraft || newSelection)) {
      const ages = (params.get("childAges") || "").split(",").map(Number);
      restored.childAges = Array.from({ length: restored.children }, (_, i) =>
        Number.isInteger(ages[i]) && ages[i]! >= 0 && ages[i]! <= 17 ? ages[i]! : -1,
      );
    }
    restored.seniors = Math.min(restored.seniors, restored.adults);
    if (params.get("datesSelected") === "1") {
      const requestedDate = params.get("date") || "";
      const requestedMonth = params.get("month") || "";
      if (!requestedDate || /^\d{4}-\d{2}-\d{2}$/.test(requestedDate))
        restored.date = requestedDate;
      if (!requestedMonth || /^\d{4}-\d{2}$/.test(requestedMonth)) restored.month = requestedMonth;
      restored.departureCity = (params.get("city") || "Bengaluru").slice(0, 80);
      restored.datesFlexible = params.get("flexible") !== "false";
      restored.departureId = params.get("departure") || null;
      restored.batchSelectionMade = true;
      if (restored.packageId && params.get("step") === "4") setStep(4);
    }
    setDraft(restored);
    let token = "";
    try {
      token = window.sessionStorage.getItem("ma-travel-request-token") || "";
    } catch {
      /* Session storage is optional. */
    }
    if (!/^[0-9a-f-]{36}$/i.test(token)) token = crypto.randomUUID();
    setRequestToken(token);
    try {
      window.sessionStorage.setItem("ma-travel-request-token", token);
    } catch {
      /* Session storage is optional. */
    }
    setReady(true);
  }, []);
  // Run after restoration commits, including React's development effect replay.
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams(window.location.search);
    if (["category", "package", "datesSelected"].some((key) => params.has(key))) {
      [
        "category",
        "package",
        "flight",
        "datesSelected",
        "departure",
        "city",
        "date",
        "month",
        "flexible",
      ].forEach((key) => params.delete(key));
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${params.size ? `?${params}` : ""}`,
      );
    }
  }, [ready]);

  // Auth: check existing session and listen for changes
  useEffect(() => {
    if (!ready) return;
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) {
        setCustomer(data.user);
        applySavedProfile(data.user);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setCustomer(session?.user ?? null);
      if (_event === "SIGNED_OUT")
        setDraft((d) => ({ ...d, name: "", phone: "", email: "", consent: false }));
      if (session?.user) applySavedProfile(session.user);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [ready]);

  // Auto-skip auth step if already logged in
  useEffect(() => {
    if (customer && step === AUTH_STEP) setStep(REVIEW_STEP);
  }, [customer, step]);

  useEffect(() => {
    if (!ready || reference) return;
    saveTravelTravellers({
      adults: draft.adults,
      children: draft.children,
      seniors: draft.seniors,
      childAges: draft.childAges,
    });
    syncTravellerUrl({
      adults: draft.adults,
      children: draft.children,
      seniors: draft.seniors,
      childAges: draft.childAges,
    });
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("step", String(step));
    window.history.replaceState(
      window.history.state,
      "",
      `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
    );
    try {
      const {
        name: _name,
        phone: _phone,
        email: _email,
        consent: _consent,
        notes: _notes,
        ...choices
      } = draft;
      window.localStorage.setItem(
        "ma-travel-draft-v1",
        JSON.stringify({ draft: choices, step, flowVersion: 4 }),
      );
      window.sessionStorage.setItem(
        "ma-travel-notes-session",
        JSON.stringify({ notes: draft.notes, savedAt: Date.now() }),
      );
    } catch {
      /* Continue even when storage is unavailable. */
    }
  }, [draft, step, ready, reference]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);

  function stepError(index: number): string | null {
    if (index === 1 && !draft.category) return "Choose the kind of journey you’re planning.";
    if (index === 3) {
      if (draft.departureId && (catalog.loading || catalog.departuresError))
        return "Please refresh upcoming batches before continuing.";
      if (
        draft.departureId &&
        (!chosenDeparture || !matchingDepartures.some((batch) => batch.id === draft.departureId))
      )
        return "This batch is no longer available for your package and group size. Choose another batch or preferred dates.";
      if (draft.departureCity.trim().length < 2)
        return "Tell us which city you’d like to depart from.";
      if (!draft.datesFlexible && (!draft.date || draft.date < minimumDate))
        return "Choose a future travel date, or select flexible dates.";
      if (draft.datesFlexible && draft.month && draft.month < minimumDate.slice(0, 7))
        return "Choose a current or future travel month.";
    }
    if (
      index === 0 &&
      (draft.adults < 1 ||
        draft.seniors < 0 ||
        draft.seniors > draft.adults ||
        draft.adults + draft.children > 100 ||
        draft.childAges.length !== draft.children ||
        draft.childAges.some((age) => age < 0 || age > 17))
    )
      return "Check your group size and tell us each child’s age.";
    if (index === 2) {
      if (catalog.loading) return "We’re loading the latest packages. Please wait a moment.";
      if (draft.packageId && catalog.error)
        return "Please refresh the packages before continuing with your selection.";
      if (draft.departureId && catalog.departuresError)
        return "Please refresh departure dates before continuing with your selection.";
      if (draft.packageId && (!chosenPackage || chosenPackage.category !== draft.category))
        return "This package is no longer available. Choose another or a custom journey.";
      if (
        draft.departureId &&
        (!chosenDeparture ||
          chosenDeparture.package_id !== draft.packageId ||
          (chosenDeparture.capacity && chosenDeparture.capacity < draft.adults + draft.children))
      )
        return "This departure is no longer suitable. Please choose another date.";
    }
    if (index === REVIEW_STEP) {
      if (draft.name.trim().length < 2) return "Tell us your name so our team can help you.";
      if (
        !/^\+?[0-9\s()-]{8,24}$/.test(draft.phone) ||
        draft.phone.replace(/\D/g, "").length < 8 ||
        draft.phone.replace(/\D/g, "").length > 15
      )
        return "Enter a valid mobile or WhatsApp number, including the country code.";
      if (draft.email && !z.string().email().safeParse(draft.email).success)
        return "Check your email address, or leave it blank.";
      if (!draft.consent) return "Please allow our team to contact you about this request.";
    }
    return null;
  }
  function showError(message: string) {
    setError(message);
    window.setTimeout(() => document.getElementById("travel-step-error")?.focus(), 0);
  }
  function back() {
    if (busy) return;
    if (step === 0) {
      router.push("/");
      return;
    }
    setStep(step === REVIEW_STEP && customer ? AUTH_STEP - 1 : step - 1);
    setError(null);
    window.scrollTo(0, 0);
  }
  async function next() {
    if (busy || submitting.current) return;
    const problem = stepError(step);
    if (problem) {
      showError(problem);
      return;
    }
    if (step === 0 && draft.category) {
      setStep(2);
      return;
    }
    // Advancing from preferences step: skip auth if already logged in
    if (step === 4 && customer) {
      setStep(REVIEW_STEP);
      setError(null);
      return;
    }
    if (step < REVIEW_STEP) {
      setStep(step + 1);
      setError(null);
      return;
    }
    // About to submit: re-validate all prior steps
    for (let index = 0; index < AUTH_STEP; index++) {
      const issue = stepError(index);
      if (issue) {
        setStep(index);
        showError(issue);
        return;
      }
    }
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      const { data, error: failure } = await supabase.rpc("submit_travel_booking", {
        p_booking: {
          request_token: requestToken,
          contact_consent: draft.consent,
          customer_name: draft.name.trim(),
          phone: draft.phone,
          email: draft.email.trim(),
          category: draft.category,
          departure_city: draft.departureCity.trim(),
          preferred_date: draft.datesFlexible ? null : draft.date,
          preferred_month: draft.datesFlexible ? draft.month : null,
          dates_flexible: draft.datesFlexible,
          adults: draft.adults,
          children: draft.children,
          child_ages: draft.childAges,
          flight_option_id: chosenFlight?.id ?? null,
          package_id: draft.packageId,
          departure_id: draft.departureId,
          preferences: {
            room: draft.room,
            stay: draft.stay,
            assistance: draft.assistance,
            seniors: draft.seniors,
            pace: draft.pace,
          },
          notes: draft.notes.trim(),
        },
      });
      if (failure || !data?.[0]?.booking_reference)
        throw failure || new Error("No reference returned");
      setReference(data[0].booking_reference);
      try {
        window.localStorage.removeItem("ma-travel-draft-v1");
        window.sessionStorage.removeItem("ma-travel-request-token");
        window.sessionStorage.removeItem("ma-travel-notes-session");
      } catch {
        /* Storage is optional. */
      }
      // A saved request remains successful even if profile synchronisation fails.
      if (customer)
        void saveTravelProfile(customer, {
          name: draft.name.trim(),
          phone: draft.phone,
          email: draft.email.trim(),
        }).catch(() => undefined);
    } catch {
      showError(
        "We couldn’t save your request just now. Your choices are still here. Please try again or call our team.",
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  if (reference)
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 py-12 text-center">
        <CheckCircle2 size={56} className="text-halal" />
        <p className="eyebrow mt-6">Your request is safely received</p>
        <h1 className="mt-3 font-display text-[42px]">Your journey starts here.</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          Our team will contact you to discuss your itinerary, availability and quotation. Your
          booking is confirmed only after the final arrangements are agreed.
        </p>
        <div className="my-6 w-full rounded-[20px] border border-gold/40 bg-card p-5">
          <p className="text-[12px] text-muted-foreground">Keep your request reference</p>
          <p className="mt-2 break-all text-[20px] font-semibold">{reference}</p>
        </div>
        {customer && (
          <Link
            href={`/travel/bookings/${encodeURIComponent(reference)}`}
            className="mb-5 text-sm font-semibold underline"
          >
            View your travel requests in your account
          </Link>
        )}
        <a
          href={travelWhatsApp(
            `Assalamu Alaikum! I submitted a travel request. My reference is ${reference}.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center rounded-xl bg-primary px-6 text-[14px] font-semibold text-white"
        >
          Discuss on WhatsApp
        </a>
        <Link href="/" className="mt-4 min-h-11 py-3 text-[14px] underline">
          Back to travel homepage
        </Link>
      </main>
    );

  return (
    <div className="min-h-screen pb-44 sm:pb-36">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-[1000px] items-center justify-between gap-3 px-5">
          <button
            disabled={busy}
            onClick={back}
            className="flex min-h-11 items-center gap-2 text-[14px] font-semibold"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <Link href="/" aria-label="Travel homepage">
            <BrandMark size={42} />
          </Link>
          <div className="flex min-w-0 max-w-[45%] items-center gap-2">
            <span
              className="hidden truncate text-[12px] text-muted-foreground sm:block"
              title={customer?.email}
            >
              {customer ? customer.email : "Sign-in optional"}
            </span>
            <TravelSavedPackagesLink />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1000px] px-5 py-4 sm:py-6">
        <TravelFlowProgress step={step} />
        <p className="eyebrow mt-5">{step === 1 ? "A journey that’s yours" : categoryName}</p>
        <h1
          className={cx(
            "mt-2 font-display leading-tight",
            step === 2 && chosenPackage && !changingPackage
              ? "whitespace-nowrap text-[clamp(20px,5.5vw,32px)] sm:text-[36px]"
              : "text-[36px] sm:text-[44px]",
          )}
        >
          {
            [
              "Who is joining your journey?",
              "Where would you like to go?",
              chosenPackage && !changingPackage ? "Your selected package." : "Choose your package.",
              "Choose your travel dates",
              "Any special requests?",
              "Keep your journeys together.",
              "One last look. Then let us begin.",
            ][step]
          }
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          {
            [
              "Include adults, children and senior travellers. Your count sets the package estimates.",
              "Choose your journey, then compare packages for your group.",
              "Starting adult estimates use your traveller count. Children and extras are quoted separately.",
              "Choose a batch or share your preferred dates.",
              "Keep your package arrangements, or tell us what would help. This step is optional.",
              "Sign in once to keep your journeys together, or continue as a guest.",
              "Review your choices and tell us how to reach you. No payment required.",
            ][step]
          }
        </p>
        <div className="mt-4 space-y-4">
          {step === 1 && (
            <>
              <TravelJourneyCards
                {...(draft.category ? { selected: draft.category } : {})}
                onSelect={(category) => update({ category, packageId: null, departureId: null })}
              />
              <p className="rounded-xl bg-surface p-4 text-[13px] leading-relaxed text-muted-foreground">
                For Hajj, our team will discuss the applicable official application route and
                current authorisation requirements.
              </p>
            </>
          )}
          {step === 3 && (
            <>
              {draft.category && (
                <Field label="Select next batch">
                  <select
                    className={inputClass}
                    value={chosenDeparture?.id || ""}
                    disabled={catalog.loading || !!catalog.departuresError}
                    onChange={(e) => {
                      const batch = matchingDepartures.find((item) => item.id === e.target.value);
                      update(
                        batch
                          ? {
                              packageId: batch.package_id,
                              departureId: batch.id,
                              batchSelectionMade: true,
                              date: batch.start_date,
                              departureCity: batch.departure_city,
                              datesFlexible: false,
                            }
                          : { departureId: null },
                      );
                    }}
                  >
                    <option value="">Keep my preferred dates</option>
                    {matchingDepartures.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {travelDate(batch.start_date)}
                        {batch.end_date ? ` – ${travelDate(batch.end_date)}` : ""} ·{" "}
                        {batch.departure_city} ·{" "}
                        {catalog.packages.find((pkg) => pkg.id === batch.package_id)?.name}
                      </option>
                    ))}
                  </select>
                  {!catalog.loading && !catalog.departuresError && !matchingDepartures.length && (
                    <p className="mt-2 text-xs font-normal text-muted-foreground">
                      No upcoming batches for this package and group size. Share your preferred
                      dates instead.
                    </p>
                  )}
                  {catalog.departuresError && (
                    <div role="alert" className="mt-2 text-sm font-normal">
                      <p>We couldn’t load upcoming batches.</p>
                      <button
                        type="button"
                        className="min-h-11 underline"
                        onClick={() => void catalog.reload()}
                      >
                        Retry batches
                      </button>
                    </div>
                  )}
                  {chosenDeparture?.notes && (
                    <p className="mt-2 text-xs font-normal text-muted-foreground">
                      {chosenDeparture.notes}
                    </p>
                  )}
                </Field>
              )}
              {chosenDeparture ? (
                <TravelBatchSummary batch={chosenDeparture} />
              ) : (
                <>
                  <Field label="Departure city">
                    <input
                      autoComplete="address-level2"
                      maxLength={80}
                      value={draft.departureCity}
                      onChange={(e) => update({ departureCity: e.target.value, departureId: null })}
                      placeholder="e.g. Bengaluru"
                      className={inputClass}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Choice
                      compact
                      selected={draft.datesFlexible}
                      onClick={() => update({ datesFlexible: true, departureId: null })}
                      title="My dates are flexible"
                      note="Choose a month, or decide with the team."
                    />
                    <Choice
                      compact
                      selected={!draft.datesFlexible}
                      onClick={() => update({ datesFlexible: false, departureId: null })}
                      title="I have a date in mind"
                      note="We’ll check the options for your preferred date."
                    />
                  </div>
                  {draft.datesFlexible ? (
                    <Field
                      label="Preferred month (optional)"
                      note="Leave blank if you’d like help choosing."
                    >
                      <input
                        type="month"
                        min={minimumDate.slice(0, 7)}
                        value={draft.month}
                        onChange={(e) => update({ month: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                  ) : (
                    <Field label="Preferred travel date">
                      <input
                        type="date"
                        min={minimumDate}
                        value={draft.date}
                        onChange={(e) => update({ date: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                  )}{" "}
                </>
              )}
            </>
          )}
          {step === 0 && (
            <>
              <div className="rounded-[20px] border border-border bg-card p-5">
                <p className="mb-3 text-[15px] font-semibold">
                  Adults{" "}
                  <span className="font-normal text-muted-foreground">18 years and above</span>
                </p>
                <QuantitySelector
                  size="lg"
                  min={1}
                  value={draft.adults}
                  suffix="Adults"
                  onChange={(value) =>
                    update({
                      adults: Math.max(1, Math.min(100 - draft.children, value)),
                      departureId: null,
                    })
                  }
                />
              </div>
              <div className="rounded-[20px] border border-border bg-card p-5">
                <p className="mb-3 text-[15px] font-semibold">
                  Children <span className="font-normal text-muted-foreground">Under 18 years</span>
                </p>
                <QuantitySelector
                  size="lg"
                  min={0}
                  value={draft.children}
                  suffix="Children"
                  onChange={(value) => {
                    const children = Math.max(0, Math.min(20, 100 - draft.adults, value));
                    update({
                      children,
                      childAges: Array.from(
                        { length: children },
                        (_, index) => draft.childAges[index] ?? -1,
                      ),
                      departureId: null,
                    });
                  }}
                />
              </div>
              {draft.children > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {draft.childAges.map((age, index) => (
                    <Field key={index} label={`Child ${index + 1} — age at travel`}>
                      <select
                        value={age < 0 ? "" : age}
                        onChange={(e) =>
                          update({
                            childAges: draft.childAges.map((value, i) =>
                              i === index ? Number(e.target.value) : value,
                            ),
                          })
                        }
                        className={inputClass}
                      >
                        <option value="" disabled>
                          Choose age
                        </option>
                        {Array.from({ length: 18 }, (_, i) => (
                          <option key={i} value={i}>
                            {i === 0 ? "Under 1 year" : `${i} ${i === 1 ? "year" : "years"}`}
                          </option>
                        ))}
                      </select>
                    </Field>
                  ))}
                </div>
              )}
              <div className="rounded-[20px] border border-gold/40 bg-champagne/20 p-5">
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] font-semibold">
                  <input
                    type="checkbox"
                    checked={draft.seniors > 0}
                    onChange={(e) => update({ seniors: e.target.checked ? 1 : 0 })}
                    className="h-5 w-5 accent-black"
                  />
                  Travelling with senior citizens (60+)
                </label>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Included in your adult count. Help us plan comfortable transfers, hotel access and
                  a suitable pace.
                </p>
                {draft.seniors > 0 && (
                  <div className="mt-4">
                    <QuantitySelector
                      size="lg"
                      min={1}
                      value={draft.seniors}
                      suffix="Senior travellers"
                      onChange={(value) =>
                        update({ seniors: Math.max(1, Math.min(draft.adults, value)) })
                      }
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Up to {draft.adults} adults in your group. Assistance can be selected in
                      preferences.
                    </p>
                  </div>
                )}
              </div>
              <p className="text-[13px] text-muted-foreground">
                Planning for more than 100 people?{" "}
                <a className="underline" href={`tel:+${travelContact.phone}`}>
                  Call our team
                </a>
                .
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <TravelCountBanner
                compact
                seniors={draft.seniors}
                category={draft.category}
                adults={draft.adults}
                children={draft.children}
                onBack={back}
                onChange={() => setStep(0)}
              />
              {catalog.loading && (
                <div role="status" className="h-24 animate-pulse rounded-xl bg-surface">
                  <span className="sr-only">Loading packages</span>
                </div>
              )}
              {catalog.error && (
                <div role="alert" className="rounded-xl border border-border p-4">
                  <p className="text-[14px]">{catalog.error}</p>
                  <Button className="mt-3" variant="outline" onClick={() => void catalog.reload()}>
                    Retry
                  </Button>
                </div>
              )}
              {catalog.departuresError && (
                <div role="status" className="rounded-xl border border-border bg-card p-4 text-sm">
                  <p>{catalog.departuresError}</p>
                  <Button className="mt-3" variant="outline" onClick={() => void catalog.reload()}>
                    Retry departure dates
                  </Button>
                </div>
              )}
              {chosenPackage && !changingPackage ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Your package is selected. Continue to choose your travel dates.
                  </p>
                  <TravelPackageChoice
                    pkg={chosenPackage}
                    flightOptionId={draft.flightOptionId}
                    onFlightChange={(id) => update({ flightOptionId: id })}
                    selected
                    adults={draft.adults}
                    children={draft.children}
                    seniors={draft.seniors}
                    selectLabel="Change package"
                    onSelect={() => {
                      setPackageFilter(initialCatalogueFilter);
                      setPackageLimit(6);
                      setChangingPackage(true);
                    }}
                  />
                </div>
              ) : (
                <>
                  {chosenPackage && (
                    <button
                      type="button"
                      onClick={() => setChangingPackage(false)}
                      className="min-h-11 rounded-xl border border-gold/40 bg-surface px-4 py-2 text-sm font-semibold"
                    >
                      Keep {chosenPackage.name}
                    </button>
                  )}
                  <TravelPackageGroups
                    packages={matchingPackages}
                    value={packageFilter.group || "all"}
                    loading={catalog.loading}
                    onChange={(group) => {
                      setPackageFilter({ ...packageFilter, group, collection: "all" });
                      setPackageLimit(6);
                    }}
                  />
                  <TravelCatalogueControls
                    category={draft.category}
                    value={packageFilter}
                    count={filteredPackages.length}
                    onChange={(value) => {
                      setPackageFilter(value);
                      setPackageLimit(6);
                    }}
                  />
                  {!catalog.loading && !catalog.error && !filteredPackages.length && (
                    <p className="rounded-xl bg-surface p-4 text-sm">
                      No matching packages. Adjust your filters or choose a custom journey below.
                    </p>
                  )}
                  <div className="grid items-start gap-5 sm:grid-cols-2">
                    {filteredPackages.slice(0, packageLimit).map((pkg) => (
                      <TravelPackageChoice
                        key={pkg.id}
                        pkg={pkg}
                        selected={draft.packageId === pkg.id}
                        adults={draft.adults}
                        children={draft.children}
                        seniors={draft.seniors}
                        onSelect={(flightId) => {
                          update({
                            packageId: pkg.id,
                            flightOptionId: flightId,
                            departureId: null,
                          });
                          setChangingPackage(false);
                        }}
                      />
                    ))}
                  </div>
                  {filteredPackages.length > packageLimit && (
                    <Button
                      variant="outline"
                      full
                      onClick={() => setPackageLimit((count) => count + 6)}
                    >
                      SHOW MORE JOURNEYS ({filteredPackages.length - packageLimit} remaining)
                    </Button>
                  )}
                  <Choice
                    selected={draft.packageId === null}
                    onClick={() => {
                      update({ packageId: null, departureId: null });
                      setChangingPackage(false);
                    }}
                    title="Create a custom journey"
                    note="Tell us your preferences. We’ll prepare a personal itinerary."
                  />
                </>
              )}
            </>
          )}
          {step === 4 && (
            <>
              <section className="rounded-[20px] border border-border bg-card p-5">
                <p className="eyebrow">Your package arrangements</p>
                <h2 className="mt-2 font-display text-[25px]">
                  {chosenPackage?.name || "Custom journey"}
                </h2>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  {chosenPackage?.price_basis ||
                    "Room sharing and hotels will be agreed in your quote."}
                </p>
                {chosenPackage && (
                  <ul className="mt-3 space-y-2 text-[12px] text-muted-foreground">
                    {chosenPackage.inclusions
                      .filter((item) => /hotel|accommodation|guidance|guide|assistance/i.test(item))
                      .slice(0, 5)
                      .map((item) => (
                        <li key={item} className="flex gap-2">
                          <Check size={14} className="mt-0.5 shrink-0 text-gold" />
                          <span>{item}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </section>
              <h2 className="text-[15px] font-semibold">
                Support needs <span className="font-normal text-muted-foreground">(optional)</span>
              </h2>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4">
                  <input
                    type="checkbox"
                    checked={draft.pace === "relaxed"}
                    onChange={(e) => update({ pace: e.target.checked ? "relaxed" : "balanced" })}
                    className="mt-1 h-5 w-5 shrink-0 accent-primary"
                  />
                  <span>
                    <span className="block text-[13px] font-semibold">
                      {draft.category === "umrah" || draft.category === "hajj"
                        ? "Extra breaks or slower walking"
                        : "Gentle & relaxed"}
                    </span>
                    <span className="mt-1 block text-[12px] text-muted-foreground">
                      Request a gentler pace where the itinerary allows.
                    </span>
                  </span>
                </label>
                {assistanceOptions
                  .filter(
                    (option) =>
                      option.id === "mobility" ||
                      (option.id === "child-seat" && draft.children > 0),
                  )
                  .map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4"
                    >
                      <input
                        type="checkbox"
                        checked={draft.assistance.includes(option.id)}
                        onChange={(e) =>
                          update({
                            assistance: e.target.checked
                              ? [...draft.assistance, option.id]
                              : draft.assistance.filter((id) => id !== option.id),
                          })
                        }
                        className="mt-1 h-5 w-5 shrink-0 accent-primary"
                      />
                      <span>
                        <span className="block text-[13px] font-semibold">{option.label}</span>
                        <span className="mt-1 block text-[12px] text-muted-foreground">
                          {option.note}
                        </span>
                      </span>
                    </label>
                  ))}
              </div>
              {!!chosenPackage?.flight_options?.length && (
                <Field label="Preferred flight option">
                  <select
                    className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm"
                    value={chosenFlight?.id || ""}
                    onChange={(e) => update({ flightOptionId: e.target.value || null })}
                  >
                    <option value="">No preference — help me choose</option>
                    {chosenPackage.flight_options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.airline} ·{" "}
                        {chosenPackage.pricing_mode === "on_request" ||
                        option.price_per_adult == null
                          ? "Price on request"
                          : travelMoney(option.price_per_adult) + " per adult"}
                      </option>
                    ))}
                  </select>
                  {chosenFlight?.notes && (
                    <p className="mt-2 text-xs text-muted-foreground">{chosenFlight.notes}</p>
                  )}
                </Field>
              )}
              <details className="rounded-2xl border border-border bg-card">
                <summary className="min-h-12 cursor-pointer px-4 py-3 text-[13px] font-semibold">
                  Request a package change{" "}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </summary>
                <div className="space-y-4 border-t border-border p-4">
                  <Field label="Room sharing">
                    <select
                      value={draft.room}
                      onChange={(e) => update({ room: e.target.value as TravelDraft["room"] })}
                      className={inputClass}
                    >
                      <option value="package">Keep package arrangements</option>
                      <option value="shared">Shared room</option>
                      <option value="twin">Twin / double</option>
                      <option value="private">Private room</option>
                    </select>
                  </Field>
                  <Field label="Hotel request">
                    <select
                      value={draft.stay}
                      onChange={(e) => update({ stay: e.target.value as TravelDraft["stay"] })}
                      className={inputClass}
                    >
                      <option value="package">Keep package hotels</option>
                      <option value="standard">Request standard hotels</option>
                      <option value="comfort">Request comfort hotels</option>
                      <option value="premium">Request premium hotels</option>
                    </select>
                  </Field>
                  {assistanceOptions
                    .filter(
                      (option) =>
                        option.id === "nearby-hotel" ||
                        (option.id === "guidance" &&
                          !chosenPackage?.inclusions.some((item) => /guidance|guide/i.test(item))),
                    )
                    .map((option) => (
                      <label
                        key={option.id}
                        className="flex cursor-pointer items-start gap-3 text-[13px]"
                      >
                        <input
                          type="checkbox"
                          checked={draft.assistance.includes(option.id)}
                          onChange={(e) =>
                            update({
                              assistance: e.target.checked
                                ? [...draft.assistance, option.id]
                                : draft.assistance.filter((id) => id !== option.id),
                            })
                          }
                          className="h-5 w-5 shrink-0 accent-primary"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                </div>
              </details>
              <Field label="Other requests (optional)">
                <textarea
                  rows={2}
                  maxLength={2000}
                  value={draft.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                  className={cx(inputClass, "h-auto py-3")}
                  placeholder="Dietary needs, hotel distance or anything else we should know"
                />
              </Field>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Requests are subject to availability. Any additional cost will be confirmed in your
                quote.
              </p>
            </>
          )}
          {step === AUTH_STEP && (
            <BookingAuth
              customer={customer}
              onAuthenticated={(user) => {
                setCustomer(user);
                applySavedProfile(user);
                setStep(REVIEW_STEP);
              }}
              redirectPath="/travel/plan?step=6"
              note="Sign in once and we'll securely remember your contact details for your next travel booking."
            />
          )}
          {step === REVIEW_STEP && (
            <>
              <div className="rounded-[20px] border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-[28px]">Your journey, at a glance</h2>
                  <Plane size={21} className="text-gold" />
                </div>
                {[
                  ["Journey", categoryName, 1],
                  [
                    "Dates & departure",
                    `${chosenDeparture ? travelDate(chosenDeparture.start_date) : draft.datesFlexible ? draft.month || "Flexible dates" : draft.date ? travelDate(draft.date) : "Flexible dates"} · ${chosenDeparture?.departure_city || draft.departureCity}`,
                    3,
                  ],
                  [
                    "Travellers",
                    `${draft.adults} adults${draft.seniors ? ` (${draft.seniors} seniors)` : ""}${draft.children ? ` · ${draft.children} children (${draft.childAges.join(", ")} years)` : ""}`,
                    0,
                  ],
                  ["Package", chosenPackage?.name || "Custom journey", 2],
                  [
                    "Preferences",
                    `${draft.pace === "relaxed" ? "Gentler pace requested" : "Package itinerary"} · ${draft.room === "package" ? "Package room sharing" : `${draft.room} room requested`} · ${draft.stay === "package" ? "Package hotels" : `${draft.stay} hotels requested`}${draft.assistance.length ? ` · ${draft.assistance.map((id) => assistanceOptions.find((a) => a.id === id)?.label).join(", ")}` : ""}`,
                    4,
                  ],
                ].map(([label, value, index]) => (
                  <div
                    key={String(label)}
                    className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-0"
                  >
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-1 text-[14px]">{value}</p>
                    </div>
                    <button
                      onClick={() => {
                        setStep(Number(index));
                        setError(null);
                      }}
                      className="min-h-11 text-[12px] font-semibold underline"
                    >
                      Edit
                    </button>
                  </div>
                ))}
                {chosenPackage && (
                  <div className="mt-4">
                    {chosenFlight && (
                      <p className="mb-2 text-sm font-semibold">
                        Preferred flight: {chosenFlight.airline}
                      </p>
                    )}
                    <TravelPrice
                      pkg={{ ...chosenPackage, price_per_adult: adultPrice }}
                      adults={draft.adults}
                    />
                  </div>
                )}
                <p className="mt-4 text-[15px] font-semibold">
                  {estimate === null
                    ? "Your team will prepare a personal quotation."
                    : `Starting adult estimate: ${travelMoney(estimate)}`}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  {draft.children > 0 && "Children are quoted separately. "}Final availability,
                  services, taxes and prices will be confirmed in writing.{" "}
                  {draft.category === "hajj" &&
                    "Hajj is subject to the appropriate official authorisation."}
                </p>
                {chosenPackage && (
                  <details className="mt-4 text-[13px]">
                    <summary className="cursor-pointer font-semibold">
                      Review inclusions and cancellation terms
                    </summary>
                    <p className="mt-2">
                      Included: {chosenPackage.inclusions.join(", ") || "To be confirmed."}
                    </p>
                    <p className="mt-2">
                      Excluded: {chosenPackage.exclusions.join(", ") || "To be confirmed."}
                    </p>
                    <p className="mt-2">{chosenPackage.cancellation_terms}</p>
                  </details>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name">
                  <input
                    autoComplete="name"
                    maxLength={100}
                    value={draft.name}
                    onChange={(e) => update({ name: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Mobile / WhatsApp" note="Include your country code, e.g. +91.">
                  <input
                    type="tel"
                    autoComplete="tel"
                    maxLength={24}
                    value={draft.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Email (optional)">
                <input
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={draft.email}
                  onChange={(e) => update({ email: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl bg-surface p-4 text-[13px] leading-relaxed">
                <input
                  type="checkbox"
                  checked={draft.consent}
                  onChange={(e) => update({ consent: e.target.checked })}
                  className="mt-1 h-5 w-5 shrink-0 accent-black"
                />
                I agree to be contacted about this travel request. I understand that availability
                and the final quotation need to be confirmed by the team.
              </label>
            </>
          )}
        </div>
        {error && (
          <div
            id="travel-step-error"
            tabIndex={-1}
            role="alert"
            className="mt-5 rounded-xl border border-destructive/30 bg-card p-4 text-[14px] text-destructive"
          >
            {error}{" "}
            <a href={`tel:+${travelContact.phone}`} className="underline">
              Call our team
            </a>
          </div>
        )}
      </main>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 backdrop-blur">
        <div className="mx-auto max-w-[720px]">
          <div className="mb-3 flex items-center justify-between gap-3 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users size={14} />
              {draft.adults + draft.children} travellers
            </span>
            <span>
              {estimate === null ? "Personal quotation" : `${travelMoney(estimate)} adult estimate`}
            </span>
          </div>
          <Button full size="lg" disabled={!ready || busy} onClick={() => void next()}>
            {busy
              ? "Sending your request…"
              : [
                  draft.category ? "Choose your package" : "Choose your journey",
                  "Choose your package",
                  "Choose travel dates",
                  "Choose travel preferences",
                  customer ? "Review your travel request" : "Sign in or review as guest",
                  "Review as guest",
                  "Send travel request",
                ][step]}
            {!busy && <ArrowRight size={18} />}
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {step === REVIEW_STEP
              ? "No payment. Our team confirms the final arrangements."
              : step === AUTH_STEP
                ? "Sign in above to see this request in your account, or continue as a guest."
                : "Your choices stay with you when you go back."}
          </p>
        </div>
      </div>
    </div>
  );
}
