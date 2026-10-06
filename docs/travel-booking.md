# Travel booking requests

The `/travel/plan` planner follows the catering planner's visual style, quantity
controls, saved choices, sticky action and editable review. It uses seven steps:
journey, dates/departure, travellers, package, preferences, optional sign-in,
and review/contact. Visitors can submit as guests or sign in and receive a
`MAT-…` request reference. This is an
enquiry requiring a written quotation and availability confirmation, not a paid
reservation or ticket. The existing catering planner stays independent.

## Admin

In `/admin/dashboard`, choose **Listings → Travels**. The sibling **Catering**
tab contains its packages, event categories, menu categories, menu items and add-ons.

- **Packages:** create/edit category, content, artwork, itinerary, inclusions,
  exclusions, cancellation terms, adult rate, visibility and display order.
  A blank adult rate means quotation required. Hiding a package removes it from
  public selection without deleting historical requests.
- **Departures:** offer package-specific dates, departure cities, notes and an
  optional maximum group size. Past/hidden departures are not publicly offered.
  The maximum group size is a planning limit, not remaining seat inventory.
- **Requests:** view contact details, child ages, travel preferences and the
  package snapshot captured at submission. Filter by status, load older requests,
  enter a final quotation and maintain internal notes. Quoted/confirmed statuses
  require a quotation total. Contact the customer and send written terms separately.

The original five itinerary ideas retain their UUIDs in the owner-approved
63-offer catalogue imported on 6 October 2026. Starting prices, sharing bases,
seasonal guides and inclusions are documented in [travel-catalogue-import.md](travel-catalogue-import.md).
Homepage cards and planner choices read the same live catalogue. Contact details
and FAQs remain in `src/lib/travel.ts`.

## Service-specific orders and tracking

Admin **Orders → Catering / Travel** keeps the two record types separate.
Catering uses `orders`; Travel uses `travel_booking_requests` and reuses the same
request editor as Listings, including quotations, status and internal notes.
The Travel Orders view does not fetch or show package/departure editors.

Customer `/orders` offers **Catering Booking / Travel Booking** tabs. Profile
cards identify the service and link directly to the appropriate reference.
Tracking labels use actual stored statuses: received, contacted/planning,
quotation shared, confirmed, completed. Cancelled bookings show cancellation,
without implying a completed event or journey. Refresh controls and window-focus
reloads retrieve current database status. Auth changes clear customer records.
The old shared-device catering history cache is removed; signed-in database
records are the source of truth, with stale fetches discarded after account changes.
Travel reference lookups use `get_my_travel_booking`, filtered by `auth.uid()`;
an invalid or foreign reference displays an unavailable message. No customer can
read internal admin notes or another customer's booking.

## Backend permissions

`travel_packages`, `travel_departures` and `travel_booking_requests` have RLS.
Guests read active packages and upcoming active departures only. The full request
table and internal notes are readable only by administrators. Signed-in customers
see their own requests through `get_my_travel_bookings`, which returns only history
fields, filtered by `auth.uid()`. Administrators can update
request status, quotation total and internal notes; contact details and historical
snapshots cannot be overwritten through the authenticated table API.

`submit_travel_booking(jsonb)` is the only public write entry point. It validates
journey/category compatibility, dates, counts, child ages, preferences, contact
details and explicit contact consent. It checks package/departure availability
again and derives adult estimates and package snapshots from the database.
Children and requested extras are quoted separately. A per-session UUID prevents
duplicate requests after a failed response; the same token/phone returns the
same reference. Five new requests per phone per hour are allowed. This throttle
is not a replacement for a dedicated bot-protection service if abuse appears.

Non-contact choices are saved in local storage. Names, phones, email addresses,
free-text notes and consent are not persisted in the local-storage draft. Notes
temporarily use session storage (one-hour expiry) so they survive an authentication
redirect. Draft storage is optional; successful submissions clear it. Signed-in
contact profiles are saved separately under the user ID and Supabase metadata,
and prefill later requests. Profile-sync failure does not invalidate a saved request.
The database records consent time.

Shared `BookingAuth` supports email/password, email-confirmation notices and Google
OAuth. `/auth/callback` exchanges the PKCE code, writes session cookies and permits
only `/plan`, `/travel/plan` or `/profile` return destinations. Travel redirects
resume at review after authentication, preserving choices and the request token.
Supabase Auth must have Google configured and the application's `/auth/callback`
URLs allowed for localhost and production. See the
[official Google setup guide](https://supabase.com/docs/guides/auth/social-login/auth-google).
The connected project has Google and email login enabled. Its production redirect
rules were retained, and callback URLs for `localhost:3000` and `127.0.0.1:3000`
were added on 6 October 2026. Only the redirect allowlist is managed by the new
`[auth]` entry in `supabase/config.toml`.

No payment processing, automatic email/WhatsApp sending, live transport/hotel
inventory, or permit issuance is included. Those need real supplier integrations
and agreed commercial rules before they can be offered.

## Verification

Build: `npm run build`. Focused ESLint covers the changed travel/admin files.

Backend checks (all writes roll back):

```
npx supabase db query --linked --project-ref <project-ref> --file supabase/tests/travel_booking_flow.sql
```

Browser checks: run the app at port 3000 and a test Chrome profile with
`--headless=new --remote-debugging-port=9226`, then run
`node scripts/verify-travel-booking.mjs`. Booking POSTs are mocked: validation,
incomplete draft restoration, real catalogue selection, consent, contact privacy,
320/390/1280px layout, failure preservation and safe retry are checked without
creating customer records. Admin editors were also checked with mocked writes.
`node scripts/verify-travel-auth.mjs` additionally checks shared authentication,
confirmation notices, profile prefill, restored review, signed-in submission,
profile-sync failure isolation, account history and safe callback redirects.
It mocks auth/booking writes and does not complete a real Google account login.

## Travel booking cancellation and deletion

Migration `20261006060000_travel_booking_cancellation_and_deletion.sql` preserves
existing bookings and adds two restricted RPCs. Signed-in customers can cancel
their own requests only while the database status is `new` (Travel request
received). The button is hidden for every later status. Requests still in that
state refresh every 30 seconds while visible, as well as on focus and manual
refresh. The server checks the current status atomically even if the page is stale.

Admins can permanently delete a travel booking from its request editor after
confirmation. Customer cancellation retains the booking history. Admin updates
check the originally loaded status so they cannot overwrite a newer cancellation.
Deletion does not remove the package, departure, or any other booking.

Rollback-only permission and status checks:

```
npx supabase db query --linked --project-ref <project-ref> --file supabase/tests/travel_booking_actions.sql
```

The auth browser script also checks cancellation visibility and a mocked
cancellation from the individual travel booking page.

## Research

Reviewed 6 October 2026. Guest entry and fewer required fields follow
[Baymard's checkout research](https://baymard.com/learn/checkout-flow-ux-optimization).
Pilgrimage planning and quotation content are informed by
[Nusuk Umrah](https://umrah.nusuk.sa/). Official Hajj routes and eligibility still
require current authorisation checks; selecting Hajj does not reserve a place.
