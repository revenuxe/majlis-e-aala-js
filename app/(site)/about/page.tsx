import type { Metadata } from "next";
import AboutPage from "@/routes/about";
export const metadata: Metadata = {
  title: "About & Our Halal Commitment",
  description: "Read about Majlise Aala's sourcing, kitchen standards and Halal commitment.",
};
export default function Page() {
  return <AboutPage />;
}
