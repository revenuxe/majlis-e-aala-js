import type { Metadata } from "next";
import TravelProfilePage from "@/routes/travel-profile";
export const metadata: Metadata = {
  title: "Your Travel Profile",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <TravelProfilePage />;
}
