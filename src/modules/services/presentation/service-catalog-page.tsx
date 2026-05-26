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

      <section className="bg-[var(--quartz-soft)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--rose)]">
                Precio lanzamiento
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">
                Depilación láser luz diodo
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--ink-soft)]">
                Piel suave, sin vello y sin irritaciones con paquetes por zona para 5, 7 o 10 sesiones.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 flex flex-wrap justify-center gap-6">
            {laserLaunchServices.map((service, index) => (
              <Reveal key={service.id} delay={index * 0.04} className="w-full max-w-[380px] md:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
                <ServiceCard
                  service={{
                    ...service,
                    name: getLaserDisplayName(service.name),
                  }}
                />
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.12}>
            <div className="mt-8 rounded-lg border border-[var(--gold)]/20 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--rose)]">
                    Tratamiento facial
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold text-[var(--ink)]">
                    Hollywood Peeling
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {hollywoodPeelingServices.map((service) => (
                    <div key={service.id} className="rounded-lg border border-[var(--line)] bg-[var(--quartz-soft)] p-4">
                      <p className="text-sm font-medium text-[var(--ink-soft)]">{service.name}</p>
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
                <div className="flex h-full items-center gap-3 rounded-lg border border-[var(--line)] bg-white px-4 py-3">
                  <benefit.icon aria-hidden="true" className="size-5 shrink-0 text-[var(--rose)]" />
                  <span className="text-sm font-semibold text-[var(--ink)]">{benefit.label}</span>
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

      <section className="mx-auto flex max-w-7xl flex-wrap justify-center gap-6 px-4 py-14 sm:px-6 lg:px-8">
        {services.map((service, index) => (
          <Reveal key={service.id} delay={index * 0.04} className="w-full max-w-[380px] md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
            <ServiceCard service={service} />
          </Reveal>
        ))}
      </section>
    </div>
  );
}
