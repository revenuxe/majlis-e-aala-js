import type { Metadata } from "next";
import TravelHome from "@/routes/travel";
import { siteUrl } from "@/lib/site-url";
import { getTravelHomeContent } from "@/lib/travel-home-content";

const title = "Umrah, Hajj & Holiday Travel | Majlis E Aala";
const description =
  "Plan Umrah journeys, Hajj preparation, international trips and domestic holidays with Majlis E Aala Tours & Travels. Request a personalised travel quotation.";
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Majlis E Aala Tours & Travels",
    title,
    description,
    url: "/",
    images: [{ url: "/travel/makkah.jpg", alt: "The Kaaba in Makkah" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/travel/makkah.jpg"] },
};
export default async function Page() {
  const content = await getTravelHomeContent();
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": `${siteUrl}/#travel-agency`,
        name: "Majlis E Aala Tours & Travels",
        url: siteUrl,
        logo: `${siteUrl}/brand-logo.webp`,
        image: `${siteUrl}/travel/makkah.jpg`,
        telephone: "+91-98862-85028",
        description,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Majlis E Aala",
        alternateName: "Majlise Aala",
        publisher: { "@id": `${siteUrl}/#travel-agency` },
        inLanguage: "en-IN",
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: siteUrl,
        name: title,
        description,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#travel-agency` },
        inLanguage: "en-IN",
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <TravelHome initialContent={content} />
    </>
  );
}
