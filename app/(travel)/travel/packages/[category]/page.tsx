import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TravelPackages from "@/routes/travel-packages";
import { travelCategories } from "@/lib/travel";
import { getTravelHomeContent } from "@/lib/travel-home-content";

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
  return {
    title: { absolute: `${item.name} Packages | Majlise Aala Tours & Travels` },
    description: `Compare ${item.name} journeys, starting prices and package inclusions. Plan your journey with Majlise Aala.`,
    alternates: { canonical: `/travel/packages/${category}` },
  };
}
export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const item = travelCategories.find((entry) => entry.id === category);
  if (!item) notFound();
  const { packages } = await getTravelHomeContent();
  return (
    <TravelPackages
      key={item.id}
      category={item.id}
      initialPackages={packages.filter((pkg) => pkg.category === item.id)}
    />
  );
}
