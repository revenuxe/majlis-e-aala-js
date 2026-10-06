"use client";
import { useEffect, useState } from "react";
import {
  defaultTravelTravellers,
  normalizeTravellers,
  readTravelTravellers,
  restoreTravellers,
  saveTravelTravellers,
  syncTravellerUrl,
  type TravelTravellers,
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

  function update(key: keyof TravelTravellers, value: number) {
    setCounts((current) => normalizeTravellers({ ...current, [key]: value }));
  }

  return {
    ...counts,
    setAdults: (value: number) => update("adults", value),
    setChildren: (value: number) => update("children", value),
    setSeniors: (value: number) => update("seniors", value),
  };
}
