import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui-kit";

export const metadata = { robots: { index: false, follow: false } };

export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[720px] items-center px-5 py-12 sm:px-8">
      <section className="w-full rounded-[28px] border border-border bg-card p-7 text-center shadow-[var(--shadow-card)] sm:p-10">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" strokeWidth={1.5} />
        <p className="eyebrow mt-6">Booking request received</p>
        <h1 className="mt-3 font-display text-[36px] leading-tight sm:text-[46px]">
          Thank you for choosing Majlise Aala.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
          Our catering team will review your request and contact you shortly to confirm the details.
        </p>
        {ref && (
          <div className="mx-auto mt-7 max-w-sm rounded-[16px] border border-gold/40 bg-champagne/30 px-5 py-4">
            <p className="eyebrow">Booking reference</p>
            <p className="mt-1 font-mono text-[20px] font-semibold tracking-wide">{ref}</p>
          </div>
        )}
        <Link href="/" className="mt-8 inline-block">
          <Button size="lg">Back to home</Button>
        </Link>
      </section>
    </main>
  );
}
