import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://majliseaala.com";
  return [
    "",
    "/nikah",
    "/walima",
    "/aqiqah",
    "/corporate-events",
    "/packages",
    "/events",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path ? 0.8 : 1,
  }));
}
