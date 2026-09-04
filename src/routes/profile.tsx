"use client";
import Link from "next/link";
import {
  Bell,
  CalendarClock,
  ChevronRight,
  LifeBuoy,
  LogOut,
  MapPin,
  Package,
  ScrollText,
  User,
  X,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePlan } from "@/lib/plan-store";
import { Button, SectionHeader } from "@/components/ui-kit";

const timeline = [
  "Booking Received",
  "Catering Details Confirmed",
  "Event Scheduled",
  "Preparation",
  "Ready / Dispatched",
  "Completed",
];
const rows = [
  { icon: User, label: "Personal Details", section: "personal" },
  { icon: ScrollText, label: "Draft Menus", section: "drafts" },
  { icon: MapPin, label: "Saved Addresses", section: "addresses" },
  { icon: CalendarClock, label: "Upcoming Events", section: "upcoming" },
  { icon: Package, label: "Past Orders", section: "orders" },
  { icon: Bell, label: "Notifications", section: "notifications" },
  { icon: LifeBuoy, label: "Support", section: "support" },
  { icon: ScrollText, label: "Terms", section: "terms" },
];

export default function ProfilePage() {
  const { plan, bookings } = usePlan();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null),
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const authenticate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (authBusy) return;
    setAuthBusy(true);
    setAuthMessage(null);
    const result =
      authMode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setAuthBusy(false);
    if (result.error) {
      setAuthMessage(result.error.message);
      return;
    }
    if (!result.data.session) {
      setAuthMessage("Check your email to confirm your account, then sign in here.");
      return;
    }
    setUser(result.data.user);
    setShowAuth(false);
    setPassword("");
  };

  const logout = async () => {
    setAuthBusy(true);
    setAuthMessage(null);
    const { error } = await supabase.auth.signOut({ scope: "local" });
    setAuthBusy(false);
    if (error) {
      setAuthMessage(error.message);
      return;
    }
    setUser(null);
    setShowAuth(false);
  };
  const signInWithGoogle = async () => {
    if (authBusy) return;
    setAuthBusy(true);
    setAuthMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/profile` },
    });
    if (error) {
      setAuthMessage(error.message);
      setAuthBusy(false);
    }
  };
  const customerBookings = user ? bookings : [];
  const upcoming = customerBookings
    .filter((booking) => !["completed", "cancelled"].includes(booking.status))
    .sort((a, b) => (a.eventDate || "9999").localeCompare(b.eventDate || "9999"))[0];
  const activeStep = upcoming
    ? { new: 0, contacted: 1, quoted: 1, confirmed: 2, completed: 5, cancelled: 0 }[upcoming.status]
    : 0;

  return (
    <main className="mx-auto max-w-[860px] px-5 py-8 sm:px-8">
      <SectionHeader eyebrow="Your account" title="Profile" />
      <div className="mt-6 rounded-[16px] border border-border bg-card p-5">
        <p className="font-display text-[24px]">
          {user ? plan.contact.name || user.email : "Guest"}
        </p>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {user
            ? plan.contact.phone ||
              user.email ||
              "Add your mobile number when you request catering."
            : "Sign in to view bookings and save your details."}
        </p>
        {!user && !showAuth && (
          <div className="mt-5 flex flex-nowrap gap-3">
            <Button size="lg" className="shrink-0 px-4" onClick={() => setShowAuth(true)}>
              <User className="h-4 w-4" /> Sign in
            </Button>
            <Button
              size="lg"
              className="min-w-0 flex-1 whitespace-nowrap px-3 text-[13px]"
              disabled={authBusy}
              onClick={() => void signInWithGoogle()}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt=""
                className="h-5 w-5"
              />
              <span>
                <span className="hidden min-[480px]:inline">Continue with </span>Google
              </span>
            </Button>
          </div>
        )}
        {user && (
          <Button
            variant="outline"
            size="lg"
            className="mt-5"
            disabled={authBusy}
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4" /> {authBusy ? "Signing out..." : "Logout"}
          </Button>
        )}
      </div>

      {!user && showAuth && (
        <div className="fixed inset-0 z-[100] flex items-end bg-foreground/45 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
          <button
            type="button"
            aria-label="Close sign in"
            className="absolute inset-0 cursor-default"
            onClick={() => setShowAuth(false)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-auth-title"
            className="relative w-full max-w-[430px] rounded-[24px] bg-card p-5 shadow-float animate-in slide-in-from-bottom-4 duration-200 sm:rounded-[22px] sm:p-6"
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Your account</p>
                <h2 id="profile-auth-title" className="mt-1 font-display text-[27px] leading-tight">
                  {authMode === "signin" ? "Welcome back" : "Create your account"}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowAuth(false)}
                className="press -mr-1 -mt-1 grid h-10 w-10 place-items-center rounded-full border border-border"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Sign in to keep your bookings and saved venue details together.
            </p>
            <div className="mt-5 grid grid-cols-2 rounded-[12px] bg-surface p-1">
              {(["signin", "signup"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setAuthMode(mode);
                    setAuthMessage(null);
                  }}
                  className={
                    mode === authMode
                      ? "rounded-[9px] bg-card px-3 py-2.5 text-[13px] font-semibold shadow-sm"
                      : "rounded-[9px] px-3 py-2.5 text-[13px] font-semibold text-muted-foreground"
                  }
                >
                  {mode === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>
            <form className="mt-4 grid gap-3" onSubmit={authenticate}>
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="h-13 rounded-[12px] border border-border bg-background px-4 text-[15px] outline-none focus:border-gold"
              />
              <input
                type="password"
                required
                minLength={6}
                autoComplete={authMode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="h-13 rounded-[12px] border border-border bg-background px-4 text-[15px] outline-none focus:border-gold"
              />
              {authMessage && <p className="text-[13px] text-muted-foreground">{authMessage}</p>}
              <Button
                type="button"
                size="lg"
                full
                disabled={authBusy}
                onClick={() => void signInWithGoogle()}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt=""
                  className="h-5 w-5"
                />
                Continue with Google
              </Button>
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[.12em] text-muted-text">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button type="submit" size="lg" full disabled={authBusy} className="mt-1">
                {authBusy ? "Please wait..." : authMode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>
          </section>
        </div>
      )}

      <section className="mt-8">
        <p className="eyebrow">Upcoming event</p>
        <div className="mt-3 rounded-[16px] border border-border bg-card p-5">
          {upcoming ? (
            <>
              <p className="text-[15px] font-semibold">
                {upcoming.occasion} · {upcoming.guests} guests
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {upcoming.eventDate
                  ? new Date(`${upcoming.eventDate}T00:00:00`).toDateString()
                  : "Date to be confirmed"}
              </p>
              <p className="mt-3 font-mono text-[12px] text-muted-text">{upcoming.reference}</p>
              <ol className="mt-5 space-y-4">
                {timeline.map((label, index) => (
                  <li key={label} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                    <span
                      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: index <= activeStep ? "var(--halal)" : "var(--border)" }}
                    />
                    <span
                      className={
                        index <= activeStep
                          ? "text-[14px] font-medium"
                          : "text-[14px] text-muted-text"
                      }
                    >
                      {label}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-5 grid gap-1 border-t border-border pt-4 text-[13px] text-muted-foreground">
                <span>Our catering team will contact you shortly.</span>
                <a href="tel:+919886285028">+91 98862 85028</a>
              </div>
            </>
          ) : (
            <p className="text-[14px] text-muted-foreground">No upcoming catering bookings yet.</p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <p className="eyebrow">Your bookings</p>
        <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0">
          {customerBookings.map((booking) => (
            <div
              key={booking.reference}
              className="w-[220px] shrink-0 rounded-[16px] border border-border bg-card p-5 sm:w-auto"
            >
              <p className="text-[15px] font-semibold">{booking.occasion}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {booking.guests} guests · {booking.packageName}
              </p>
              <p className="mt-3 font-mono text-[11px] text-muted-text">{booking.reference}</p>
              <span className="mt-3 inline-block rounded-full bg-surface px-3 py-1 text-[11px] font-semibold capitalize">
                {booking.status}
              </span>
            </div>
          ))}
          {customerBookings.length === 0 && (
            <p className="text-[14px] text-muted-foreground">
              Your confirmed booking requests will appear here.
            </p>
          )}
        </div>
      </section>

      <section className="mt-8 divide-y divide-border overflow-hidden rounded-[16px] border border-border bg-card">
        {rows.map(({ icon: Icon, label, section }) => (
          <Link
            key={label}
            href={`/profile/${section}`}
            className="press grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4 text-left"
          >
            <Icon className="h-[18px] w-[18px] shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <span className="min-w-0 truncate text-[15px]">{label}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-text" />
          </Link>
        ))}
      </section>
      <div className="mt-8 text-center">
        <Link href="/plan">
          <Button size="lg">Plan Your Catering</Button>
        </Link>
      </div>
    </main>
  );
}
