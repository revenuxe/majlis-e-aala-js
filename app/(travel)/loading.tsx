export default function TravelLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading your journey"
      className="mx-auto max-w-[1000px] px-5 py-4"
    >
      <span className="sr-only" role="status">
        Loading your journey
      </span>
      <div className="space-y-4 motion-safe:animate-pulse" aria-hidden="true">
        <div className="h-12 w-2/3 rounded-xl bg-surface" />
        <div className="h-28 rounded-2xl border border-border bg-card" />
        <div className="h-28 rounded-2xl border border-border bg-card" />
        <div className="h-28 rounded-2xl border border-border bg-card" />
      </div>
    </main>
  );
}
