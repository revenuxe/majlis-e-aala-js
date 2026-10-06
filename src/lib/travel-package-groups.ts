import type { TravelPackage } from "./travel-booking";

const collectionLabels: Record<string, string> = {
  core: "Classic Umrah",
  ramadan: "Ramadan Umrah",
  combo: "Umrah + holiday",
  ziyarat: "Ziyarat",
};
export function packageGroupKeys(pkg: TravelPackage): string[] {
  if (pkg.category === "umrah") return [`collection:${pkg.collection}`];
  if (pkg.category === "hajj") return [`tier:${pkg.name.trim()}`];
  // Multi-city itineraries belong to each destination they visit.
  return [
    ...new Set(
      pkg.places
        .split(/\s*(?:→|->|&|\+)\s*/)
        .map((place) => place.trim())
        .filter(Boolean),
    ),
  ].map((place) => `destination:${place}`);
}
export function travelPackageGroups(packages: TravelPackage[]) {
  const groups = new Map<
    string,
    { id: string; label: string; image: string | null; count: number }
  >();
  for (const pkg of packages) {
    for (const id of packageGroupKeys(pkg)) {
      const label = id.startsWith("collection:")
        ? collectionLabels[pkg.collection] || pkg.collection
        : id.slice(id.indexOf(":") + 1);
      const group = groups.get(id);
      if (group) {
        group.count++;
        group.image ||= pkg.image_url;
      } else groups.set(id, { id, label, image: pkg.image_url, count: 1 });
    }
  }
  return [...groups.values()];
}
