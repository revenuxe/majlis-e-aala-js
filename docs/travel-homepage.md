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
2. Rounded inset hero with manually selected destination slides, bottom-aligned
   editorial heading and a working journey search, matching the catering hero.
3. Four-item feature strip, matching the catering trust strip.
4. Umrah, Hajj, international and domestic category cards with white title
   panels, choose badges and arrow controls; a traveller-count quick planner
   using the shared catering quantity component and preset-button layout.
5. Filterable journey ideas with duration, destination and planning preferences.
6. Pilgrimage editorial section.
7. Four-step enquiry-to-confirmation explanation.
8. Documents, health, permits and official preparation resources.
9. Enquiry form with departure city, month, travellers and personal preferences.
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

## Configuration and future booking structure

Edit journey content, FAQs and the existing business contact in `src/lib/travel.ts`.
The planner prepares a message; a customer explicitly opens WhatsApp to send it.
It does not save an enquiry, accept payments or confirm a booking. The existing
catering phone is reused pending a dedicated travel contact.

A future travel backend should separately model destinations, travel packages,
departures, city stays, hotels, room occupancy, itinerary days, inclusions,
exclusions and enquiries. Confirm real operating arrangements, contact details,
travel cancellation terms and inventory before adding bookable packages.

## Photography

Local assets are downloaded from Unsplash; no external image URL is needed to
render the travel homepage. Source image identifiers:

- Makkah courtyard: `photo-1647177156544-0d51fb7c900c`.
- Makkah category: `photo-1720549973451-018d3623b55a`.
- Madinah: `photo-1591604129939-f1efa4d9f7fa`.
- Dubai: `photo-1512453979798-5ea266f8880c`.
- Kerala: `photo-1602216056096-3b40cc0c9944`.
