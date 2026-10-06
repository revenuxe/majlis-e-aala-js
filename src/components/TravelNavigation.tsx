"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, FileCheck2, Globe2, Home, Plane } from "lucide-react";
export function TravelNavigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Travel quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="mx-auto flex h-[72px] max-w-md items-center rounded-[22px] border border-primary bg-primary text-white shadow-float">
        {[
          { href: "/travel", label: "Home", icon: Home },
          { href: "/travel/packages", label: "Packages", icon: Globe2 },
          { href: "/travel/plan", label: "Plan", icon: Plane },
          { href: "/travel#pilgrim-guide", label: "Guide", icon: FileCheck2 },
          { href: "/travel/bookings", label: "Bookings", icon: ClipboardList },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            aria-current={
              pathname === href || (href !== "/travel" && pathname.startsWith(href + "/"))
                ? "page"
                : undefined
            }
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] aria-[current=page]:text-gold"
          >
            <Icon size={21} strokeWidth={1.6} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
