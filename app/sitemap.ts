import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/travel",
    "/travel/packages",
    "/travel/packages/umrah",
    "/travel/packages/hajj",
    "/travel/packages/international",
    "/travel/packages/domestic",
    "/nikah",
    "/walima",
    "/aqiqah",
    "/corporate-events",
    "/packages",
    "/about",
    "/contact",
    "/blog",
    "/blog/muslim-wedding-catering-bangalore-menu-guide",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path ? 0.8 : 1,
  }));
}
