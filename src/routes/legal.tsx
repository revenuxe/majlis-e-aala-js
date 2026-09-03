import { SectionHeader } from "@/components/ui-kit";

const terms = [
  [
    "Booking requests",
    "Submitting a catering request does not create a confirmed booking. A booking is confirmed only after Majlise Aala confirms availability, final menu, service scope, price, payment terms, and event details in writing.",
  ],
  [
    "Quotes, pricing and payments",
    "Website estimates are indicative and may change with guest count, menu choices, venue conditions, staffing, transport, taxes, and final requirements. Any advance payment, balance due date, and cancellation terms will be stated in the confirmed quote or invoice.",
  ],
  [
    "Changes and cancellations",
    "Please request changes or cancellations as early as possible. Whether a change can be accepted, and any applicable charge or refund, depends on the confirmed booking terms, procurement already completed, and the proximity to your event.",
  ],
  [
    "Food and event service",
    "Please tell us about dietary requirements, allergies, venue restrictions, and access arrangements before confirmation. We take reasonable care in preparation and service, but cannot guarantee an allergen-free environment unless this has been expressly agreed in writing.",
  ],
  [
    "Customer responsibilities",
    "You are responsible for providing accurate event, guest, venue, contact, and access details. You must obtain any venue permissions needed for catering, equipment, staff access, counters, or service.",
  ],
  [
    "Contact",
    "For questions about a booking or these terms, contact Majlise Aala at +91 98862 85028 or majliseaala@gmail.com.",
  ],
];
const privacy = [
  [
    "Information we collect",
    "We collect the details you provide when planning or booking: name, phone number, email, venue area, pincode, event details, menu selections, and account information. We also store saved drafts and addresses when you choose to use those features.",
  ],
  [
    "How we use information",
    "We use your information to prepare estimates, manage bookings, communicate about your event, remember your saved details, provide support, and improve our catering service.",
  ],
  [
    "Sharing",
    "We do not sell personal information. We may share information only with staff and service partners who need it to deliver your catering, or where required by law.",
  ],
  [
    "Storage and security",
    "Account, booking, and customer data are stored through our service providers with access controls. No online system can be guaranteed completely secure; please do not share payment card or other sensitive information through public chat channels.",
  ],
  [
    "Your choices",
    "You may ask to review, correct, or delete your stored personal information, subject to records we need to retain for legitimate business or legal purposes. You can also sign out of your account and manage saved profile details in the app.",
  ],
  ["Contact", "For privacy requests, contact majliseaala@gmail.com or +91 98862 85028."],
];

export default function LegalPage({ type }: { type: "terms" | "privacy" }) {
  const isPrivacy = type === "privacy";
  const sections = isPrivacy ? privacy : terms;
  return (
    <main className="mx-auto max-w-[860px] px-5 py-10 sm:px-8">
      <SectionHeader
        eyebrow="Majlise Aala"
        title={isPrivacy ? "Privacy Policy" : "Terms & Conditions"}
        subtitle={`Last updated: 4 September 2026. ${isPrivacy ? "This policy explains how we handle customer information." : "Please read these terms before placing a catering request."}`}
      />
      <div className="mt-8 space-y-6">
        {sections.map(([title, content], index) => (
          <section key={title} className="border-t border-border pt-5">
            <p className="eyebrow">{String(index + 1).padStart(2, "0")}</p>
            <h2 className="mt-2 font-display text-[25px]">{title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{content}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
