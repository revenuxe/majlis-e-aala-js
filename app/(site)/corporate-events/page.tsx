import type { Metadata } from "next";
import { OccasionLanding } from "@/routes/occasion-landing";
export const metadata: Metadata = {
  title: "Corporate Event Catering in Bangalore | Majlis E Aala",
  description:
    "Plan corporate event catering in Bangalore with Majlis E Aala. Explore menu packages and flexible food planning for meetings, office gatherings and company celebrations.",
  alternates: { canonical: "/corporate-events" },
};
export default function Page() {
  return <OccasionLanding kind="corporate" />;
}
