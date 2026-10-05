import type { Metadata } from "next";
import TravelPackageStart from "@/routes/travel-package-start";
export const metadata: Metadata = {
  title: "Find Your Travel Package | Majlise Aala",
  description:
    "Choose your traveller count, then explore Umrah, Hajj and holiday packages with estimates for your group.",
  alternates: { canonical: "/travel/packages" },
};
export default function Page() {
  return <TravelPackageStart />;
}
