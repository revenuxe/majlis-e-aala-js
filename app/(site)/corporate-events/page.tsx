import { publicPageMetadata } from "@/lib/seo";
import { OccasionLanding } from "@/routes/occasion-landing";
export const metadata = publicPageMetadata({
  title: "Corporate Event Catering in Bangalore",
  description:
    "Plan corporate event catering in Bangalore with Majlis E Aala. Explore menu packages and flexible food planning for meetings, office gatherings and company celebrations.",
  path: "/corporate-events",
});
export default function Page() {
  return <OccasionLanding kind="corporate" />;
}
