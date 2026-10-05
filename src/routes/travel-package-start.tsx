"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/Brand";
import { Button, QuantitySelector, SectionHeader } from "@/components/ui-kit";
import { TravelSeniorCount } from "@/components/TravelSeniorCount";
import { TravelJourneyCards } from "@/components/TravelJourneyCards";

export default function TravelPackageStart() {
  const router = useRouter();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const seniorCount = Math.min(seniors, adults);
  const [choosingJourney, setChoosingJourney] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-5">
          <Link href="/travel">
            <BrandLogo className="h-8" />
          </Link>
          <Link href="/travel" className="flex min-h-11 items-center gap-2 text-sm">
            <ArrowLeft size={16} />
            Travel home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 sm:py-12">
        {!choosingJourney ? (
          <div className="mx-auto max-w-xl">
            <p className="eyebrow">Find your package · Step 1 of 2</p>
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
                <p className="mt-3 text-xs text-muted-foreground">
                  We’ll ask for each child’s age when you proceed to booking.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <TravelSeniorCount adults={adults} value={seniorCount} onChange={setSeniors} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Include senior citizens in adults. Assistance preferences are available during
              booking.
            </p>
            <Button
              full
              size="lg"
              className="mt-7"
              onClick={() => {
                setChoosingJourney(true);
                window.scrollTo(0, 0);
              }}
            >
              CHOOSE YOUR JOURNEY
              <ArrowRight size={18} />
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-card p-5">
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
                onClick={() => setChoosingJourney(false)}
              >
                Change
              </button>
            </div>
            <SectionHeader
              eyebrow="Find your kind of journey"
              title="Sacred beginnings. Beautiful escapes."
              subtitle="Choose your journey to see packages calculated for your group."
            />
            <TravelJourneyCards
              onSelect={(category) =>
                router.push(
                  `/travel/packages/${category}?travellers=${adults}&children=${children}&seniors=${seniorCount}`,
                )
              }
            />
          </>
        )}
      </main>
    </div>
  );
}
