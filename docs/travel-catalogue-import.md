# Owner catalogue import — 6 October 2026

The complete catalogue supplied in chat is normalised in `supabase/seed-data/travel-catalogue-20261006.json`. The original pasted attachment omitted package headings and five rates; the subsequent complete reply resolves these omissions. Repeated copies in the reply are deduplicated by stable package slug.

## Import scope

| Category | Offers | Treatment |
| --- | ---: | --- |
| Umrah | 17 | Five tiers, Short, Family, four separate Ramadan periods, six combos |
| Hajj | 8 | Four priced tiers and four duration preferences (21/25/30/35 days) requiring individual quotes |
| International | 23 | Each named duration/tier is its own offer; Saudi heritage stays separate from Umrah |
| Domestic | 15 | Each named duration/tier is its own offer; Ajmer and Multi-Ziyarat India use the Ziyarat collection |

Every numeric amount is an owner-supplied starting adult rate, not a fixed charge or an independently verified supplier price. Known sharing bases are retained for the five core Umrah tiers. Unspecified sharing remains explicitly subject to quotation. Ramadan amounts are **seasonal starting guides** and are re-quoted for actual dates and availability. No scheduled departures, airline inventory, hotel contracts, entry permits or Hajj reservations are fabricated by the migration.

Where the source gives destinations or focus points rather than detailed contracted services, the package describes an itinerary plan and clearly asks for the exact service scope in the final quotation. Shorter international variants use their named destination; broader destinations are attached to the longer named Highlights/Explorer variant. Optional Nile cruises, wheelchair arrangements, Samarra access, Zamzam and Haram-facing rooms are not presented as unconditional guarantees. No unsupported hotel names, walking distances, daily dates or refund percentages are added.

## Data protection and pricing

`20261006040000_owner_travel_catalogue.sql` runs in one transaction. It records a restricted before-image in `travel_catalogue_imports`, renames the five original slugs in place, then upserts the new catalogue. Original UUIDs, departure foreign keys, request ownership and historical snapshots remain intact. The import backup is readable only by admins. There are no customer-request updates or deletes.

Original slug mappings: classic-umrah → umrah-economy; private-umrah → family-umrah; hajj-planning → hajj-economy; dubai-discovery → dubai-essentials; kerala-retreat → kerala-highlights.

Database checks enforce coherent pricing mode/amount, supported collections and bounded pricing text. Submission still calculates estimates from the server catalogue and adult count. It snapshots the rate, sharing basis, pricing mode and note alongside the existing package details, so later catalogue edits cannot change a prior request's quoted context. Children, senior assistance, upgrades and extras are not silently priced. Seniors remain part of the adult count.

## Customer and admin experience

The homepage, package selector and final review share one price panel: From amount, adult/sharing basis, optional adult group estimate and an explanation of variable pricing. The homepage detail sheet includes inclusions and exclusions. Search, starting budget, collection and ascending/descending price filters work on the live catalogue; quote-only offers appear after priced offers and are excluded when a numeric budget is selected. Six cards are shown initially with a Show More button. The current selected package remains identified when filters hide its card.

Admin → Listings → Travels → Packages allows editing the starting amount, price presentation, sharing basis, pricing note and collection. Blank amounts use Price on Request. New packages stay hidden until published. Rates and inclusions are editable independently for each named offer.

## Verification and rollback

`supabase/tests/travel_catalogue_pricing.sql` rolls back every test write and covers import counts, preserved UUIDs, price tampering, sharing snapshots, seasonal pricing, quote-only Hajj and backup privacy. `supabase/tests/travel_booking_flow.sql` retains validation, retry and ownership checks. Browser tests intercept booking writes.

For restoration, an authorised administrator can use the stored before-image to restore the original five records by UUID and hide imported offers. Keep any imported package already referenced by a request/departure; do not delete linked records or rewrite booking snapshots. The before-image is deliberately not exposed in the customer application.

`node scripts/build-travel-catalogue.mjs` recreates the local reviewed seed/migration from the owner catalogue definitions. Once the migration is deployed, future commercial edits belong in admin or in a new migration; do not edit/reapply an already published migration.
