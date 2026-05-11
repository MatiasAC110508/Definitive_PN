import type { Metadata } from "next";

export function generatePageMetadata(title: string, description: string, image?: string): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | Perfect Nails`,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      title: `${title} | Perfect Nails`,
      description,
      images: image ? [image] : undefined,
    },
  };
}
