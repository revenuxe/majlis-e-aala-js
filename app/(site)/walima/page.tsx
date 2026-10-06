import { publicPageMetadata } from "@/lib/seo";
import { OccasionLanding } from "@/routes/occasion-landing";
export const metadata = publicPageMetadata({
  title: "Walima Catering in Bangalore | Muslim Wedding Caterers",
  description:
    "Plan your Walima with Majlis E Aala in Bangalore. Explore current catering packages, menu options, biryani and flexible food planning for your celebration.",
  path: "/walima",
});
export default function Page() {
  return <OccasionLanding kind="walima" />;
}
