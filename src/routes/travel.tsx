"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTravelCatalog } from "@/hooks/use-travel-catalog";
import { packageJourney, travelDate } from "@/lib/travel-booking";
import { useEffect, useState, type ReactNode } from "react";
import { useTravelTravellers } from "@/hooks/use-travel-travellers";
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
  MapPin,
  Menu,
  Plane,
  Pause,
  Play,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Star,
  Users,
  X,
} from "lucide-react";
import { TravelJourneyCards } from "@/components/TravelJourneyCards";
import { TravelNavigation } from "@/components/TravelNavigation";
import { TravelSavedPackagesLink } from "@/components/TravelSavedPackages";
import { BrandLogo, BrandMark } from "@/components/Brand";
import { Button, QuantitySelector, SectionHeader, cx } from "@/components/ui-kit";
import { useTravelHero } from "@/hooks/use-travel-hero";
import type { TravelHomeContent } from "@/lib/travel-home-content";
import {
  travelCategories,
  travelContact,
  travelFAQs,
  travelWhatsApp,
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

export default function TravelHome({ initialContent }: { initialContent?: TravelHomeContent }) {
  const router = useRouter();
  const catalog = useTravelCatalog(initialContent?.packages);
  const journeys = catalog.packages.map(packageJourney);
  const [enquiryJourney, setEnquiryJourney] = useState("Umrah");
  const [mobileMenu, setMobileMenu] = useState(false);
  const {
    adults: travellers,
    children,
    seniors,
    childAges,
    ready: travellersReady,
    setAdults: setTravellers,
  } = useTravelTravellers();
  const today = new Date();
  const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const nextBatch = catalog.departures
    .filter(
      (batch) =>
        batch.is_active &&
        batch.start_date >= todayDate &&
        (!batch.capacity || batch.capacity >= travellers + children) &&
        catalog.packages.some((pkg) => pkg.id === batch.package_id && pkg.is_active),
    )
    .sort((a, b) => a.start_date.localeCompare(b.start_date) || a.id.localeCompare(b.id))[0];
  const nextBatchPackage = catalog.packages.find((pkg) => pkg.id === nextBatch?.package_id);
  const nextBatchHref =
    nextBatch && nextBatchPackage
      ? `/travel/dates?${new URLSearchParams({
          category: nextBatchPackage.category,
          package: nextBatchPackage.id,
          travellers: String(travellers),
          children: String(children),
          seniors: String(seniors),
          childAges: childAges.join(","),
          departure: nextBatch.id,
          date: nextBatch.start_date,
          city: nextBatch.departure_city,
          month: "",
          flexible: "false",
          datesSelected: "1",
        })}`
      : "";
  const [heroIndex, setHeroIndex] = useState(0);
  const { slides: travelHeroSlides } = useTravelHero(initialContent?.slides);
  const [heroPaused, setHeroPaused] = useState(false);
  const [heroInteracting, setHeroInteracting] = useState(false);
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
  function planJourney(journeyName: string) {
    const pkg = catalog.packages.find((item) => item.name === journeyName);
    const chosenCategory =
      pkg?.category ||
      travelCategories.find((item) => item.name.toLowerCase() === journeyName.toLowerCase())?.id;
    const params = new URLSearchParams({
      travellers: String(travellers),
      children: String(children),
      seniors: String(seniors),
    });
    if (chosenCategory) params.set("category", chosenCategory);
    if (pkg) params.set("package", pkg.id);
    router.push("/travel/plan?" + params.toString());
  }

  function selectCategory(value: TravelCategory) {
    router.push(`/travel/packages/${value}`);
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
            href="/"
            aria-label="Majlise Aala Tours and Travels home"
            className="flex min-w-0 items-center gap-3"
          >
            <span className="lg:hidden">
              <BrandMark size={46} />
            </span>
            <span className="min-w-0">
              <span className="hidden lg:block">
                <BrandLogo className="h-9" />
              </span>
              <span className="block text-[11px] font-semibold uppercase tracking-[.16em] lg:mt-1.5 lg:text-[9px]">
                Tours & Travels
              </span>
              <span className="block truncate text-[12px] text-muted-foreground lg:hidden">
                Journeys with meaning
              </span>
            </span>
          </Link>
          <nav
            aria-label="Travel navigation"
            className="hidden items-center gap-6 text-[14px] lg:flex"
          >
            <a href="#explore">Explore</a>
            <a href="#explore">Journeys</a>
            <a href="#pilgrim-guide">Pilgrim guide</a>
            <a href="#travel-faqs">FAQs</a>
            <Link href="/travel/bookings">Bookings</Link>
            <Link href="/travel/profile">Profile</Link>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <TravelSavedPackagesLink />
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
              ["Browse packages", "#explore"],
              ["Pilgrim guide", "#pilgrim-guide"],
              ["Plan your trip", "/travel/plan"],
              ["Bookings", "/travel/bookings"],
              ["Profile", "/travel/profile"],
              ["FAQs", "#travel-faqs"],
            ].map(([label, href]) => (
              <a
                key={label}
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
                      className="h-full w-full object-cover"
                    />
                  </picture>
                </div>
              ))}
              {!travelHeroSlides.length && (
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
                    {currentHero?.title || "Umrah, Hajj & holidays, planned around you."}
                  </h1>
                  <p className="mt-4 text-sm leading-relaxed text-white/85">
                    Umrah journeys, Hajj preparation, international trips and domestic holidays.
                  </p>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      const query = searchQuery.trim().toLowerCase();
                      const match = catalog.packages.find((pkg) =>
                        `${pkg.name} ${pkg.places}`.toLowerCase().includes(query),
                      );
                      router.push(
                        `/travel/packages/${match?.category || "umrah"}?q=${encodeURIComponent(searchQuery.trim())}`,
                      );
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
        </section>

        <Section id="explore">
          <SectionHeader
            eyebrow="Find your kind of journey"
            title="Find your next journey."
            subtitle="Choose what brings you here. We’ll help you take the next step."
          />
          <TravelJourneyCards onSelect={selectCategory} />
        </Section>

        <Section className="!py-6 sm:!py-8">
          {travellersReady && nextBatch && nextBatchPackage && !catalog.departuresError && (
            <section
              aria-labelledby="next-batch-heading"
              className="rounded-xl border border-gold/40 bg-champagne/30 p-5 sm:p-6"
            >
              <div className="flex items-center gap-2 text-gold">
                <CalendarDays size={18} aria-hidden="true" />
                <h3 id="next-batch-heading" className="text-sm font-semibold">
                  Next batch
                </h3>
              </div>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-display text-[26px] leading-tight">{nextBatchPackage.name}</p>
                  <p className="mt-2 text-base font-semibold">{travelDate(nextBatch.start_date)}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin size={15} aria-hidden="true" />
                    From {nextBatch.departure_city}
                  </p>
                </div>
                <Link href={nextBatchHref} className={cx(anchorClass, "w-full shrink-0 sm:w-auto")}>
                  Choose this batch <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Your traveller count and this batch are preselected. Availability is confirmed by
                our team.
              </p>
            </section>
          )}
          {travellersReady && nextBatch && nextBatchPackage && !catalog.departuresError && (
            <div
              aria-hidden="true"
              className="mx-auto flex max-w-xs items-center gap-3 px-6 py-7 sm:py-8"
            >
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/50" />
              <span className="h-1.5 w-1.5 rotate-45 bg-gold/70" />
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/50" />
            </div>
          )}
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
        </Section>

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

        <Section id="testimonials">
          <SectionHeader
            eyebrow="Traveller stories"
            title="Umrah & Hajj stories from Bengaluru"
            subtitle="Sample testimonials — replace with approved customer reviews before publishing."
          />
          <div
            role="region"
            aria-label="Umrah and Hajj sample reviews"
            tabIndex={0}
            className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 focus-visible:outline-gold"
          >
            {[
              {
                title: "A peaceful family journey",
                quote:
                  "Having our flights, stays and travel dates explained together made planning our family Umrah feel much easier.",
                traveller: "Khadeer Ahmed",
                journey: "Umrah",
              },
              {
                title: "Clear from the first conversation",
                quote:
                  "We appreciated being able to compare the airline options and understand our Umrah package before choosing our dates.",
                traveller: "Aliya Afreen",
                journey: "Umrah",
              },
              {
                title: "Thoughtful planning for our parents",
                quote:
                  "Sharing our parents’ needs early helped us discuss a comfortable pace and the support they would need during Hajj.",
                traveller: "Muskan Sheikh",
                journey: "Hajj",
              },
              {
                title: "Prepared for a meaningful Hajj",
                quote:
                  "Discussing the Hajj itinerary, documents and arrangements in advance helped us understand what to prepare for our pilgrimage.",
                traveller: "Sufiyan",
                journey: "Hajj",
              },
            ].map((review) => (
              <figure
                key={review.title}
                className="flex w-[86%] max-w-sm shrink-0 snap-start flex-col rounded-xl border border-gold/25 bg-card p-5 sm:w-[340px] sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="flex gap-1 text-gold"
                    role="img"
                    aria-label="Sample rating: 5 out of 5 stars"
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star key={index} size={16} fill="currentColor" aria-hidden="true" />
                    ))}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold">{review.title}</h3>
                <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  “{review.quote}”
                </blockquote>
                <figcaption className="mt-5 border-t border-border pt-4">
                  <p className="text-sm font-semibold">{review.traveller}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin size={13} aria-hidden="true" />
                    <span>Bengaluru</span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{review.journey}</span>
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

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
                href="/catering"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-[13px] text-champagne"
              >
                Discover Majlise Aala Catering <ArrowUpRight size={15} />
              </Link>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[.18em] text-white/50">Explore</p>
              <div className="mt-4 grid gap-1">
                {travelCategories.map((item) => (
                  <Link
                    key={item.id}
                    href={`/travel/packages/${item.id}`}
                    className="min-h-11 text-left text-[14px] text-white/80"
                  >
                    {item.name}
                  </Link>
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
            <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
              <Link
                href="/terms"
                className="inline-flex min-h-11 items-center text-white/80 hover:text-white"
              >
                Terms &amp; Conditions
              </Link>
              <Link
                href="/privacy"
                className="inline-flex min-h-11 items-center text-white/80 hover:text-white"
              >
                Privacy Policy
              </Link>
            </nav>
          </div>
        </div>
      </footer>

      <TravelNavigation />
    </div>
  );
}
