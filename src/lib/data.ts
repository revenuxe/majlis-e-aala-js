import biryaniImg from "@/assets/cat-biryani.jpg";
import kebabImg from "@/assets/cat-kebabs.jpg";
import mainsImg from "@/assets/cat-mains.jpg";
import dessertImg from "@/assets/cat-desserts.jpg";
import weddingImg from "@/assets/editorial-wedding.jpg";

export type DietType = "veg" | "nonveg";

export interface Category {
  id: string;
  name: string;
  image: string;
  items: number;
}

export interface Dish {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  price: number;
  serves: string;
  diet: DietType;
  image: string;
  tags?: ("bestseller" | "premium" | "most-loved")[];
}

export interface Occasion {
  id: string;
  name: string;
  image: string;
}

export interface PackageSection {
  title: string;
  items: string[];
}

export interface CateringPackage {
  id: string;
  name: string;
  tagline: string;
  /** Base package price; the range indicates the included guest capacity. */
  pricePerMann: number;
  guestsPerMann: number;
  guestCountFrom?: number;
  guestCountTo?: number;
  eventCategoryId?: string | null;
  foodPreference?: "veg" | "nonveg" | "mixed";
  includedServices?: string[];
  excludedServices?: string[];
  serviceOptions?: string[];
  sections: PackageSection[];
  signature?: boolean;
}

/** Catering is quoted in "Mann" — one Mann serves 100 guests. */
export const GUESTS_PER_MANN = 100;

export const mannsFor = (guests: number, guestsPerMann = GUESTS_PER_MANN) =>
  Math.max(1, Math.ceil(guests / guestsPerMann));

export const packageTotalFor = (pkg: CateringPackage, guests: number) =>
  Math.round(pkg.pricePerMann * packagePriceMultiplier(pkg, guests));

export const packagePriceMultiplier = (pkg: CateringPackage, guests: number) => {
  const from = pkg.guestCountFrom ?? pkg.guestsPerMann;
  const to = pkg.guestCountTo ?? pkg.guestsPerMann;
  const selectedGuests = Math.max(1, guests);
  // The listed package price covers its stated range. Below the range, the
  // estimate scales from the lower included count; above it, from the upper.
  if (selectedGuests < from) return selectedGuests / from;
  if (selectedGuests > to) return selectedGuests / to;
  return 1;
};

export const packageGuestRange = (pkg: CateringPackage) => {
  const from = pkg.guestCountFrom ?? pkg.guestsPerMann;
  const to = pkg.guestCountTo ?? pkg.guestsPerMann;
  return from === to ? `${to} guests` : `${from}–${to} guests`;
};

export const packageGuestFit = (pkg: CateringPackage, guests: number) => {
  const from = pkg.guestCountFrom ?? pkg.guestsPerMann;
  const to = pkg.guestCountTo ?? pkg.guestsPerMann;
  if (guests < from) return "below" as const;
  if (guests > to) return "above" as const;
  return "within" as const;
};

export const perGuestFor = (pkg: CateringPackage, guests: number) =>
  Math.round(packageTotalFor(pkg, guests) / Math.max(1, guests));

export const categories: Category[] = [
  { id: "biryani", name: "Signature Biryani", image: biryaniImg, items: 8 },
  { id: "kebabs", name: "Grills & Kebabs", image: kebabImg, items: 11 },
  { id: "mains", name: "Main Course", image: mainsImg, items: 14 },
  { id: "desserts", name: "Desserts", image: dessertImg, items: 9 },
];

export const menuFilters = [
  "All",
  "Starters",
  "Biryani",
  "Kebabs",
  "Main Course",
  "Rice",
  "Breads",
  "Desserts",
  "Drinks",
  "Live Counters",
] as const;

export const occasions: Occasion[] = [
  { id: "wedding", name: "Wedding", image: weddingImg },
  { id: "walima", name: "Walima", image: weddingImg },
  { id: "nikah", name: "Nikah", image: dessertImg },
  { id: "aqiqah", name: "Aqiqah", image: mainsImg },
  { id: "family", name: "Family Gathering", image: biryaniImg },
  { id: "corporate", name: "Corporate", image: kebabImg },
  { id: "birthday", name: "Birthday", image: dessertImg },
  { id: "iftar", name: "Iftar", image: mainsImg },
  { id: "eid", name: "Eid", image: biryaniImg },
  { id: "private", name: "Private Event", image: weddingImg },
];

