import type { Metadata } from "next";
import TravelPlan from "@/routes/travel-plan";
import { getTravelHomeContent } from "@/lib/travel-home-content";
export const metadata: Metadata = {
  title: { absolute: "Plan Your Journey | Majlis E Aala Tours & Travels" },
  description:
    "Plan your pilgrimage or holiday step by step. Choose dates, travellers and preferences, then sign in or send your request as a guest.",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const { packages } = await getTravelHomeContent();
  return <TravelPlan initialPackages={packages} />;
}
