import type { Metadata } from "next";
import ContactPage from "@/routes/contact";
export const metadata: Metadata = {
  title: "Contact Majlise Aala",
  description: "Contact Majlise Aala for premium Halal catering in Bengaluru.",
};
export default function Page() {
  return <ContactPage />;
}
