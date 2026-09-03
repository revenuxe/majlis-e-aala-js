"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardCheck,
  CookingPot,
  HeartHandshake,
  MapPin,
  Menu,
  Minus,
  Plus,
  Sparkles,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import biryaniImg from "@/assets/cat-biryani.jpg";
import kebabImg from "@/assets/cat-kebabs.jpg";
import weddingImg from "@/assets/editorial-wedding.jpg";
import {
  inr,
  packageGuestFit,
  packageGuestRange,
  packageTotalFor,
  type CateringPackage,
} from "@/lib/data";
import { usePlan } from "@/lib/plan-store";
import { Button, SectionHeader, cx } from "@/components/ui-kit";

const WHATSAPP = "https://wa.me/919886285028";

function imageSrc(asset: string | { src: string }) {
  return typeof asset === "string" ? asset : asset.src;
}

const highlights = [
  "Traditional Muslim flavours",
  "Halal food",
  "Flexible packages",
  "Large gatherings",
];
const planning = [
  ["Guest count", Users],
  ["Quantity planning", ClipboardCheck],
  ["Menu balance", Menu],
  ["Food preparation", CookingPot],
  ["Buffet flow", UtensilsCrossed],
  ["Service", HeartHandshake],
] as const;
const care = [
  "Menu planning",
  "Guest count planning",
  "Food preparation",
  "Catering setup",
  "Service",
  "Replenishment",
];
const menuCategories = [
  "Welcome drinks",
  "Starters",
  "Main course",
  "Biryani",
  "Breads",
  "Sides",
  "Desserts",
  "Refreshments",
  "Fun food",
];
const faqs = [
  [
    "What catering packages do you offer for Nikah?",
    "The packages shown here are the current Nikah packages created by our catering team. Each has its own menu sections, and we can help you find the right starting point for your guest count.",
  ],
  [
    "Can I customise a Nikah package?",
    "Yes. Start with a package, then share your family preferences and requirements. Final menu changes are discussed with our catering team.",
  ],
  [
    "Do you provide Halal food for Nikah?",
    "Our Nikah menus are planned with Muslim celebrations in mind. Please share any specific family requirements when you request your quotation.",
  ],
  [
    "How much biryani is needed for 350 guests?",
    "A menu, portions, age mix, starters and other rice dishes all affect the final quantity. The planning guide provides a starting reference; the final quantity is confirmed with your complete menu.",
  ],
  [
    "What does 1 mann mean in catering?",
    "Mann is a traditional bulk-catering reference. In the package flow, each package clearly shows its guest serving reference so that estimates stay easy to understand.",
  ],
  [
    "Can I add a special groom or family table?",
    "Yes. Share this as an optional requirement with the team, and we will discuss the dishes and setup that suit your Nikah.",
  ],
  [
    "Do you cater for large Nikah gatherings?",
    "We plan catering around the guest count and menu requirements. Share your date, venue area and estimated guests for guidance.",
  ],
  [
    "How can I get a Nikah catering quotation?",
    "Use any ‘Plan’ or ‘Quote’ button on this page to begin, or talk to our team on WhatsApp with your event date, venue and guest count.",
  ],
] as const;

