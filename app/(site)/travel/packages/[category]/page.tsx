import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TravelPackages from "@/routes/travel-packages";
import { travelCategories } from "@/lib/travel";

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
    title: `${item.name} Packages | Majlise Aala`,
    description: `Compare ${item.name} journeys, starting prices and package inclusions. Plan your journey with Majlise Aala.`,
    alternates: { canonical: `/travel/packages/${category}` },
  };
}
export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const item = travelCategories.find((entry) => entry.id === category);
  if (!item) notFound();
  return <TravelPackages key={item.id} category={item.id} />;
}
