import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-banquet.jpg";

export function BlogHero({ article = false }: { article?: boolean }) {
  return (
    <section className="mx-auto max-w-[1280px] px-5 pt-5 sm:px-8 sm:pt-8">
      <div className="relative isolate overflow-hidden rounded-[24px] border border-gold/40 bg-primary shadow-[0_18px_45px_rgba(55,42,25,0.18)] sm:rounded-[32px]">
        <Image
          src={heroImage}
          alt="An elegant banquet setting for a wedding celebration"
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/65 to-black/25" />
        <div className="relative flex min-h-[490px] flex-col justify-between gap-16 p-6 sm:min-h-[540px] sm:p-10 lg:p-12">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-white/90"
          >
            <Link className="hover:underline" href="/">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            {article ? (
              <>
                <Link className="hover:underline" href="/blog">
                  Journal
                </Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">Wedding planning</span>
              </>
            ) : (
              <span aria-current="page">Journal</span>
            )}
          </nav>
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne">
              The Majlis E Aala journal
            </p>
            <h1 className="mt-4 text-balance font-display text-[38px] leading-[1.08] text-white sm:text-[54px] lg:text-[64px]">
              {article ? (
                <>
                  Muslim wedding catering in Bangalore:
                  <span className="text-champagne"> a menu & planning guide.</span>
                </>
              ) : (
                <>
                  Thoughtful planning.
                  <br />
                  <span className="text-champagne">Memorable gatherings.</span>
                </>
              )}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              {article
                ? "From the first menu conversation to the last plate of biryani. A practical guide to hosting your Nikah or Walima with confidence."
                : "Menu inspiration, practical advice and the small details that make everyone feel beautifully hosted."}
            </p>
            {!article && (
              <Link
                href="#latest"
                className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl bg-champagne px-5 py-3 font-semibold text-primary hover:bg-white"
              >
                Explore the journal <ArrowRight size={18} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 rounded-[22px] border border-gold/40 bg-card p-4 text-sm sm:grid-cols-3">
        {[
          {
            Icon: BookOpen,
            label: article ? "By the Majlis E Aala team" : "Ideas for your celebration",
          },
          { Icon: Clock3, label: article ? "12 minute read" : "Practical planning guides" },
          { Icon: MapPin, label: "Made for Bengaluru gatherings" },
        ].map(({ Icon, label }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3">
            <Icon className="shrink-0 text-gold" size={18} aria-hidden="true" />
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}
