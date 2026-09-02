import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  CalendarClock,
  ChevronRight,
  FileText,
  Heart,
  LifeBuoy,
  LogOut,
  MapPin,
  Package,
  ScrollText,
  User,
} from "lucide-react";
import { usePlan } from "@/lib/plan-store";
import { Button, SectionHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile & Saved Menus | Majlise Aala" },
      {
        name: "description",
        content:
          "Manage your details, saved addresses, upcoming events, past catering orders and saved menus.",
      },
      { property: "og:title", content: "Your Profile | Majlise Aala" },
      {
        property: "og:description",
        content: "Saved menus, upcoming events and past catering orders in one place.",
      },
    ],
  }),
  component: ProfilePage,
});

const savedMenus = ["My Walima Menu", "Wedding Menu", "Family Gathering", "Office Iftar"];

const timeline = [
  "Booking Received",
  "Menu Confirmation",
  "Event Scheduled",
  "Preparation",
  "Ready / Dispatched",
  "Completed",
];

const rows = [
  { icon: User, label: "Personal Details" },
  { icon: MapPin, label: "Saved Addresses" },
  { icon: CalendarClock, label: "Upcoming Events" },
  { icon: Package, label: "Past Orders" },
  { icon: FileText, label: "Saved Menus" },
  { icon: Heart, label: "Favourite Dishes" },
  { icon: Bell, label: "Notifications" },
  { icon: LifeBuoy, label: "Support" },
  { icon: ScrollText, label: "Terms" },
];

function ProfilePage() {
  const { plan } = usePlan();
  const activeStep = 2;

  return (
    <main className="mx-auto max-w-[860px] px-5 py-8 sm:px-8">
      <SectionHeader eyebrow="Your account" title="Profile" />

      <div className="mt-6 rounded-[16px] border border-border bg-card p-5">
        <p className="font-display text-[24px]">
          {plan.contact.name || "Guest"}
        </p>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {plan.contact.phone || "Add your mobile number when you request catering."}
        </p>
      </div>

      <section className="mt-8">
        <p className="eyebrow">Upcoming event</p>
        <div className="mt-3 rounded-[16px] border border-border bg-card p-5">
          <p className="text-[15px] font-semibold capitalize">
            {plan.occasion ?? "No event yet"} · {plan.guests} guests
          </p>
          <ol className="mt-5 space-y-4">
            {timeline.map((t, i) => (
              <li key={t} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    background: i <= activeStep ? "var(--halal)" : "var(--border)",
                  }}
                />
                <span
                  className={
                    i <= activeStep
                      ? "text-[14px] font-medium"
                      : "text-[14px] text-muted-text"
                  }
                >
                  {t}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-5 grid gap-1 border-t border-border pt-4 text-[13px] text-muted-foreground">
            <span>Event Coordinator · Adil Shaikh</span>
            <a href="tel:+919000000000">+91 90000 00000</a>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <p className="eyebrow">Saved menus</p>
        <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0">
          {savedMenus.map((m) => (
            <div
              key={m}
              className="w-[220px] shrink-0 rounded-[16px] border border-border bg-card p-5 sm:w-auto"
            >
              <p className="text-[15px] font-semibold">{m}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[12px] text-muted-foreground">
                <span className="rounded-full border border-border px-3 py-1">Duplicate</span>
                <span className="rounded-full border border-border px-3 py-1">Edit</span>
                <span className="rounded-full border border-border px-3 py-1">Request Quote</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 divide-y divide-border overflow-hidden rounded-[16px] border border-border bg-card">
        {rows.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="press grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4 text-left"
          >
            <Icon className="h-[18px] w-[18px] shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <span className="min-w-0 truncate text-[15px]">{label}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-text" />
          </button>
        ))}
      </section>

      <Button variant="outline" size="lg" full className="mt-6">
        <LogOut className="h-4 w-4" /> Logout
      </Button>

      <div className="mt-8 text-center">
        <Link to="/plan">
          <Button size="lg">Plan Your Catering</Button>
        </Link>
      </div>
    </main>
  );
}
