import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/integrations/supabase/server";

const allowedReturns = new Set(["/plan", "/travel/plan", "/profile", "/travel/bookings"]);
export async function GET(request: NextRequest) {
  let desired = new URL("/profile", request.nextUrl.origin);
  try {
    desired = new URL(
      request.nextUrl.searchParams.get("next") || "/profile",
      request.nextUrl.origin,
    );
  } catch {
    /* Ignore malformed return destinations. */
  }
  const safe =
    desired.origin === request.nextUrl.origin &&
    (allowedReturns.has(desired.pathname) || /^\/travel\/bookings\/[^/]+$/.test(desired.pathname));
  const destination = safe ? desired : new URL("/profile", request.nextUrl.origin);
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    try {
      const client = await createSupabaseServerClient({ writeCookies: true });
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(destination, { headers: { "Cache-Control": "no-store" } });
    } catch {
      /* Return to the flow with a clear, retryable error. */
    }
  }
  destination.searchParams.set("auth_error", "1");
  return NextResponse.redirect(destination, { headers: { "Cache-Control": "no-store" } });
}
