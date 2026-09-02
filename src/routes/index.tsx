import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import heroImg from "@/assets/hero-banquet.jpg";
import biryaniImg from "@/assets/cat-biryani.jpg";
import kebabImg from "@/assets/cat-kebabs.jpg";
import weddingImg from "@/assets/editorial-wedding.jpg";
import {
  categories,
  dishes,
  editorialImage,
  inr,
  occasions,
  packageTotalFor,
  packages,
  serviceAreas,
  standards,
  testimonials,
} from "@/lib/data";
import { usePlan } from "@/lib/plan-store";
import { FoodCard } from "@/components/FoodCard";
import {
  Button,
  ChoiceCard,
  Chip,
  HalalBadge,
  QuantitySelector,
  SectionHeader,
  cx,
} from "@/components/ui-kit";

export const Route = createFileRoute("/")({
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
});

function Home() {
  const mostLoved = dishes.filter((d) => d.tags?.includes("most-loved")).slice(0, 4);

  return (
    <main>
      <Hero />
      <OccasionSelector />
      <QuickPlanner />
      <MenuPreview />
      <MostLoved dishes={mostLoved} />
      <Packages />
      <BuildYourMenuCTA />
      <WeddingEditorial />
      <Standards />
      <Testimonials />
      <ServiceAreas />
    </main>
  );
}

function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("mx-auto max-w-[1280px] px-5 py-12 sm:px-8 sm:py-16", className)}>
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
    eyebrow: "Packages from ₹1,00,000 / Mann",
    title: "Classic To Royal.",
    text: "Complete menus with refreshment stations, grand table, crockery and service staff.",
  },
];

function Hero() {
  const [index, setIndex] = useState(0);
  const count = heroSlides.length;

  const go = useCallback((dir: number) => setIndex((i) => (i + dir + count) % count), [count]);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => window.clearInterval(id);
  }, [count]);

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-4 sm:px-8 sm:pt-6">
      <div className="relative overflow-hidden rounded-[22px] bg-soft-black sm:rounded-[28px]">
        {/* Slides */}
        <div className="relative h-[440px] sm:h-[520px] lg:h-[600px]">
          {heroSlides.map((s, i) => (
            <div
              key={s.title}
              aria-hidden={i !== index}
              className={cx(
                "absolute inset-0 transition-opacity duration-700",
                i === index ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <img
                src={s.image}
                alt={s.eyebrow}
                loading={i === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,12,11,0.92)] via-[rgba(12,12,11,0.45)] to-[rgba(12,12,11,0.15)]" />
            </div>
          ))}

          {/* Copy */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-9 lg:p-12">
            <div className="max-w-xl">
              <span
                className="eyebrow block"
                style={{ color: "var(--gold)" }}
                key={heroSlides[index]!.eyebrow}
              >
                {heroSlides[index]!.eyebrow}
              </span>
              <h1 className="mt-3 font-display text-[38px] leading-[1.04] text-white sm:text-[54px] lg:text-[64px]">
                {heroSlides[index]!.title}
              </h1>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/75 sm:text-[16px]">
                {heroSlides[index]!.text}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to="/plan" className="sm:w-auto">
                  <Button size="lg" full className="sm:w-auto sm:px-8">
                    Plan Your Catering
                  </Button>
                </Link>
                <Link to="/packages" className="sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    full
                    className="border-white/35 bg-white/10 text-white sm:w-auto sm:px-8"
                  >
                    View Packages
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop arrows */}
          <button
            aria-label="Previous slide"
            onClick={() => go(-1)}
            className="press absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur lg:grid"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Next slide"
            onClick={() => go(1)}
            className="press absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur lg:grid"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute right-5 top-5 flex gap-1.5 sm:right-9 sm:top-8">
            {heroSlides.map((s, i) => (
              <button
                key={s.title}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cx(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-7 bg-white" : "w-1.5 bg-white/45",
                )}
              />
            ))}
          </div>

          <div className="absolute left-5 top-5 sm:left-9 sm:top-8">
            <HalalBadge />
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-[18px] border border-border bg-card p-4 sm:grid-cols-4 sm:p-5">
        {["100% Halal", "Freshly Prepared", "Custom Menus", "Event Catering"].map((t) => (
          <div key={t} className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--gold)" }} />
            {t}
          </div>
        ))}
      </div>
    </section>
  );
}

