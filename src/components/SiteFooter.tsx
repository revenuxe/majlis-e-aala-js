import { Link } from "@tanstack/react-router";
import { BrandLogo } from "./Brand";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8">
        <div className="brightness-0 invert">
          <BrandLogo className="h-6" />
        </div>
        <p className="mt-5 max-w-sm text-[14px] leading-relaxed opacity-70">
          Premium Halal catering for weddings, Walima, Aqiqah, corporate and private
          gatherings across Bengaluru.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-50">
              Catering
            </p>
            <div className="mt-4 grid gap-2.5 text-[14px] opacity-85">
              <Link to="/menu">Explore Menu</Link>
              <Link to="/packages">Catering Packages</Link>
              <Link to="/plan">Plan Your Catering</Link>
              <Link to="/my-menu">Your Catering Plan</Link>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-50">
              Occasions
            </p>
            <div className="mt-4 grid gap-2.5 text-[14px] opacity-85">
              <Link to="/events">Weddings & Walima</Link>
              <Link to="/events">Nikah & Aqiqah</Link>
              <Link to="/events">Corporate Events</Link>
              <Link to="/events">Ramadan & Iftar</Link>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-50">
              Contact
            </p>
            <div className="mt-4 grid gap-2.5 text-[14px] opacity-85">
              <a href="tel:+919000000000">+91 90000 00000</a>
              <a href="https://wa.me/919000000000" target="_blank" rel="noreferrer">
                Chat with Catering Team
              </a>
              <Link to="/about">Our Halal Commitment</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-[12px] opacity-50">
          © {new Date().getFullYear()} Majlise Aala. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
