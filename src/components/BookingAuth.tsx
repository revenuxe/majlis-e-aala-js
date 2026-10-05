"use client";
import { useEffect, useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button, cx } from "@/components/ui-kit";

/**
 * Shared sign-in / sign-up card used by both the catering and travel booking
 * wizards. When `customer` is already set, it renders nothing so the parent
 * can auto-advance to the next step.
 *
 * `redirectPath` controls where Google OAuth redirects after authentication
 * (e.g. "/plan?step=7" or "/travel/plan?step=6").
 *
 * `title` / `note` let each flow customise the heading copy.
 */
export function BookingAuth({
  customer,
  onAuthenticated,
  redirectPath,
  title,
  note,
  heading,
}: {
  customer: User | null;
  onAuthenticated: (user: User) => void;
  redirectPath: string;
  title?: { signin: string; signup: string };
  note?: string;
  /** Optional heading element rendered above the card (e.g. a StepHeading). */
  heading?: (mode: "signin" | "signup") => React.ReactNode;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("auth_error"))
      setError("We couldn't complete sign-in. Please try again or use your email and password.");
  }, []);
  const callbackUrl = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const result =
        mode === "signin"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: callbackUrl() },
            });

      setBusy(false);
      if (result.error) {
        setError(result.error.message);
        return;
      }
      if (!result.data.session) {
        setNotice("Check your inbox to confirm your email, then return here to sign in.");
        return;
      }
      if (result.data.user) onAuthenticated(result.data.user);
    } catch {
      setError("Couldn't reach the sign-in service. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl() },
      });
      if (oauthError) {
        setError(oauthError.message);
        setBusy(false);
      }
    } catch {
      setError("Couldn't start Google sign-in. Please try again.");
      setBusy(false);
    }
  };

  if (customer) return null;

  const defaultTitle = {
    signin: "Welcome back",
    signup: "Save your booking details",
  };
  const resolvedTitle = title ?? defaultTitle;
  const resolvedNote =
    note ?? "Sign in once and we'll securely remember your contact details for your next booking.";

  return (
    <>
      {heading?.(mode)}
      {!heading && (
        <div className="mb-6">
          <h2 className="font-display text-[32px] leading-tight sm:text-[38px]">
            {resolvedTitle[mode]}
          </h2>
          <p className="mt-2 text-[15px] text-muted-foreground">{resolvedNote}</p>
        </div>
      )}
      <div className="rounded-[20px] border border-border bg-card p-5 shadow-card sm:p-6">
        <div className="mb-6 grid grid-cols-2 rounded-[12px] bg-surface p-1">
          {(["signin", "signup"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setMode(option);
                setError(null);
                setNotice(null);
              }}
              className={cx(
                "rounded-[9px] px-3 py-2.5 text-[13px] font-semibold transition-colors",
                mode === option ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {option === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
        <form className="grid gap-4" onSubmit={submit}>
          <label className="block">
            <span className="eyebrow">Email address</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 h-14 w-full rounded-[12px] border border-border bg-background px-4 text-[16px] outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="eyebrow">Password</span>
            <input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              className="mt-2 h-14 w-full rounded-[12px] border border-border bg-background px-4 text-[16px] outline-none focus:border-gold"
            />
          </label>
          {error && (
            <p role="alert" className="text-[13px] text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-[13px] text-muted-foreground">
              {notice}
            </p>
          )}
          <Button
            type="button"
            size="lg"
            full
            disabled={busy}
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
          <Button type="submit" size="lg" full disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LockKeyhole className="h-4 w-4" />
            )}
            {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>
      </div>
    </>
  );
}
