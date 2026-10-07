/** Enquiry-led itinerary ideas; these are not confirmed departures or bookable inventory. */
export const travelContact = { phone: "919886285028", displayPhone: "+91 98862 85028" };

export const travelCategories = [
  {
    id: "umrah",
    name: "Umrah",
    note: "A journey of devotion",
    image: "https://res.cloudinary.com/dcrauhr1x/image/upload/v1791377604/umrah_image_h7tmay.webp",
  },
  {
    id: "hajj",
    name: "Hajj",
    note: "Prepare for your pilgrimage",
    image: "https://res.cloudinary.com/dcrauhr1x/image/upload/v1791378417/hajj_sjywcb.webp",
  },
  {
    id: "international",
    name: "International",
    note: "Discover a little further",
    image:
      "https://res.cloudinary.com/dcrauhr1x/image/upload/v1791377991/international_image_q0jwxt.webp",
  },
  {
    id: "domestic",
    name: "Domestic",
    note: "Find wonder closer to home",
    image:
      "https://res.cloudinary.com/dcrauhr1x/image/upload/v1791378126/domestic_image_fxo7ol.webp",
  },
] as const;

export type TravelCategory = (typeof travelCategories)[number]["id"];
export type Journey = {
  id: string;
  category: TravelCategory;
  name: string;
  label: string;
  places: string;
  duration: string;
  image: string;
  description: string;
  highlights: string[];
  itinerary: [string, string][];
};

export const journeys: Journey[] = [
  {
    id: "classic-umrah",
    category: "umrah",
    name: "The Essential Umrah",
    label: "A thoughtful first journey",
    places: "Makkah & Madinah",
    duration: "Suggested 10–14 days",
    image: "/travel/makkah.jpg",
    description:
      "Time for worship, a comfortable rhythm, and a stay in both holy cities. Shape the journey around your family and your preferred dates.",
    highlights: [
      "Makkah & Madinah stays",
      "Airport & intercity transfers",
      "Visa and permit guidance",
      "Room sharing options",
    ],
    itinerary: [
      [
        "Arrive & settle in",
        "Discuss flight options, arrival transfers and your preferred hotel in Makkah.",
      ],
      [
        "Time in Makkah",
        "Allow time for Umrah and worship, with optional visits discussed in your itinerary.",
      ],
      [
        "Continue to Madinah",
        "Plan your transfer and stay near the Prophet’s Mosque. Rawdah access is subject to official appointment availability.",
      ],
      [
        "Return home",
        "Confirm your final transfer, baggage allowance and return flight before booking.",
      ],
    ],
  },
  {
    id: "private-umrah",
    category: "umrah",
    name: "Umrah, at Your Pace",
    label: "For families & private groups",
    places: "Makkah & Madinah",
    duration: "Flexible duration",
    image: "/travel/madinah.jpg",
    description:
      "A more personal itinerary with room preferences, a gentler pace and the practical details that matter when travelling with parents or children.",
    highlights: [
      "Private itinerary planning",
      "Hotel distance preferences",
      "Family room requests",
      "Accessibility requests",
    ],
    itinerary: [
      ["Your priorities", "Share your dates, group size, mobility needs and preferred pace."],
      [
        "Your stay",
        "Compare hotel names, actual walking distances and room occupancy before you choose.",
      ],
      ["Your journey", "Discuss private or shared transfers, meals and optional visits."],
      [
        "Your confirmation",
        "Review a written itinerary, inclusions, cancellation terms and total quotation.",
      ],
    ],
  },
  {
    id: "hajj-planning",
    category: "hajj",
    name: "Your Hajj Preparation",
    label: "Guidance & planning",
    places: "Makkah, Mina, Arafat & Muzdalifah",
    duration: "Seasonal pilgrimage",
    image: "/travel/makkah.jpg",
    description:
      "Start with the correct application route, current eligibility and official arrangements. Hajj enquiries are handled separately from Umrah.",
    highlights: [
      "Official application resources",
      "Document preparation",
      "Health requirement checklist",
      "Questions for your operator",
    ],
    itinerary: [
      [
        "Check the official route",
        "Review Haj Committee of India guidance or the applicable authorised operator route.",
      ],
      [
        "Prepare your documents",
        "Verify passport, application and medical requirements using the current official guidance.",
      ],
      [
        "Understand arrangements",
        "Request written details for accommodation, transport, camp arrangements and assistance.",
      ],
      [
        "Confirm before payment",
        "Hajj requires the appropriate authorisation. An enquiry does not reserve a place or confirm eligibility.",
      ],
    ],
  },
  {
    id: "dubai-discovery",
    category: "international",
    name: "Dubai & Beyond",
    label: "City escapes",
    places: "Dubai & Abu Dhabi",
    duration: "Suggested 5–7 days",
    image: "/travel/dubai.jpg",
    description:
      "Modern skylines, a slower evening by the water and time to explore. Choose the balance of sightseeing and relaxation that suits you.",
    highlights: [
      "Hotel preferences",
      "Flight options",
      "Optional city experiences",
      "Visa guidance",
    ],
    itinerary: [
      ["Arrive in Dubai", "Choose your hotel area and arrival transfer."],
      ["Discover the city", "Discuss sightseeing, waterfront walks and optional attractions."],
      ["Explore further", "Add an Abu Dhabi visit or a free day at your own pace."],
      ["Head home", "Arrange your return transfer and flight."],
    ],
  },
  {
    id: "kerala-retreat",
    category: "domestic",
    name: "A Little Time in Kerala",
    label: "Nature & slower days",
    places: "Kochi, Munnar & Alleppey",
    duration: "Suggested 5–6 days",
    image: "/travel/kerala.jpg",
    description:
      "Tea-covered hills, peaceful backwaters and a change of pace. An easy starting point for a family holiday or a private getaway.",
    highlights: [
      "Flexible sightseeing",
      "Stay preferences",
      "Private vehicle requests",
      "Houseboat options",
    ],
    itinerary: [
      ["A warm welcome in Kochi", "Begin with a comfortable arrival and time to settle in."],
      ["Into the hills", "Explore Munnar with a route and pace matched to your group."],
      ["By the backwaters", "Discuss a houseboat experience or a relaxed stay near Alleppey."],
      ["Return refreshed", "Plan the drive back around your flight or train."],
    ],
  },
];