export const dishes: Dish[] = [
  {
    id: "chicken-dum-biryani",
    name: "Chicken Dum Biryani",
    categoryId: "Biryani",
    description: "Slow-cooked chicken layered with aromatic basmati rice and house spices.",
    price: 1499,
    serves: "Serves 5–6",
    diet: "nonveg",
    image: biryaniImg,
    tags: ["bestseller", "most-loved"],
  },
  {
    id: "mutton-dum-biryani",
    name: "Mutton Dum Biryani",
    categoryId: "Biryani",
    description: "Tender mutton sealed and dum-cooked with long grain basmati.",
    price: 2199,
    serves: "Serves 5–6",
    diet: "nonveg",
    image: biryaniImg,
    tags: ["premium", "most-loved"],
  },
  {
    id: "jeera-rice",
    name: "Jeera Rice",
    categoryId: "Rice",
    description: "Fragrant basmati tempered with cumin and ghee.",
    price: 699,
    serves: "Serves 5–6",
    diet: "veg",
    image: biryaniImg,
  },
  {
    id: "chicken-65",
    name: "Chicken 65",
    categoryId: "Starters",
    description: "Crisp fried chicken tossed with curry leaf and chilli.",
    price: 899,
    serves: "Serves 5–6",
    diet: "nonveg",
    image: kebabImg,
    tags: ["bestseller"],
  },
  {
    id: "chicken-malai-tikka",
    name: "Chicken Malai Tikka",
    categoryId: "Kebabs",
    description: "Creamy cardamom marinade, char-grilled to a soft finish.",
    price: 1099,
    serves: "Serves 5–6",
    diet: "nonveg",
    image: kebabImg,
    tags: ["most-loved"],
  },
  {
    id: "seekh-kebab",
    name: "Seekh Kebab",
    categoryId: "Kebabs",
    description: "Hand-rolled minced kebabs grilled over open coal.",
    price: 999,
    serves: "Serves 5–6",
    diet: "nonveg",
    image: kebabImg,
  },
  {
    id: "mutton-seekh-kebab",
    name: "Mutton Seekh Kebab",
    categoryId: "Kebabs",
    description: "Spiced mutton mince, smoky and rich off the skewer.",
    price: 1399,
    serves: "Serves 5–6",
    diet: "nonveg",
    image: kebabImg,
    tags: ["premium"],
  },
  {
    id: "tandoori-chicken",
    name: "Tandoori Chicken",
    categoryId: "Kebabs",
    description: "Overnight yoghurt marinade, finished in a clay tandoor.",
    price: 1199,
    serves: "Serves 4–5",
    diet: "nonveg",
    image: kebabImg,
  },
  {
    id: "chicken-korma",
    name: "Chicken Korma",
    categoryId: "Main Course",
    description: "Slow simmered in cashew, yoghurt and warm whole spices.",
    price: 1299,
    serves: "Serves 5–6",
    diet: "nonveg",
    image: mainsImg,
    tags: ["most-loved"],
  },
  {
    id: "mutton-korma",
    name: "Mutton Korma",
    categoryId: "Main Course",
    description: "A royal preparation of mutton in a silky spiced gravy.",
    price: 1899,
    serves: "Serves 5–6",
    diet: "nonveg",
    image: mainsImg,
    tags: ["premium"],
  },
  {
    id: "butter-chicken",
    name: "Butter Chicken",
    categoryId: "Main Course",
    description: "Tandoori chicken folded into a mellow tomato butter gravy.",
    price: 1349,
    serves: "Serves 5–6",
    diet: "nonveg",
    image: mainsImg,
    tags: ["bestseller"],
  },
  {
    id: "paneer-butter-masala",
    name: "Paneer Butter Masala",
    categoryId: "Main Course",
    description: "Soft paneer in a gently sweet tomato and cream gravy.",
    price: 1099,
    serves: "Serves 5–6",
    diet: "veg",
    image: mainsImg,
  },
  {
    id: "dal-makhani",
    name: "Dal Makhani",
    categoryId: "Main Course",
    description: "Black lentils simmered overnight with butter and cream.",
    price: 899,
    serves: "Serves 5–6",
    diet: "veg",
    image: mainsImg,
  },
  {
    id: "butter-naan",
    name: "Butter Naan",
    categoryId: "Breads",
    description: "Tandoor-baked naan brushed with clarified butter.",
    price: 320,
    serves: "20 pieces",
    diet: "veg",
    image: mainsImg,
  },
  {
    id: "rumali-roti",
    name: "Rumali Roti",
    categoryId: "Breads",
    description: "Feather-thin handkerchief bread, made to order.",
    price: 280,
    serves: "20 pieces",
    diet: "veg",
    image: mainsImg,
  },
  {
    id: "shahi-tukda",
    name: "Shahi Tukda",
    categoryId: "Desserts",
    description: "Saffron rabri over golden fried bread, finished with pistachio.",
    price: 799,
    serves: "Serves 5–6",
    diet: "veg",
    image: dessertImg,
    tags: ["bestseller"],
  },
  {
    id: "gulab-jamun",
    name: "Gulab Jamun",
    categoryId: "Desserts",
    description: "Warm milk dumplings soaked in cardamom syrup.",
    price: 549,
    serves: "20 pieces",
    diet: "veg",
    image: dessertImg,
  },
  {
    id: "fruit-custard",
    name: "Fruit Custard",
    categoryId: "Desserts",
    description: "Chilled custard with seasonal fruit, lightly sweetened.",
    price: 599,
    serves: "Serves 5–6",
    diet: "veg",
    image: dessertImg,
  },
  {
    id: "falooda",
    name: "Falooda",
    categoryId: "Drinks",
    description: "Rose, vermicelli and basil seed served chilled.",
    price: 649,
    serves: "10 glasses",
    diet: "veg",
    image: dessertImg,
  },
  {
    id: "live-chaat",
    name: "Live Chaat Counter",
    categoryId: "Live Counters",
    description: "A manned counter serving assembled-to-order chaat.",
    price: 6500,
    serves: "Up to 100 guests",
    diet: "veg",
    image: mainsImg,
    tags: ["premium"],
  },
];

