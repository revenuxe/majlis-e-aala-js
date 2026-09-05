import type { Metadata } from "next";
import Home from "@/routes/index";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Best Muslim Food Caterers in Bangalore | Majlis E Aala",
  description:
    "Halal catering in Bangalore for weddings, Nikah, Walima and Aqiqah. Enjoy authentic flavours and custom menus with Majlis E Aala.",
  alternates: { canonical: "/" },
  keywords: [
    "Muslim food caterers in Bangalore",
    "Halal catering Bangalore",
    "Nikah catering Bangalore",
    "Walima catering Bangalore",
    "Aqiqah catering Bangalore",
  ],
};

export default function Page() {
  const base = siteUrl;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CateringBusiness",
        "@id": `${base}/#business`,
        name: "Majlis E Aala",
        alternateName: "Majlise Aala",
        url: base,
        logo: `${base}/brand-logo.webp`,
        image: `${base}/brand-logo.webp`,
        telephone: "+91-98862-85028",
        email: "majliseaala@gmail.com",
        priceRange: "₹₹₹",
        address: {
          "@type": "PostalAddress",
          streetAddress: "11, 4th Cross, 2nd Main Rd, Shampura",
          addressLocality: "Bengaluru",
          addressRegion: "Karnataka",
          postalCode: "560045",
          addressCountry: "IN",
        },
        areaServed: { "@type": "City", name: "Bengaluru" },
        servesCuisine: ["Halal", "Indian", "Mughlai"],
        serviceType: [
          "Wedding catering",
          "Nikah catering",
          "Walima catering",
          "Corporate catering",
        ],
        sameAs: ["https://wa.me/919886285028"],
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: "Majlis E Aala",
        publisher: { "@id": `${base}/#business` },
        inLanguage: "en-IN",
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Home />
    </>
  );
}
