# Catering and travel website structure

The catering homepage stays at `/`. The separate travel homepage is `/travel`.
Both use the official logo, existing ivory/black/gold tokens, serif headings,
Manrope UI text, 1280px content width and rounded cards. Travel is linked from the catering navigation and footer. Catering is linked
from the travel footer; there is no service switch above either header.

## UI and UX review

The existing site has a consistent visual language, reusable UI components,
mobile navigation and a progressive catering planner. Its catalogue, hero,
orders, saved menus and account pages are catering-specific. Reusing those
destinations for travel would give visitors the wrong booking journey.

The travel page therefore has its own section navigation and mobile bottom bar.
Categories filter journey cards; details open an accessible dialog; enquiry
buttons prefill the planner. Native FAQ disclosures work with a keyboard.
The travel page does not mount the catering PlanProvider or query its database.

## Homepage content

1. Travel navigation with no service bar above the header.
2. Rounded inset hero with Supabase-managed destination slides, bottom-aligned
   editorial heading and a working journey search, matching the catering hero.
3. Four-item feature strip, matching the catering trust strip.
4. Umrah, Hajj, international and domestic category cards with white title
   panels, choose badges and arrow controls; a traveller-count quick planner
   using the shared catering quantity component and preset-button layout.
5. Filterable journey ideas with duration, destination and planning preferences.
6. Pilgrimage editorial section.
7. Four-step enquiry-to-confirmation explanation.
8. Documents, health, permits and official preparation resources.
9. Step-by-step booking request entry point with guest submission and a reference.
10. FAQs, contact details and mobile quick navigation.

## Research and content decisions

Reviewed on 5 October 2026. Requirements can change; the page links to official
sources rather than publishing fixed visa deadlines or vaccine prescriptions.

- [Nusuk Umrah](https://umrah.nusuk.sa/): pilgrimage planning includes accommodation,
  transportation, visa services and other options. Hotel names, mosque distance,
  occupancy, city nights, transfers and meal arrangements belong in a quotation.
- [Haj Committee of India](https://www.hajcommittee.gov.in/): Hajj uses a separate
  seasonal application and authorisation process. Enquiries must not imply that
  a place or eligibility has been confirmed.
- [Saudi tourist visa](https://visa.visitsaudi.com/Home): a tourist visa does not
  authorise Hajj. Do not promise visa approval or imply universal eligibility.
- [Nusuk](https://www.nusuk.sa/): refer travellers to current permit and appointment
  guidance, including Rawdah availability.
- [Saudi Ministry of Health](https://www.moh.gov.sa/en/healthawareness/pilgrims-health/pages/default.aspx):
  direct travellers to current health requirements for their dates and nationality.

Domestic and international content uses Kerala and Dubai as illustrative
itinerary starting points. None of the cards represents confirmed inventory.
No invented prices, reviews, departure dates, hotel ratings, accreditations,
pilgrim counts or approval guarantees are displayed.

## Configuration and booking structure

Journey cards now read the live Supabase travel catalogue. Edit packages,
departures and incoming requests in **Listings > Travels** in admin.
The step-by-step planner at /travel/plan saves a validated request and returns a
reference. Prices and availability still require a written quotation; it does
not accept payments or reserve inventory. Contact details and FAQs remain in
src/lib/travel.ts. The existing catering phone is reused pending a dedicated
travel contact. See [travel booking](./travel-booking.md) for backend and checks.

## Admin hero management

Open `/admin/dashboard`, select **Homepage**, then **Catering** or **Travels**.
Both use the same slide editor: headline, eyebrow, desktop image, optional
mobile image, visibility and display order. Lower display-order numbers appear
first. Each tab has its own homepage preview link.

Catering continues to use `hero_carousels`. Travels uses `travel_hero_carousels`.
The migration `20261005120000_travel_hero_carousels.sql` creates the travel table
and migrates the three original travel slides into editable rows. It preserves
the existing catering records. Public visitors can read active slides only;
authenticated administrators can create, edit, hide and delete slides.

The travel hero fetches active rows in order on page load and when the browser
tab regains focus. It uses configured mobile artwork below 640px, with desktop
artwork as the fallback. Slides rotate every six seconds, with pause and manual
selection controls. Rotation pauses during interaction and respects reduced
motion. Hiding every slide leaves a neutral heading and the working search form;
hidden slides are not replaced by the original hardcoded content. A connection
failure retains previously loaded slides, or uses the local Makkah image when
none have loaded.

## Photography

Local assets are downloaded from Unsplash; no external image URL is needed to
render the travel homepage. Source image identifiers:

- Makkah courtyard: `photo-1647177156544-0d51fb7c900c`.
- Makkah category: `photo-1720549973451-018d3623b55a`.
- Madinah: `photo-1591604129939-f1efa4d9f7fa`.
- Dubai: `photo-1512453979798-5ea266f8880c`.
- Kerala: `photo-1602216056096-3b40cc0c9944`.
