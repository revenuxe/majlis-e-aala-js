import type { Metadata } from "next";
import TravelBookings from "@/routes/travel-bookings";
export const metadata: Metadata = {
  title: "Track Your Travel Booking",
  robots: { index: false, follow: false },
};
export default async function Page({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return <TravelBookings reference={reference} />;
}
