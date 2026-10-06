import "server-only";
import type { Database } from "@/integrations/supabase/types";
import type { TravelPackage } from "@/lib/travel-booking";
export type TravelHomeContent = {
  slides: Database["public"]["Tables"]["travel_hero_carousels"]["Row"][];
  packages: TravelPackage[];
};
/** Public-only snapshot for crawlable HTML; client hooks still refresh admin edits. */
export async function getTravelHomeContent(): Promise<TravelHomeContent> {
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? process.env["SUPABASE_URL"];
  const key =
    process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return { slides: [], packages: [] };
  async function read<T>(table: string, order: string): Promise<T[]> {
    try {
      const endpoint = new URL(`/rest/v1/${table}`, url);
      endpoint.searchParams.set("select", "*");
      endpoint.searchParams.set("is_active", "eq.true");
      endpoint.searchParams.set("order", order);
      const response = await fetch(endpoint, {
        headers: { apikey: key! },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) return [];
      const data: unknown = await response.json();
      return Array.isArray(data) ? (data as T[]) : [];
    } catch {
      return [];
    }
  }
  const [slides, packages] = await Promise.all([
    read<TravelHomeContent["slides"][number]>(
      "travel_hero_carousels",
      "sort_order.asc,created_at.asc",
    ),
    read<TravelPackage>("travel_packages", "sort_order.asc,name.asc"),
  ]);
  return { slides, packages };
}
