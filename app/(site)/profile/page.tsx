import type { Metadata } from "next";
import ProfilePage from "@/routes/profile";
export const metadata: Metadata = {
  title: "Your Profile & Saved Menus",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <ProfilePage />;
}
