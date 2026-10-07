export const travelFlowSteps = [
  "Travellers",
  "Journey",
  "Package",
  "Travel dates",
  "Preferences",
  "Sign in (optional)",
  "Review",
];

export function TravelFlowProgress({ step }: { step: number }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold">
        Step {step + 1} of {travelFlowSteps.length}
        <span className="ml-2 text-muted-foreground">{travelFlowSteps[step]}</span>
      </p>
      <div
        role="progressbar"
        aria-label="Travel planning progress"
        aria-valuemin={0}
        aria-valuemax={travelFlowSteps.length}
        aria-valuenow={step + 1}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-border"
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${((step + 1) / travelFlowSteps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
