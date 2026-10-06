# SEO and booking audit — 6 October 2026

The production build, TypeScript and ESLint checks passed. Checks ran against a local `next start` server; no customer bookings were created.

## SEO

- Every sitemap URL returned HTTP 200 with one title containing **Majlis E Aala**, a description and one canonical URL pointing to that page.
- Travel category pages include Open Graph and Twitter images, CollectionPage and breadcrumb structured data. Invalid travel categories return 404.
- The homepage retains TravelAgency and WebSite structured data. Catering keeps its own business schema.
- Public packages render in the initial HTML; catalogue snapshots refresh every minute. The verified Umrah response contained six package cards before JavaScript ran.
- Booking, account and admin pages remain excluded from indexing. The sitemap excludes private pages and the legacy `/travel` URL.
- Internal travel links use `/` directly. The legacy `/travel` redirect remains for existing bookmarks; authentication redirects remain necessary for sign-in.

Metadata follows the [Next.js metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata). Canonicals, crawlable content and private-page indexing rules follow [Google’s developer guidance](https://developers.google.com/search/docs/fundamentals/get-started-developers).

## Booking and navigation

- Tested guest and signed-in flows, child-age validation, incomplete draft restoration, traveller estimates, package selection, preference retention and review validation.
- Checked 320px, 390px and 1280px layouts for page overflow and collapsed scrolling cards.
- Verified package selection uses client navigation, banner Back returns one step, Change opens traveller editing, and child ages appear before senior citizen controls.
- Catalogue refreshes retain existing cards. Package and departure failures recover independently with retry; requests have a timeout and are cancelled when superseded or unmounted.
- Verified failed submissions preserve contact fields and retry with the same request token. A synchronous submission guard prevents overlapping writes.
- Tested OAuth resume, saved profile prefill, profile-sync failure isolation, account history, tracking, cancellation rules and safe callback destinations with mocked responses.
- Added route loading placeholders and a recoverable application error boundary.

## Limits of verification

Live booking writes, live OAuth provider configuration, deployed Core Web Vitals and search-engine indexing were not verified. Booking/authentication mutations were mocked; catalogue reads used the public API. Search ranking and production uptime cannot be established by local tests.

Repeatable checks: `scripts/verify-home-seo.mjs`, `scripts/verify-travel-navigation.mjs`, `scripts/verify-travel-booking.mjs`, `scripts/verify-travel-pricing.mjs` and `scripts/verify-travel-auth.mjs`. Browser checks require an isolated Chrome debugging session; the navigation test supports `SEO_BASE_URL` and `CHROME_DEBUG_URL`.
