import type { Metadata } from "next";
import { OccasionLanding } from "@/routes/occasion-landing";
export const metadata: Metadata = {
  title: "Aqiqah Catering in Bangalore | Majlis E Aala",
  description:
    "Plan Aqiqah catering in Bangalore with Majlis E Aala. Explore flexible menus, live package options and thoughtful family-gathering food planning.",
  alternates: { canonical: "/aqiqah" },
};
export default function Page() {
  return <OccasionLanding kind="aqiqah" />;
}
