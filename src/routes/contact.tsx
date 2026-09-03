import { Mail, MapPin, Phone } from "lucide-react";
import { Button, SectionHeader } from "@/components/ui-kit";

const phone = "+919886285028";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-[860px] px-5 py-10 sm:px-8">
      <SectionHeader
        eyebrow="We’re here to help"
        title="Contact Majlise Aala"
        subtitle="Tell us about your occasion, guest count, and preferred date. Our catering team will guide you from menu to service."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href={`tel:${phone}`}
          className="rounded-[20px] border border-border bg-card p-5 shadow-card hover:border-gold"
        >
          <Phone className="h-5 w-5 text-gold" />
          <h2 className="mt-4 font-display text-[24px]">Call us</h2>
          <p className="mt-2 text-[15px] text-muted-foreground">+91 98862 85028</p>
        </a>
        <a
          href="mailto:majliseaala@gmail.com"
          className="rounded-[20px] border border-border bg-card p-5 shadow-card hover:border-gold"
        >
          <Mail className="h-5 w-5 text-gold" />
          <h2 className="mt-4 font-display text-[24px]">Email us</h2>
          <p className="mt-2 text-[15px] text-muted-foreground">majliseaala@gmail.com</p>
        </a>
      </div>
      <section className="mt-5 rounded-[20px] border border-gold/30 bg-champagne/25 p-5 sm:p-7">
        <MapPin className="h-5 w-5 text-gold" />
        <h2 className="mt-4 font-display text-[27px]">Catering across Bengaluru</h2>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
          Visit us at 11, 4th Cross, 2nd Main Rd, Shampura, Bengaluru, Karnataka 560045. We cater
          for Nikah, Walima, Aqiqah, weddings, corporate events, and private gatherings. Share your
          venue area and pincode when you contact us so we can plan service and delivery accurately.
        </p>
        <a
          href={`https://wa.me/${phone}`}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block"
        >
          <Button>
            <img src="/whatsapp.svg" alt="" className="h-4 w-4" /> Chat on WhatsApp
          </Button>
        </a>
      </section>
    </main>
  );
}
