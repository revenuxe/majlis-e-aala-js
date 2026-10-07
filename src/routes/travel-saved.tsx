"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Trash2, ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/Brand";
import { TravelNavigation } from "@/components/TravelNavigation";
import { TravelPackageChoice } from "@/components/TravelPackageChoice";
import { TravelSavedPackagesLink, useSavedTravelPackages } from "@/components/TravelSavedPackages";
import { useTravelCatalog } from "@/hooks/use-travel-catalog";
import type { TravelPackage } from "@/lib/travel-booking";

export default function TravelSaved({ initialPackages }: { initialPackages: TravelPackage[] }) {
  const { items, ready, removePackage } = useSavedTravelPackages();
  const catalog = useTravelCatalog(initialPackages);
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-12">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-5 py-4">
          <Link href="/" className="min-w-0">
            <BrandLogo className="h-8 max-w-full" />
          </Link>
          <TravelSavedPackagesLink />
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-5 py-4 sm:px-8 sm:py-6">
        <Link href="/travel/packages" className="inline-flex min-h-11 items-center gap-2 text-sm">
          <ArrowLeft size={16} />
          Browse packages
        </Link>
        <h1 className="mt-2 font-display text-3xl">Saved packages</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick up where you left off. Your selected packages stay saved on this device.
        </p>
        {!ready ? (
          <p role="status" className="py-8 text-sm">
            Loading saved packages…
          </p>
        ) : items.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-border bg-card p-6 text-center">
            <Heart size={28} className="mx-auto text-gold" />
            <h2 className="mt-3 font-semibold">No saved packages yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Select a package and it will appear here automatically.
            </p>
            <Link
              href="/travel/packages"
              className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Explore packages
            </Link>
          </div>
        ) : (
          <>
            {catalog.error && (
              <div role="status" className="mt-4 rounded-xl border border-border p-4 text-sm">
                <p>{catalog.error}</p>
                <button
                  onClick={() => void catalog.reload()}
                  className="mt-2 min-h-11 font-semibold underline"
                >
                  Refresh packages
                </button>
              </div>
            )}
            <div className="mt-5 grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const pkg = catalog.packages.find((pkg) => pkg.id === item.packageId);
                return (
                  <section
                    key={item.packageId}
                    aria-label={pkg ? `Saved ${pkg.name}` : "Saved package"}
                    className="min-w-0"
                  >
                    {pkg ? (
                      <TravelPackageChoice
                        pkg={pkg}
                        adults={item.adults}
                        children={item.children}
                        seniors={item.seniors}
                        selectLabel="Continue booking"
                        onSelect={(flightId) =>
                          router.push(
                            `/travel/plan?category=${pkg.category}&package=${pkg.id}&flight=${encodeURIComponent(flightId || "")}&travellers=${item.adults}&children=${item.children}&seniors=${item.seniors}`,
                          )
                        }
                      />
                    ) : (
                      <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="font-semibold">
                          {catalog.loading
                            ? "Loading package…"
                            : catalog.error
                              ? "Package details unavailable"
                              : "This package is no longer available"}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {catalog.loading || catalog.error
                            ? "Your saved selection is still here."
                            : "Browse current packages to find another journey."}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => removePackage(item.packageId)}
                      aria-label={`Remove ${pkg?.name || "package"} from saved packages`}
                      className="mt-2 flex min-h-11 items-center gap-2 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 size={15} />
                      Remove from saved
                    </button>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </main>
      <TravelNavigation />
    </div>
  );
}
