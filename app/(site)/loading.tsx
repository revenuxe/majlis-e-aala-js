export default function Loading() {
  return (
    <main className="mx-auto max-w-[1280px] animate-pulse px-5 py-8 sm:px-8">
      <div className="h-5 w-32 rounded bg-surface" />
      <div className="mt-4 h-10 w-64 max-w-full rounded bg-surface" />
      <div className="mt-3 h-5 w-96 max-w-full rounded bg-surface" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="h-48 rounded-[20px] bg-surface" />
        ))}
      </div>
    </main>
  );
}
