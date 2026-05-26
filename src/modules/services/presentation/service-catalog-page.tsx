import Link from "next/link";
import type { Route } from "next";
import { CalendarDays, Clock, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { ServiceCard } from "@/components/catalog/service-card";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { serviceCategories, services as serviceCatalog } from "@/infrastructure/mock/perfect-nails-data";
import { Reveal } from "@/presentation/components/motion/reveal";

const laserServices = serviceCatalog.filter(
  (service) => service.categorySlug === "depilacion-laser",
);

const peelingServices = serviceCatalog.filter(
  (service) => service.categorySlug === "hollywood-peeling",
);

const nailsServices = serviceCatalog.filter(
  (service) => service.categorySlug === "unas-premium",
);

const massageServices = serviceCatalog.filter(
  (service) => service.categorySlug === "masajes",
);

const laserBenefits = [
  { icon: Zap, label: "Tecnología diodo" },
  { icon: Clock, label: "Sesión rápida y segura" },
  { icon: Sparkles, label: "Resultados visibles" },
  { icon: ShieldCheck, label: "Apto para todo tipo de piel" },
];

function getLaserDisplayName(name: string) {
  return name.replace("Depilación Láser - ", "");
}

export async function ServiceCatalogPage() {
  return (
    <div className="pt-[4.5rem]">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="marble-surface px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Catálogo de servicios"
            title="Depilación láser, peeling y belleza premium"
            description="Precios de lanzamiento para depilación láser luz diodo, Hollywood Peeling, uñas premium y masajes. Selecciona tu servicio y agenda en línea."
          />
        </Reveal>
        <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-3">
          {serviceCategories.map((category) => (
            <Badge key={category.id} variant="gold">
              {category.name}
            </Badge>
          ))}
        </div>
      </section>

      {/* ── Depilación Láser ──────────────────────────────────────── */}
      <section className="bg-[var(--quartz-soft)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--rose-deep)]">
                Precio lanzamiento
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">
                Depilación láser luz diodo
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--ink-soft)]">
                Piel suave, sin vello y sin irritaciones. Elige tu zona y selecciona entre paquetes
                de 5, 7 o 10 sesiones.
              </p>
            </div>
          </Reveal>

          <div className="catalog-scrollbar -mx-4 mt-10 flex snap-x gap-6 overflow-x-auto px-4 pb-5 items-stretch">
            {laserServices.map((service, index) => (
              <Reveal
                key={service.id}
                delay={index * 0.04}
                className="w-[min(84vw,380px)] shrink-0 snap-start flex"
              >
                <ServiceCard
                  service={{
                    ...service,
                    name: getLaserDisplayName(service.name),
                  }}
                />
              </Reveal>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {laserBenefits.map((benefit, index) => (
              <Reveal key={benefit.label} delay={index * 0.04}>
                <div className="flex h-full items-center gap-3 rounded-lg border border-[var(--line)] bg-white px-4 py-3">
                  <benefit.icon aria-hidden="true" className="size-5 shrink-0 text-[var(--rose-deep)]" />
                  <span className="text-sm font-semibold text-[var(--ink)]">{benefit.label}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.16}>
            <div className="mt-9 flex justify-center">
              <Button asChild variant="gold" size="lg">
                <Link href={"/reservar?serviceId=svc-laser-axilas" as Route}>
                  <CalendarDays aria-hidden="true" />
                  Agenda tu sesión láser
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Hollywood Peeling ─────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--rose-deep)]">
                Tratamiento facial
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">
                Hollywood Peeling
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--ink-soft)]">
                Tecnología de última generación para una piel luminosa, unificada y rejuvenecida
                desde la primera sesión.
              </p>
            </div>
          </Reveal>

          <div className="catalog-scrollbar -mx-4 mt-10 flex snap-x gap-6 overflow-x-auto px-4 pb-5 items-stretch">
            {peelingServices.map((service, index) => (
              <Reveal
                key={service.id}
                delay={index * 0.04}
                className="w-[min(84vw,380px)] shrink-0 snap-start flex"
              >
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.12}>
            <div className="mt-9 flex justify-center">
              <Button asChild variant="gold" size="lg">
                <Link href={"/reservar?serviceId=svc-hollywood-peeling" as Route}>
                  <CalendarDays aria-hidden="true" />
                  Agenda tu peeling facial
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Uñas Premium ──────────────────────────────────────────── */}
      {nailsServices.length > 0 && (
        <section className="bg-[var(--quartz-soft)] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--rose-deep)]">
                  Nail art & diseño
                </p>
                <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">
                  Uñas Premium
                </h2>
                <p className="mt-4 text-base leading-8 text-[var(--ink-soft)]">
                  Acrílicas, semipermanente y nail art con acabados que duran semanas.
                </p>
              </div>
            </Reveal>

            <div className="catalog-scrollbar -mx-4 mt-10 flex snap-x gap-6 overflow-x-auto px-4 pb-5 items-stretch">
              {nailsServices.map((service, index) => (
                <Reveal
                  key={service.id}
                  delay={index * 0.04}
                  className="w-[min(84vw,380px)] shrink-0 snap-start flex"
                >
                  <ServiceCard service={service} />
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.12}>
              <div className="mt-9 flex justify-center">
                <Button asChild variant="gold" size="lg">
                  <Link href={"/reservar?serviceId=svc-acrylic-perfect" as Route}>
                    <CalendarDays aria-hidden="true" />
                    Reserva tu cita de uñas
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Masajes y Relajación ──────────────────────────────────── */}
      {massageServices.length > 0 && (
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--rose-deep)]">
                  Bienestar & relajación
                </p>
                <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">
                  Masajes y Rituales
                </h2>
                <p className="mt-4 text-base leading-8 text-[var(--ink-soft)]">
                  Rituales de bienestar para liberar tensiones y consentir tu cuerpo.
                </p>
              </div>
            </Reveal>

            <div className="catalog-scrollbar -mx-4 mt-10 flex snap-x gap-6 overflow-x-auto px-4 pb-5 items-stretch">
              {massageServices.map((service, index) => (
                <Reveal
                  key={service.id}
                  delay={index * 0.04}
                  className="w-[min(84vw,380px)] shrink-0 snap-start flex"
                >
                  <ServiceCard service={service} />
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.12}>
              <div className="mt-9 flex justify-center">
                <Button asChild variant="gold" size="lg">
                  <Link href={"/reservar?serviceId=svc-massage-relax" as Route}>
                    <CalendarDays aria-hidden="true" />
                    Reserva tu masaje
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </div>
  );
}
