import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TravelPackages from "@/routes/travel-packages";
import { travelCategories } from "@/lib/travel";
import { getTravelHomeContent } from "@/lib/travel-home-content";
import { publicPageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";

export const dynamicParams = false;

export function generateStaticParams() {
  return travelCategories.map(({ id }) => ({ category: id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const item = travelCategories.find((entry) => entry.id === category);
  if (!item) return {};
  return publicPageMetadata({
    title: `${item.name} Packages`,
    description: `Compare ${item.name} journeys, starting prices and package inclusions. Plan your journey with Majlis E Aala.`,
    path: `/travel/packages/${category}`,
    image: item.image,
  });
}
export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const item = travelCategories.find((entry) => entry.id === category);
  if (!item) notFound();
  const { packages } = await getTravelHomeContent();
  const categoryPackages = packages.filter((pkg) => pkg.category === item.id);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/travel/packages/${category}#webpage`,
        url: `${siteUrl}/travel/packages/${category}`,
        name: `${item.name} Packages | Majlis E Aala`,
        isPartOf: { "@id": `${siteUrl}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Travel packages",
            item: `${siteUrl}/travel/packages`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${item.name} packages`,
            item: `${siteUrl}/travel/packages/${category}`,
          },
        ],
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <TravelPackages key={item.id} category={item.id} initialPackages={categoryPackages} />
    </>
  );
}
