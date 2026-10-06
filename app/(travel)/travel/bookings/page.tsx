import type { Metadata } from "next";
import TravelBookings from "@/routes/travel-bookings";
export const metadata: Metadata = {
  title: "Your Travel Bookings",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <TravelBookings />;
}
