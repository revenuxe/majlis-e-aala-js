const fallbackSiteUrl = "https://majliseaala.com";

/**
 * The Vercel environment can contain an empty string, which `??` does not
 * treat as missing. Keep a valid absolute URL available during prerendering.
 */
export const siteUrl = process.env["NEXT_PUBLIC_SITE_URL"]?.trim() || fallbackSiteUrl;
