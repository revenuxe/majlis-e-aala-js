import { SectionHeader } from "@/components/ui-kit";

const terms = [
  [
    "About these terms and contacting us",
    "These terms apply to the Majlise Aala website and our travel and catering enquiries. Contact us at majliseaala@gmail.com or +91 98862 85028 for quotations, support, cancellations or complaints. The service provider, supplier arrangements and contact details applicable to your booking should be identified in your written confirmation. Please retain your quotation, confirmation and receipts. You must be at least 18 to make a booking, or act through a parent or legal guardian, and have authority to provide details for your group.",
  ],
  [
    "Enquiries are not confirmed bookings",
    "Sending a request, choosing an airline, saving a package or selecting a batch does not reserve seats, rooms, visas or catering capacity. A website reference acknowledges your request only. Confirmation requires our written acceptance of availability, itinerary or menu, inclusions, total price, applicable supplier conditions and payment schedule. Do not make non-refundable onward arrangements based solely on a website estimate.",
  ],
  [
    "Quotations, package prices and children",
    "Website prices are starting guides in Indian rupees unless stated otherwise. Per-adult prices and adult estimates do not include a child fare unless expressly stated. Children are quoted according to age at travel, airline rules, room occupancy and other requirements. Senior travellers are included in the adult count. Room sharing, seasonal rates, flight selection, taxes, exchange rates and availability can affect your quotation. Only inclusions expressly listed in your written quotation are included; please check meals, baggage, transfers, insurance, visa assistance and optional services before accepting. We will disclose applicable charges and material corrections before you commit.",
  ],
  [
    "Payments and booking documents",
    "Any deposit, balance deadline, payment method and supplier deadlines will be provided in writing before payment. The website enquiry process itself does not require payment. Pay only through a method confirmed by our team and request a receipt; never disclose an OTP, account password or card PIN. Failure to meet an agreed payment deadline may result in release of reservations or cancellation subject to the disclosed terms. We will not introduce undisclosed cancellation charges after your acceptance.",
  ],
  [
    "Travel batches, airlines, hotels and changes",
    "Batch dates and displayed capacity are planning information until confirmed. Airlines, schedules, accommodation and transport remain subject to supplier confirmation. A selected airline is a preference until ticketing is confirmed. We will explain material changes and any price impact and seek your agreement where required; available alternatives or refunds depend on the affected services and applicable law. Supplier baggage, check-in, name correction, fare and accommodation rules should be supplied or made available before booking.",
  ],
  [
    "Passports, visas, Umrah and Hajj",
    "You are responsible for accurate traveller names, valid travel documents and meeting the entry, transit, health and permit requirements that apply to your nationality and itinerary. Our assistance cannot guarantee a visa, permit, appointment or admission: these decisions belong to the relevant authorities. Hajj requires the appropriate official authorisation; an Umrah or tourist visa is not a Hajj authorisation. Hajj services will only be arranged through legally permitted channels. Never assume that an advertised package or enquiry confirms eligibility or an allocation. Ask our team for the current process and review official guidance before paying.",
  ],
  [
    "Health, accessibility and travel insurance",
    "Tell us before confirmation about accessibility requirements, mobility assistance, dietary needs or arrangements necessary for a child or older traveller. Share only information needed to arrange support. Acceptance of specific assistance must be confirmed in writing. Consider suitable travel insurance and check its exclusions, medical cover and cancellation protection. Insurance is included only when expressly listed, and claims are decided by the insurer under the policy.",
  ],
  [
    "Customer changes, cancellations and refunds",
    "Send a change or cancellation request to our published contact details with your booking reference and ask for acknowledgement. Charges depend on the written terms accepted before booking, actual supplier restrictions, work already performed and applicable law; a request does not itself cancel issued tickets or other supplier reservations. Ask for an itemised explanation of deductions and the amount refundable. We will communicate the expected processing time and any supplier dependency. No universal no-refund rule applies through this page, and statutory refund or consumer remedies are not excluded.",
  ],
  [
    "Disruption or cancellation by us or a supplier",
    "Severe weather, official restrictions, airline disruption, public health measures and other events beyond reasonable control can affect services. We will communicate known material disruption and discuss reasonable alternatives. Rescheduling, cancellation charges, refunds and unrecoverable supplier costs depend on the accepted arrangements and applicable law. Such events do not automatically remove your statutory rights or excuse our own failure to exercise reasonable care.",
  ],
  [
    "Catering services",
    "A catering booking requires written agreement on the menu, final guest count, venue, timings, service scope, equipment, access, taxes, payment schedule and change deadlines. Please disclose allergies and dietary restrictions before confirmation. Shared preparation environments may involve cross-contact; an allergen-free service must never be assumed. You are responsible for providing accurate venue information and obtaining agreed access and venue permissions. Food storage, leftovers and service extensions should be agreed in advance.",
  ],
  [
    "Responsibilities, suppliers and liability",
    "We will exercise reasonable care in the services we undertake and in communicating the arrangements. Airlines, hotels, insurers and other independent suppliers may perform parts of a journey under their own disclosed conditions; this does not remove responsibilities imposed on us by law. You are responsible for accurate information, timely attendance, lawful conduct and following reasonable safety instructions. Neither party is responsible for losses caused solely by the other party or unrelated events. Nothing excludes liability for fraud, wilful misconduct, negligence where exclusion is unlawful, or any non-excludable consumer right.",
  ],
  [
    "Website use and information",
    "Use the website lawfully and do not misuse accounts, submit another person's information without authority, interfere with security or copy protected content without permission. Images are illustrative unless expressly identified as the actual accommodation or service. We may correct website errors, but a change does not retrospectively alter an accepted booking without agreement or a lawful basis. Website access may occasionally be interrupted.",
  ],
  [
    "Complaints, governing law and changes",
    "Contact us promptly with your reference, supporting documents and the resolution you seek so we can investigate. Indian law applies, subject to any mandatory protections available to you. You retain access to competent consumer commissions, courts and other remedies available by law; these terms do not impose exclusive Bengaluru jurisdiction or mandatory arbitration. Updates will carry a new date. The terms and disclosed supplier conditions accepted for a confirmed booking apply to that booking unless a lawful change or mutually agreed variation is made.",
  ],
];
const privacy = [
  [
    "Scope and privacy contact",
    "This policy covers information handled through the Majlise Aala website, accounts, travel requests, catering bookings and related customer communications. For questions, access, corrections, deletion or a privacy complaint, contact majliseaala@gmail.com or +91 98862 85028 and identify your request as a privacy matter. We may ask for proportionate verification to avoid disclosing information to the wrong person.",
  ],
  [
    "Information you provide",
    "We process your name, phone number, email, account details and information you choose to submit. Travel details can include journey category, selected package and airline, batch or preferred dates, departure city, adult and child counts, children's ages, preferences and support requests. Catering details can include event dates, guest counts, venue or address, pincode, menus and dietary requirements. Booking references, quotations, communication history and booking status may also be retained. Please do not include unnecessary sensitive information in free-text notes.",
  ],
  [
    "Travel documents and special requirements",
    "Passport or identity documents, visa information and health or accessibility details may be needed later for a particular confirmed arrangement; the initial planning form is not a request to upload these documents. We will explain why additional information is needed and how to provide it. Share it only through a channel agreed with our team. Do not send passwords, OTPs, card PINs or unnecessary identity documents through website notes or public messages.",
  ],
  [
    "Accounts, technical information and browser storage",
    "Accounts and booking records use Supabase services. Authentication may process your email, user identifier, session information and information supplied through an enabled sign-in provider. The site stores authentication sessions and, where used, traveller counts, child ages, saved package choices, travel-date selections and draft progress in browser storage so that choices survive navigation and refresh. Some selections also appear in the page URL; avoid sharing a booking-planner URL if you do not want its contents shared. Hosting and infrastructure providers may process technical request information such as IP address, browser details and security logs.",
  ],
  [
    "How we use information",
    "We use information to respond to requests, prepare and explain quotations, check group requirements, arrange agreed services, maintain booking records, support accounts and saved choices, provide customer support, prevent misuse and meet legal obligations. We do not treat an enquiry as blanket permission for unrelated advertising. If promotional messages are offered, you can decline or ask us to stop them; essential service messages may still be needed for an active request or booking.",
  ],
  [
    "When information is shared",
    "Relevant details may be shared with authorised staff and providers needed for hosting, authentication, customer support or the service you request. For agreed travel arrangements this may include airlines, accommodation providers, transport operators, insurers, authorised travel partners and visa or permit authorities. Catering partners receive only details relevant to their role. We may disclose information when legally required or necessary to address fraud, security incidents or legal claims. We do not sell your personal information.",
  ],
  [
    "International processing and external services",
    "Travel arrangements may require information to be sent to suppliers or authorities outside India, including destination and transit countries. Technology providers may also process information in their service locations. Such processing is subject to applicable legal requirements and relevant provider arrangements. WhatsApp, sign-in providers, official guidance sites and other external services operate under their own privacy policies; opening a link or contacting us through them may disclose information to those providers.",
  ],
  [
    "Children and information about your group",
    "A parent, guardian or appropriately authorised adult should provide children's information. Ages are requested to assess fare and service requirements rather than to create a child's account. Please provide only necessary details and ensure you have authority to share information about accompanying travellers. Contact us if a child has submitted information independently or if group information was shared without authority so we can assess and address the request.",
  ],
  [
    "Retention and deletion",
    "We retain enquiry and booking information only for the purposes described here and for applicable accounting, legal, dispute-resolution and security requirements. Retention depends on the type of record, whether a booking proceeds and relevant obligations; we do not promise one deletion period for every record. You can request deletion of information no longer needed. Records subject to a lawful retention requirement, active claim or fraud investigation may need to be retained, and backup copies may take time to expire through their normal lifecycle.",
  ],
  [
    "Security and shared devices",
    "We use access controls and service-provider security features to help protect records, but no internet service can promise absolute security. Keep account access private, sign out on shared devices and clear site storage if you do not want drafts and saved choices to remain there. Clearing browser data may remove local drafts but does not delete submitted requests or server records. Report suspected unauthorised access promptly using our contact details.",
  ],
  [
    "Your choices and requests",
    "You may contact us to request access to your information, correction, deletion, withdrawal of consent where processing depends on consent, or to raise a grievance, subject to applicable law. Explain the information or request involved without sending unnecessary identity documents. We will assess the request, explain any verification needed and communicate relevant limitations or lawful retention requirements. Withdrawing information needed to arrange a service may prevent us from completing it; it does not automatically cancel an existing booking or override its lawful terms. Rights and regulatory remedies under applicable Indian data-protection law apply as the relevant provisions come into force.",
  ],
  [
    "Policy updates",
    "We may update this policy as our services or legal requirements change and will show the updated date. Material changes will be communicated where required. A policy update does not itself authorise a new unrelated use of information where fresh permission is required. Contact us if any part of the policy is unclear before providing additional information.",
  ],
];

export default function LegalPage({ type }: { type: "terms" | "privacy" }) {
  const isPrivacy = type === "privacy";
  const sections = isPrivacy ? privacy : terms;
  return (
    <main className="mx-auto max-w-[860px] px-5 py-10 sm:px-8">
      <SectionHeader
        eyebrow="Majlise Aala"
        title={isPrivacy ? "Privacy Policy" : "Terms & Conditions"}
        subtitle={`Last updated: 7 October 2026. ${isPrivacy ? "This policy explains how we handle customer information." : "Please read these terms before making a travel or catering request."}`}
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
