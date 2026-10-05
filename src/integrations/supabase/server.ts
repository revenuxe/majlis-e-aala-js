import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

function config() {
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? process.env["SUPABASE_URL"];
  const key =
    process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Supabase public environment variables are required.");
  return { url, key };
}

/** Request-scoped Supabase client for Server Components and Route Handlers. */
export async function createSupabaseServerClient({
  writeCookies = false,
}: { writeCookies?: boolean } = {}) {
  const cookieStore = await cookies();
  const { url, key } = config();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        // Route handlers may write sessions; Server Components use proxy.ts.
        if (writeCookies)
          values.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}
