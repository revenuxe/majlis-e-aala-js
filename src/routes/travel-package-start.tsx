"use client";
import { TravelFlowProgress } from "@/components/TravelFlowProgress";
import { TravelStepFooter } from "@/components/TravelStepFooter";
import { TravelSavedPackagesLink } from "@/components/TravelSavedPackages";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTravelTravellers } from "@/hooks/use-travel-travellers";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/Brand";
import { Button, QuantitySelector } from "@/components/ui-kit";
import { TravelSeniorCount } from "@/components/TravelSeniorCount";
import { TravelChildAges } from "@/components/TravelChildAges";
import { TravelJourneyCards } from "@/components/TravelJourneyCards";

export default function TravelPackageStart() {
  const router = useRouter();
  const { adults, children, seniors, childAges, setChildAge, setAdults, setChildren, setSeniors } =
    useTravelTravellers();
  const seniorCount = Math.min(seniors, adults);
  const [choosingJourney, setChoosingJourney] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("step") === "journey") setChoosingJourney(true);
  }, []);
  return (
    <div className="min-h-screen bg-background pb-48">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-5">
          <Link href="/" className="min-w-0">
            <BrandLogo className="h-8 max-w-full" />
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <TravelSavedPackagesLink />
            <Link
              href="/"
              aria-label="Travel home"
              className="hidden min-h-11 items-center gap-2 text-sm sm:flex"
            >
              <ArrowLeft size={16} />
              Travel home
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-5 py-4 sm:px-8 sm:py-6">
        <TravelFlowProgress step={choosingJourney ? 1 : 0} />
        {!choosingJourney ? (
          <div className="mx-auto max-w-xl">
            <h1 className="mt-3 font-display text-[38px] leading-tight">
              Who’s joining your journey?
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Tell us your group size. Package estimates will be calculated for your adults, with
              children quoted separately.
            </p>
            <div className="mt-7 space-y-4">
              <div className="rounded-[22px] border border-border bg-card p-5">
                <h2 className="mb-4 text-sm font-semibold">Adults · 18 years and above</h2>
                <QuantitySelector
                  size="lg"
                  min={1}
                  value={adults}
                  suffix="Adults"
                  onChange={(value) => setAdults(Math.max(1, Math.min(100 - children, value)))}
                />
              </div>
              <div className="rounded-[22px] border border-border bg-card p-5">
                <h2 className="mb-4 text-sm font-semibold">Children · Under 18 years</h2>
                <QuantitySelector
                  size="lg"
                  min={0}
                  value={children}
                  suffix="Children"
                  onChange={(value) => setChildren(Math.max(0, Math.min(20, 100 - adults, value)))}
                />
                <TravelChildAges ages={childAges} onChange={setChildAge} />
              </div>
            </div>
            <div className="mt-4">
              <TravelSeniorCount adults={adults} value={seniorCount} onChange={setSeniors} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Include senior citizens in adults. Assistance preferences are available during
              booking.
            </p>
          </div>
        ) : (
          <>
            <h1 className="sr-only">Choose your journey</h1>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-card p-5">
              <div>
                <p className="eyebrow">Your traveller count</p>
                <p className="mt-2 text-sm font-semibold">
                  {adults + children} travellers · {adults} adults
                  {children ? `, ${children} children` : ""}
                  {seniorCount ? ` (${seniorCount} seniors included)` : ""}
                </p>
              </div>
              <button
                className="min-h-11 rounded-full border border-gold/50 bg-surface px-4 text-sm font-semibold"
                onClick={() => {
                  setChoosingJourney(false);
                  const url = new URL(window.location.href);
                  url.searchParams.delete("step");
                  window.history.replaceState(window.history.state, "", url);
                }}
              >
                Change
              </button>
            </div>
            <TravelJourneyCards
              onSelect={(category) =>
                router.push(
                  `/travel/packages/${category}?${new URLSearchParams(Object.fromEntries(["departure", "city", "date", "month", "flexible", "datesSelected"].map((key) => [key, new URLSearchParams(window.location.search).get(key) || ""])))}&travellers=${adults}&children=${children}&seniors=${seniorCount}`,
                )
              }
            />
          </>
        )}
      </main>
      {!choosingJourney && (
        <TravelStepFooter travellers={adults + children}>
          <Button
            full
            size="lg"
            className="min-h-14"
            disabled={childAges.some((age) => age < 0)}
            onClick={() => {
              setChoosingJourney(true);
              window.history.replaceState(
                window.history.state,
                "",
                `/travel/packages?step=journey&travellers=${adults}&children=${children}&seniors=${seniorCount}`,
              );
              window.scrollTo(0, 0);
            }}
          >
            CHOOSE YOUR JOURNEY
            <ArrowRight size={18} />
          </Button>
        </TravelStepFooter>
      )}
    </div>
  );
}
