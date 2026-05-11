import Link from "next/link";
import { Gem, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const footerLinks = [
  { label: "Servicios", href: "/servicios" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Reservar cita", href: "/reservar" },
  { label: "Acceso cliente", href: "/login" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--ink)] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/10">
              <Gem aria-hidden="true" className="size-5 text-[var(--gold-soft)]" />
            </span>
            <span className="font-display text-3xl font-semibold">Perfect Nails</span>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/68">
            Un espacio creado para consentirte.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--gold-soft)]">
            Navegación
          </h2>
          <div className="mt-5 grid gap-3 text-sm text-white/70">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--gold-soft)]">
            Contacto
          </h2>
          <div className="mt-5 grid gap-3 text-sm text-white/70">
            <span className="flex items-start gap-2">
              <MapPin aria-hidden="true" className="size-4 shrink-0 mt-0.5 text-[var(--gold-soft)]" />
              Calle 31 #55-13, Bello 051052, Antioquia, Colombia
            </span>
            <span className="flex items-center gap-2">
              <Phone aria-hidden="true" className="size-4 text-[var(--gold-soft)]" />
              +57 310 4627014
            </span>
            <span className="flex items-center gap-2">
              <Mail aria-hidden="true" className="size-4 text-[var(--gold-soft)]" />
              hola@perfectnails.co
            </span>
            <span className="flex items-center gap-2">
              <MessageCircle aria-hidden="true" className="size-4 text-[var(--gold-soft)]" />
              WhatsApp Business
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/48">
        © {new Date().getFullYear()} Perfect Nails. Todos los derechos reservados.
      </div>
    </footer>
  );
}
