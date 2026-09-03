/** Full official horizontal desktop logo. */
export function BrandLogo({ className = "h-8" }: { className?: string }) {
  return (
    <img
      src="/brand-logo.webp"
      alt="Majlise Aala"
      className={`w-auto object-contain ${className}`}
      width={2048}
      height={512}
      decoding="async"
    />
  );
}

/**
 * Compact brand mark — the official circular MA + crescent monogram,
 * framed from the left edge of the same official logo file.
 */
export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/brand-mark.webp"
      alt="Majlise Aala"
      className="inline-block shrink-0 object-contain"
      width={960}
      height={960}
      style={{ width: size, height: size }}
      decoding="async"
    />
  );
}