function OccasionSelector() {
  const { plan, update } = usePlan();
  return (
    <Section>
      <SectionHeader
        eyebrow="Planning something special?"
        title="What's the occasion?"
        subtitle="Pick one and we'll shape the menu around it."
      />
      <div className="no-scrollbar -mx-5 mt-6 flex gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
        {occasions.map((o) => {
          const selected = plan.occasion === o.id;
          return (
            <button
              key={o.id}
              onClick={() => update({ occasion: o.id })}
              className={cx(
                "press relative w-[148px] shrink-0 overflow-hidden rounded-[16px] border text-left",
                selected ? "border-primary" : "border-border",
              )}
            >
              <img src={o.image} alt="" loading="lazy" className="h-[110px] w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[rgba(17,17,17,0.85)] to-transparent" />
              <span className="absolute bottom-3 left-3 text-[14px] font-semibold text-white">
                {o.name}
              </span>
              {selected && (
                <span
                  className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full"
                  style={{ background: "var(--gold)" }}
                >
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Section>
  );
}

function QuickPlanner() {
  const { plan, update } = usePlan();
  const [step, setStep] = useState(0);

  return (
    <Section className="py-6 sm:py-8">
      <div className="rounded-[24px] border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-8">
        <div className="flex items-center gap-3">
          <span className="gold-rule" />
          <span className="eyebrow">Plan your catering</span>
        </div>
        <h3 className="mt-3 font-display text-[28px] leading-tight sm:text-[34px]">
          How many guests are you expecting?
        </h3>

        <div className="mt-6 max-w-sm">
          <QuantitySelector
            size="lg"
            value={plan.guests}
            step={10}
            min={10}
            suffix="Guests"
            onChange={(v) => update({ guests: Math.max(10, v) })}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[25, 50, 100, 200, 300, 500].map((g) => (
            <Chip key={g} active={plan.guests === g} onClick={() => update({ guests: g })}>
              {g === 500 ? "500+" : g}
            </Chip>
          ))}
        </div>

        {step >= 1 && (
          <div className="mt-8 duration-300 animate-in fade-in slide-in-from-bottom-2">
            <p className="eyebrow">Food preference</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {(["nonveg", "veg", "mixed"] as const).map((f) => (
                <ChoiceCard
                  key={f}
                  title={f === "nonveg" ? "Non-Veg" : f === "veg" ? "Veg" : "Mixed"}
                  selected={plan.foodPreference === f}
                  onClick={() => update({ foodPreference: f })}
                />
              ))}
            </div>

            <p className="eyebrow mt-6">Serving style</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {["Buffet", "Packed Meals", "Live Counter", "Traditional Service"].map((s) => (
                <ChoiceCard
                  key={s}
                  title={s}
                  selected={plan.servingStyle === s}
                  onClick={() => update({ servingStyle: s })}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-7">
          {step === 0 ? (
            <Button size="lg" full className="sm:w-auto sm:px-10" onClick={() => setStep(1)}>
              Continue
            </Button>
          ) : (
            <Link to="/plan">
              <Button size="lg" full className="sm:w-auto sm:px-10">
                Find My Menu
              </Button>
            </Link>
          )}
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
          <Link to="/menu" className="hidden shrink-0 items-center gap-1 text-[14px] font-semibold sm:flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/menu"
            className="press relative overflow-hidden rounded-[16px] border border-border"
          >
            <img
              src={c.image}
              alt={c.name}
              loading="lazy"
              className="h-[190px] w-full object-cover sm:h-[260px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(17,17,17,0.85)] via-[rgba(17,17,17,0.15)] to-transparent" />
            <div className="absolute inset-x-4 bottom-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
              <span className="min-w-0">
                <span className="block font-display text-[20px] text-white">{c.name}</span>
                <span className="block text-[12px] text-white/70">{c.items} items</span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-white" />
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
      <SectionHeader eyebrow="Chosen again and again" title="Most Loved Dishes" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((d) => (
          <FoodCard key={d.id} dish={d} />
        ))}
      </div>
    </Section>
  );
}

function Packages() {
  const { plan } = usePlan();
  return (
    <Section>
      <SectionHeader
        eyebrow="Easiest way to plan"
        title="Catering Packages"
        subtitle="Quoted per Mann — one Mann serves 100 guests, crockery and service included."
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {packages.map((p) => (
          <div
            key={p.id}
            className={cx(
              "flex flex-col rounded-[20px] border p-5",
              p.signature
                ? "border-gold bg-champagne/40"
                : "border-border bg-card shadow-[var(--shadow-card)]",
            )}
          >
            {p.signature && (
              <span className="eyebrow mb-2 block" style={{ color: "var(--gold)" }}>
                Flagship
              </span>
            )}
            <h3 className="font-display text-[26px] leading-tight">{p.name}</h3>
            <p className="mt-1.5 text-[13px] text-muted-foreground">{p.tagline}</p>
            <p className="mt-4 text-[24px] font-bold leading-none">
              {inr(p.pricePerMann)}
              <span className="text-[13px] font-medium text-muted-foreground"> / Mann</span>
            </p>
            <p className="mt-1 text-[12px] text-muted-text">
              {inr(packageTotalFor(p, plan.guests))} for {plan.guests} guests
            </p>
            <ul className="mt-4 flex-1 space-y-1.5 text-[13px] text-muted-foreground">
              {p.sections.map((s) => (
                <li key={s.title} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--gold)" }} />
                  <span className="min-w-0">
                    {s.title}
                    <span className="text-muted-text"> · {s.items.length} {s.items.length === 1 ? "item" : "items"}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link to="/packages" className="mt-5">
              <Button full variant={p.signature ? "primary" : "outline"}>
                View Package
              </Button>
            </Link>
          </div>
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
            Full control
          </span>
          <h3 className="mt-2 font-display text-[30px] leading-tight sm:text-[38px]">
            Build your own menu, dish by dish.
          </h3>
          <p className="mt-3 max-w-md text-[15px] opacity-75">
            We guide you category by category and recommend quantities for your guest count.
          </p>
        </div>
        <Link to="/plan">
          <Button size="lg" variant="champagne" full className="lg:w-auto lg:px-8">
            Build My Menu
          </Button>
        </Link>
      </div>
    </Section>
  );
}

function WeddingEditorial() {
  return (
    <Section>
      <div className="overflow-hidden rounded-[24px] border border-border bg-card lg:grid lg:grid-cols-2">
        <img
          src={editorialImage}
          alt="Wedding banquet hall set for a Walima reception"
          loading="lazy"
          className="h-[240px] w-full object-cover sm:h-[320px] lg:h-full"
        />
        <div className="p-7 sm:p-10">
          <span className="eyebrow">Weddings</span>
          <h3 className="mt-3 font-display text-[32px] leading-[1.08] sm:text-[42px]">
            A feast worthy of
            <br />
            your biggest day.
          </h3>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            From intimate Nikah gatherings to grand Walima celebrations, create a menu your
            guests will remember.
          </p>
          <Link to="/events" className="mt-6 inline-block">
            <Button variant="outline" size="lg">
              Plan Wedding Catering <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
}

function Standards() {
  return (
    <Section>
      <SectionHeader eyebrow="Why us" title="The Majlise Aala Standard" />
      <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {standards.map((s) => (
          <div key={s.title} className="border-t border-border pt-5">
            <span className="gold-rule block" />
            <h3 className="mt-4 text-[17px] font-semibold">{s.title}</h3>
            <p className="mt-1.5 text-[14px] text-muted-foreground">{s.note}</p>
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
                <Star key={i} className="h-3.5 w-3.5" style={{ color: "var(--gold)", fill: "var(--gold)" }} />
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
