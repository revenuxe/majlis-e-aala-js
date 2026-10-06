import type { Metadata } from "next";
import OrdersPage from "@/routes/orders";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Your Catering Orders",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; reference?: string }>;
}) {
  const params = await searchParams;
  if (params.service === "travel")
    redirect(
      params.reference
        ? `/travel/bookings/${encodeURIComponent(params.reference)}`
        : "/travel/bookings",
    );
  return <OrdersPage />;
}
