import type { Metadata } from "next";
import MyMenu from "@/routes/my-menu";
export const metadata: Metadata = {
  title: "Your Catering Plan",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <MyMenu />;
}
