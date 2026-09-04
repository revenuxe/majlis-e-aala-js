import type { Metadata } from "next";
import { Suspense } from "react";
import PackagesPage from "@/routes/packages";
export const metadata: Metadata = {
  title: "Halal Catering Packages in Bangalore",
  description:
    "Browse the current Halal catering packages created by Majlis E Aala for Nikah, Walima, Aqiqah and corporate events in Bangalore.",
  alternates: { canonical: "/packages" },
  openGraph: {
    title: "Halal Catering Packages in Bangalore | Majlis E Aala",
    description:
      "Explore Halal catering packages for Nikah, Walima, Aqiqah and corporate events in Bangalore.",
  },
};
export default function Page() {
  return (
    <Suspense>
      <PackagesPage />
    </Suspense>
  );
}
