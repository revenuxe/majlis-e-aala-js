import { publicPageMetadata } from "@/lib/seo";
import { OccasionLanding } from "@/routes/occasion-landing";
export const metadata = publicPageMetadata({
  title: "Aqiqah Catering in Bangalore",
  description:
    "Plan Aqiqah catering in Bangalore with Majlis E Aala. Explore flexible menus, live package options and thoughtful family-gathering food planning.",
  path: "/aqiqah",
});
export default function Page() {
  return <OccasionLanding kind="aqiqah" />;
}
