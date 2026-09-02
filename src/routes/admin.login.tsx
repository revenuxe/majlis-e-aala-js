import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isCurrentUserAdmin } from "@/lib/admin";
import { Button } from "@/components/ui-kit";
import { Field, TextInput } from "@/components/admin/AdminUI";
import { BrandMark } from "@/components/Brand";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Sign In — Majlise Aala" },
      { name: "description", content: "Secure sign in for the Majlise Aala catering admin console." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Sign In — Majlise Aala" },
      {
        property: "og:description",
        content: "Secure sign in for the Majlise Aala catering admin console.",
      },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (await isCurrentUserAdmin()) navigate({ to: "/admin/dashboard", replace: true });
    })();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setBusy(false);
      return;
    }
    if (!(await isCurrentUserAdmin())) {
      await supabase.auth.signOut();
      setError("This account does not have admin access.");
      setBusy(false);
      return;
    }
    navigate({ to: "/admin/dashboard", replace: true });
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(184,154,98,0.35),transparent_60%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <BrandMark className="h-14 w-14" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne">
              Admin Console
            </p>
            <h1 className="mt-4 max-w-[420px] font-display text-[46px] leading-[1.05] text-primary-foreground">
              Run every celebration from one calm dashboard.
            </h1>
            <p className="mt-4 max-w-[380px] text-[15px] leading-relaxed text-champagne/80">
              Manage packages, menus, sections and enquiries with the same care your guests taste on
              the plate.
            </p>
          </div>
          <p className="text-[12px] text-champagne/60">Majlise Aala • Premium Halal Catering</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <form onSubmit={onSubmit} className="w-full max-w-[400px]">
          <div className="lg:hidden">
            <BrandMark className="h-12 w-12" />
          </div>
          <p className="eyebrow mt-6">Restricted Access</p>
          <h2 className="mt-2 font-display text-[32px] leading-tight">Admin sign in</h2>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Use your administrator credentials to continue.
          </p>

          <div className="mt-7 space-y-4">
            <Field label="Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-text" />
                <TextInput
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mea.com"
                  className="pl-10"
                />
              </div>
            </Field>
            <Field label="Password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-text" />
                <TextInput
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </Field>
          </div>

          {error && (
            <p className="mt-4 rounded-[12px] border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" full size="lg" className="mt-6" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {busy ? "Signing in…" : "Sign in"}
          </Button>

          <p className="mt-5 text-center text-[12px] text-muted-foreground">
            Access is limited to authorised administrators.
          </p>
        </form>
      </section>
    </main>
  );
}
