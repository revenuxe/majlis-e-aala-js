"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTravelCatalog } from "@/hooks/use-travel-catalog";
import { TravelPrice } from "@/components/TravelPrice";
import { TravelCatalogueControls } from "@/components/TravelCatalogueControls";
import { packageJourney, filterTravelPackages, initialCatalogueFilter } from "@/lib/travel-booking";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  FileCheck2,
  Globe2,
  HeartHandshake,
  Home,
  MapPin,
  Menu,
  ClipboardList,
  Plane,
  Pause,
  Play,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { BrandLogo, BrandMark } from "@/components/Brand";
import { Button, QuantitySelector, SectionHeader, cx } from "@/components/ui-kit";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useTravelHero } from "@/hooks/use-travel-hero";
import {
  travelCategories,
  travelContact,
  travelFAQs,
  travelWhatsApp,
  type Journey,
  type TravelCategory,
} from "@/lib/travel";

const fieldClass =
  "h-12 w-full rounded-xl border border-border bg-background px-3 text-[14px] outline-none focus:border-gold focus:ring-2 focus:ring-gold/20";
const anchorClass =
  "press inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[14px] font-semibold text-primary-foreground hover:bg-soft-black";

function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cx(
        "relative mx-auto max-w-[1280px] scroll-mt-28 px-5 py-12 before:pointer-events-none before:absolute before:left-1/2 before:top-0 before:h-px before:w-[calc(100%-40px)] before:-translate-x-1/2 before:bg-gradient-to-r before:from-transparent before:via-gold/70 before:to-transparent sm:px-8 sm:py-16 sm:before:w-[calc(100%-64px)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export default function TravelHome() {
  const router = useRouter();
  const catalog = useTravelCatalog();
  const [catalogueFilter, setCatalogueFilter] = useState(initialCatalogueFilter);
  const [journeyLimit, setJourneyLimit] = useState(6);
  const journeys = filterTravelPackages(catalog.packages, catalogueFilter).map(packageJourney);
  const [category, setCategory] = useState<TravelCategory | "all">("all");
  const [selected, setSelected] = useState<Journey | null>(null);
  const selectedPackage = catalog.packages.find((pkg) => pkg.id === selected?.id);
  const [enquiryJourney, setEnquiryJourney] = useState("Umrah");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [travellers, setTravellers] = useState(2);
  const [heroIndex, setHeroIndex] = useState(0);
  const { slides: travelHeroSlides, loading: heroLoading, failed: heroFailed } = useTravelHero();
  const [heroPaused, setHeroPaused] = useState(false);
  const [heroInteracting, setHeroInteracting] = useState(false);
  const [loadedHeroImages, setLoadedHeroImages] = useState<Set<string>>(() => new Set());
  const activeHeroIndex = travelHeroSlides.length ? heroIndex % travelHeroSlides.length : 0;
  const currentHero = travelHeroSlides[activeHeroIndex];
  useEffect(() => {
    if (travelHeroSlides.length < 2 || heroPaused || heroInteracting) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden && !reducedMotion.matches) setHeroIndex((index) => index + 1);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [travelHeroSlides.length, heroPaused, heroInteracting]);
  useEffect(() => {
    if (travelHeroSlides.length < 2) return;
    const nextSlide = travelHeroSlides[(activeHeroIndex + 1) % travelHeroSlides.length];
    if (!nextSlide) return;
    const mobile = window.matchMedia("(max-width: 639px)");
    const preload = () => {
      const nextImage = new window.Image();
      nextImage.src =
        mobile.matches && nextSlide.mobile_image_url
          ? nextSlide.mobile_image_url
          : nextSlide.desktop_image_url;
    };
    preload();
    mobile.addEventListener("change", preload);
    return () => mobile.removeEventListener("change", preload);
  }, [activeHeroIndex, travelHeroSlides]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const visibleJourneys = journeys.filter(
    (journey) =>
      (category === "all" || journey.category === category) &&
      `${journey.name} ${journey.category} ${journey.places} ${journey.description}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );
  function planJourney(journeyName: string) {
    const pkg = catalog.packages.find((item) => item.name === journeyName);
    const chosenCategory =
      pkg?.category ||
      travelCategories.find((item) => item.name.toLowerCase() === journeyName.toLowerCase())?.id;
    const params = new URLSearchParams({ travellers: String(travellers) });
    if (chosenCategory) params.set("category", chosenCategory);
    if (pkg) params.set("package", pkg.id);
    router.push("/travel/plan?" + params.toString());
  }

  function selectCategory(value: TravelCategory) {
    setCategory(value);
    setJourneyLimit(6);
    setCatalogueFilter(initialCatalogueFilter);
    setSearchTerm("");
    setSearchQuery("");
    document.getElementById("journeys")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  return (
    <div className="pb-28 lg:pb-0 [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-gold [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-4 [&_button]:focus-visible:outline-gold">
      <a
        href="#travel-main"
        className="sr-only z-[80] rounded-xl bg-card p-4 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between gap-5 px-5 sm:px-8 lg:h-[88px]">
          <Link
            href="/travel"
            aria-label="Majlise Aala Tours and Travels home"
            className="flex items-center gap-3"
          >
            <span className="lg:hidden">
              <BrandMark size={46} />
            </span>
            <span>
              <span className="hidden lg:block">
                <BrandLogo className="h-9" />
              </span>
              <span className="block text-[11px] font-semibold uppercase tracking-[.16em] lg:mt-1.5 lg:text-[9px]">
                Tours & Travels
              </span>
              <span className="text-[12px] text-muted-foreground lg:hidden">
                Journeys with meaning
              </span>
            </span>
          </Link>
          <nav
            aria-label="Travel navigation"
            className="hidden items-center gap-6 text-[14px] lg:flex"
          >
            <a href="#explore">Explore</a>
            <a href="#journeys">Journeys</a>
            <a href="#pilgrim-guide">Pilgrim guide</a>
            <a href="#travel-faqs">FAQs</a>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <a href="/travel/plan" className={anchorClass}>
                PLAN YOUR TRIP <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            <button
              type="button"
              aria-label={mobileMenu ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileMenu}
              aria-controls="travel-mobile-menu"
              onClick={() => setMobileMenu(!mobileMenu)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-border lg:hidden"
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <nav
            id="travel-mobile-menu"
            aria-label="Mobile travel navigation"
            className="grid gap-1 border-t border-border px-5 py-3 lg:hidden"
          >
            {[
              ["Explore journeys", "#explore"],
              ["Compare journeys", "#journeys"],
              ["Pilgrim guide", "#pilgrim-guide"],
              ["Plan your trip", "/travel/plan"],
              ["FAQs", "#travel-faqs"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileMenu(false)}
                className="flex min-h-12 items-center justify-between text-[14px]"
              >
                {label}
                <ArrowUpRight size={16} />
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="travel-main">
        <section className="mx-auto max-w-[1280px] px-4 pt-4 sm:px-8 sm:pt-6">
          <div
            className="relative overflow-hidden rounded-[22px] bg-soft-black sm:rounded-[28px]"
            aria-roledescription="carousel"
            role="region"
            aria-label="Featured travel journeys"
            onMouseEnter={() => setHeroInteracting(true)}
            onMouseLeave={() => setHeroInteracting(false)}
            onFocusCapture={() => setHeroInteracting(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setHeroInteracting(false);
            }}
          >
            <div className="relative h-[440px] sm:h-[520px] lg:h-[600px]">
              {travelHeroSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  aria-hidden={index !== activeHeroIndex}
                  className={cx(
                    "absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none",
                    index === activeHeroIndex ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                >
                  {!loadedHeroImages.has(
                    `${slide.desktop_image_url}|${slide.mobile_image_url ?? ""}`,
                  ) && (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 motion-safe:animate-pulse bg-[radial-gradient(circle_at_72%_28%,rgba(202,164,93,0.34),transparent_28%),linear-gradient(135deg,#211b14,#5b4931_48%,#17130f)]"
                    />
                  )}
                  <picture className="block h-full w-full">
                    {slide.mobile_image_url && (
                      <source media="(max-width: 639px)" srcSet={slide.mobile_image_url} />
                    )}
                    <img
                      key={`${slide.desktop_image_url}|${slide.mobile_image_url ?? ""}`}
                      src={slide.desktop_image_url}
                      alt={slide.title}
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "low"}
                      decoding="async"
                      onLoad={() =>
                        setLoadedHeroImages((current) =>
                          new Set(current).add(
                            `${slide.desktop_image_url}|${slide.mobile_image_url ?? ""}`,
                          ),
                        )
                      }
                      className={cx(
                        "h-full w-full object-cover transition-opacity duration-300 motion-reduce:transition-none",
                        loadedHeroImages.has(
                          `${slide.desktop_image_url}|${slide.mobile_image_url ?? ""}`,
                        )
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </picture>
                </div>
              ))}
              {heroFailed && !travelHeroSlides.length && (
                <Image
                  src="/travel/makkah-courtyard.jpg"
                  alt="The Kaaba in Makkah"
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1216px"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,12,11,0.92)] via-[rgba(12,12,11,0.45)] to-[rgba(12,12,11,0.15)]" />
              <div className="absolute left-5 top-5 inline-flex min-h-9 items-center gap-2 rounded-full border border-white/30 bg-background/95 px-3 text-[11px] font-semibold text-primary sm:left-9 sm:top-8">
                <Compass size={14} className="text-gold" />
                Journeys with meaning
              </div>
              <div
                className="absolute right-5 top-16 flex max-w-[calc(100%-40px)] gap-2 overflow-x-auto sm:right-9 sm:top-8"
                role="group"
                aria-label="Featured travel destinations"
              >
                {travelHeroSlides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setHeroPaused(!heroPaused)}
                    aria-label={heroPaused ? "Play carousel" : "Pause carousel"}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-black/40 text-white"
                  >
                    {heroPaused ? <Play size={16} /> : <Pause size={16} />}
                  </button>
                )}
                {travelHeroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setHeroIndex(index)}
                    aria-label={`Show slide ${index + 1}: ${slide.title}`}
                    aria-pressed={activeHeroIndex === index}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-black/20"
                  >
                    <span
                      className={cx(
                        "h-2 rounded-full",
                        activeHeroIndex === index ? "w-5 bg-champagne" : "w-2 bg-white/60",
                      )}
                    />
                  </button>
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-9 lg:p-12">
                <div className="max-w-xl">
                  <span className="eyebrow block !text-gold">
                    {currentHero?.eyebrow || "Majlise Aala Tours & Travels"}
                  </span>
                  <h1 className="mt-3 max-w-[360px] text-balance font-display text-[32px] leading-[1.06] text-white sm:max-w-xl sm:text-[54px] lg:max-w-[840px] lg:text-[64px] lg:[text-wrap:wrap]">
                    {heroLoading ? (
                      <span role="status" className="block motion-safe:animate-pulse">
                        <span className="sr-only">Loading featured journeys</span>
                        <span
                          aria-hidden="true"
                          className="block h-[1em] w-4/5 rounded bg-white/10"
                        />
                        <span
                          aria-hidden="true"
                          className="mt-2 block h-[1em] w-3/5 rounded bg-white/10"
                        />
                      </span>
                    ) : (
                      currentHero?.title || "Your next journey begins here."
                    )}
                  </h1>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      setSearchTerm(searchQuery.trim());
                      setCategory("all");
                      setCatalogueFilter(initialCatalogueFilter);
                      setJourneyLimit(6);
                      document.getElementById("journeys")?.scrollIntoView({
                        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                          ? "auto"
                          : "smooth",
                      });
                    }}
                    className="mt-5 flex max-w-md items-center gap-3 rounded-[14px] bg-white px-4 py-3 text-foreground shadow-lg transition-shadow focus-within:shadow-[0_0_0_3px_rgba(202,164,93,0.6),0_12px_24px_rgba(0,0,0,0.2)]"
                  >
                    <Search className="h-4 w-4 shrink-0 text-gold" />
                    <input
                      aria-label="Search travel journeys"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search Umrah, Hajj or holidays"
                      className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
                    />
                    <button
                      type="submit"
                      aria-label="Search journeys"
                      className="press grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                    >
                      <ArrowRight size={17} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-[22px] border border-gold/45 bg-card p-3 shadow-[0_14px_30px_rgba(55,42,25,0.10)] sm:grid-cols-4 sm:gap-3 sm:p-4">
            {[
              { label: "Umrah & Hajj", Icon: Compass },
              { label: "Family Holidays", Icon: Users },
              { label: "Custom Itineraries", Icon: SlidersHorizontal },
              { label: "Personal Planning", Icon: HeartHandshake },
            ].map(({ label, Icon }) => (
              <div
                key={label}
                className="flex min-h-12 items-center gap-2.5 rounded-[14px] border border-border bg-surface px-3 text-[13px] font-semibold transition-colors hover:border-gold/60 hover:bg-champagne/35 sm:min-h-14"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold/35 bg-card text-gold shadow-[0_2px_6px_rgba(55,42,25,0.08)]">
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span className="leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <Section id="explore">
          <SectionHeader
            eyebrow="Find your kind of journey"
            title="Sacred beginnings. Beautiful escapes."
            subtitle="Choose what brings you here. We’ll help you take the next step."
          />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {travelCategories.map((item) => (
              <button
                key={item.id}
                onClick={() => selectCategory(item.id)}
                aria-pressed={category === item.id}
                className={cx(
                  "group relative min-h-[222px] cursor-pointer overflow-hidden rounded-[22px] border-2 bg-soft-black text-left shadow-[0_14px_30px_rgba(55,42,25,0.18)] transition-all duration-300 motion-safe:hover:-translate-y-1.5 hover:shadow-[0_24px_42px_rgba(55,42,25,0.28)] active:translate-y-0 active:scale-[0.975] sm:min-h-[280px] sm:rounded-[26px]",
                  category === item.id
                    ? "border-gold ring-2 ring-gold/60"
                    : "border-gold/35 hover:border-gold",
                )}
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/30" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span
                  className={cx(
                    "absolute left-3 top-3 z-10 inline-flex h-6 items-center gap-1 rounded-full px-2 text-[9px] font-bold uppercase tracking-[0.1em] shadow-sm sm:left-4 sm:top-4 sm:text-[10px]",
                    category === item.id ? "bg-gold text-primary" : "bg-card text-muted-foreground",
                  )}
                >
                  {category === item.id ? "Selected" : "Choose"}
                </span>
                <span className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-card text-foreground shadow-[0_10px_20px_rgba(18,14,9,0.28)] transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-primary-foreground sm:right-5 sm:top-5 sm:h-12 sm:w-12">
                  <ArrowRight size={16} />
                </span>
                <span
                  className={cx(
                    "absolute inset-x-3 bottom-3 z-10 flex min-h-14 items-center rounded-[16px] px-3 py-2 shadow-[0_8px_20px_rgba(18,14,9,0.14)] backdrop-blur-sm sm:inset-x-5 sm:bottom-5 sm:min-h-[72px] sm:rounded-[18px] sm:px-4",
                    category === item.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground",
                  )}
                >
                  <span className="block min-w-0 font-display text-[18px] leading-none sm:text-[26px]">
                    {item.name}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[13px]">
            <span className="text-muted-foreground">Something more personal?</span>
            {["Family holiday", "Custom journey"].map((item) => (
              <button
                key={item}
                onClick={() => planJourney(item)}
                className="press flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4"
              >
                {item}
                <ArrowUpRight size={14} />
              </button>
            ))}
          </div>
        </Section>

        <Section className="!py-6 sm:!py-8">
          <div className="relative overflow-hidden rounded-[24px] border border-gold/45 bg-card p-5 shadow-[0_16px_34px_rgba(55,42,25,0.12)] before:pointer-events-none before:absolute before:inset-x-7 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent sm:p-8">
            <div className="flex items-center gap-3">
              <span className="gold-rule" />
              <span className="eyebrow">Plan your journey</span>
            </div>
            <h3 className="mt-3 font-display text-[28px] leading-tight sm:text-[34px]">
              How many travellers are joining you?
            </h3>
            <div className="mt-6 rounded-[18px] border border-border bg-card p-2 shadow-[0_8px_18px_rgba(55,42,25,0.06)]">
              <QuantitySelector
                size="lg"
                value={travellers}
                step={1}
                min={1}
                suffix="Travellers"
                onChange={(value) => {
                  setTravellers(Math.min(100, value));
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[1, 2, 4, 6, 10, 20].map((count) => (
                <button
                  key={count}
                  aria-pressed={travellers === count}
                  onClick={() => {
                    setTravellers(count);
                  }}
                  className={cx(
                    "press flex h-14 flex-col items-center justify-center rounded-[14px] border text-[15px] font-semibold",
                    travellers === count
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_8px_16px_rgba(35,29,22,0.16)]"
                      : "border-border bg-card hover:border-gold",
                  )}
                >
                  {count}
                  <span
                    className={cx(
                      "mt-0.5 text-[10px] font-medium",
                      travellers === count ? "text-white/70" : "text-muted-text",
                    )}
                  >
                    {count === 1 ? "traveller" : "travellers"}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="sr-only" htmlFor="quick-travel-journey">
                Choose your journey
              </label>
              <select
                id="quick-travel-journey"
                value={enquiryJourney}
                onChange={(event) => {
                  setEnquiryJourney(event.target.value);
                }}
                className={fieldClass}
              >
                {[
                  ...travelCategories.map((item) => item.name),
                  "Family holiday",
                  "Custom journey",
                  ...journeys.map((item) => item.name),
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <Button onClick={() => planJourney(enquiryJourney)}>
                PLAN MY TRIP <ArrowRight size={17} />
              </Button>
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground">
              Your group size carries through to your enquiry. No booking or payment required.
            </p>
          </div>
        </Section>

        <div className="border-y border-border bg-surface/60">
          <Section id="journeys">
            <SectionHeader
              eyebrow="A little inspiration"
              title="Journeys worth looking forward to"
              subtitle="Starting points for your itinerary. Dates, hotels and prices are confirmed in your personal quotation."
            />
            {catalog.loading && (
              <p role="status" className="mt-5 text-sm text-muted-foreground">
                Loading travel packages?
              </p>
            )}
            {catalog.error && (
              <div role="alert" className="mt-5 rounded-xl border border-border p-4">
                <p>{catalog.error}</p>
                <button className="mt-2 underline" onClick={() => void catalog.reload()}>
                  Try again
                </button>
              </div>
            )}
            <div role="group" aria-label="Filter journeys" className="mt-6 flex flex-wrap gap-2">
              {[{ id: "all", name: "All journeys" }, ...travelCategories].map((item) => (
                <button
                  key={item.id}
                  aria-pressed={category === item.id}
                  onClick={() => {
                    setCategory(item.id as TravelCategory | "all");
                    setCatalogueFilter(initialCatalogueFilter);
                    setJourneyLimit(6);
                    setSearchTerm("");
                    setSearchQuery("");
                  }}
                  className={cx(
                    "press min-h-11 rounded-full px-5 text-[14px] font-medium",
                    category === item.id ? "bg-primary text-white" : "border border-border bg-card",
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <div className="mt-5">
              <TravelCatalogueControls
                value={catalogueFilter}
                onChange={(value) => {
                  setCatalogueFilter(value);
                  setJourneyLimit(6);
                }}
                count={visibleJourneys.length}
                search={false}
              />
            </div>
            <p className="sr-only" aria-live="polite">
              {visibleJourneys.length} journey ideas displayed
            </p>
            {searchTerm && (
              <p className="mt-4 text-[14px] text-muted-foreground">
                Results for “{searchTerm}”{" "}
                <button
                  className="ml-3 min-h-11 font-semibold text-foreground underline"
                  onClick={() => {
                    setSearchTerm("");
                    setSearchQuery("");
                  }}
                >
                  Clear search
                </button>
              </p>
            )}
            {!catalog.loading && !catalog.error && visibleJourneys.length === 0 && (
              <div className="mt-6 rounded-[20px] border border-border bg-card p-6">
                <h3 className="font-display text-[28px]">
                  Your journey can be a little different.
                </h3>
                <p className="mt-2 text-[14px] text-muted-foreground">
                  We couldn’t find a matching itinerary. Tell us what you have in mind.
                </p>
                <Button className="mt-4" onClick={() => planJourney("Custom journey")}>
                  PLAN A CUSTOM JOURNEY <ArrowRight size={16} />
                </Button>
              </div>
            )}
            <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visibleJourneys.slice(0, journeyLimit).map((journey) => (
                <article
                  key={journey.id}
                  className="overflow-hidden rounded-[20px] border border-border bg-card shadow-card"
                >
                  <div className="relative h-[230px]">
                    <Image
                      src={journey.image}
                      alt={journey.places}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-background/95 px-3 py-1.5 text-[11px] font-semibold">
                      {journey.label}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="flex items-start gap-1.5 text-[12px] text-muted-foreground">
                      <MapPin size={14} className="mt-0.5 shrink-0" />
                      {journey.places}
                    </p>
                    <h3 className="mt-2 font-display text-[29px]">{journey.name}</h3>
                    <p className="mt-1 flex items-center gap-2 text-[12px] text-muted-foreground">
                      <CalendarDays size={14} />
                      {journey.duration}
                    </p>
                    <ul className="my-5 grid grid-cols-2 gap-x-3 gap-y-3">
                      {journey.highlights.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-[12px] leading-relaxed"
                        >
                          <Check size={14} className="mt-0.5 shrink-0 text-gold" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    {catalog.packages.find((p) => p.id === journey.id) && (
                      <TravelPrice
                        pkg={catalog.packages.find((p) => p.id === journey.id)!}
                        compact
                      />
                    )}
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
                      <span className="text-xs text-muted-foreground">
                        Explore the itinerary & inclusions
                      </span>
                      <button
                        onClick={() => setSelected(journey)}
                        className="press flex min-h-11 items-center gap-1 text-[13px] font-semibold"
                      >
                        Details <ArrowUpRight size={16} />
                      </button>
                    </div>
                    <Button full className="mt-4" onClick={() => planJourney(journey.name)}>
                      CHOOSE THIS JOURNEY <ArrowUpRight size={16} />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            {visibleJourneys.length > journeyLimit && (
              <Button
                full
                variant="outline"
                className="mt-6"
                onClick={() => setJourneyLimit((count) => count + 6)}
              >
                SHOW MORE JOURNEYS ({visibleJourneys.length - journeyLimit} remaining)
              </Button>
            )}
          </Section>
        </div>

        <Section>
          <div className="grid overflow-hidden rounded-[24px] bg-primary text-primary-foreground lg:grid-cols-2">
            <div className="relative min-h-[300px] lg:min-h-[480px]">
              <Image
                src="/travel/madinah.jpg"
                alt="The Prophet’s Mosque in Madinah in the evening light"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute bottom-6 left-6 text-[11px] uppercase tracking-[.2em] text-white/90">
                Madinah, Saudi Arabia
              </p>
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-champagne">
                Less to worry about. More to remember.
              </p>
              <h2 className="mt-4 font-display text-[39px] leading-[1.08] sm:text-[48px]">
                Keep your heart
                <br />
                on the journey.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-white/75">
                A pilgrimage deserves careful preparation. Start with the details that make a
                difference: a suitable hotel, a manageable walking distance, the right documents and
                time to rest.
              </p>
              <div className="mt-6 grid gap-3 text-[14px]">
                {[
                  "A pace that works for your family",
                  "Clear hotel and transport preferences",
                  "Official resources for permits and preparation",
                ].map((item) => (
                  <p key={item} className="flex items-center gap-3">
                    <Check size={17} className="shrink-0 text-gold" />
                    {item}
                  </p>
                ))}
              </div>
              <button
                onClick={() => planJourney("Umrah")}
                className="press mt-8 inline-flex min-h-12 w-fit items-center gap-3 rounded-xl bg-background px-5 text-[14px] font-semibold text-primary"
              >
                PLAN MY UMRAH <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </Section>

        <Section className="!pt-0">
          <SectionHeader
            eyebrow="Simple from the start"
            title="From an idea to an itinerary"
            subtitle="One clear conversation. A plan you can understand. No account required."
          />
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "01",
                "Tell us your wish",
                "Choose a pilgrimage or holiday, your dates and who’s coming along.",
              ],
              [
                "02",
                "Make it yours",
                "Discuss departure city, stays, room sharing and the pace you prefer.",
              ],
              [
                "03",
                "Review every detail",
                "Check the written quotation, inclusions, exclusions and cancellation terms.",
              ],
              [
                "04",
                "Confirm your journey",
                "Book only after availability, eligibility and final arrangements are confirmed.",
              ],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-[20px] border border-border bg-card p-5">
                <span className="text-[12px] font-bold tracking-[.16em] text-gold">{number}</span>
                <h3 className="mt-6 text-[17px] font-semibold">{title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </Section>

        <div className="border-y border-border bg-surface/60">
          <Section id="pilgrim-guide">
            <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
              <div>
                <p className="eyebrow">Before your pilgrimage</p>
                <h2 className="mt-3 font-display text-[38px] leading-[1.1] sm:text-[44px]">
                  Prepared with care.
                  <br />
                  Travel with clarity.
                </h2>
                <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted-foreground">
                  A few important checks before you confirm an Umrah or Hajj journey. Always review
                  current guidance for your nationality and travel dates.
                </p>
                <a
                  href="https://umrah.nusuk.sa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold"
                >
                  Visit official Nusuk guidance <ArrowUpRight size={16} />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
              <div className="grid gap-3">
                {[
                  {
                    icon: FileCheck2,
                    title: "Documents & the correct visa",
                    text: "Check passport and visa eligibility. Hajj requires its own authorisation; an Umrah or tourist visa does not permit Hajj.",
                    href: "https://www.hajcommittee.gov.in/",
                    label: "Haj Committee of India",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Health & travel readiness",
                    text: "Review current vaccination and health requirements. Discuss mobility needs and necessary assistance before booking.",
                    href: "https://www.moh.gov.sa/en/healthawareness/pilgrims-health/pages/default.aspx",
                    label: "Saudi Ministry of Health",
                  },
                  {
                    icon: CalendarDays,
                    title: "Permits & appointments",
                    text: "Check relevant Nusuk permits and Rawdah appointments. Access is subject to official availability and approval.",
                    href: "https://www.nusuk.sa/",
                    label: "Official Nusuk platform",
                  },
                ].map(({ icon: Icon, title, text, href, label }) => (
                  <div
                    key={title}
                    className="flex gap-4 rounded-[18px] border border-border bg-card p-5"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface text-gold">
                      <Icon size={21} />
                    </span>
                    <div>
                      <h3 className="text-[15px] font-semibold">{title}</h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                        {text}
                      </p>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex min-h-11 items-center gap-1 text-[12px] font-semibold"
                      >
                        {label}
                        <ArrowUpRight size={14} />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        <Section id="travel-planner">
          <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="eyebrow">Your next chapter</p>
              <h2 className="mt-3 font-display text-[42px] leading-[1.08] sm:text-[50px]">
                Tell us where.
                <br />
                We’ll talk about how.
              </h2>
              <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                A sacred journey, a family escape or a place you’ve always wanted to see. Share a
                few details to start a conversation.
              </p>
              <div className="mt-7 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-champagne">
                  <HeartHandshake size={23} />
                </span>
                <p className="text-[13px] leading-relaxed">
                  Personal planning.
                  <br />
                  <span className="text-muted-foreground">No payment needed to enquire.</span>
                </p>
              </div>
              <a
                href={`tel:+${travelContact.phone}`}
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold"
              >
                Prefer a call? {travelContact.displayPhone}
                <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="rounded-[24px] border border-border bg-card p-5 shadow-card sm:p-7">
              <h3 className="font-display text-[28px]">Your journey, one simple step at a time.</h3>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  "Choose your journey",
                  "Dates & departure",
                  "Your travellers",
                  "Pick a package",
                  "Personal preferences",
                  "Review & contact",
                ].map((label, index) => (
                  <div key={label} className="rounded-xl bg-background p-4">
                    <span className="text-gold text-sm">0{index + 1}</span>
                    <p className="mt-2 text-sm font-semibold">{label}</p>
                  </div>
                ))}
              </div>
              <Button full className="mt-6" onClick={() => planJourney(enquiryJourney)}>
                PLAN MY JOURNEY <ArrowRight size={17} />
              </Button>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                No account or payment needed. Review everything before sending your request, then
                receive a reference for your enquiry.
              </p>
            </div>
          </div>
        </Section>

        <Section id="travel-faqs" className="!pt-0">
          <div className="mx-auto max-w-[820px]">
            <SectionHeader eyebrow="A few helpful answers" title="Before you take the first step" />
            <div className="mt-6 divide-y divide-border border-y border-border">
              {travelFAQs.map(([question, answer]) => (
                <details key={question} className="group">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-5 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
                    {question}
                    <ChevronDown
                      size={18}
                      className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="pb-6 pr-6 text-[14px] leading-relaxed text-muted-foreground">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </Section>
      </main>

      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8">
          <div className="grid gap-9 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="brightness-0 invert">
                <BrandLogo className="h-8" />
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[.2em] text-champagne">
                Tours & Travels
              </p>
              <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-white/65">
                Sacred journeys and beautiful escapes.
                <br />
                Thoughtful planning, with you at the heart.
              </p>
              <Link
                href="/"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-[13px] text-champagne"
              >
                Discover Majlise Aala Catering <ArrowUpRight size={15} />
              </Link>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[.18em] text-white/50">Explore</p>
              <div className="mt-4 grid gap-1">
                {travelCategories.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectCategory(item.id)}
                    className="min-h-11 text-left text-[14px] text-white/80"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[.18em] text-white/50">
                Let’s talk travel
              </p>
              <a href={`tel:+${travelContact.phone}`} className="mt-4 block py-3 text-[14px]">
                {travelContact.displayPhone}
              </a>
              <a href="/travel/plan" className="flex min-h-11 items-center gap-2 text-[14px]">
                Plan your trip <ArrowUpRight size={15} />
              </a>
              <a href="#pilgrim-guide" className="block py-3 text-[14px]">
                Pilgrim preparation guide
              </a>
              <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-white/55">
                All journeys are enquiry-based. Final availability, inclusions and terms are
                confirmed in your quotation.
              </p>
            </div>
          </div>
          <div className="mt-9 flex flex-wrap justify-between gap-4 border-t border-white/15 pt-6 text-[11px] text-white/55">
            <p>© {new Date().getFullYear()} Majlise Aala. All rights reserved.</p>
            <p>Destination photography: Unsplash</p>
          </div>
        </div>
      </footer>

      <nav
        aria-label="Travel quick navigation"
        className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] lg:hidden"
      >
        <div className="mx-auto flex h-[72px] max-w-md items-center rounded-[22px] border border-primary bg-primary text-white shadow-float">
          {[
            { href: "/travel", label: "Home", icon: Home },
            { href: "#explore", label: "Explore", icon: Globe2 },
          ].map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              className="flex h-full flex-1 flex-col items-center justify-center gap-1 text-[11px]"
            >
              <Icon size={21} strokeWidth={1.6} />
              {label}
            </a>
          ))}
          <a
            href="/travel/plan"
            className="relative -top-3 flex h-[60px] w-[66px] shrink-0 flex-col items-center justify-center gap-1 rounded-[20px] border border-gold/70 bg-primary text-[10px] font-semibold"
          >
            <Plane size={23} />
            PLAN
          </a>
          <a
            href="#pilgrim-guide"
            className="flex h-full flex-1 flex-col items-center justify-center gap-1 text-[11px]"
          >
            <FileCheck2 size={21} strokeWidth={1.6} />
            Guide
          </a>
          <a
            href="/orders?service=travel"
            className="flex h-full flex-1 flex-col items-center justify-center gap-1 text-[11px]"
          >
            <ClipboardList size={21} strokeWidth={1.6} />
            Bookings
          </a>
        </div>
      </nav>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[85dvh] w-[calc(100%-32px)] max-w-xl overflow-y-auto rounded-[24px] p-6 sm:p-8">
          {selected && (
            <>
              <p className="eyebrow">{selected.label}</p>
              <DialogTitle className="font-display text-[33px] font-medium leading-tight">
                {selected.name}
              </DialogTitle>
              <DialogDescription className="text-[14px] leading-relaxed">
                {selected.description}
              </DialogDescription>
              <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <MapPin size={14} />
                {selected.places} · {selected.duration}
              </p>
              {selectedPackage && <TravelPrice pkg={selectedPackage} />}
              {selectedPackage && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold">Included in the package plan</h3>
                    <ul className="mt-2 space-y-2 text-xs leading-relaxed text-muted-foreground">
                      {selectedPackage.inclusions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Not included</h3>
                    <ul className="mt-2 space-y-2 text-xs leading-relaxed text-muted-foreground">
                      {selectedPackage.exclusions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              <h3 className="mt-2 text-[14px] font-semibold">How your journey could look</h3>
              <ol className="grid gap-4">
                {selected.itinerary.map(([title, text], index) => (
                  <li key={title} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-champagne text-[12px] font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold">{title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="rounded-xl bg-surface p-3 text-[12px] leading-relaxed text-muted-foreground">
                An itinerary idea, subject to availability. Request exact hotel names, nights,
                transfers, meals, flight details, visa services and cancellation terms in your
                quotation.
              </p>
              <Button onClick={() => planJourney(selected.name)} full>
                ENQUIRE ABOUT THIS JOURNEY <ArrowRight size={16} />
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