export const packages: CateringPackage[] = [
  {
    id: "classic",
    name: "Classic Package",
    tagline: "A complete, well-judged spread for family functions.",
    pricePerMann: 100000,
    guestsPerMann: GUESTS_PER_MANN,
    sections: [
      { title: "Welcome Drink", items: ["Mango Badam -or- Arabian Grape"] },
      { title: "Starter", items: ["Chicken Keshu Kabab"] },
      {
        title: "Main Course",
        items: [
          "Butter Chicken Gravy",
          "Rumali Roti",
          "Coin Parota & Seviyan",
          "Mutton Biriyani",
          "Brinjal Chutney",
          "Curd Chutney",
          "Mineral Water",
          "Crockery",
          "Service",
        ],
      },
      { title: "Desserts", items: ["Dal Sweet", "Gajar ka Halwa"] },
      { title: "Fun Food Counter", items: ["Ice Cream", "Soft Drink", "Pan Beeda"] },
      {
        title: "Spl. Groom Table",
        items: ["Fish Fry", "Teetar", "My Cans", "Lolly Pop Chicken", "Leg Fry"],
      },
    ],
  },
  {
    id: "supreme",
    name: "Supreme Package",
    tagline: "Two starters with a full biryani course and refreshment stations.",
    pricePerMann: 125000,
    guestsPerMann: GUESTS_PER_MANN,
    sections: [
      {
        title: "Main Course (2 Starters)",
        items: [
          "Chicken Karaipak",
          "Double Dum Kabab",
          "Methi Chicken Gravy / Butter Chicken",
          "Coin Parola / Tandoori Kulcha",
          "Rumali Roti / Seviyan",
        ],
      },
      {
        title: "Biryani",
        items: [
          "Mutton Biryani",
          "Brinjal Curry / Dall Cha",
          "Curd Chatni",
          "Dessert (2 Sweet)",
          "Carrot Halwa",
          "Pine Apple Spl. Sweet",
        ],
      },
      {
        title: "Refreshment Stations",
        items: [
          "Ice Cream",
          "Pan Beeda",
          "Soft Drink",
          "Tea Counter",
          "Pop Corn",
          "Sugar Candy",
          "Fruit Stall",
        ],
      },
      {
        title: "Family Grand Table (30 Members)",
        items: [
          "Mutton Chops",
          "Fish Fry",
          "Teetar Fry",
          "Tandoori Chicken",
          "Kalmi Chicken",
          "Chicken Paal",
          "Cool Drinks",
        ],
      },
    ],
  },
  {
    id: "deluxe",
    name: "Deluxe Package",
    tagline: "Three starters and a wider main course for large celebrations.",
    pricePerMann: 150000,
    guestsPerMann: GUESTS_PER_MANN,
    sections: [
      {
        title: "Main Course (3 Starters)",
        items: [
          "Chicken Tandoori / Chicken Sheek",
          "Fish Fry",
          "Methi Chicken Gravy / Malai Chicken",
          "Hyderabadi Chicken / Pepper Chicken",
          "Tandoori Kulcha / Reshmi Roti",
          "Rumali Roti / Seviyan",
        ],
      },
      {
        title: "Biryani",
        items: [
          "Mutton Biryani",
          "Brinjal Curry / Dall Cha",
          "Curd Raitha",
          "Dessert (2 Sweet)",
          "Muzzaffar / Hyderabadi Firni",
          "Pine Apple Spl. Sweet",
        ],
      },
      {
        title: "Refreshment Stations",
        items: [
          "Ice Cream / Gulkhan",
          "Pan Beeda",
          "Soft Drink",
          "Tea Counter",
          "Pop Corn",
          "Sugar Candy",
          "Fruit Stall",
        ],
      },
      {
        title: "Family Grand Table (30 Members)",
        items: [
          "Mutton Chops",
          "Fish Fry",
          "Teetar Fry",
          "Tandoori Chicken",
          "Kalmi Chicken",
          "Chicken Piaal",
          "Cool Drinks",
        ],
      },
    ],
  },
  {
    id: "royal",
    name: "Royal Package",
    tagline: "Our flagship feast — the fullest spread we serve.",
    pricePerMann: 175000,
    guestsPerMann: GUESTS_PER_MANN,
    signature: true,
    sections: [
      {
        title: "Main Course (3 Starters)",
        items: [
          "Chicken Tandoori / Mutton Sheek / Fish Fry",
          "Methi Chicken Gravy / Malai Chicken",
          "Hyderabadi Chicken / Pepper Chicken",
          "Tandoori Kulcha / Reshmi Roti",
          "Rumali Roti / Seviyan",
        ],
      },
      {
        title: "Biryani",
        items: [
          "Mutton Biryani",
          "Brinjal Curry / Dall Cha",
          "Curd Raitha",
          "Dessert (2 Sweet) / Carrot Halwa",
          "Muzzaffar / Hyderabadi Firni",
          "Pine Apple Spl. Sweet",
        ],
      },
      {
        title: "Refreshment Stations",
        items: [
          "Ice Cream / Shahi Tukda",
          "Pan Beeda",
          "Soft Drink",
          "Tea Counter",
          "Pop Corn",
          "Sugar Candy",
          "Fruit Stall",
        ],
      },
      {
        title: "Family Grand Table (30 Members)",
        items: [
          "Mutton Mandi",
          "Fish Fry",
          "Teetar Fry",
          "Tandoori Chicken",
          "Kalmi Chicken",
          "Chicken Paal",
          "Cool Drinks",
        ],
      },
    ],
  },
];