export default function NikahPage() {
  const router = useRouter();
  const { occasions, packages, plan, update } = usePlan();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const nikah = occasions.find((item) => item.name.trim().toLowerCase() === "nikah");
  const nikahPackages = useMemo(
    () => packages.filter((item) => Boolean(nikah) && item.eventCategoryId === nikah?.id),
    [nikah, packages],
  );
  const guestCount = Math.max(25, plan.guests || 350);
  const riceReference = Math.max(1, Math.round((guestCount / 350) * 40));

  const startPlanning = (step = 1) => {
    update({ occasion: nikah?.id ?? plan.occasion, mode: "package" });
    router.push(`/plan?step=${step}`);
  };
  const choosePackage = (pkg: CateringPackage) => {
    update({
      occasion: nikah?.id ?? pkg.eventCategoryId ?? plan.occasion,
      packageId: pkg.id,
      mode: "package",
      foodPreference: pkg.foodPreference ?? "mixed",
      services: pkg.includedServices ?? [],
    });
    router.push("/plan?step=1");
  };

  return (
    <main className="overflow-x-clip pb-8 lg:pb-0">
      <section className="mx-auto max-w-[1280px] px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="relative isolate overflow-hidden rounded-[24px] bg-primary text-primary-foreground sm:rounded-[30px]">
          <img
            src={imageSrc(biryaniImg)}
            alt="Aromatic biryani prepared for a Nikah feast"
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/25" />
          <div className="relative flex min-h-[490px] flex-col justify-end px-5 pb-7 pt-20 sm:min-h-[550px] sm:max-w-3xl sm:px-10 sm:pb-12">
            <p className="eyebrow text-gold">Nikah Catering • Bangalore</p>
            <h1 className="mt-3 max-w-2xl font-display text-[42px] leading-[.96] sm:text-[60px]">
              Nikah Catering in Bangalore.
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-primary-foreground/80 sm:text-[17px]">
              Traditional flavours, generous hospitality and thoughtfully planned Muslim wedding
              catering for your Nikah celebration in Bangalore.
            </p>
            <div className="mt-6 grid gap-3 sm:flex">
              <Button size="lg" variant="champagne" onClick={() => startPlanning()}>
                Plan My Nikah <ArrowRight className="h-4 w-4" />
              </Button>
              <a
                href="#nikah-packages"
                className="inline-flex h-14 items-center justify-center rounded-[12px] border border-white/30 px-6 text-[16px] font-semibold transition-colors hover:bg-white/10"
              >
                Explore Packages
              </a>
            </div>
          </div>
        </div>
      </section>

      <Section className="pt-12">
        <SectionHeader
          eyebrow="Thoughtful hospitality"
          title="Made for the Moments That Bring Families Together."
          subtitle="Majlis E Aala plans Nikah catering around your guest count, menu preferences and the traditional dishes your family wants to share."
        />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {highlights.map((item) => (
            <div
              key={item}
              className="rounded-[18px] border border-border bg-card p-4 text-[13px] font-semibold shadow-card"
            >
              <Check className="mb-3 h-4 w-4 text-gold" />
              {item}
            </div>
          ))}
        </div>
      </Section>

      <Section className="py-5">
        <div className="grid gap-5 rounded-[24px] border border-border bg-card p-6 sm:grid-cols-[.8fr_1.2fr] sm:items-center sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-champagne text-gold">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="eyebrow">Bangalore Nikah catering</p>
            <h2 className="mt-2 font-display text-[32px] leading-none">
              Planned Around Your Venue, Guest List and Menu.
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
              Share your Nikah date, Bengaluru venue area, pincode and expected guests. We can then
              guide the package, food selections and catering requirements around your gathering
              instead of making you fit a fixed template.
            </p>
          </div>
        </div>
      </Section>

      <Section className="py-5">
        <div className="grid overflow-hidden rounded-[24px] border border-gold/30 bg-champagne/25 sm:grid-cols-[.8fr_1.2fr]">
          <div className="p-6 sm:p-9">
            <p className="eyebrow">Halal-first</p>
            <h2 className="mt-3 font-display text-[34px] leading-[1.02]">
              Halal Food. Thoughtfully Prepared for Your Nikah.
            </h2>
          </div>
          <div className="grid gap-px bg-gold/20 sm:grid-cols-3">
            {[
              ["Halal-first", "Menus planned with Muslim celebrations in mind."],
              ["Traditional", "Familiar dishes that belong at a memorable Nikah feast."],
              [
                "Family confidence",
                "Food planned with the expectations of a Muslim gathering in mind.",
              ],
            ].map(([title, copy]) => (
              <div className="bg-card p-5" key={title}>
                <p className="text-[14px] font-semibold">{title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="The details matter"
          title="A Nikah Feast Takes More Than a Menu."
          subtitle="When you are serving dozens or hundreds of guests, quantities, timing, preparation, service and menu balance all matter."
        />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {planning.map(([title, Icon], index) => (
            <div key={title} className="rounded-[18px] border border-border bg-card p-4">
              <Icon className="h-5 w-5 text-gold" />
              <p className="mt-7 text-[11px] font-bold tracking-[.14em] text-muted-text">
                0{index + 1}
              </p>
              <p className="mt-1 text-[15px] font-semibold">{title}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="nikah-packages" className="scroll-mt-6">
        <SectionHeader
          eyebrow="Nikah packages"
          title="Choose Your Nikah Feast"
          subtitle="Explore the current Nikah packages, from elegant essentials to a grand celebration spread."
        />
        {nikahPackages.length ? (
          <>
            <div className="no-scrollbar -mx-5 mt-6 flex snap-x gap-4 overflow-x-auto px-5 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-3">
              {nikahPackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  guests={plan.guests}
                  expanded={expanded === pkg.id}
                  onToggle={() => setExpanded(expanded === pkg.id ? null : pkg.id)}
                  onChoose={() => choosePackage(pkg)}
                />
              ))}
            </div>
            <p className="mt-3 text-center text-[12px] text-muted-foreground sm:hidden">
              Swipe to compare packages
            </p>
          </>
        ) : (
          <div className="mt-6 rounded-[20px] border border-border bg-card p-6">
            <p className="font-semibold">Nikah packages are being prepared.</p>
            <p className="mt-2 text-[14px] text-muted-foreground">
              Tell us your guest count and menu preferences for a tailored Nikah quotation.
            </p>
            <Button className="mt-5" onClick={() => startPlanning()}>
              Get a custom quote
            </Button>
          </div>
        )}
      </Section>

      <Section className="py-5">
        <div className="rounded-[24px] bg-primary p-6 text-primary-foreground sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-9">
          <div>
            <p className="eyebrow text-gold">Need a little guidance?</p>
            <h2 className="mt-2 font-display text-[34px]">
              Not Sure Which Package Fits Your Nikah?
            </h2>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-primary-foreground/75">
              Tell us your guest count and celebration details. We’ll help you choose a menu that
              fits your gathering.
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:mt-0">
            <Button variant="champagne" onClick={() => startPlanning()}>
              Help Me Choose
            </Button>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="text-center text-[14px] font-semibold underline underline-offset-4"
            >
              Get a Custom Quote
            </a>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 rounded-[24px] border border-border bg-card p-5 shadow-card sm:grid-cols-2 sm:p-8">
          <div>
            <SectionHeader
              eyebrow="Guest count guide"
              title={`Planning Your Nikah for ${guestCount.toLocaleString("en-IN")} Guests?`}
              subtitle="Use this as a starting planning reference—not a final quantity."
            />
            <div className="mt-6 flex h-14 items-center justify-between rounded-[14px] border border-border px-2">
              <button
                aria-label="Decrease guest count"
                onClick={() => update({ guests: Math.max(25, guestCount - 25) })}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                value={guestCount}
                inputMode="numeric"
                type="number"
                min={25}
                aria-label="Nikah guest count"
                onChange={(event) =>
                  update({ guests: Math.max(0, Number(event.target.value) || 0) })
                }
                className="w-24 bg-transparent text-center text-[18px] font-semibold outline-none"
              />
              <button
                aria-label="Increase guest count"
                onClick={() => update({ guests: guestCount + 25 })}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="rounded-[20px] bg-surface p-5">
            <p className="text-[13px] font-semibold">Traditional bulk reference</p>
            <p className="mt-4 font-display text-[33px]">~{riceReference} kg raw rice</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Planning reference for {guestCount.toLocaleString("en-IN")} guests. One mann is
              commonly used as a traditional bulk quantity reference of approximately 40 kg.
            </p>
            <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
              Final quantity depends on adults and children, starters, other rice dishes, menu size,
              portions and meat quantity. We confirm it with your complete menu.
            </p>
            <Button variant="outline" className="mt-5" onClick={() => startPlanning()}>
              Plan My Guest Count
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Flexible by design"
          title="Make the Menu Yours."
          subtitle="Start with a package and customise the dishes around your celebration."
        />
        <div className="mt-6 flex flex-wrap gap-2">
          {menuCategories.map((item) => (
            <span
              className="rounded-full border border-border bg-card px-4 py-2.5 text-[13px] font-medium"
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
        <Button className="mt-6" onClick={() => startPlanning()}>
          Create My Menu <ArrowRight className="h-4 w-4" />
        </Button>
      </Section>

      <Section className="py-5">
        <div className="relative isolate overflow-hidden rounded-[24px] bg-soft-black p-6 text-primary-foreground sm:p-10">
          <img
            src={imageSrc(kebabImg)}
            alt="Special dishes for the groom and family table"
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
          />
          <p className="eyebrow text-gold">Optional</p>
          <h2 className="mt-3 font-display text-[36px]">
            Something Special for the Groom & Family.
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-primary-foreground/80">
            Ask about a special table for the groom and family. Dish choices and setup can be
            planned around your celebration.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "Mutton Mandi",
              "Fish Fry",
              "Mutton Chops",
              "Tandoori Chicken",
              "Kalmi Chicken",
              "Leg Fry",
            ].map((item) => (
              <span
                className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[12px]"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
          <a
            className="mt-6 inline-flex h-12 items-center rounded-[12px] bg-card px-5 text-[14px] font-semibold text-foreground"
            href={WHATSAPP}
            target="_blank"
            rel="noreferrer"
          >
            Ask About the Special Table
          </a>
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Catering, coordinated"
          title="From the First Menu Choice to the Final Plate."
        />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {care.map((item, index) => (
            <div key={item} className="rounded-[18px] border border-border bg-card p-4">
              <p className="text-[11px] font-bold tracking-[.16em] text-gold">0{index + 1}</p>
              <p className="mt-5 text-[15px] font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="py-5">
        <div className="rounded-[24px] border border-border bg-card p-6 sm:p-9">
          <SectionHeader eyebrow="Simple, clear planning" title="How It Works" />
          <ol className="mt-7 grid gap-5 sm:grid-cols-4">
            {[
              ["Share Your Details", "Date, venue and guest count."],
              ["Choose Your Package", "Pick a starting menu."],
              ["Customise", "Adjust dishes and requirements."],
              ["Celebrate", "We coordinate the catering."],
            ].map(([title, copy], index) => (
              <li key={title}>
                <p className="text-[12px] font-bold tracking-[.18em] text-gold">0{index + 1}</p>
                <p className="mt-3 font-semibold">{title}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">{copy}</p>
              </li>
            ))}
          </ol>
          <Button className="mt-8" onClick={() => startPlanning()}>
            Start Planning My Nikah
          </Button>
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Why Majlis E Aala"
          title="Why Families Choose Majlis E Aala for Their Nikah"
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Halal food",
            "Traditional Muslim flavours",
            "Flexible packages",
            "Thoughtful quantity planning",
            "Large gathering experience",
            "Personalised menus",
          ].map((item) => (
            <div
              className="flex items-center gap-3 rounded-[18px] border border-border bg-card p-4"
              key={item}
            >
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-[14px] font-semibold">{item}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section className="py-5">
        <div className="grid overflow-hidden rounded-[24px] border border-border bg-card sm:grid-cols-2">
          <img
            src={imageSrc(weddingImg)}
            alt="A shared Nikah feast with family and guests"
            loading="lazy"
            className="h-64 w-full object-cover sm:h-full"
          />
          <div className="p-6 sm:p-10">
            <p className="eyebrow">Nikah food experience</p>
            <h2 className="mt-3 font-display text-[38px] leading-[1.02]">
              The Feast Becomes Part of the Memory.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Long after the Nikah is over, people remember the conversations, the laughter, the
              aroma of the biryani and the meal shared with family.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow="Helpful answers" title="Nikah Catering FAQs" />
        <div className="mt-6 divide-y overflow-hidden rounded-[20px] border border-border bg-card">
          {faqs.map(([question, answer], index) => (
            <div key={question}>
              <button
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                aria-expanded={openFaq === index}
              >
                <span>{question}</span>
                <ChevronDown
                  className={cx(
                    "h-4 w-4 shrink-0 text-gold transition-transform",
                    openFaq === index && "rotate-180",
                  )}
                />
              </button>
              {openFaq === index && (
                <p className="border-t border-border px-5 py-4 text-[14px] leading-relaxed text-muted-foreground">
                  {answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section className="pb-8">
        <div className="rounded-[26px] bg-primary p-7 text-center text-primary-foreground sm:p-11">
          <p className="eyebrow text-gold">Nikah catering in Bangalore</p>
          <h2 className="mt-3 font-display text-[42px] leading-none">
            Let’s Plan Your Nikah Feast.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-primary-foreground/75">
            Tell us your date, venue and guest count. We’ll help you shape the menu around your
            celebration.
          </p>
          <div className="mt-7 grid gap-3 sm:flex sm:justify-center">
            <Button size="lg" variant="champagne" onClick={() => startPlanning()}>
              Get My Nikah Quote
            </Button>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-14 items-center justify-center rounded-[12px] border border-white/30 px-6 text-[16px] font-semibold"
            >
              Talk to Our Team
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-[1280px] px-5 py-12 sm:px-8 sm:py-16 ${className}`}>
      {children}
    </section>
  );
}

function PackageCard({
  pkg,
  guests,
  expanded,
  onToggle,
  onChoose,
}: {
  pkg: CateringPackage;
  guests: number;
  expanded: boolean;
  onToggle: () => void;
  onChoose: () => void;
}) {
  const highlights = pkg.sections.flatMap((section) => section.items).slice(0, 4);
  const fit = packageGuestFit(pkg, guests);
  return (
    <article
      className={cx(
        "w-[84vw] max-w-[360px] shrink-0 snap-center rounded-[22px] border bg-card p-5 shadow-card sm:w-auto sm:max-w-none",
        pkg.signature && "border-gold bg-champagne/20",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[30px] leading-none">{pkg.name}</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {pkg.tagline || "A thoughtfully planned Nikah spread."}
          </p>
        </div>
        {pkg.signature && (
          <span className="rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-primary">
            Popular
          </span>
        )}
      </div>
      <div className="mt-4 rounded-[14px] bg-surface p-4">
        <p className="text-[22px] font-bold leading-none">{inr(packageTotalFor(pkg, guests))}</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Estimate for {guests.toLocaleString("en-IN")} guests · package serves{" "}
          {packageGuestRange(pkg)}
        </p>
      </div>
      {fit !== "within" && (
        <p className="mt-3 rounded-[12px] border border-gold/35 bg-champagne/30 px-3 py-2.5 text-[12px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Tailored estimate. </span>
          {fit === "below"
            ? "Some inclusions or quantities may change for a smaller guest count. Our catering expert will confirm the final menu and price with you."
            : "Final quantities and price for the larger guest count will be confirmed with our catering expert."}
        </p>
      )}
      <div className="mt-5 rounded-[16px] bg-surface p-4">
        <p className="text-[11px] font-bold uppercase tracking-[.14em] text-gold">
          Menu highlights
        </p>
        <p className="mt-2 text-[14px] leading-relaxed">
          {highlights.length
            ? highlights.join(" · ")
            : "Menu details available with our catering team."}
        </p>
      </div>
      {pkg.sections.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-[15px] border border-border">
          <button
            onClick={onToggle}
            aria-expanded={expanded}
            className="flex w-full items-center justify-between px-4 py-3 text-[14px] font-semibold"
          >
            View Full Menu{" "}
            <ChevronDown className={cx("h-4 w-4 transition-transform", expanded && "rotate-180")} />
          </button>
          {expanded && (
            <div className="border-t border-border bg-surface/50 p-4">
              {pkg.sections.map((section) => (
                <div className="mb-3 last:mb-0" key={section.title}>
                  <p className="text-[12px] font-semibold">{section.title}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    {section.items.length ? section.items.join(" · ") : "Included in this package"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <Button full className="mt-5" onClick={onChoose}>
        Choose This Package <ArrowRight className="h-4 w-4" />
      </Button>
    </article>
  );
}
