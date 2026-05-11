import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "sonner";
import { AppProviders } from "@/presentation/providers/app-providers";
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
    process.env.NEXT_PUBLIC_APP_URL ?? "https://perfect-nails.vercel.app",
  ),
  title: {
    default: "Perfect Nails | Depilación Láser, Uñas y Masajes en Bello",
    template: "%s | Perfect Nails",
  },
  description:
    "Un espacio creado para consentirte. Depilación láser, uñas premium y masajes relajantes en una experiencia boutique exclusiva.",
  keywords: [
    "Perfect Nails",
    "uñas premium",
    "depilación láser",
    "masajes",
    "relax",
    "belleza Bello",
    "Bello Antioquia",
    "reservas online",
  ],
  applicationName: "Perfect Nails",
  authors: [{ name: "Perfect Nails" }],
  openGraph: {
    title: "Perfect Nails",
    description:
      "Un espacio creado para consentirte. Depilación láser, uñas premium y masajes relajantes en Bello, Antioquia.",
    url: "/",
    siteName: "Perfect Nails",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=85",
        width: 1200,
        height: 630,
        alt: "Manicure premium Perfect Nails",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Perfect Nails",
    description: "Belleza premium, uñas y boutique femenina.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-screen bg-[var(--quartz)] text-[var(--ink)] antialiased">
        <AppProviders>
          <SiteHeader />
          <main className="min-h-screen">{children}</main>
          <SiteFooter />
          <Toaster position="bottom-right" richColors closeButton duration={3000} />
        </AppProviders>
      </body>
    </html>
  );
}
