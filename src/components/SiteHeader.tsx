"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo, BrandMark } from "./Brand";
import { Button, cx } from "./ui-kit";
import { SearchOverlay } from "./SearchOverlay";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Packages", to: "/packages" },
  { label: "Catering", to: "/plan" },
  { label: "Events", to: "/events" },
  { label: "About", to: "/about" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cx(
          "sticky top-0 z-50 w-full transition-all duration-200",
          scrolled ? "border-b border-border bg-background/85 backdrop-blur-md" : "bg-background",
        )}
      >
        {/* Mobile */}
        <div className="mx-auto grid h-16 max-w-[1280px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 lg:hidden">
          <Link href="/" className="press">
            <BrandMark size={54} />
          </Link>
          <button className="press min-w-0 text-left">
            <span className="block text-[11px] uppercase tracking-[0.14em] text-muted-text">
              Catering in
            </span>
            <span className="flex items-center gap-1 text-[14px] font-semibold">
              <span className="truncate">Bengaluru</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            </span>
          </button>
          <div className="flex items-center gap-1">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="press grid h-10 w-10 place-items-center rounded-full"
            >
              <Search className="h-[19px] w-[19px]" strokeWidth={1.75} />
            </button>
            <Link
              href="/profile/drafts"
              aria-label="Saved drafts"
              className="press grid h-10 w-10 place-items-center rounded-full"
            >
              <Heart className="h-[19px] w-[19px]" strokeWidth={1.75} />
            </Link>
          </div>
        </div>

        {/* Desktop */}
        <div className="mx-auto hidden h-[84px] max-w-[1280px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-8 px-8 lg:grid">
          <Link href="/" className="press">
            <BrandLogo className="h-12" />
          </Link>
          <nav className="flex min-w-0 items-center justify-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                href={l.to}
                className={cx(
                  "text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground",
                  pathname === l.to ? "text-foreground" : "",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="press grid h-11 w-11 place-items-center rounded-full border border-border bg-card"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
            <a
              href="https://wa.me/919886285028"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="press grid h-11 w-11 place-items-center rounded-full border border-border bg-card"
            >
              <img src="/whatsapp.svg" alt="" className="h-[18px] w-[18px]" />
            </a>
            <Link href="/plan">
              <Button size="md" className="tracking-[0.08em]">
                PLAN CATERING
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
