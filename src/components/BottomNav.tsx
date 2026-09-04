"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Home, UtensilsCrossed, User } from "lucide-react";
import { usePlan } from "@/lib/plan-store";
import { cx } from "./ui-kit";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/packages", label: "Packages", icon: UtensilsCrossed },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const path = usePathname();
  const { bookings } = usePlan();
  const openBookingCount = bookings.filter((booking) => booking.status !== "cancelled").length;

  const link = (to: string, label: string, Icon: typeof Home) => {
    const active = to === "/" ? path === "/" : path.startsWith(to);
    return (
      <Link
        key={to}
        href={to}
        className={cx(
          "press flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1",
          active ? "text-white" : "text-white/65",
        )}
      >
        <span className="relative">
          <Icon className="h-[21px] w-[21px]" strokeWidth={active ? 2 : 1.6} />
          {to === "/orders" && openBookingCount > 0 && (
            <span
              className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-primary-foreground"
              style={{ background: "var(--primary)" }}
            >
              {openBookingCount}
            </span>
          )}
        </span>
        <span className="text-[11px] font-medium">{label}</span>
        {active && (
          <span className="h-[2px] w-4 rounded-full" style={{ background: "var(--gold)" }} />
        )}
      </Link>
    );
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[calc(10px+env(safe-area-inset-bottom))] lg:hidden">
      <div className="mx-auto flex h-[72px] max-w-md items-center rounded-[22px] border border-primary bg-primary shadow-[var(--shadow-float)]">
        {link(items[0].to, items[0].label, items[0].icon)}
        {link(items[1].to, items[1].label, items[1].icon)}

        <div className="relative flex h-full w-[74px] shrink-0 justify-center">
          <a
            href="https://wa.me/919886285028"
            target="_blank"
            rel="noreferrer"
            className="press absolute -top-6 flex h-[60px] w-[60px] flex-col items-center justify-center rounded-[21px] border-2 border-gold/80 bg-card text-primary shadow-[0_14px_28px_rgba(18,14,9,0.28),0_0_0_4px_var(--primary)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_18px_32px_rgba(18,14,9,0.34),0_0_0_4px_var(--primary)]"
            aria-label="Chat with us on WhatsApp"
          >
            <img src="/whatsapp.svg" alt="" className="h-[23px] w-[23px]" />
            <span className="mt-0.5 text-[9px] font-bold tracking-[0.08em]">CHAT</span>
          </a>
        </div>

        {link(items[2].to, items[2].label, items[2].icon)}
        {link(items[3].to, items[3].label, items[3].icon)}
      </div>
    </nav>
  );
}
