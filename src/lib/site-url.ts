const fallbackSiteUrl = "https://www.majliseaala.com";

/**
 * The Vercel environment can contain an empty string, which `??` does not
 * treat as missing. Keep a valid absolute URL available during prerendering.
 */
function canonicalOrigin() {
  try {
    const configured = new URL(process.env["NEXT_PUBLIC_SITE_URL"]?.trim() || fallbackSiteUrl);
    if (!["http:", "https:"].includes(configured.protocol)) return fallbackSiteUrl;
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(configured.hostname);
    if (process.env.NODE_ENV === "production" && local) return fallbackSiteUrl;
    return configured.origin;
  } catch {
    return fallbackSiteUrl;
  }
}
export const siteUrl = canonicalOrigin();
