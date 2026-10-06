import type { Metadata } from "next";

export function publicPageMetadata({
  title,
  description,
  path,
  image = "/brand-logo.webp",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const fullTitle = `${title} | Majlis E Aala`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: "Majlis E Aala",
      title: fullTitle,
      description,
      url: path,
      images: [{ url: image, alt: title }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image] },
  };
}
