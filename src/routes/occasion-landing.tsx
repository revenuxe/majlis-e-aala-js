"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardCheck,
  CookingPot,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import biryaniImg from "@/assets/cat-biryani.jpg";
import kebabImg from "@/assets/cat-kebabs.jpg";
import mainsImg from "@/assets/cat-mains.jpg";
import {
  inr,
  packageGuestFit,
  packageGuestRange,
  packageTotalFor,
  type CateringPackage,
} from "@/lib/data";
import { usePlan } from "@/lib/plan-store";
import { Button, SectionHeader, cx } from "@/components/ui-kit";

type OccasionKind = "walima" | "aqiqah" | "corporate";

type Content = {
  eventName: string;
  searchName: string;
  eyebrow: string;
  h1: string;
  introTitle: string;
  intro: string;
  focusTitle: string;
  focus: readonly string[];
  planningTitle: string;
  planning: string;
  customTitle: string;
  custom: string;
  faq: readonly [string, string][];
  image: string | { src: string };
  imageAlt: string;
};

const content: Record<OccasionKind, Content> = {
  walima: {
    eventName: "Walima",
    searchName: "Walima catering in Bangalore",
    eyebrow: "Walima catering • Bangalore",
    h1: "Walima Catering in Bangalore.",
    introTitle: "A Generous Meal for a Joyful Gathering.",
    intro:
      "A Walima brings family and guests together after the Nikah. Majlis E Aala helps you begin with a suitable menu, guest count and service plan, then shape the details around your celebration.",
    focusTitle: "What We Plan Around Your Walima",
    focus: [
      "Guest count and venue",
      "Biryani and main-course balance",
      "Starters and refreshments",
      "Package menu options",
    ],
    planningTitle: "A Walima Menu Needs Balance.",
    planning:
      "The final spread is more than a list of dishes. The size of the gathering, meal timing, menu variety and serving style all influence the plan. Share your details so we can guide the right starting point.",
    customTitle: "Make Your Walima Menu Your Own.",
    custom:
      "Begin with a current package, then discuss the dishes and requirements that matter to your family.",
    faq: [
      [
        "What Walima catering packages are available?",
        "The current Walima packages shown on this page come from our live package catalogue. Open any package to see its menu sections.",
      ],
      [
        "Can I customise my Walima menu?",
        "Yes. Choose a starting package and share your menu preferences with the catering team.",
      ],
      [
        "Do you cater for large Walima gatherings?",
        "We plan around your guest count and venue details. Request a quotation with your expected guests for practical guidance.",
      ],
      [
        "How do I get a Walima catering quote in Bangalore?",
        "Start the planning flow or contact the team on WhatsApp with your date, venue area and guest count.",
      ],
    ],
    image: biryaniImg,
    imageAlt: "Biryani for a Walima catering celebration in Bangalore",
  },
  aqiqah: {
    eventName: "Aqiqah",
    searchName: "Aqiqah catering in Bangalore",
    eyebrow: "Aqiqah catering • Bangalore",
    h1: "Aqiqah Catering in Bangalore.",
    introTitle: "A Thoughtful Meal for a Meaningful Occasion.",
    intro:
      "For an Aqiqah gathering, food is part of welcoming family and friends. Majlis E Aala helps you shape an appropriate menu around your guest list, preferred dishes and venue.",
    focusTitle: "Plan Your Aqiqah Gathering with Care",
    focus: [
      "Family guest lists",
      "Traditional meal choices",
      "Flexible menu options",
      "Venue and serving requirements",
    ],
    planningTitle: "A Comfortable Family Meal Starts with a Clear Plan.",
    planning:
      "Knowing the guest count, meal time and menu preference early makes it easier to balance food choices and quantities. Our planning flow captures these details before your menu is finalised.",
    customTitle: "Aqiqah Menus, Shaped Around Your Family.",
    custom:
      "Explore the current Aqiqah packages, then adjust the menu conversation around your gathering.",
    faq: [
      [
        "Do you offer Aqiqah catering in Bangalore?",
        "Yes. Select an Aqiqah package shown here or start a custom catering enquiry with your date and guest count.",
      ],
      [
        "Can I choose a custom Aqiqah menu?",
        "Yes. A package is a useful starting point, and your family’s preferred dishes can be discussed with the team.",
      ],
      [
        "How many guests should I plan food for?",
        "Use your expected attendance as a starting point. Final quantities depend on the full menu, service style and guest profile.",
      ],
      [
        "How can I request an Aqiqah quote?",
        "Start planning online or message the catering team with your venue area, pincode, date and estimated guest count.",
      ],
    ],
    image: mainsImg,
    imageAlt: "Family-style food for an Aqiqah catering gathering in Bangalore",
  },
  corporate: {
    eventName: "Corporate Events",
    searchName: "Corporate event catering in Bangalore",
    eyebrow: "Corporate event catering • Bangalore",
    h1: "Corporate Event Catering in Bangalore.",
    introTitle: "Food That Supports a Well-Run Event.",
    intro:
      "From team lunches and office celebrations to meetings and larger company gatherings, Majlis E Aala helps you begin with the event format, guest count and menu requirements.",
    focusTitle: "Corporate Catering, Planned Around the Event",
    focus: [
      "Event format and guest count",
      "Menu preference",
      "Buffet and service options",
      "Venue area and timing",
    ],
    planningTitle: "A Clear Catering Brief Makes the Event Smoother.",
    planning:
      "Share the date, venue, guest count and preferred meal format early. This gives the catering team the information needed to guide menus and suitable package options for your corporate event.",
    customTitle: "Build a Menu That Fits Your Team.",
    custom:
      "Choose a live package as a starting point, then discuss food preference, format and optional services for your event.",
    faq: [
      [
        "What corporate events do you cater for in Bangalore?",
        "Use the planning flow for office gatherings, team lunches, meetings and corporate celebrations, then share the format and guest count with the team.",
      ],
      [
        "Can we customise a corporate catering menu?",
        "Yes. Start with a current package or tell us your menu requirements when requesting a quotation.",
      ],
      [
        "Can you plan for buffet service?",
        "Available services are shown during package selection. Share your event requirements so the team can guide the appropriate option.",
      ],
      [
        "How can I get a corporate catering quote?",
        "Provide the event date, Bengaluru venue area, pincode, guest count and preferred meal format through the planning flow or WhatsApp.",
      ],
    ],
    image: kebabImg,
    imageAlt: "Catering food for a corporate event in Bangalore",
  },
};

