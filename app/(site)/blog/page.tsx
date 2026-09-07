import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { BlogHero } from "@/components/blog/BlogHero";
import { weddingGuide } from "@/lib/blog";
import weddingImage from "@/assets/editorial-wedding.jpg";

export const metadata: Metadata = {
  title: "Catering & Wedding Planning Blog in Bangalore",
  description:
    "Explore the Majlis E Aala journal for wedding menu ideas, Nikah and Walima catering advice, guest planning and thoughtful celebrations in Bangalore.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "The Majlis E Aala Journal",
    description: "Thoughtful menus and practical wedding catering advice for Bengaluru gatherings.",
    url: "/blog",
    images: [
      {
        url: weddingImage.src,
        width: weddingImage.width,
        height: weddingImage.height,
        alt: "Wedding celebration inspiration",
      },
    ],
  },
};

export default function BlogPage() {
  return (
    <main>
      <BlogHero />
      <section
        id="latest"
        className="mx-auto max-w-[1280px] scroll-mt-28 px-5 py-14 sm:px-8 sm:py-20"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">A little inspiration, a clearer plan</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">From our journal</h2>
          </div>
          <span className="rounded-full border border-border bg-card px-4 py-2 text-sm">
            Wedding planning
          </span>
        </div>
        <Link
          href={`/blog/${weddingGuide.slug}`}
          className="group grid overflow-hidden rounded-[28px] border border-border bg-card shadow-card transition-shadow hover:shadow-float focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold md:grid-cols-2"
        >
          <div className="relative min-h-72 overflow-hidden">
            <Image
              src={weddingImage}
              alt="A decorated venue ready for a wedding feast"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            />
            <span className="absolute left-5 top-5 rounded-full bg-background px-4 py-2 text-xs font-semibold">
              The wedding planning guide
            </span>
          </div>
          <div className="p-7 sm:p-10 lg:p-12">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Wedding planning · 12 minute read
            </p>
            <h3 className="mt-5 font-display text-3xl leading-tight sm:text-4xl">
              {weddingGuide.title}
            </h3>
            <p className="mt-5 leading-7 text-muted-foreground">
              A generous meal starts with a thoughtful plan. Explore menu combinations, understand
              your quote, and make the details of your Nikah or Walima feel manageable.
            </p>
            <span className="mt-8 inline-flex items-center gap-3 font-semibold">
              Read the complete guide <ArrowUpRight size={20} aria-hidden="true" />
            </span>
          </div>
        </Link>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {[
            {
              title: "Planning a Nikah?",
              text: "Explore catering for a meaningful family celebration.",
              href: "/nikah",
            },
            {
              title: "Hosting your Walima?",
              text: "Find a menu that fits the rhythm of your reception.",
              href: "/walima",
            },
            {
              title: "Ready to choose dishes?",
              text: "Start with packages and shape your catering plan.",
              href: "/packages",
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-gold"
            >
              <h3 className="font-display text-2xl">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.text}</p>
              <ArrowRight className="mt-5 text-gold" size={20} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
