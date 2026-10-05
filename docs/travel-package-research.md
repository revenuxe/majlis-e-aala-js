# Travel package research and booking improvements

Reviewed operator websites on 6 October 2026. Advertisements are market references, not Majlis prices or verified supplier commitments.

| Operator | Published example | Useful presentation pattern |
| --- | --- | --- |
| [Al Haj Tours](https://www.alhajtoursandtravel.com/) | Budget Umrah: INR 89,000, August 2026–January 2027, quad occupancy. Economy: INR 85,000, June–July 2027, with an advance booking condition. | Show occupancy beside price; explain flights, visa/insurance, accommodation, meals, transfers, guidance and optional practical services. |
| [Yaseen Overseas](https://www.yaseenoverseas.com/umrah-packages-from-bangalore/) | Advertises a lowest fare of INR 79,000, but its associated 4 October departure has passed. October schedules have distinct adult/child/infant fares and hotels. | Departure-specific rates, hotel names, sharing basis, child age bands and availability belong together. Avoid presenting a past departure's fare as today's bookable price. |
| [Maryam Tours](https://maryamtoursandtravels.com/umrah-packages-bangalore) | Bangalore page advertises rates from INR 105,000 tied to August 2026 departures. | Explain airport, hotel proximity and room sharing. Past offers require revalidation. |
| [Al Muqeet Travel](https://almuqeettravel.com/) | Saudi private transfers; fares confirmed by route and vehicle rather than a public complete Umrah package price. | Plan passenger/luggage capacity, family transport, child seats and arrival coordination. This is the website found under the supplied name; identity with any other similarly named operator is unconfirmed. |

## Curated package structure

Use Essentials, Comfort and Private/Family as editable commercial tiers after supplier costs are confirmed. Essentials should describe shared rooms and the precise transport/meal scope. Comfort should specify actual hotels, distances and occupancy rather than an unsupported star rating. Private/Family should specify room and vehicle arrangements, a gentler pace and requested accessibility. Hajj enquiries remain distinct and require the applicable official authorisation route.

Each offer should disclose departure/return dates, adult sharing basis, child and infant rules, flight route/baggage, named hotels or explicit substitution terms, meals, transfers, visa/insurance scope, sightseeing/guidance, assistance availability, excluded charges, payment and cancellation terms. Do not copy another operator's hotel contracts, authorisation claims, permits or inclusions as promises from Majlis.

## Implemented

The planner now uses image-led cards with highlights, prominent price or quotation panels, group adult estimates, clear selection controls and an optional itinerary timeline. Package details include a quotation checklist adapted to pilgrimage or holiday journeys. Seniors are counted within adults, with a 60+ planning checkbox and a bounded count. Balanced/relaxed pace, existing mobility and hotel-distance requests are saved in validated request preferences and shown in admin. Existing drafts default safely to zero seniors and balanced pace. The travel mobile navigation now links Bookings to travel tracking.

Actual package prices are edited in Admin → Listings → Travels → Packages → Indicative adult price (INR). Blank prices intentionally remain quote-only. Competitor advertisements above have not been published as Majlis prices.

Migration: `20261006030000_travel_senior_preferences.sql`. Backend validation, retry semantics and private history protections are covered by the rollback-only `supabase/tests/travel_booking_flow.sql` checks. Browser checks mock submission and verify senior/pace values without creating requests.
