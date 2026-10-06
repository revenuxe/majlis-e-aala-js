import { publicPageMetadata } from "@/lib/seo";
import TravelPackageStart from "@/routes/travel-package-start";
export const metadata = publicPageMetadata({
  title: "Find Your Travel Package",
  description:
    "Choose your traveller count, then explore Umrah, Hajj and holiday packages with estimates for your group.",
  path: "/travel/packages",
});
export default function Page() {
  return <TravelPackageStart />;
}
