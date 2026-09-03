import type { Metadata } from "next";
import NikahPage from "@/routes/nikah";

export const metadata: Metadata = {
  title: "Nikah Catering in Bangalore | Muslim Wedding Caterers",
  description:
    "Plan your Nikah with Majlis E Aala in Bangalore. Explore Halal-friendly menus, traditional Muslim wedding dishes, biryani and flexible Nikah catering packages.",
  alternates: { canonical: "/nikah" },
  openGraph: {
    title: "Muslim Wedding & Nikah Catering in Bangalore | Majlis E Aala",
    description: "Halal-friendly menus, biryani and flexible Nikah catering packages in Bangalore.",
  },
};

export default function Page() {
  return <NikahPage />;
}
