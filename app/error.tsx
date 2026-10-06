"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 py-10 text-center">
      <h1 className="font-display text-3xl">Let’s try that again</h1>
      <p role="alert" className="mt-3 text-sm leading-relaxed text-muted-foreground">
        This page couldn’t load. Try again, or return home to continue.
      </p>
      <div className="mt-5 flex gap-3">
        <button
          onClick={reset}
          className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
