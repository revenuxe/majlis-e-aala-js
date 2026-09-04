"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChefHat,
  ChevronDown,
  HeartHandshake,
  SlidersHorizontal,
  Search,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import heroImg from "@/assets/hero-banquet.jpg";
import biryaniImg from "@/assets/cat-biryani.jpg";
import kebabImg from "@/assets/cat-kebabs.jpg";
import weddingImg from "@/assets/editorial-wedding.jpg";
import { categories, dishes, inr, serviceAreas, standards, testimonials } from "@/lib/data";
import { usePlan } from "@/lib/plan-store";
import { supabase } from "@/integrations/supabase/client";
import {
  Button,
  DietMark,
  HalalBadge,
  QuantitySelector,
  SectionHeader,
  cx,
} from "@/components/ui-kit";

const routeMetadata = {
  head: () => ({
    meta: [
      { title: "Majlise Aala — Premium Halal Catering in Bengaluru" },
      {
        name: "description",
        content:
          "Exceptional Halal catering crafted for weddings, Walima, Aqiqah and gatherings of every size. Plan your catering in minutes.",
      },
      { property: "og:title", content: "Majlise Aala — Premium Halal Catering" },
      {
        property: "og:description",
        content:
          "Exceptional Halal catering crafted for weddings, celebrations and gatherings of every size.",
      },
    ],
  }),
  component: Home,
};

export default function Home() {
  return (
    <main>
      <Hero />
      <OccasionSelector />
      <QuickPlanner />
      <HowItWorks />
      <Standards />
      <BuildYourMenuCTA />
      <Testimonials />
      <ServiceAreas />
      <HomeFAQs />
    </main>
  );
}

