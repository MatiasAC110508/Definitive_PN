"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem("cookieConsent");
    if (!hasConsented) {
      setTimeout(() => setIsVisible(true), 1500); // Small delay for better UX
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  const declineCookies = () => {
    // We could handle strictly necessary cookies here
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 transition-transform duration-500",
        isVisible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="mx-auto max-w-5xl rounded-2xl border border-[var(--gold)]/30 bg-[var(--ink)]/95 backdrop-blur-md p-6 shadow-2xl flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between text-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--gold-soft)_0%,_transparent_50%)] opacity-[0.05] pointer-events-none" />

        <div className="flex items-start gap-4 flex-1 relative z-10">
          <div className="bg-[var(--gold)]/20 p-3 rounded-full shrink-0">
            <Cookie className="h-6 w-6 text-[var(--gold)]" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold mb-1">
              Valoramos tu privacidad
            </h3>
            <p className="text-sm text-white/70 font-light leading-relaxed">
              Utilizamos cookies propias y de terceros para mejorar nuestros
              servicios y mostrarte publicidad relacionada con tus preferencias
              mediante el análisis de tus hábitos de navegación. Puedes obtener
              más información consultando nuestra{" "}
              <Link
                href={"/politica-de-privacidad" as any}
                className="text-[var(--gold)] hover:underline whitespace-nowrap"
              >
                Política de Privacidad
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative z-10">
          <Button
            variant="ghost"
            onClick={declineCookies}
            className="border border-white/20 text-white hover:bg-white/10 w-full sm:w-auto transition-colors"
          >
            Rechazar
          </Button>
          <Button
            onClick={acceptCookies}
            className="bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold)]/90 hover:scale-105 w-full sm:w-auto font-medium transition-all"
          >
            Aceptar Todas
          </Button>
        </div>
      </div>
    </div>
  );
}
