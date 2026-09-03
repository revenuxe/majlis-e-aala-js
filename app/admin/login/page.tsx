import type { Metadata } from "next";
import AdminLogin from "@/routes/admin.login";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false, follow: false } };
export default function Page() {
  return <AdminLogin />;
}
