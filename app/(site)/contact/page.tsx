import { publicPageMetadata } from "@/lib/seo";
import ContactPage from "@/routes/contact";
export const metadata = publicPageMetadata({
  title: "Contact",
  description: "Contact Majlis E Aala for premium Halal catering in Bengaluru.",
  path: "/contact",
});
export default function Page() {
  return <ContactPage />;
}
