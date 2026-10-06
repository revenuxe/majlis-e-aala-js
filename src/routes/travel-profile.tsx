"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import {
  ChevronRight,
  ClipboardList,
  Heart,
  LifeBuoy,
  LogOut,
  Plane,
  UserRound,
} from "lucide-react";
import { BrandLogo } from "@/components/Brand";
import { BookingAuth } from "@/components/BookingAuth";
import { TravelBookingHistory } from "@/components/TravelBookingHistory";
import { TravelNavigation } from "@/components/TravelNavigation";
import { TravelSavedPackagesLink, useSavedTravelPackages } from "@/components/TravelSavedPackages";
import { supabase } from "@/integrations/supabase/client";
import { travelProfileFromUser, saveTravelProfile, type TravelProfile } from "@/lib/travel-profile";
import { travelCategories, travelContact } from "@/lib/travel";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  phone: z
    .string()
    .trim()
    .max(24)
    .refine(
      (value) =>
        !value ||
        (/^\+?[0-9\s()-]+$/.test(value) &&
          value.replace(/\D/g, "").length >= 8 &&
          value.replace(/\D/g, "").length <= 15),
      "Enter a valid mobile number.",
    ),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address.").max(254)]),
});
const draftSchema = z.object({
  draft: z
    .object({
      category: z.enum(["", "umrah", "hajj", "international", "domestic"]),
      adults: z.number().int().min(1).max(100),
      children: z.number().int().min(0).max(20),
    })
    .refine((draft) => draft.adults + draft.children <= 100),
});
const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20";

export default function TravelProfilePage() {
  const { items } = useSavedTravelPackages();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<TravelProfile>({ name: "", phone: "", email: "" });
  const [draft, setDraft] = useState<z.infer<typeof draftSchema>["draft"] | null>(null);
  useEffect(() => {
    let active = true;
    const applyUser = (customer: User | null) => {
      if (!active) return;
      setUser(customer);
      setProfile(customer ? travelProfileFromUser(customer) : { name: "", phone: "", email: "" });
      setReady(true);
    };
    void supabase.auth
      .getUser()
      .then(({ data }) => applyUser(data.user))
      .catch(() => {
        if (active) setReady(true);
      });
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      applyUser(session?.user || null),
    );
    try {
      const saved = draftSchema.safeParse(
        JSON.parse(localStorage.getItem("ma-travel-draft-v1") || "null"),
      );
      if (saved.success) setDraft(saved.data.draft);
    } catch {
      /* Draft storage is optional. */
    }
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || busy) return;
    const parsed = profileSchema.safeParse(profile);
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message || "Check your details.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await saveTravelProfile(user, parsed.data);
      setProfile(parsed.data);
      setEditing(false);
      setMessage("Your travel details are saved.");
    } catch {
      setMessage("We couldn’t sync your details just now. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const result = await supabase.auth.signOut({ scope: "local" });
      if (result.error) throw result.error;
      setUser(null);
      setProfile({ name: "", phone: "", email: "" });
      setEditing(false);
    } catch {
      setMessage("We couldn’t sign you out. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-12">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between gap-3 px-5 py-4">
          <Link href="/" className="min-w-0">
            <BrandLogo className="h-8 max-w-full" />
          </Link>
          <TravelSavedPackagesLink />
        </div>
      </header>
      <main className="mx-auto max-w-[1000px] px-5 py-4 sm:px-8 sm:py-6">
        <h1 className="font-display text-3xl">Your travel profile</h1>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
            <UserRound size={24} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">
              {ready
                ? user
                  ? profile.name || "Welcome back"
                  : "Welcome, traveller"
                : "Loading your account…"}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {user ? user.email : "Your journeys, saved packages and bookings"}
            </p>
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          {[
            {
              href: "/travel/bookings",
              label: "Travel bookings",
              note: "Trips, quotations and updates",
              icon: ClipboardList,
            },
            {
              href: "/travel/saved",
              label: "Saved packages",
              note: `${items.length} saved on this device`,
              icon: Heart,
            },
            {
              href: "/travel/plan",
              label: draft ? "Continue planning" : "Plan a new journey",
              note: draft
                ? `${travelCategories.find((category) => category.id === draft.category)?.name || "Your journey"} · ${draft.adults + draft.children} travellers`
                : "Start your next trip",
              icon: Plane,
            },
            {
              href: `tel:+${travelContact.phone}`,
              label: "Travel support",
              note: travelContact.displayPhone,
              icon: LifeBuoy,
            },
          ].map(({ href, label, note, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex min-h-20 items-center gap-3 border-b border-border px-5 py-3 last:border-0 hover:bg-surface"
            >
              <Icon size={20} className="shrink-0 text-gold" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{note}</span>
              </span>
              <ChevronRight size={17} className="shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
        {message && (
          <p role="status" className="mt-4 rounded-xl border border-border bg-card p-4 text-sm">
            {message}
          </p>
        )}
        {!ready ? (
          <p role="status" className="mt-5 text-sm text-muted-foreground">
            Loading your account…
          </p>
        ) : user ? (
          <>
            <section className="mt-4 rounded-2xl border border-border bg-card p-5">
              <button
                disabled={busy}
                onClick={() => {
                  setEditing(!editing);
                  setMessage(null);
                }}
                aria-expanded={editing}
                aria-controls="travel-personal-details"
                className="flex min-h-11 w-full items-center justify-between gap-3 text-left font-semibold"
              >
                <span>Personal details</span>
                <span className="text-xs text-gold">{editing ? "Close" : "Edit"}</span>
              </button>
              {editing && (
                <form
                  id="travel-personal-details"
                  onSubmit={(event) => void save(event)}
                  className="mt-3 space-y-4"
                >
                  <label className="block text-sm font-semibold">
                    Name
                    <input
                      required
                      maxLength={100}
                      autoComplete="name"
                      value={profile.name}
                      onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-sm font-semibold">
                    Mobile / WhatsApp
                    <input
                      type="tel"
                      maxLength={24}
                      autoComplete="tel"
                      value={profile.phone}
                      onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-sm font-semibold">
                    Contact email
                    <input
                      type="email"
                      maxLength={254}
                      autoComplete="email"
                      value={profile.email}
                      onChange={(event) => setProfile({ ...profile, email: event.target.value })}
                      className={inputClass}
                    />
                  </label>
                  <button
                    disabled={busy}
                    type="submit"
                    className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {busy ? "Saving…" : "Save details"}
                  </button>
                </form>
              )}
            </section>
            <TravelBookingHistory key={user.id} userId={user.id} />
            <button
              disabled={busy}
              onClick={() => void signOut()}
              className="mt-4 flex min-h-11 items-center gap-2 px-2 text-sm font-semibold"
            >
              <LogOut size={17} />
              {busy ? "Please wait…" : "Sign out"}
            </button>
          </>
        ) : (
          <div className="mt-5 max-w-lg">
            <BookingAuth
              customer={null}
              onAuthenticated={(customer) => {
                setUser(customer);
                setProfile(travelProfileFromUser(customer));
              }}
              redirectPath="/travel/profile"
              note="Sign in to see your travel bookings and keep your contact details ready for your next journey."
            />
          </div>
        )}
      </main>
      <TravelNavigation />
    </div>
  );
}
