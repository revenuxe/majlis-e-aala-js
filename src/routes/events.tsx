import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { editorialImage } from "@/lib/data";
import { Button, SectionHeader } from "@/components/ui-kit";

const routeMetadata = {
  head: () => ({
    meta: [
      { title: "Event Catering — Weddings, Walima, Aqiqah | Majlise Aala" },
      {
        name: "description",
        content:
          "Halal catering for weddings, Walima, Nikah, Aqiqah, corporate events, Ramadan Iftar and private gatherings in Bengaluru.",
      },
      { property: "og:title", content: "Event Catering | Majlise Aala" },
      {
        property: "og:description",
        content: "From intimate Nikah gatherings to grand Walima celebrations.",
      },
    ],
  }),
  component: EventsPage,
};

const editorials = [
  {
    eyebrow: "Nikah & Walima",
    title: "A feast worthy of your biggest day.",
    copy: "From intimate Nikah gatherings to grand Walima celebrations, create a menu your guests will remember.",
  },
  {
    eyebrow: "Aqiqah",
    title: "A warm welcome, beautifully served.",
    copy: "Considered menus for family lunches and Aqiqah gatherings, prepared with care.",
  },
  {
    eyebrow: "Corporate",
    title: "Hospitality your team will notice.",
    copy: "Packed meals, buffets and live counters for offices, conferences and team celebrations.",
  },
];

export default function EventsPage() {
  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
      <SectionHeader
        eyebrow="Occasions"
        title="Catering for every celebration"
        subtitle="Tell us the occasion and we'll shape the menu, service and timing around it."
      />

      <div className="mt-8 space-y-6">
        {editorials.map((e, i) => (
          <div
            key={e.eyebrow}
            className={`overflow-hidden rounded-[24px] border border-border bg-card lg:grid lg:grid-cols-2 ${
              i % 2 === 1 ? "lg:[&>img]:order-2" : ""
            }`}
          >
            <img
              src={editorialImage}
              alt={`${e.eyebrow} catering`}
              loading="lazy"
              className="h-[220px] w-full object-cover lg:h-full"
            />
            <div className="p-7 sm:p-10">
              <span className="eyebrow">{e.eyebrow}</span>
              <h2 className="mt-3 font-display text-[30px] leading-[1.1] sm:text-[38px]">
                {e.title}
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                {e.copy}
              </p>
              <Link href="/plan" className="mt-6 inline-block">
                <Button variant="outline" size="lg">
                  Plan This Catering <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
