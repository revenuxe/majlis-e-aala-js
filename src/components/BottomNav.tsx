import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarCheck, ClipboardList, Home, UtensilsCrossed, User } from "lucide-react";
import { usePlan } from "@/lib/plan-store";
import { cx } from "./ui-kit";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/my-menu", label: "Orders", icon: ClipboardList },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { itemCount } = usePlan();

  const link = (to: string, label: string, Icon: typeof Home) => {
    const active = to === "/" ? path === "/" : path.startsWith(to);
    return (
      <Link
        key={to}
        to={to}
        className={cx(
          "press flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1",
          active ? "text-foreground" : "text-muted-text",
        )}
      >
        <span className="relative">
          <Icon className="h-[21px] w-[21px]" strokeWidth={active ? 2 : 1.6} />
          {to === "/my-menu" && itemCount > 0 && (
            <span
              className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-primary-foreground"
              style={{ background: "var(--primary)" }}
            >
              {itemCount}
            </span>
          )}
        </span>
        <span className="text-[11px] font-medium">{label}</span>
        {active && <span className="h-[2px] w-4 rounded-full" style={{ background: "var(--gold)" }} />}
      </Link>
    );
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[calc(10px+env(safe-area-inset-bottom))] lg:hidden">
      <div className="mx-auto flex h-[72px] max-w-md items-center rounded-[22px] border border-border bg-card shadow-[var(--shadow-float)]">
        {link(items[0].to, items[0].label, items[0].icon)}
        {link(items[1].to, items[1].label, items[1].icon)}

        <div className="relative flex h-full w-[74px] shrink-0 justify-center">
          <Link
            to="/plan"
            className="press absolute -top-6 flex h-[58px] w-[58px] flex-col items-center justify-center rounded-[20px] bg-primary text-primary-foreground shadow-[var(--shadow-float)]"
            aria-label="Plan your catering"
          >
            <CalendarCheck className="h-[21px] w-[21px]" strokeWidth={1.8} />
            <span className="mt-0.5 text-[9px] font-bold tracking-[0.14em]" style={{ color: "var(--champagne)" }}>
              PLAN
            </span>
          </Link>
        </div>

        {link(items[2].to, items[2].label, items[2].icon)}
        {link(items[3].to, items[3].label, items[3].icon)}
      </div>
    </nav>
  );
}
