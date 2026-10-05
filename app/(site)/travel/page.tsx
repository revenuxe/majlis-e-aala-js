import type { Metadata } from "next";
import TravelHome from "@/routes/travel";

export const metadata: Metadata = {
  title: { absolute: "Tours & Travels | Umrah, Hajj & Holidays | Majlise Aala" },
  description:
    "Explore Umrah journey ideas, Hajj preparation, international escapes and domestic holidays. Plan a personal itinerary with Majlise Aala Tours & Travels.",
  alternates: { canonical: "/travel" },
  openGraph: {
    title: "Journeys with meaning | Majlise Aala Tours & Travels",
    description: "Thoughtfully planned pilgrimages and holidays, shaped around you.",
    url: "/travel",
    images: [{ url: "/travel/makkah.jpg", alt: "The Kaaba in Makkah" }],
  },
};

export default function Page() {
  return <TravelHome />;
}
