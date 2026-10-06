import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tours & Travels | Majlis E Aala",
    template: "%s | Majlis E Aala",
  },
  description: "Explore journeys, holidays and catering services with Majlis E Aala.",
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
  openGraph: { type: "website", siteName: "Majlis E Aala", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#FAF8F3", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
