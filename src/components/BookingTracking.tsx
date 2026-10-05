import { CheckCircle2, Circle, XCircle } from "lucide-react";

export const bookingStatuses = ["new", "contacted", "quoted", "confirmed", "completed"] as const;
const labels = {
  catering: [
    "Catering request received",
    "Event details discussed",
    "Catering quotation shared",
    "Catering booking confirmed",
    "Catering completed",
  ],
  travel: [
    "Travel request received",
    "Itinerary planning",
    "Travel quotation shared",
    "Travel booking confirmed",
    "Journey completed",
  ],
};
export function BookingTracking({
  service,
  status,
}: {
  service: "catering" | "travel";
  status: string;
}) {
  if (status === "cancelled")
    return (
      <p role="status" className="mt-5 flex items-center gap-2 rounded-xl bg-surface p-4 text-sm">
        <XCircle size={18} /> {service === "travel" ? "Travel booking" : "Catering booking"}{" "}
        cancelled
      </p>
    );
  const active = bookingStatuses.indexOf(status as (typeof bookingStatuses)[number]);
  if (active < 0)
    return <p className="mt-5 text-sm">Status: {status}. Contact our team for an update.</p>;
  return (
    <ol
      aria-label={`${service === "travel" ? "Travel" : "Catering"} booking tracking`}
      className="mt-5 space-y-3"
    >
      {labels[service].map((label, index) => (
        <li
          key={label}
          aria-current={index === active ? "step" : undefined}
          className={`flex items-center gap-3 text-sm ${index <= active ? "font-medium" : "text-muted-foreground"}`}
        >
          {index <= active ? (
            <CheckCircle2 size={18} className="shrink-0 text-halal" />
          ) : (
            <Circle size={18} className="shrink-0 text-muted-text" />
          )}
          <span>
            {label}
            {index === active && <span className="ml-2 text-xs text-gold">Current</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
