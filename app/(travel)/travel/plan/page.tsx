import type { Metadata } from "next";
import TravelPlan from "@/routes/travel-plan";
export const metadata: Metadata = {
  title: { absolute: "Plan Your Journey | Majlise Aala Tours & Travels" },
  description:
    "Plan your pilgrimage or holiday step by step. Choose dates, travellers and preferences, then sign in or send your request as a guest.",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <TravelPlan />;
}
