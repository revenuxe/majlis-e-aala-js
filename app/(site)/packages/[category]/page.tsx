import type { Metadata } from "next";
import { Suspense } from "react";
import PackagesPage from "@/routes/packages";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const name = category.replace(/-/g, " ");
  return { title: `${name} Catering Packages | Majlise Aala` };
}

export default async function EventPackagesPage() {
  return (
    <Suspense>
      <PackagesPage />
    </Suspense>
  );
}
