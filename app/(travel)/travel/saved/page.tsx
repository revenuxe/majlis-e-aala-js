import type { Metadata } from "next";
import TravelSaved from "@/routes/travel-saved";
import { getTravelHomeContent } from "@/lib/travel-home-content";
export const metadata: Metadata = {
  title: "Saved Travel Packages",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const { packages } = await getTravelHomeContent();
  return <TravelSaved initialPackages={packages} />;
}
