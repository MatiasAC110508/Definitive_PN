import { ServiceCard } from "@/components/catalog/service-card";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { serviceCategories } from "@/infrastructure/mock/perfect-nails-data";
import { getServiceRepository } from "@/infrastructure/repositories/repository-factory";
import { Reveal } from "@/presentation/components/motion/reveal";

export async function ServiceCatalogPage() {
  const services = await getServiceRepository().findAll();

  return (
    <div className="pt-[4.5rem]">
      <section className="marble-surface px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Catálogo de servicios"
            title="Técnica premium para manos y pies impecables"
            description="Elige entre acrílicas, manicure, pedicure, nail art y rituales de spa. Cada servicio indica duración, precio y acceso directo a reserva."
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
