import TravelDates from "@/routes/travel-dates";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Choose Your Travel Dates",
  description: "Choose an upcoming batch or your preferred travel dates.",
  path: "/travel/dates",
});

export default function Page() {
  return <TravelDates />;
}
