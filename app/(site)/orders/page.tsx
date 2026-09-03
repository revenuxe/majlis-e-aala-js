import type { Metadata } from "next";
import OrdersPage from "@/routes/orders";
export const metadata: Metadata = {
  title: "Your Catering Orders",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <OrdersPage />;
}
