import type { Metadata } from "next";
import LegalPage from "@/routes/legal";
export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: "/terms" },
};
export default function Page() {
  return <LegalPage type="terms" />;
}
