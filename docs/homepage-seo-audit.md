# Homepage SEO audit — 6 October 2026

Tours & Travels is the homepage at `/`. The former catering homepage is retained
at `/catering`. `/travel` permanently redirects to `/`, preserving query strings.
Travel planning, packages and booking routes retain their existing paths.

| Finding                                                                         | Implementation                                                                                                                                     |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root title, description and structured data described catering                  | Travel-specific title, description, TravelAgency, WebSite and WebPage JSON-LD at `/`; catering identity moved to `/catering`                       |
| Default canonical and social URL could identify unrelated pages as the homepage | Removed inherited root URLs; indexable pages supply their own canonical                                                                            |
| Travel hero and catalogue arrived only after browser fetches                    | Public active content is rendered on the server, cached for 60 seconds, and refreshed by client hooks; category pages receive initial package data |
| H1 was initially a loading placeholder                                          | Actual hero title or a descriptive travel fallback is present in initial HTML                                                                      |
| Hero image waited for hydration before becoming visible                         | Initial hero image is visible immediately, with responsive sources and high fetch priority; static fallback remains available                      |
| Category navigation used buttons exclusively in the footer                      | Real category links expose Umrah, Hajj, international and domestic pages to crawlers                                                               |
| Duplicate travel homepage URL                                                   | Request-level 308 redirect and root canonical; sitemap contains `/` rather than `/travel`                                                          |
| Sitemap claimed every page had just changed                                     | Removed fabricated `lastModified`, `changeFrequency` and `priority` entries                                                                        |
| Travel root inherited catering chrome and data provider                         | Travel header/footer at `/`; catering components remain on catering routes                                                                         |

Production metadata also rejects localhost and invalid canonical origins,
falling back to `https://www.majliseaala.com`. Set `NEXT_PUBLIC_SITE_URL` to the
public production origin when deploying to another domain.

Existing FAQs remain visible. No ratings, reviews, operator authorisation,
guaranteed departure availability or travel-office address were invented for
structured data. The catering address remains associated with catering.
Structured data is descriptive and does not guarantee a Google rich result.

Validation: production build, TypeScript, targeted ESLint, and
`SEO_BASE_URL=http://localhost:3001 node scripts/verify-home-seo.mjs` against a
running production server. The script checks initial HTML, metadata, schema,
canonical URLs, redirects, sitemap membership and private-page noindex rules.

Limits: this repository audit cannot measure Search Console impressions, actual
rankings or field Core Web Vitals. After deployment, inspect `/` and `/catering`
in Search Console and submit the updated sitemap. The homepage now serves a
different search intent; the old catering homepage's rankings are not guaranteed
to transfer to `/catering`. This was the requested change, rather than an entire
domain migration. No production deployment or Search Console submission is made
by these code changes.

Sources: [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls),
[Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
[Google JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics),
[Next.js metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata).
