import type { Metadata } from "next";
import LegalPage from "@/routes/legal";
export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};
export default function Page() {
  return <LegalPage type="privacy" />;
}
