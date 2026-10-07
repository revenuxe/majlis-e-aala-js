import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
} from "lucide-react";
import { BrandLogo } from "@/components/Brand";
import { travelContact, travelWhatsApp } from "@/lib/travel";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Contact our travel team",
  description:
    "Contact Majlise Aala in Bengaluru for Umrah, Hajj and holiday enquiries, package guidance and booking support.",
  path: "/travel/contact",
});

export default function TravelContactPage() {
  const whatsapp = travelWhatsApp(
    "Assalamu alaikum, I would like to speak with your travel team about a journey.",
  );
  return (
    <div className="min-h-screen bg-background [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-gold">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" aria-label="Majlise Aala home">
            <BrandLogo className="h-8" />
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm">
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="relative overflow-hidden rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-gold/20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 right-0 h-80 w-80 rounded-full border border-gold/15"
          />
          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-champagne">
              Contact our travel team
            </p>
            <h1 className="mt-4 font-display text-[40px] leading-[1.1] sm:text-6xl">
              Every journey starts
              <br className="hidden sm:block" /> with a conversation.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
              Planning Umrah, preparing for Hajj or exploring a holiday? Tell us what you have in
              mind. We’ll help you understand your options and the next step.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-champagne">
              <MapPin size={16} aria-hidden="true" />
              Based in Bengaluru, here for your journey.
            </p>
          </div>
        </section>

        <section aria-label="Ways to contact us" className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Chat on WhatsApp",
              text: "Share your dates and ask about packages at your own pace.",
              value: "Start a conversation",
              href: whatsapp,
              icon: MessageCircle,
              external: true,
            },
            {
              title: "Give us a call",
              text: "Talk through your journey, group size or an existing request.",
              value: travelContact.displayPhone,
              href: `tel:+${travelContact.phone}`,
              icon: Phone,
              external: false,
            },
            {
              title: "Send an email",
              text: "Send your questions or booking details for our team to review.",
              value: "majliseaala@gmail.com",
              href: "mailto:majliseaala@gmail.com",
              icon: Mail,
              external: false,
            },
          ].map(({ title, text, value, href, icon: Icon, external }) => (
            <a
              key={title}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-gold sm:p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-champagne/50 text-gold">
                <Icon size={21} aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-lg font-semibold">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
              <span className="mt-5 flex items-center justify-between gap-2 border-t border-border pt-4 text-sm font-semibold">
                <span className="break-all">{value}</span>
                <ArrowUpRight size={17} className="shrink-0 text-gold" aria-hidden="true" />
              </span>
              {external && <span className="sr-only">Opens in a new tab</span>}
            </a>
          ))}
        </section>

        <section className="mt-8 grid gap-6 rounded-2xl border border-gold/30 bg-champagne/20 p-6 sm:p-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">
              A little preparation helps
            </p>
            <h2 className="mt-3 font-display text-3xl">Let’s make the next step easy.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              You don’t need a finished plan. A few details help us suggest suitable packages and
              check the right arrangements.
            </p>
            <Link
              href="/travel/packages"
              className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Explore packages
              <Plane size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              "Your journey: Umrah, Hajj or a holiday",
              "Preferred dates and departure city",
              "Number of adults and children, with ages at travel",
              "Package name or reference number, if you have one",
            ].map((text) => (
              <p key={text} className="flex items-start gap-3 text-sm leading-relaxed">
                <Check size={17} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                {text}
              </p>
            ))}
            <p className="border-t border-gold/20 pt-4 text-xs leading-relaxed text-muted-foreground">
              For an existing request, include your reference so we can find the details. Please
              avoid sending passports, payment details or OTPs in your first message.
            </p>
          </div>
        </section>
        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          Enquiries do not confirm a booking. Availability and final arrangements are confirmed in
          writing.
        </p>
      </main>
      <footer className="border-t border-border px-5 py-6">
        <nav
          aria-label="Footer"
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
        >
          <Link className="inline-flex min-h-11 items-center" href="/">
            Home
          </Link>
          <Link className="inline-flex min-h-11 items-center" href="/terms">
            Terms &amp; Conditions
          </Link>
          <Link className="inline-flex min-h-11 items-center" href="/privacy">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
