import logoAsset from "@/assets/logo.webp.asset.json";

/** Full official horizontal MAJLISE AALA logo. */
export function BrandLogo({ className = "h-8" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="Majlise Aala"
      className={`w-auto ${className}`}
      width={1920}
      height={356}
    />
  );
}

/**
 * Compact brand mark — the official circular MA + crescent monogram,
 * framed from the left edge of the same official logo file.
 */
export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="relative inline-block shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
      aria-label="Majlise Aala"
      role="img"
    >
      <img
        src={logoAsset.url}
        alt=""
        aria-hidden="true"
        className="absolute left-0 top-0 max-w-none"
        style={{ height: size, width: (1920 / 356) * size }}
      />
    </span>
  );
}
