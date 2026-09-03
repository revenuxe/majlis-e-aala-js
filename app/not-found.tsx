import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-[64px] leading-none">404</h1>
        <h2 className="mt-4 font-display text-[26px]">This page isn't on the menu</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-[12px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