export const packageHighlights = (p: CateringPackage) => p.sections.map((s) => s.title);

export const serviceAreas = [
  "Frazer Town",
  "Shivajinagar",
  "Indiranagar",
  "Koramangala",
  "HSR Layout",
  "Whitefield",
  "Hebbal",
  "Jayanagar",
  "Banashankari",
  "Electronic City",
  "Yelahanka",
  "RT Nagar",
];

export const testimonials = [
  {
    quote:
      "The food and service were exceptional. Our guests especially loved the biryani and kebabs.",
    name: "Sameer Ahmed",
    event: "Walima • 250 Guests",
  },
  {
    quote: "They handled 400 guests without a single delay. The buffet presentation was beautiful.",
    name: "Fatima Rizvi",
    event: "Wedding • 400 Guests",
  },
  {
    quote: "We asked for a simple Aqiqah lunch and still received the attention of a large event.",
    name: "Imran Khan",
    event: "Aqiqah • 80 Guests",
  },
];

export const standards = [
  { title: "100% Halal", note: "Verified sourcing, every single time." },
  { title: "Thoughtfully Prepared", note: "Cooked in small batches on event day." },
  { title: "Premium Ingredients", note: "Long-grain basmati, fresh cuts, whole spices." },
  { title: "Custom Catering", note: "Menus shaped around your occasion." },
  { title: "Experienced Team", note: "Trained service staff for every function." },
  { title: "Made for Celebrations", note: "From 30 guests to 1,000 and beyond." },
];

export const editorialImage = weddingImg;

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
