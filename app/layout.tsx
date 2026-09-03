import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://majliseaala.com"),
  title: {
    default: "Best Muslim Food Caterers in Bangalore | Majlis E Aala",
    template: "%s | Majlis E Aala",
  },
  description:
    "Majlis E Aala offers premium Halal Muslim catering in Bangalore for Nikah, Walima, Aqiqah, weddings, corporate events, custom menus, buffet service and live counters.",
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Majlis E Aala", locale: "en_IN", url: "/" },
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
