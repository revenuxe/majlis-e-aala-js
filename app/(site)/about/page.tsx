import { publicPageMetadata } from "@/lib/seo";
import AboutPage from "@/routes/about";
export const metadata = publicPageMetadata({
  title: "About & Our Halal Commitment",
  description: "Read about Majlis E Aala's sourcing, kitchen standards and Halal commitment.",
  path: "/about",
});
export default function Page() {
  return <AboutPage />;
}
