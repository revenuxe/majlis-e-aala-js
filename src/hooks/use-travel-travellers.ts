"use client";
import { useEffect, useState } from "react";
import {
  defaultTravelTravellers,
  normalizeTravellers,
  readTravelTravellers,
  restoreTravellers,
  saveTravelTravellers,
  syncTravellerUrl,
} from "@/lib/travel-travellers";

export function useTravelTravellers() {
  const [counts, setCounts] = useState(defaultTravelTravellers);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restore = () => {
      setCounts(
        restoreTravellers(new URLSearchParams(window.location.search), readTravelTravellers()),
      );
      setReady(true);
    };
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveTravelTravellers(counts);
    syncTravellerUrl(counts);
  }, [counts, ready]);

  function update(key: "adults" | "children" | "seniors", value: number) {
    setCounts((current) => normalizeTravellers({ ...current, [key]: value }));
  }

  return {
    ready,
    ...counts,
    childAges: counts.childAges || [],
    setChildAge: (index: number, age: number) =>
      setCounts((current) =>
        normalizeTravellers({
          ...current,
          childAges: Array.from({ length: current.children }, (_, i) =>
            i === index ? age : (current.childAges?.[i] ?? -1),
          ),
        }),
      ),
    setAdults: (value: number) => update("adults", value),
    setChildren: (value: number) => update("children", value),
    setSeniors: (value: number) => update("seniors", value),
  };
}
