"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TravelDeparture, TravelPackage } from "@/lib/travel-booking";

export function useTravelCatalog(initialPackages?: TravelPackage[]) {
  const [packages, setPackages] = useState<TravelPackage[]>(initialPackages ?? []);
  const [departures, setDepartures] = useState<TravelDeparture[]>([]);
  const [loading, setLoading] = useState(!initialPackages?.length);
  const [error, setError] = useState<string | null>(null);
  const [departuresError, setDeparturesError] = useState<string | null>(null);
  const hasPackages = useRef(Boolean(initialPackages?.length));
  const currentRequest = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    currentRequest.current?.abort();
    const controller = new AbortController();
    currentRequest.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    setLoading(!hasPackages.current);
    setError(null);
    setDeparturesError(null);
    try {
      const [p, d] = await Promise.all([
        supabase
          .from("travel_packages")
          .select("*")
          .eq("is_active", true)
          .order("sort_order")
          .order("name")
          .abortSignal(controller.signal),
        supabase
          .from("travel_departures")
          .select("*")
          .eq("is_active", true)
          .gte("start_date", new Date().toISOString().slice(0, 10))
          .order("start_date")
          .abortSignal(controller.signal),
      ]);
      if (currentRequest.current !== controller) return;
      if (p.error) {
        setError("We couldn't refresh the latest packages. Please try again.");
      } else {
        setPackages((p.data ?? []) as unknown as TravelPackage[]);
        hasPackages.current = Boolean(p.data?.length);
      }
      if (d.error) {
        setDeparturesError(
          "Departure dates couldn't be loaded. Please retry before choosing a scheduled departure.",
        );
      } else {
        setDepartures(d.data ?? []);
      }
    } catch {
      if (currentRequest.current === controller)
        setError("We couldn't load the latest journeys. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      if (currentRequest.current === controller) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
    return () => {
      currentRequest.current?.abort();
      currentRequest.current = null;
    };
  }, [load]);
  return { packages, departures, loading, error, departuresError, reload: load };
}
