import { createFileRoute, Link } from "@tanstack/react-router";
import { standards } from "@/lib/data";
import { BrandLogo } from "@/components/Brand";
import { Button, HalalBadge, SectionHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Our Halal Commitment | Majlise Aala" },
      {
        name: "description",
        content:
          "Majlise Aala is a premium Halal catering brand in Bengaluru. Read about our sourcing, kitchen standards and Halal commitment.",
      },
      { property: "og:title", content: "About Majlise Aala" },
      {
        property: "og:description",
        content: "Premium Halal catering, prepared with care for celebrations of every size.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="mx-auto max-w-[860px] px-5 py-10 sm:px-8">
      <BrandLogo className="h-6" />
      <h1 className="mt-8 font-display text-[38px] leading-[1.08] sm:text-[48px]">
        Hospitality, prepared with care.
      </h1>
      <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground">
        Majlise Aala is a premium Halal catering house serving weddings, Walima, Aqiqah,
        corporate functions and private gatherings across Bengaluru. Every menu is cooked in
        small batches on the day of your event, by a team that has served celebrations from
        thirty guests to well over a thousand.
      </p>

      <div className="mt-10 rounded-[20px] border border-border bg-card p-6 sm:p-8">
        <HalalBadge />
        <h2 className="mt-5 font-display text-[28px]">Our Halal Commitment</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          All meat is sourced from certified Halal suppliers we have worked with for years.
          Preparation, storage and service are kept fully separate from any non-Halal product,
          and our kitchen team is trained on these standards as part of onboarding. If you would
          like certification details for your event, our catering team will share them on request.
        </p>
      </div>

      <div className="mt-12">
        <SectionHeader eyebrow="Why us" title="The Majlise Aala Standard" />
        <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {standards.map((s) => (
            <div key={s.title} className="border-t border-border pt-5">
              <span className="gold-rule block" />
              <h3 className="mt-4 text-[17px] font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-[14px] text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Link to="/plan">
          <Button size="lg" full className="sm:w-auto sm:px-8">
            Plan Your Catering
          </Button>
        </Link>
        <a href="https://wa.me/919000000000" target="_blank" rel="noreferrer">
          <Button size="lg" variant="outline" full className="sm:w-auto sm:px-8">
            Chat with Catering Team
          </Button>
        </a>
      </div>
    </main>
  );
}
