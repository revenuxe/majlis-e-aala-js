"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TravelHero = Database["public"]["Tables"]["travel_hero_carousels"]["Row"];

/** No persistent cache: admin edits are read on page load and when returning to this tab. */
export function useTravelHero(initialSlides?: TravelHero[]) {
  const [slides, setSlides] = useState<TravelHero[]>(initialSlides ?? []);
  const [loading, setLoading] = useState(initialSlides === undefined);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let requestId = 0;
    async function load() {
      const request = ++requestId;
      try {
        const { data, error } = await supabase
          .from("travel_hero_carousels")
          .select("*")
          .eq("is_active", true)
          .order("sort_order")
          .order("created_at");
        if (cancelled || request !== requestId) return;
        if (error) throw error;
        setSlides(data ?? []);
        setFailed(false);
      } catch {
        if (!cancelled && request === requestId) setFailed(true);
      } finally {
        if (!cancelled && request === requestId) setLoading(false);
      }
    }
    void load();
    const onFocus = () => {
      void load();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return { slides, loading, failed };
}
