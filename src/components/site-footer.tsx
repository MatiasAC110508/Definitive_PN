import Link from "next/link";
import Image from "next/image";
import { MapPin, MessageCircle, Phone } from "lucide-react";

const footerLinks = [
  { label: "Servicios", href: "/servicios" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Reservar cita", href: "/reservar" },
  { label: "Acceso cliente", href: "/login" },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative border-t border-[var(--line)] bg-[var(--ink)] text-white overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-[0.15]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--gold-soft)_0%,_transparent_50%)] opacity-[0.04] pointer-events-none" />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr] lg:px-8 relative z-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-xl overflow-hidden p-[2px]">
              <Image
                src="/logo.jpg"
                alt="Perfect Nails Logo"
                width={56}
                height={56}
                className="size-full rounded-full object-cover"
                unoptimized
              />
            </span>
            <span className="font-display text-4xl font-semibold bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
              Perfect Nails
            </span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-white/60 font-light">
            Un espacio exclusivo creado para resaltar tu belleza y brindarte la
            mejor experiencia de cuidado personal. Con años de dedicación a tu
            bienestar.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--gold-soft)] mb-6">
            Navegación
          </h2>
          <div className="grid gap-4 text-sm text-white/70">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[var(--gold-soft)] hover:translate-x-1 transition-all flex items-center gap-2 w-fit"
              >
                <span className="h-px w-3 bg-[var(--gold-soft)]/30" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--gold-soft)] mb-6">
            Contacto
          </h2>
          <div className="grid gap-5 text-sm text-white/70 font-light">
            <div className="flex items-start gap-4 group">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-[var(--gold-soft)] group-hover:bg-[var(--gold-soft)] group-hover:text-[var(--ink)] transition-colors">
                <MapPin aria-hidden="true" className="size-4" />
              </span>
              <span className="leading-snug pt-1 group-hover:text-white transition-colors">
                Calle 31 #55-13
                <br />
                Bello 051052, Antioquia
              </span>
            </div>

            <div className="flex items-center gap-4 group">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-[var(--gold-soft)] group-hover:bg-[var(--gold-soft)] group-hover:text-[var(--ink)] transition-colors">
                <Phone aria-hidden="true" className="size-4" />
              </span>
              <span className="group-hover:text-white transition-colors">
                +57 310 4627014
              </span>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Link
                href="https://www.instagram.com/perfectnails_vm/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-[var(--gold-soft)] hover:text-[var(--ink)] hover:border-transparent transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <svg
                  aria-hidden="true"
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </Link>
              <Link
                href="https://wa.link/tguhvp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-[var(--gold-soft)] hover:text-[var(--ink)] hover:border-transparent transition-all hover:scale-110"
                aria-label="WhatsApp"
              >
                <MessageCircle aria-hidden="true" className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 relative z-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 md:flex-row lg:px-8 text-xs text-white/40">
          <p>
            © {new Date().getFullYear()} Perfect Nails. Todos los derechos
            reservados.
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center mt-4 md:mt-0">
            <Link
              href="/politica-de-privacidad"
              className="hover:text-white transition-colors cursor-pointer"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/terminos-y-condiciones"
              className="hover:text-white transition-colors cursor-pointer"
            >
              Términos de Servicio
            </Link>
            <Link
              href="/aviso-legal"
              className="hover:text-white transition-colors cursor-pointer"
            >
              Aviso Legal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