function imageSrc(asset: string | { src: string }) {
  return typeof asset === "string" ? asset : asset.src;
}

export function OccasionLanding({ kind }: { kind: OccasionKind }) {
  const copy = content[kind];
  const router = useRouter();
  const { occasions, packages, plan, update } = usePlan();
  const [openPackage, setOpenPackage] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const occasion = occasions.find(
    (item) => item.name.trim().toLowerCase() === copy.eventName.toLowerCase(),
  );
  const eventPackages = useMemo(
    () => packages.filter((pkg) => pkg.eventCategoryId === occasion?.id),
    [packages, occasion],
  );
  const planEvent = (pkg?: CateringPackage) => {
    update({
      occasion: occasion?.id ?? pkg?.eventCategoryId ?? plan.occasion,
      mode: "package",
      ...(pkg
        ? {
            packageId: pkg.id,
            foodPreference: pkg.foodPreference ?? "mixed",
            services: pkg.includedServices ?? [],
          }
        : {}),
    });
    router.push("/plan?step=1");
  };
  return (
    <main className="overflow-x-clip">
      <section className="mx-auto max-w-[1280px] px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="relative isolate overflow-hidden rounded-[24px] bg-primary text-primary-foreground sm:rounded-[30px]">
          <img
            src={imageSrc(copy.image)}
            alt={copy.imageAlt}
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/25" />
          <div className="relative flex min-h-[460px] flex-col justify-end px-5 pb-7 pt-20 sm:min-h-[530px] sm:max-w-3xl sm:px-10 sm:pb-12">
            <p className="eyebrow text-gold">{copy.eyebrow}</p>
            <h1 className="mt-3 font-display text-[42px] leading-[.96] sm:text-[60px]">
              {copy.h1}
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-primary-foreground/80 sm:text-[17px]">
              Flexible catering packages, menu planning and food options shaped around your event.
            </p>
            <div className="mt-6 grid gap-3 sm:flex">
              <Button size="lg" variant="champagne" onClick={() => planEvent()}>
                Plan My {copy.eventName.replace(" Events", " Event")}{" "}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <a
                href="#packages"
                className="inline-flex h-14 items-center justify-center rounded-[12px] border border-white/30 px-6 text-[16px] font-semibold"
              >
                Explore Packages
              </a>
            </div>
          </div>
        </div>
      </section>
      <Section>
        <SectionHeader eyebrow={copy.searchName} title={copy.introTitle} subtitle={copy.intro} />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {copy.focus.map((item) => (
            <div
              className="rounded-[18px] border border-border bg-card p-4 text-[13px] font-semibold shadow-card"
              key={item}
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
            <p className="eyebrow">Bengaluru venue planning</p>
            <h2 className="mt-2 font-display text-[32px] leading-none">Tell Us Where and When.</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              Share your date, Bengaluru venue area, pincode and expected guests. This helps us
              guide you towards a practical starting menu and catering plan.
            </p>
          </div>
        </div>
      </Section>
      <Section>
        <SectionHeader
          eyebrow="Planning matters"
          title={copy.planningTitle}
          subtitle={copy.planning}
        />
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            [Users, "Guests"],
            [ClipboardCheck, "Menu"],
            [CookingPot, "Service"],
          ].map(([Icon, title]) => {
            const Visual = Icon as typeof Users;
            return (
              <div className="rounded-[18px] border border-border bg-card p-4" key={String(title)}>
                <Visual className="h-5 w-5 text-gold" />
                <p className="mt-5 text-[14px] font-semibold">{title as string}</p>
              </div>
            );
          })}
        </div>
      </Section>
      <Section id="packages" className="scroll-mt-6">
        <SectionHeader
          eyebrow={`${copy.eventName} packages`}
          title="Explore Current Catering Packages"
          subtitle="Open a package to see its menu sections, then choose it as the starting point for your event."
        />
        {eventPackages.length ? (
          <div className="no-scrollbar -mx-5 mt-6 flex snap-x gap-4 overflow-x-auto px-5 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-3">
            {eventPackages.map((pkg) => (
              <Package
                key={pkg.id}
                pkg={pkg}
                guests={plan.guests}
                open={openPackage === pkg.id}
                onToggle={() => setOpenPackage(openPackage === pkg.id ? null : pkg.id)}
                onChoose={() => planEvent(pkg)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[20px] border border-border bg-card p-6">
            <p className="font-semibold">Packages are being prepared for this occasion.</p>
            <p className="mt-2 text-[14px] text-muted-foreground">
              Share your event details for a custom catering quotation.
            </p>
            <Button className="mt-5" onClick={() => planEvent()}>
              Get a custom quote
            </Button>
          </div>
        )}
      </Section>
      <Section className="py-5">
        <div className="rounded-[24px] bg-primary p-6 text-primary-foreground sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-9">
          <div>
            <p className="eyebrow text-gold">Need guidance?</p>
            <h2 className="mt-2 font-display text-[34px]">Not Sure Which Menu Fits?</h2>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-primary-foreground/75">
              Tell us the occasion, guest count and venue details. We’ll help you start with the
              right package.
            </p>
          </div>
          <Button className="mt-5 sm:mt-0" variant="champagne" onClick={() => planEvent()}>
            Help Me Choose
          </Button>
        </div>
      </Section>
      <Section>
        <SectionHeader
          eyebrow="Flexible by design"
          title={copy.customTitle}
          subtitle={copy.custom}
        />
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            "Welcome drinks",
            "Starters",
            "Main course",
            "Biryani",
            "Desserts",
            "Refreshments",
            "Optional services",
          ].map((item) => (
            <span
              className="rounded-full border border-border bg-card px-4 py-2.5 text-[13px] font-medium"
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
        <Button className="mt-6" onClick={() => planEvent()}>
          Create My Menu <ArrowRight className="h-4 w-4" />
        </Button>
      </Section>
      <Section className="py-5">
        <div className="rounded-[24px] border border-border bg-card p-6 sm:p-9">
          <SectionHeader eyebrow="A clear next step" title="How It Works" />
          <ol className="mt-7 grid gap-5 sm:grid-cols-4">
            {[
              ["Share details", "Date, venue and guest count."],
              ["Explore packages", "Pick a suitable menu."],
              ["Customise", "Discuss requirements."],
              ["Confirm", "Finalise your catering plan."],
            ].map(([title, detail], index) => (
              <li key={title}>
                <p className="text-[12px] font-bold tracking-[.18em] text-gold">0{index + 1}</p>
                <p className="mt-3 font-semibold">{title}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">{detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>
      <Section>
        <SectionHeader eyebrow="Helpful answers" title={`${copy.eventName} Catering FAQs`} />
        <div className="mt-6 divide-y overflow-hidden rounded-[20px] border border-border bg-card">
          {copy.faq.map(([question, answer], index) => (
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
      <Section className="pb-12">
        <div className="rounded-[26px] bg-primary p-7 text-center text-primary-foreground sm:p-11">
          <p className="eyebrow text-gold">{copy.searchName}</p>
          <h2 className="mt-3 font-display text-[42px] leading-none">
            Let’s Plan Your Event Catering.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-primary-foreground/75">
            Share your date, venue and guest count. We’ll help you begin with a menu that fits the
            occasion.
          </p>
          <Button size="lg" variant="champagne" className="mt-7" onClick={() => planEvent()}>
            Get My Quote <ArrowRight className="h-4 w-4" />
          </Button>
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

function Package({
  pkg,
  guests,
  open,
  onToggle,
  onChoose,
}: {
  pkg: CateringPackage;
  guests: number;
  open: boolean;
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
      <h3 className="font-display text-[30px] leading-none">{pkg.name}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        {pkg.tagline || "A thoughtfully planned catering menu."}
      </p>
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
            aria-expanded={open}
            className="flex w-full items-center justify-between px-4 py-3 text-[14px] font-semibold"
          >
            View Full Menu{" "}
            <ChevronDown className={cx("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
          {open && (
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
