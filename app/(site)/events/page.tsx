import type { Metadata } from "next";
import EventsPage from "@/routes/events";
export const metadata: Metadata = {
  title: "Event Catering — Weddings, Walima & Aqiqah",
  description:
    "Halal catering for weddings, Nikah, Aqiqah, corporate events and gatherings in Bengaluru.",
};
export default function Page() {
  return <EventsPage />;
}
