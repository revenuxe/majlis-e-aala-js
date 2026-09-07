import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Phone } from "lucide-react";
import { BlogHero } from "@/components/blog/BlogHero";
import { guideFaqs, guideSections, menuIdeas, weddingGuide } from "@/lib/blog";
import { siteUrl } from "@/lib/site-url";
import biryaniImage from "@/assets/cat-biryani.jpg";
import heroImage from "@/assets/hero-banquet.jpg";

const path = `/blog/${weddingGuide.slug}`;
export const metadata: Metadata = {
  title: "Muslim Wedding Catering Bangalore: Menu & Budget Guide",
  description: weddingGuide.description,
  alternates: { canonical: path },
  openGraph: {
    type: "article",
    title: weddingGuide.title,
    description: weddingGuide.description,
    url: path,
    images: [
      {
        url: heroImage.src,
        width: heroImage.width,
        height: heroImage.height,
        alt: "Wedding banquet setting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: weddingGuide.title,
    description: weddingGuide.description,
    images: [heroImage.src],
  },
};

const related = [
  { href: "/nikah", title: "Nikah catering", text: "Bring your ceremony and meal plans together." },
  {
    href: "/walima",
    title: "Walima catering",
    text: "Plan a welcoming reception around your guests.",
  },
  {
    href: "/packages",
    title: "Explore packages",
    text: "Compare menus and find your starting point.",
  },
];

export default function WeddingGuidePage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${siteUrl}${path}#article`,
        headline: weddingGuide.title,
        description: weddingGuide.description,
        mainEntityOfPage: `${siteUrl}${path}`,
        image: new URL(heroImage.src, siteUrl).href,
        author: { "@type": "Organization", name: "Majlis E Aala", url: `${siteUrl}/about` },
        publisher: {
          "@id": `${siteUrl}/#business`,
          "@type": "Organization",
          name: "Majlis E Aala",
          url: siteUrl,
        },
        inLanguage: "en-IN",
        articleSection: "Wedding planning",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
          { "@type": "ListItem", position: 3, name: weddingGuide.title, item: `${siteUrl}${path}` },
        ],
      },
    ],
  };
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <BlogHero article />
      <div className="mx-auto grid max-w-[1280px] items-start gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-16 lg:py-16">
        <aside className="lg:sticky lg:top-28">
          <nav
            aria-label="Article contents"
            className="rounded-2xl border border-border bg-card p-5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              In this guide
            </p>
            <ol className="mt-5 space-y-3">
              {guideSections.map((section, i) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex gap-3 text-sm leading-6 hover:underline underline-offset-4"
                  >
                    <span className="text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    {section.title}
                  </a>
                </li>
              ))}
              <li>
                <a className="block py-2 text-sm hover:underline" href="#questions">
                  Your questions, answered
                </a>
              </li>
            </ol>
          </nav>
          <div className="mt-5 rounded-2xl bg-primary p-6 text-white">
            <p className="font-display text-2xl">Your celebration, your menu.</p>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Turn these ideas into a catering plan for your date and guest count.
            </p>
            <Link
              href="/plan"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-champagne px-4 py-3 text-sm font-semibold text-primary"
            >
              Plan your catering <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </aside>
        <article className="min-w-0 max-w-[820px]">
          <div className="rounded-[24px] border border-gold/40 bg-champagne/30 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em]">The short version</p>
            <p className="mt-4 font-display text-2xl leading-snug sm:text-3xl">
              Choose a meal your guests will love. Give the service as much thought as the menu.
            </p>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              {[
                "Start with a realistic guest count",
                "Build around a signature main",
                "Compare complete quotations",
                "Confirm the day’s service plan",
              ].map((text) => (
                <div key={text} className="flex gap-2">
                  <Check size={18} className="shrink-0 text-halal" aria-hidden="true" />
                  {text}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-8 text-lg leading-8 text-muted-foreground">
            Planning a wedding meal brings together family favourites, practical decisions and a
            little anticipation. This guide helps you work through them in a sensible order, whether
            you are arranging an intimate Nikah lunch or a larger Walima reception in Bengaluru.
          </p>
          {guideSections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 border-b border-border py-9 sm:py-12"
            >
              <p className="text-xs font-bold tracking-[0.18em] text-muted-foreground">
                THE GUIDE / {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                {section.title}
              </h2>
              <div className="mt-6 space-y-5 text-base leading-8 text-foreground/85 sm:text-[17px]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 35)}>{paragraph}</p>
                ))}
              </div>
              {section.id === "nikah-and-walima" && (
                <p className="mt-5 leading-7">
                  Explore our{" "}
                  <Link className="underline decoration-gold underline-offset-4" href="/nikah">
                    Nikah catering in Bangalore
                  </Link>{" "}
                  and{" "}
                  <Link className="underline decoration-gold underline-offset-4" href="/walima">
                    Walima catering options
                  </Link>{" "}
                  to start shaping each celebration.
                </p>
              )}
              {section.id === "build-your-menu" && (
                <div className="mt-8 grid gap-4 xl:grid-cols-3">
                  {menuIdeas.map((menu, i) => (
                    <div key={menu.title} className="rounded-2xl border border-gold/35 bg-card p-5">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Menu inspiration 0{i + 1}
                      </span>
                      <h3 className="mt-4 font-display text-2xl">{menu.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{menu.note}</p>
                      <ul className="mt-5 space-y-3 border-t border-border pt-5 text-sm leading-6">
                        {menu.dishes.map((dish) => (
                          <li key={dish} className="flex gap-2">
                            <span aria-hidden="true" className="text-gold">
                              ✦
                            </span>
                            {dish}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              {section.id === "biryani-and-portions" && (
                <figure className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
                  <Image
                    src={biryaniImage}
                    alt="Biryani served with aromatic rice, a centrepiece for a wedding menu"
                    sizes="(max-width: 1024px) 100vw, 820px"
                    className="aspect-[16/9] w-full object-cover"
                  />
                  <figcaption className="px-5 py-4 text-sm leading-6 text-muted-foreground">
                    Build the rest of the meal around your chosen biryani, then confirm portions for
                    the complete menu.
                  </figcaption>
                </figure>
              )}
              {section.id === "catering-budget" && (
                <div className="mt-7 rounded-2xl border border-gold/40 bg-surface p-6">
                  <h3 className="font-display text-2xl">
                    Compare the whole celebration, not just a plate.
                  </h3>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    Use our{" "}
                    <Link
                      href="/packages"
                      className="text-foreground underline decoration-gold underline-offset-4"
                    >
                      catering packages
                    </Link>{" "}
                    as a starting point, then{" "}
                    <Link
                      href="/contact"
                      className="text-foreground underline decoration-gold underline-offset-4"
                    >
                      request a quote
                    </Link>{" "}
                    with your venue, date and guest count. Confirm current pricing and inclusions
                    with the team.
                  </p>
                </div>
              )}
            </section>
          ))}
          <section id="questions" className="scroll-mt-28 py-10">
            <p className="eyebrow">A few final details</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">Your questions, answered</h2>
            <div className="mt-7 space-y-3">
              {guideFaqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-border bg-card p-5 open:border-gold/60"
                >
                  <summary className="cursor-pointer py-1 pr-2 font-semibold leading-7 focus-visible:outline-2 focus-visible:outline-gold">
                    {faq.question}
                  </summary>
                  <p className="mt-4 leading-8 text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
          <section className="rounded-[28px] bg-primary p-7 text-white sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-champagne">
              Let’s bring your menu together
            </p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">
              A beautiful meal starts with a conversation.
            </h2>
            <p className="mt-4 leading-8 text-white/80">
              Share your date, venue and guest count with Majlis E Aala. We’ll help you explore a
              menu for your Nikah or Walima and confirm the details for your celebration.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/plan"
                className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-champagne px-5 py-3 font-semibold text-primary hover:bg-white"
              >
                Build your catering plan <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a
                href="tel:+919886285028"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/40 px-5 py-3 hover:bg-white/10"
              >
                <Phone size={16} aria-hidden="true" />
                Speak to our team
              </a>
            </div>
          </section>
          <div className="mt-8 rounded-2xl border border-border p-6">
            <p className="font-semibold">Written by the Majlis E Aala team</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Catering and menu planning for weddings and gatherings in Bengaluru.{" "}
              <Link href="/about" className="text-foreground underline underline-offset-4">
                Get to know us
              </Link>
              .
            </p>
          </div>
        </article>
      </div>
      <section className="mx-auto max-w-[1280px] px-5 pb-8 sm:px-8">
        <h2 className="font-display text-3xl">Take the next step</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {related.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-gold"
            >
              <h3 className="flex items-center justify-between gap-3 font-display text-2xl">
                {card.title}
                <ArrowRight size={20} aria-hidden="true" />
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.text}</p>
            </Link>
          ))}
        </div>
        <Link href="/blog" className="mt-8 inline-block py-3 text-sm underline underline-offset-4">
          Back to the journal
        </Link>
      </section>
    </main>
  );
}
