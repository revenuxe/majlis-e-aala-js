"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ArrowLeft, Loader2, Plane } from "lucide-react";
import { BrandMark } from "@/components/Brand";
import { BookingAuth } from "@/components/BookingAuth";
import { TravelBookingHistory } from "@/components/TravelBookingHistory";
import { TravelNavigation } from "@/components/TravelNavigation";
import { supabase } from "@/integrations/supabase/client";
export default function TravelBookings({ reference }: { reference?: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    void supabase.auth
      .getUser()
      .then(({ data }) => {
        if (active) {
          setUser(data.user);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) setReady(true);
      });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user || null);
        setReady(true);
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  const returnPath = reference
    ? `/travel/bookings/${encodeURIComponent(reference)}`
    : "/travel/bookings";
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link href="/travel" className="flex items-center gap-3">
            <BrandMark size={40} />
            <span>
              <span className="eyebrow block">Majlis E Aala</span>
              <span className="block text-sm font-semibold">Tours & Travels</span>
            </span>
          </Link>
          <Link
            href="/travel/plan"
            className="flex min-h-11 items-center gap-2 text-[13px] font-semibold"
          >
            <Plane size={17} />
            Plan a journey
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[1000px] px-5 py-7 pb-32 sm:px-8 sm:py-10 sm:pb-32">
        <Link
          href={reference ? "/travel/bookings" : "/travel"}
          className="inline-flex min-h-11 items-center gap-2 text-[13px] text-muted-foreground"
        >
          <ArrowLeft size={16} />
          {reference ? "All travel bookings" : "Travel home"}
        </Link>
        <h1 className="mt-4 font-display text-[34px] leading-tight sm:text-[44px]">
          {reference ? "Your journey, at a glance" : "Your travel bookings"}
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {reference
            ? "Follow your request from planning to confirmation."
            : "Your journeys, quotations and booking updates, together in one place."}
        </p>
        {!ready ? (
          <div role="status" className="flex items-center gap-2 py-12 text-sm">
            <Loader2 className="animate-spin" size={18} />
            Loading your account…
          </div>
        ) : user ? (
          <TravelBookingHistory
            key={user.id}
            userId={user.id}
            {...(reference ? { reference } : {})}
            standalone
          />
        ) : (
          <div className="mx-auto mt-7 max-w-lg">
            <BookingAuth
              customer={null}
              onAuthenticated={setUser}
              redirectPath={returnPath}
              note="Sign in to securely view travel requests made with your account."
            />
            <p className="mt-5 text-[12px] leading-relaxed text-muted-foreground">
              Booked as a guest? Contact our travel team with your booking reference. Guest requests
              are not automatically linked to an account.
            </p>
            <a
              href="tel:+919886285028"
              className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold underline"
            >
              Contact travel support
            </a>
          </div>
        )}
      </main>
      <footer className="mx-auto max-w-[1000px] border-t border-border px-5 pb-28 pt-5 text-[12px] text-muted-foreground lg:pb-8">
        Looking for your event orders?{" "}
        <Link href="/orders" className="font-semibold underline">
          Catering bookings
        </Link>
      </footer>
      <TravelNavigation />
    </div>
  );
}
