"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TravelDeparture, TravelPackage } from "@/lib/travel-booking";

export function useTravelCatalog(initialPackages?: TravelPackage[]) {
  const [packages, setPackages] = useState<TravelPackage[]>(initialPackages ?? []);
  const [departures, setDepartures] = useState<TravelDeparture[]>([]);
  const [loading, setLoading] = useState(initialPackages === undefined);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, d] = await Promise.all([
        supabase
          .from("travel_packages")
          .select("*")
          .eq("is_active", true)
          .order("sort_order")
          .order("name"),
        supabase
          .from("travel_departures")
          .select("*")
          .eq("is_active", true)
          .gte("start_date", new Date().toISOString().slice(0, 10))
          .order("start_date"),
      ]);
      if (p.error || d.error) throw p.error || d.error;
      setPackages((p.data ?? []) as unknown as TravelPackage[]);
      setDepartures(d.data ?? []);
    } catch {
      setError("We couldn't load the latest journeys. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  return { packages, departures, loading, error, reload: load };
}
