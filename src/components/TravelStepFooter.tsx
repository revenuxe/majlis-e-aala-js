import type { ReactNode } from "react";
import { Users } from "lucide-react";

export function TravelStepFooter({
  travellers,
  children,
}: {
  travellers: number;
  children: ReactNode;
}) {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      <div className="mx-auto max-w-xl">
        <p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Users size={15} aria-hidden="true" />
          {travellers} {travellers === 1 ? "traveller" : "travellers"}
        </p>
        {children}
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Your choices stay with you when you go back.
        </p>
      </div>
    </footer>
  );
}