function HowItWorks() {
  const steps = [
    [
      "01",
      "Choose your occasion",
      "Tell us whether you are planning a Nikah, Walima, Aqiqah, wedding or corporate gathering.",
    ],
    [
      "02",
      "Set your guest count",
      "See packages and estimates shaped around the number of guests you are hosting.",
    ],
    [
      "03",
      "Select a menu",
      "Open each package to review inclusions, or build a menu dish by dish.",
    ],
    [
      "04",
      "Confirm with our team",
      "Send your request and our Bengaluru catering team will confirm the final details with you.",
    ],
  ];
  return (
    <Section>
      <SectionHeader
        eyebrow="Simple from the start"
        title="How catering comes together"
        subtitle="A clear path from your first idea to a beautifully served gathering."
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([number, title, note]) => (
          <div
            key={number}
            className="group rounded-[20px] border border-border bg-card p-5 shadow-[0_8px_20px_rgba(55,42,25,0.07)] transition-all hover:-translate-y-1 hover:border-gold/70"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold tracking-[.16em] text-gold">{number}</span>
              <ArrowUpRight className="h-4 w-4 text-gold" />
            </div>
            <h3 className="mt-8 text-[17px] font-semibold">{title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{note}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={cx(
        "relative mx-auto max-w-[1280px] px-5 py-12 before:pointer-events-none before:absolute before:left-1/2 before:top-0 before:h-px before:w-[calc(100%-40px)] before:-translate-x-1/2 before:bg-gradient-to-r before:from-transparent before:via-gold/70 before:to-transparent sm:px-8 sm:py-16 sm:before:w-[calc(100%-64px)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

const heroSlides = [
  {
    image: heroImg,
    eyebrow: "Weddings & Walima",
    title: "A Feast Worth Remembering.",
    text: "Exceptional Halal catering crafted for weddings, celebrations and gatherings of every size.",
  },
  {
    image: biryaniImg,
    eyebrow: "Signature Dum Biryani",
    title: "Slow-Cooked. Never Rushed.",
    text: "Long-grain basmati, whole spices and sealed dum cooking on your event day itself.",
  },
  {
    image: kebabImg,
    eyebrow: "Live Grills & Kebabs",
    title: "Straight Off The Coal.",
    text: "Manned grill counters serving kebabs hot to your guests, all evening long.",
  },
  {
    image: weddingImg,
    // @ts-expect-error -- the final spread supplies the customer-facing eyebrow.
    eyebrow: "Packages from ₹1,00,000 / Mann",
    title: "Catering, considered.",
    text: "Explore the menus and service options currently available for your celebration.",
    ...Object.assign({}, { eyebrow: "Made for your occasion" }),
  },
];

const HERO_CACHE_TTL = 5 * 60 * 1000;

type HeroSlide = {
  image: string;
  mobileImage?: string | null;
  eyebrow: string;
  title: string;
  text: string;
};

const heroSlideKey = (slide: HeroSlide) => `${slide.image}|${slide.mobileImage ?? ""}`;

function HeroTitle({ title }: { title: string }) {
  const protectedPhrase = "Caterers in Bangalore";
  if (!title.endsWith(protectedPhrase)) return title;
  return (
    <>
      {title.slice(0, -protectedPhrase.length)}
      <span className="lg:whitespace-nowrap">{protectedPhrase}</span>
    </>
  );
}

function Hero() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [hint, setHint] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [managedSlides, setManagedSlides] = useState<HeroSlide[]>([]);
  const [loadedSlides, setLoadedSlides] = useState<Set<string>>(() => new Set());
  const slides: HeroSlide[] = managedSlides.length ? managedSlides : heroSlides;
  const count = slides.length;
  const heroCacheKey = "majlise-aala-hero-v1";
  const suggestedSearch = ["Nikah", "Walima", "Aqiqah", "Corporate event"][hint] ?? "catering";

  useEffect(() => {
    void (async () => {
      try {
        const cached = JSON.parse(window.localStorage.getItem(heroCacheKey) ?? "null") as {
          savedAt?: number;
          slides?: HeroSlide[];
        } | null;
        if (
          cached?.slides?.length &&
          cached.savedAt &&
          Date.now() - cached.savedAt < HERO_CACHE_TTL
        ) {
          setManagedSlides(cached.slides);
          return;
        }
      } catch {
        /* use bundled slides while loading */
      }
      // The migration adds this table; generated Supabase types are refreshed separately.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("hero_carousels")
        .select("title, eyebrow, desktop_image_url, mobile_image_url")
        .eq("is_active", true)
        .order("sort_order");
      if (error || !data?.length) return;
      const nextSlides = data.map(
        (slide: {
          desktop_image_url: string;
          mobile_image_url: string | null;
          eyebrow: string;
          title: string;
        }) => ({
          image: slide.desktop_image_url,
          mobileImage: slide.mobile_image_url,
          eyebrow: slide.eyebrow,
          title: slide.title,
          text: "",
        }),
      );
      setManagedSlides(nextSlides);
      try {
        window.localStorage.setItem(
          heroCacheKey,
          JSON.stringify({ savedAt: Date.now(), slides: nextSlides }),
        );
      } catch {
        /* cache is optional */
      }
      setIndex(0);
    })();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => window.clearInterval(id);
  }, [count]);
  useEffect(() => {
    const id = window.setInterval(() => setHint((value) => (value + 1) % 4), 2200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const nextSlide = slides[(index + 1) % count];
    if (!nextSlide) return;
    const nextImage = new window.Image();
    const useMobileImage = window.matchMedia("(max-width: 639px)").matches;
    nextImage.src =
      useMobileImage && nextSlide.mobileImage ? nextSlide.mobileImage : nextSlide.image;
  }, [count, index, slides]);

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-4 sm:px-8 sm:pt-6">
      <div className="relative overflow-hidden rounded-[22px] bg-soft-black sm:rounded-[28px]">
        {/* Slides */}
        <div className="relative h-[440px] sm:h-[520px] lg:h-[600px]">
          {slides.map((s, i) => (
            <div
              key={s.title}
              aria-hidden={i !== index}
              className={cx(
                "absolute inset-0 transition-opacity duration-700",
                i === index ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              {!loadedSlides.has(heroSlideKey(s)) && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_72%_28%,rgba(202,164,93,0.34),transparent_28%),linear-gradient(135deg,#211b14,#5b4931_48%,#17130f)]"
                />
              )}
              <picture className="block h-full w-full">
                {s.mobileImage ? (
                  <source media="(max-width: 639px)" srcSet={s.mobileImage} />
                ) : null}
                <img
                  src={s.image}
                  alt={s.eyebrow}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "low"}
                  decoding="async"
                  onLoad={() => setLoadedSlides((current) => new Set(current).add(heroSlideKey(s)))}
                  className={cx(
                    "h-full w-full object-cover transition-opacity duration-300",
                    loadedSlides.has(heroSlideKey(s)) ? "opacity-100" : "opacity-0",
                  )}
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,12,11,0.92)] via-[rgba(12,12,11,0.45)] to-[rgba(12,12,11,0.15)]" />
            </div>
          ))}

          {/* Minimal editorial copy */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-9 lg:p-12">
            <div className="max-w-xl">
              <span className="eyebrow block" style={{ color: "var(--gold)" }}>
                Majlise Aala Catering
              </span>
              <h1 className="mt-3 max-w-[360px] text-balance font-display text-[32px] leading-[1.06] text-white sm:max-w-xl sm:text-[54px] lg:max-w-[840px] lg:text-[64px] lg:[text-wrap:wrap]">
                <HeroTitle title={slides[index]!.title} />
              </h1>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const query = searchQuery.trim() || suggestedSearch;
                  router.push(`/packages?q=${encodeURIComponent(query)}`);
                }}
                className="mt-5 flex max-w-md items-center gap-3 rounded-[14px] bg-white px-4 py-3 text-foreground shadow-lg transition-shadow focus-within:shadow-[0_0_0_3px_rgba(202,164,93,0.6),0_12px_24px_rgba(0,0,0,0.2)]"
              >
                <Search className="h-4 w-4 text-gold" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  aria-label="Search catering packages"
                  placeholder={`Search ${suggestedSearch} packages`}
                  className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  aria-label="Search packages"
                  className="press grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>

          <div className="absolute left-5 top-5 sm:left-9 sm:top-8">
            <HalalBadge />
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-[22px] border border-gold/45 bg-card p-3 shadow-[0_14px_30px_rgba(55,42,25,0.10)] sm:grid-cols-4 sm:gap-3 sm:p-4">
        {[
          { label: "100% Halal", Icon: Check },
          { label: "Freshly Prepared", Icon: ChefHat },
          { label: "Custom Menus", Icon: SlidersHorizontal },
          { label: "Event Catering", Icon: HeartHandshake },
        ].map(({ label, Icon }) => (
          <div
            key={label}
            className="flex min-h-12 items-center gap-2.5 rounded-[14px] border border-border bg-surface px-3 text-[13px] font-semibold text-foreground transition-colors hover:border-gold/60 hover:bg-champagne/35 sm:min-h-14"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold/35 bg-card text-gold shadow-[0_2px_6px_rgba(55,42,25,0.08)]">
              <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <span className="leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function OccasionSelector() {
  const { plan, update, occasions, catalogLoading } = usePlan();
  const navigate = useRouter();
  const hasClearedOccasion = useRef(false);

  useEffect(() => {
    if (hasClearedOccasion.current) return;
    hasClearedOccasion.current = true;
    update({ occasion: null });
  }, [update]);

  return (
    <Section>
      <SectionHeader
        eyebrow="Choose your event category"
        title="What are you celebrating?"
        subtitle="Pick a category to see the packages created for it."
      />
      <div
        className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        aria-busy={catalogLoading}
      >
        {catalogLoading && occasions.length === 0
          ? Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="min-h-[222px] animate-pulse rounded-[22px] bg-surface sm:min-h-[280px] sm:rounded-[26px]"
              />
            ))
          : null}
        {occasions.map((o) => {
          const selected = plan.occasion === o.id;
          return (
            <button
              key={o.id}
              onClick={() => {
                update({ occasion: o.id, packageId: null, mode: "package" });
                navigate.push(`/packages/${o.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
              }}
              aria-pressed={selected}
              className={cx(
                "group relative min-h-[222px] cursor-pointer overflow-hidden rounded-[22px] border-2 text-left shadow-[0_14px_30px_rgba(55,42,25,0.18)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_42px_rgba(55,42,25,0.28)] active:translate-y-0 active:scale-[0.975] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/40 sm:min-h-[280px] sm:rounded-[26px]",
                selected ? "border-gold ring-2 ring-gold/60" : "border-gold/35 hover:border-gold",
              )}
            >
              <img
                src={o.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/30" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span
                className={cx(
                  "absolute left-3 top-3 z-10 inline-flex h-6 items-center gap-1 rounded-full px-2 text-[9px] font-bold uppercase tracking-[0.1em] shadow-sm sm:left-4 sm:top-4 sm:text-[10px]",
                  selected ? "bg-gold text-primary" : "bg-card text-muted-foreground",
                )}
              >
                {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                {selected ? "Selected" : "Choose"}
              </span>
              <span
                className={cx(
                  "absolute inset-x-3 bottom-3 z-10 flex min-h-14 items-center rounded-[16px] px-3 py-2 shadow-[0_8px_20px_rgba(18,14,9,0.14)] backdrop-blur-sm sm:inset-x-5 sm:bottom-5 sm:min-h-[72px] sm:rounded-[18px] sm:px-4",
                  selected ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
                )}
              >
                <span className="block min-w-0 whitespace-nowrap font-display text-[18px] leading-none sm:text-[26px]">
                  {o.name}
                </span>
              </span>
              <span className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-card text-foreground shadow-[0_10px_20px_rgba(18,14,9,0.28)] transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-primary-foreground group-active:scale-90 sm:right-5 sm:top-5 sm:h-12 sm:w-12">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

function QuickPlanner() {
  const { plan, update } = usePlan();
  const [customMode, setCustomMode] = useState(false);
  const presets = [25, 50, 100, 200, 300, 500];

  return (
    <Section className="py-6 sm:py-8">
      <div className="relative overflow-hidden rounded-[24px] border border-gold/45 bg-card p-5 shadow-[0_16px_34px_rgba(55,42,25,0.12)] before:pointer-events-none before:absolute before:inset-x-7 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent sm:p-8">
        <div className="flex items-center gap-3">
          <span className="gold-rule" />
          <span className="eyebrow">Plan your catering</span>
        </div>
        <h3 className="mt-3 font-display text-[28px] leading-tight sm:text-[34px]">
          How many guests are you expecting?
        </h3>

        <div className="mt-6 rounded-[18px] border border-border bg-card p-2 shadow-[0_8px_18px_rgba(55,42,25,0.06)]">
          <QuantitySelector
            size="lg"
            value={plan.guests}
            step={10}
            min={10}
            suffix="Guests"
            onChange={(v) => {
              update({ guests: Math.max(10, v) });
              setCustomMode(false);
            }}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {presets.map((g) => (
            <button
              key={g}
              onClick={() => {
                setCustomMode(false);
                update({ guests: g });
              }}
              className={cx(
                "press flex h-14 flex-col items-center justify-center rounded-[14px] border text-[15px] font-semibold transition-colors",
                !customMode && plan.guests === g
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_8px_16px_rgba(35,29,22,0.16)]"
                  : "border-border bg-card text-foreground hover:border-gold",
              )}
            >
              {g === 500 ? "500+" : g}
              <span
                className={cx(
                  "mt-0.5 text-[10px] font-medium",
                  !customMode && plan.guests === g
                    ? "text-primary-foreground/70"
                    : "text-muted-text",
                )}
              >
                guests
              </span>
            </button>
          ))}
        </div>

        <div
          className={cx(
            "mt-3 overflow-hidden rounded-[18px] border transition-colors",
            customMode
              ? "border-gold/50 bg-champagne/30"
              : "border-border bg-card hover:border-gold",
          )}
        >
          <button
            onClick={() => setCustomMode(true)}
            className="press flex h-14 w-full items-center justify-between px-4 text-left"
          >
            <span className="text-[15px] font-semibold">Custom guest count</span>
            <span className="text-[12px] text-muted-foreground">Enter an exact number</span>
          </button>
          {customMode && (
            <div className="border-t border-gold/25 px-4 pb-4 pt-3 duration-300 animate-in fade-in slide-in-from-bottom-2">
              <label className="eyebrow" htmlFor="custom-guests">
                Enter exact guest count
              </label>
              <input
                id="custom-guests"
                type="number"
                inputMode="numeric"
                min={10}
                autoFocus
                value={Number.isNaN(plan.guests) ? "" : plan.guests}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  update({ guests: Number.isNaN(v) ? 0 : Math.max(0, v) });
                }}
                placeholder="e.g. 750"
                className="mt-2 h-14 w-full rounded-[14px] border border-border bg-card px-4 text-center text-[20px] font-semibold tabular-nums outline-none focus:border-gold"
              />
              <p className="mt-2 text-[12px] text-muted-foreground">
                Minimum 10 guests. We'll bill per Mann (100 guests), rounded up.
              </p>
            </div>
          )}
        </div>

        <div className="mt-7">
          <Link href="/plan">
            <Button size="lg" full className="sm:w-auto sm:px-10">
              Start Planning
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
}

function MenuPreview() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Our kitchen"
        title="Explore the Menu"
        subtitle="Crafted for gatherings big and small."
        action={
          <Link
            href="/menu"
            className="hidden shrink-0 items-center gap-1 text-[14px] font-semibold sm:flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            href="/menu"
            className="group relative min-h-[154px] overflow-hidden rounded-[22px] border border-border bg-surface shadow-[0_12px_28px_rgba(55,42,25,0.10)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-gold/70 hover:shadow-[0_20px_38px_rgba(55,42,25,0.18)]"
          >
            <img
              src={c.image}
              alt={c.name}
              loading="lazy"
              className="absolute bottom-0 right-0 h-full w-[52%] object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <span className="absolute inset-y-0 left-0 w-[68%] bg-gradient-to-r from-surface via-surface to-surface/70" />
            <div className="absolute bottom-5 left-5 z-10 max-w-[52%]">
              <span className="block font-display text-[27px] leading-[0.95] text-foreground sm:text-[31px]">
                {c.name}
              </span>
              <span className="mt-2 block text-[12px] font-medium text-muted-foreground">
                {c.items} signature dishes
              </span>
              <span className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

function MostLoved({ dishes: list }: { dishes: typeof dishes }) {
  return (
    <Section>
      <SectionHeader
        eyebrow="Chosen again and again"
        title="Most Loved Dishes"
        subtitle="Signatures from our packages — served buffet-style, priced per tray."
      />
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((d) => (
          <Link
            key={d.id}
            href="/packages"
            className="press group overflow-hidden rounded-[20px] border border-border bg-card shadow-[var(--shadow-card)]"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img
                src={d.image}
                alt={d.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {d.tags && d.tags.length > 0 && (
                <span
                  className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.12em]"
                  style={{ background: "var(--champagne)", color: "var(--foreground)" }}
                >
                  {d.tags[0] === "bestseller"
                    ? "BESTSELLER"
                    : d.tags[0] === "premium"
                      ? "PREMIUM"
                      : "MOST LOVED"}
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <DietMark diet={d.diet} />
                <h3 className="min-w-0 truncate text-[16px] font-semibold">{d.name}</h3>
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="text-[17px] font-bold">{inr(d.price)}</span>
                <span className="text-[12px] font-medium text-muted-foreground">per tray</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

function BuildYourMenuCTA() {
  return (
    <Section>
      <div className="grid gap-6 rounded-[24px] bg-primary p-7 text-primary-foreground sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <span className="eyebrow" style={{ color: "var(--gold)" }}>
            Made for your occasion
          </span>
          <h3 className="mt-2 font-display text-[30px] leading-tight sm:text-[38px]">
            Find the right package for your gathering.
          </h3>
          <p className="mt-3 max-w-md text-[15px] opacity-75">
            Choose your occasion, set the guest count and compare package estimates before you make
            a booking request.
          </p>
        </div>
        <Link href="/packages">
          <Button size="lg" variant="champagne" full className="lg:w-auto lg:px-8">
            Explore Packages <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Section>
  );
}

function Standards() {
  return (
    <Section>
      <SectionHeader eyebrow="Why us" title="The Majlise Aala Standard" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
        {standards.map((s, index) => (
          <div
            key={s.title}
            className="group rounded-[20px] border border-border bg-card p-5 shadow-[0_8px_20px_rgba(55,42,25,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/70 hover:shadow-[0_16px_30px_rgba(55,42,25,0.15)]"
          >
            <div className="flex items-center justify-between">
              <span className="gold-rule block" />
              <span className="grid h-8 w-8 place-items-center rounded-full bg-champagne text-[12px] font-bold text-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-5 text-[17px] font-semibold">{s.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{s.note}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Testimonials() {
  return (
    <Section>
      <SectionHeader eyebrow="Guests & hosts" title="Celebrations We've Been Part Of" />
      <div className="no-scrollbar -mx-5 mt-6 flex gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="w-[280px] shrink-0 rounded-[16px] border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:w-auto"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5"
                  style={{ color: "var(--gold)", fill: "var(--gold)" }}
                />
              ))}
            </div>
            <blockquote className="mt-4 font-display text-[19px] leading-snug">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-5 text-[13px]">
              <span className="font-semibold">{t.name}</span>
              <span className="mt-0.5 block text-muted-text">{t.event}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

function ServiceAreas() {
  const [q, setQ] = useState("");
  const filtered = serviceAreas.filter((a) => a.toLowerCase().includes(q.toLowerCase()));
  return (
    <Section>
      <SectionHeader eyebrow="Where we serve" title="Catering Across Bengaluru" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search your area"
        className="mt-6 h-12 w-full max-w-sm rounded-[12px] border border-border bg-card px-4 text-[15px] outline-none focus:border-gold"
      />
      <div className="mt-5 flex flex-wrap gap-2">
        {filtered.map((a) => (
          <span
            key={a}
            className="rounded-full border border-border bg-card px-4 py-2 text-[13px] text-muted-foreground"
          >
            {a}
          </span>
        ))}
        {filtered.length === 0 && (
          <p className="text-[14px] text-muted-foreground">
            We may still be able to help — please message our catering team.
          </p>
        )}
      </div>
    </Section>
  );
}

function HomeFAQs() {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    [
      "How early should I book catering in Bengaluru?",
      "For weddings and larger gatherings, sharing your date a few weeks in advance gives our team the best chance to reserve the right kitchen and service team. We will confirm availability after receiving your request.",
    ],
    [
      "Can I customise a catering package?",
      "Yes. Start with a package for a clear estimate, then share your family preferences, dietary requirements and service needs. Final inclusions are confirmed with the catering team.",
    ],
    [
      "What does a Mann mean?",
      "A Mann is our bulk-catering serving reference. The package page shows the included guest range and a tailored estimate for your selected guest count.",
    ],
    [
      "Do you cater outside Bengaluru?",
      "We serve many Bengaluru neighbourhoods. Share your venue while planning and our team will confirm service coverage and any event-specific requirements.",
    ],
    [
      "Are package prices final?",
      "The displayed amount is an estimate based on your guest count and selected package. The catering team confirms final quantities, menu inclusions, venue requirements and the formal quotation before the event is booked.",
    ],
    [
      "Can you accommodate vegetarian or mixed menus?",
      "Yes. Choose a food preference while planning and tell us about any family, dietary or service preferences. Our team will guide the suitable package and final menu conversation.",
    ],
    [
      "Do packages include service staff and buffet setup?",
      "Every package lists its own inclusions. Open the package details to review the menu sections, then the catering team will confirm staffing, buffet setup and any optional services for your venue.",
    ],
    [
      "Can I change my guest count after submitting a request?",
      "Yes. Your initial request gives us a planning reference. Tell the catering team when the count changes and they will update quantities and the estimate with you.",
    ],
    [
      "What should I share about my venue?",
      "Share the venue address, area, event date, serving style and any access or setup details you already know. This helps the team plan service smoothly.",
    ],
    [
      "How do I confirm a catering booking?",
      "Submit your request online, then our team will contact you to review availability, menu, guest count and final quotation. A booking is confirmed only after that conversation.",
    ],
  ];
  return (
    <Section>
      <div className="rounded-[24px] border border-border bg-surface/55 p-5 sm:p-8">
        <SectionHeader
          eyebrow="Helpful answers"
          title="Before you plan"
          subtitle="A few common questions from families planning a celebration."
        />
        <div className="mt-6 divide-y divide-border overflow-hidden rounded-[16px] border border-border bg-card">
          {faqs.map(([question, answer], index) => {
            const expanded = open === index;
            return (
              <div key={question}>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : index)}
                  aria-expanded={expanded}
                  className="press flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
                >
                  <span className="text-[15px] font-semibold">{question}</span>
                  <ChevronDown
                    className={cx(
                      "h-5 w-5 shrink-0 text-gold transition-transform",
                      expanded && "rotate-180",
                    )}
                  />
                </button>
                {expanded && (
                  <p className="border-t border-border bg-surface/50 px-4 py-4 text-[14px] leading-relaxed text-muted-foreground sm:px-5">
                    {answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex flex-col gap-3 rounded-[18px] bg-primary p-5 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[16px] font-semibold">Ready to plan your gathering?</p>
            <p className="mt-1 text-[13px] text-primary-foreground/70">
              Choose an occasion and see package estimates for your guest count.
            </p>
          </div>
          <Link href="/plan">
            <Button variant="champagne" size="lg" className="w-full sm:w-auto">
              Start planning <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
}
