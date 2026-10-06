export type TravelTravellers = { adults: number; children: number; seniors: number };

export const defaultTravelTravellers: TravelTravellers = { adults: 2, children: 0, seniors: 0 };
export const travelTravellersKey = "ma-travel-travellers-v1";

function integer(value: unknown, fallback: number, min: number, max: number): number {
  const count = typeof value === "number" ? value : NaN;
  return Number.isInteger(count) && count >= min && count <= max ? count : fallback;
}

export function normalizeTravellers(value: Partial<TravelTravellers>): TravelTravellers {
  const adults = integer(value.adults, 2, 1, 100);
  return {
    adults,
    children: Math.min(integer(value.children, 0, 0, 20), 100 - adults),
    seniors: Math.min(integer(value.seniors, 0, 0, 100), adults),
  };
}

export function restoreTravellers(params: URLSearchParams, saved: unknown): TravelTravellers {
  const fallback = normalizeTravellers(
    saved && typeof saved === "object" ? (saved as Partial<TravelTravellers>) : {},
  );
  const adultValue = params.get("travellers");
  const adults = adultValue?.trim() ? Number(adultValue) : NaN;
  // An explicit adult count starts a new group; omitted children/seniors mean zero.
  if (!Number.isInteger(adults) || adults < 1 || adults > 100) return fallback;
  return normalizeTravellers({
    adults,
    children: Number(params.get("children")),
    seniors: Number(params.get("seniors")),
  });
}

export function readTravelTravellers(): TravelTravellers {
  try {
    return restoreTravellers(
      new URLSearchParams(),
      JSON.parse(localStorage.getItem(travelTravellersKey) || "null"),
    );
  } catch {
    return { ...defaultTravelTravellers };
  }
}

export function saveTravelTravellers(value: TravelTravellers): void {
  try {
    localStorage.setItem(travelTravellersKey, JSON.stringify(normalizeTravellers(value)));
  } catch {
    // URL persistence still works when browser storage is unavailable.
  }
}

export function syncTravellerUrl(value: TravelTravellers): void {
  const url = new URL(window.location.href);
  url.searchParams.set("travellers", String(value.adults));
  url.searchParams.set("children", String(value.children));
  url.searchParams.set("seniors", String(value.seniors));
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, "", url);
}
