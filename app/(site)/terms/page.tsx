import type { Metadata } from "next";
import LegalPage from "@/routes/legal";
export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms for Majlis E Aala travel enquiries and catering services, including quotations, booking arrangements and cancellations.",
  alternates: { canonical: "/terms" },
};
export default function Page() {
  return <LegalPage type="terms" />;
}
