import Link from "next/link";
import type { Route } from "next";
import { CalendarDays, Clock, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { ServiceCard } from "@/components/catalog/service-card";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { serviceCategories, services as serviceCatalog } from "@/infrastructure/mock/perfect-nails-data";
import { getServiceRepository } from "@/infrastructure/repositories/repository-factory";
import { formatCurrency } from "@/lib/formatters";
import { Reveal } from "@/presentation/components/motion/reveal";

const laserLaunchServices = serviceCatalog.filter(
  (service) => service.categorySlug === "depilacion-laser",
);

const hollywoodPeelingServices = serviceCatalog.filter(
  (service) => service.categorySlug === "hollywood-peeling",
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
  const services = await getServiceRepository().findAll();

  return (
    <div className="pt-[4.5rem]">
      <section className="marble-surface px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Catálogo de servicios"
            title="Depilación láser, peeling y belleza premium"
            description="Estos son los precios de lanzamiento correctos para depilación láser luz diodo y Hollywood Peeling, junto con uñas premium y masajes."
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

      <section className="bg-[var(--ink)] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--rose)]">
                Precio lanzamiento
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Depilación láser luz diodo
              </h2>
              <p className="mt-4 text-base leading-8 text-white/72">
                Piel suave, sin vello y sin irritaciones con paquetes por zona para 5, 7 o 10 sesiones.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {laserLaunchServices.map((service, index) => (
              <Reveal key={service.id} delay={index * 0.04}>
                <div className="h-full rounded-lg border border-[var(--rose)]/45 bg-white/[0.06] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-2xl font-semibold text-[var(--rose)]">
                      {getLaserDisplayName(service.name)}
                    </h3>
                    <span className="shrink-0 rounded-full bg-[var(--rose)] px-3 py-1 text-sm font-bold text-[var(--ink)]">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/68">Sesión individual</p>

                  {service.sessionPackages ? (
                    <div className="mt-5 space-y-2 border-t border-dashed border-white/28 pt-4">
                      {service.sessionPackages.map((pkg) => (
                        <div key={pkg.sessions} className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-white/78">{pkg.sessions} sesiones</span>
                          <span className="font-semibold text-[var(--rose)]">
                            {formatCurrency(pkg.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.12}>
            <div className="mt-8 rounded-lg border border-[var(--rose)]/50 bg-white/[0.06] p-5 sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--rose)]">
                    Tratamiento facial
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold text-white">
                    Hollywood Peeling
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {hollywoodPeelingServices.map((service) => (
                    <div key={service.id} className="rounded-lg bg-white/[0.08] p-4">
                      <p className="text-sm font-medium text-white/78">{service.name}</p>
                      <p className="mt-2 font-display text-3xl font-semibold text-[var(--rose)]">
                        {formatCurrency(service.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {laserBenefits.map((benefit, index) => (
              <Reveal key={benefit.label} delay={index * 0.04}>
                <div className="flex h-full items-center gap-3 rounded-lg border border-white/12 bg-white/[0.06] px-4 py-3">
                  <benefit.icon aria-hidden="true" className="size-5 shrink-0 text-[var(--rose)]" />
                  <span className="text-sm font-semibold text-white/82">{benefit.label}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.16}>
            <div className="mt-9 flex justify-center">
              <Button asChild variant="gold" size="lg">
                <Link href={"/reservar" as Route}>
                  <CalendarDays aria-hidden="true" />
                  Agenda tu cita
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {services.map((service, index) => (
          <Reveal key={service.id} delay={index * 0.04}>
            <ServiceCard service={service} />
          </Reveal>
        ))}
      </section>
    </div>
  );
}
