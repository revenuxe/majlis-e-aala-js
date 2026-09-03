import type { Metadata } from "next";
import PlanFlow from "@/routes/plan";
export const metadata: Metadata = {
  title: "Plan Your Catering",
  description: "Plan Halal catering for your celebration in a few simple steps.",
  robots: { index: false, follow: true },
};
export default function Page() {
  return <PlanFlow />;
}
