"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const focused = path.startsWith("/plan") || path.startsWith("/admin");

  useEffect(() => {
    // Hash-only links are intentionally left untouched.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [path]);

  return (
    <>
      {!focused && <SiteHeader />}
      {children}
      {!focused && (
        <>
          <SiteFooter />
          <div className="h-24 lg:hidden" />
          <BottomNav />
        </>
      )}
    </>
  );
}