export const travelFAQs = [
  [
    "How do I get a travel quotation?",
    "Choose a journey, share your departure city, approximate dates and number of travellers. Use our step-by-step planner to review and submit your request. Sign in to save your contact details and see requests in your account, or continue as a guest. You'll receive a reference, and our team will discuss an itinerary and a written quotation. No payment is required to enquire.",
  ],
  [
    "What should an Umrah quotation include?",
    "Ask for hotel names and distances from the mosques, room sharing, nights in each city, flights and baggage, transfers, meals, visa assistance and any guidance services. Confirm inclusions, exclusions and cancellation terms in writing.",
  ],
  [
    "Are Hajj and Umrah bookings the same?",
    "No. Hajj has a specific season and requires the appropriate official authorisation. An Umrah or tourist visa does not authorise Hajj. Check current Haj Committee of India or relevant official guidance before making arrangements.",
  ],
  [
    "Can I travel with children or elderly parents?",
    "Share ages, mobility needs and room preferences when enquiring. Discuss hotel walking distances, wheelchair arrangements, transfer access and rest days before confirming your trip. Assistance is subject to availability.",
  ],
  [
    "Are flights, visas and meals included?",
    "Inclusions depend on your final quotation. These itinerary ideas do not represent fixed packages. Ask the team to clearly list flights, meals, transfers, visa services, taxes and any extra charges.",
  ],
  [
    "What about permits and health requirements?",
    "Requirements can change by season and nationality. Check Nusuk for relevant permits and appointments, Saudi Ministry of Health for current health guidance, and your airline or authorised operator before departure. Permits and visas are subject to official approval.",
  ],
];

export function travelWhatsApp(message: string) {
  return `https://wa.me/${travelContact.phone}?text=${encodeURIComponent(message)}`;
}
