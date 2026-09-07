import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
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
