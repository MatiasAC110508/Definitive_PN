import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "sonner";
import { AppProviders } from "@/presentation/providers/app-providers";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://perfectnails.art",
  ),
  title: {
    default: "Uñas, Masajes y Depilación Láser en Bello | Perfect Nails",
    template: "%s | Perfect Nails",
  },
  description:
    "Descubre Perfect Nails en Bello, Antioquia. Tu spa boutique especializado en uñas premium, masajes relajantes y depilación láser con resultados efectivos.",
  keywords: [
    "Uñas en Bello",
    "Spa de uñas Bello",
    "Masajes relajantes Bello",
    "Depilación láser Bello",
    "Depilación láser Antioquia",
    "Manicure premium",
    "Pedicure",
    "Spa boutique",
    "Perfect Nails",
  ],
  applicationName: "Perfect Nails",
  authors: [{ name: "Perfect Nails" }],
  openGraph: {
    title: "Perfect Nails | Uñas, Masajes y Depilación Láser en Bello",
    description:
      "Descubre Perfect Nails en Bello, Antioquia. Tu spa boutique especializado en uñas premium, masajes relajantes y depilación láser.",
    url: "/",
    siteName: "Perfect Nails",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=85",
        width: 1200,
        height: 630,
        alt: "Servicios de Uñas y Masajes en Perfect Nails Bello",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Perfect Nails | Uñas, Masajes y Depilación en Bello",
    description:
      "Spa boutique especializado en uñas premium, masajes relajantes y depilación láser.",
    images: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=85",
    ],
  },
  icons: {
    icon: [{ url: "/icon.png", sizes: "256x256", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "256x256", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: "Perfect Nails",
    image:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=85",
    "@id": "https://perfectnails.art",
    url: "https://perfectnails.art",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bello",
      addressRegion: "Antioquia",
      addressCountry: "CO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 6.3373,
      longitude: -75.558,
    },
    description:
      "Spa boutique en Bello, Antioquia, especializado en uñas premium, masajes relajantes y depilación láser de alta calidad.",
    priceRange: "$$",
  };

  return (
    <html
      lang="es"
      className={`${inter.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-screen bg-[var(--quartz)] text-[var(--ink)] antialiased"
        suppressHydrationWarning
      >
        <AppProviders>
          <SiteHeader />
          <main className="min-h-screen">{children}</main>
          <SiteFooter />
          <CookieBanner />
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            duration={3000}
          />
        </AppProviders>
      </body>
    </html>
  );
}
