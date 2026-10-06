import assert from "node:assert/strict";

const base = process.env.SEO_BASE_URL || "http://localhost:3000";
const decode = (text) =>
  text.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'");
function attributes(source) {
  return Object.fromEntries(
    [...source.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], decode(m[2])]),
  );
}
async function page(path) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  return response.text();
}
function metadata(html) {
  const tags = [...html.matchAll(/<meta\b([^>]*)>/g)].map((m) => attributes(m[1]));
  const canonical = [...html.matchAll(/<link\b([^>]*)>/g)]
    .map((m) => attributes(m[1]))
    .filter((a) => a.rel === "canonical");
  const schemas = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter((m) => attributes(m[1]).type === "application/ld+json")
    .map((m) => JSON.parse(m[2]));
  return {
    tags,
    canonical,
    schemas,
    title: decode(html.match(/<title>(.*?)<\/title>/s)?.[1] || ""),
  };
}
const [home, catering, sitemap, robots] = await Promise.all([
  page("/"),
  page("/catering"),
  page("/sitemap.xml"),
  page("/robots.txt"),
]);
const root = metadata(home);
assert.equal(root.title, "Umrah, Hajj & Holiday Travel | Majlis E Aala");
assert.equal(root.canonical.length, 1);
const canonical = new URL(root.canonical[0].href);
assert.equal(canonical.pathname, "/");
if (process.env.SEO_EXPECTED_ORIGIN)
  assert.equal(canonical.origin, process.env.SEO_EXPECTED_ORIGIN);
assert.equal(new URL(root.tags.find((a) => a.property === "og:url")?.content).href, canonical.href);
assert(root.tags.find((a) => a.name === "twitter:image"));
assert(!root.tags.some((a) => a.name === "robots" && a.content.includes("noindex")));
assert.equal([...home.matchAll(/<h1\b/g)].length, 1);
assert(!home.includes("Loading featured journeys"));
assert(home.includes("Umrah journeys, Hajj preparation"));
const graph = root.schemas.flatMap((schema) => schema["@graph"] || [schema]);
assert(graph.some((node) => node["@type"] === "TravelAgency"));
assert(!graph.some((node) => node["@type"] === "CateringBusiness"));
for (const category of ["umrah", "hajj", "international", "domestic"]) {
  const path = `/travel/packages/${category}`;
  assert(home.includes(`href="${path}"`), "Crawlable category link " + category);
  const html = await page(path);
  const categoryMeta = metadata(html);
  assert.equal(new URL(categoryMeta.canonical[0].href).pathname, path);
  assert(categoryMeta.tags.some((tag) => tag.property === "og:image"));
  assert(categoryMeta.tags.some((tag) => tag.name === "twitter:image"));
  assert(
    categoryMeta.schemas.some((schema) =>
      schema["@graph"]?.some((node) => node["@type"] === "BreadcrumbList"),
    ),
  );
  assert(html.includes("<h1"));
  assert(html.includes("<article"), `${path}: package cards must be server-rendered`);
}
const cateringMeta = metadata(catering);
assert.equal(new URL(cateringMeta.canonical[0].href).pathname, "/catering");
assert(
  cateringMeta.schemas
    .flatMap((s) => s["@graph"] || [s])
    .some((node) => node["@type"] === "CateringBusiness"),
);
const redirect = await fetch(base + "/travel?source=legacy", { redirect: "manual" });
assert.equal(redirect.status, 308);
const destination = new URL(redirect.headers.get("location"), base);
assert.equal(destination.pathname, "/");
assert.equal(destination.searchParams.get("source"), "legacy");
const sitemapPaths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
assert(sitemapPaths.includes("/"));
assert(sitemapPaths.includes("/catering"));
assert(!sitemapPaths.includes("/travel"));
assert(!sitemap.includes("<lastmod>"));
assert(!sitemapPaths.some((p) => p.includes("bookings") || p.startsWith("/admin")));
for (const path of sitemapPaths) {
  const html = await page(path);
  const meta = metadata(html);
  assert.equal((meta.title.match(/Majlis E Aala/g) || []).length, 1, `${path}: brand appears once`);
  assert.equal(meta.canonical.length, 1, `${path}: one canonical`);
  assert.equal(new URL(meta.canonical[0].href).pathname, path, `${path}: canonical path`);
  assert(
    meta.tags.some((tag) => tag.name === "description" && tag.content?.length > 20),
    `${path}: description`,
  );
  assert(
    !meta.tags.some((tag) => tag.name === "robots" && tag.content?.includes("noindex")),
    `${path}: indexable`,
  );
}
assert.equal((await fetch(base + "/travel/packages/not-a-category")).status, 404);
assert(robots.includes("Sitemap:"));
assert(robots.includes("Disallow: /admin/"));
for (const path of ["/travel/bookings", "/travel/plan", "/travel/profile", "/travel/saved"]) {
  assert(
    metadata(await page(path)).tags.some(
      (a) => a.name === "robots" && a.content.includes("noindex"),
    ),
    path,
  );
}
console.log(
  "PASS: all sitemap pages return 200 with one branded title, description and canonical; travel social previews, structured data, category links, invalid-category 404, legacy redirect and private-page noindex.",
);
