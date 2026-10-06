import type { Metadata } from "next";
import LegalPage from "@/routes/legal";
export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Majlis E Aala handles your contact details, travel requests and catering bookings, and how to contact us about your personal information.",
  alternates: { canonical: "/privacy" },
};
export default function Page() {
  return <LegalPage type="privacy" />;
}
