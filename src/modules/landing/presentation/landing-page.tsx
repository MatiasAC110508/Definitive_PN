import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Heart, ShieldCheck, Sparkles, Star } from "lucide-react";
import { ProductCard } from "@/components/catalog/product-card";
import { ServiceCard } from "@/components/catalog/service-card";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CatalogApplicationService } from "@/application/services/catalog-application.service";
import { businessMetrics, reviews } from "@/infrastructure/mock/perfect-nails-data";
import { getProductRepository, getServiceRepository } from "@/infrastructure/repositories/repository-factory";
import { formatCurrency } from "@/lib/formatters";
import { Reveal } from "@/presentation/components/motion/reveal";

const benefits = [
  {
    icon: Sparkles,
    title: "Diseño curado",
    text: "Servicios y productos seleccionados para una estética femenina, limpia y elegante.",
  },
  {
    icon: ShieldCheck,
    title: "Proceso profesional",
    text: "Protocolos claros, materiales de alta calidad y agenda ordenada por duración real.",
  },
  {
    icon: Heart,
    title: "Experiencia boutique",
    text: "Compra belleza, reserva tu cita y gestiona todo desde un solo lugar.",
  },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=900&q=85",
];

export async function LandingPage() {
  const catalog = new CatalogApplicationService(
    getServiceRepository(),
    getProductRepository(),
  );
  const { featuredServices, featuredProducts } = await catalog.getHomeCatalog();

  return (
    <>
      <section className="relative min-h-[88vh] overflow-hidden pt-[4.5rem] text-white">
        <Image
          src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1800&q=90"
          alt="Manicure de lujo Perfect Nails"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/36 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(88vh-4.5rem)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl">
            <Badge className="border-white/25 bg-white/[0.14] text-white backdrop-blur">
              Belleza premium y boutique femenina
            </Badge>
            <h1 className="mt-6 font-display text-6xl font-semibold leading-[0.95] text-white sm:text-7xl lg:text-8xl">
              Perfect Nails
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82 sm:text-xl">
              Un espacio creado para consentirte.
              Descubre la excelencia en depilación láser, uñas impecables y masajes relajantes en Bello, Antioquia.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="gold">
                <Link href="/reservar">
                  <CalendarDays aria-hidden="true" />
                  Reservar cita
                </Link>
              </Button>
              <Button asChild size="lg" variant="luxury" className="bg-white/[0.88]">
                <Link href="/catalogo">
                  Ver catálogo
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          ["Reservas mensuales", businessMetrics.bookedAppointments.toString()],
          ["Satisfacción", `${businessMetrics.satisfactionRate}%`],
          ["Ventas boutique", businessMetrics.productOrders.toString()],
        ].map(([label, value], index) => (
          <Reveal key={label} delay={index * 0.06}>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                  {label}
                </p>
                <p className="mt-2 font-display text-3xl font-semibold text-[var(--ink)]">
                  {value}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Servicios"
            title="Rituales de uñas con acabado editorial"
            description="Cada servicio combina técnica, higiene, diseño y una sensación de cuidado privado."
          />
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredServices.slice(0, 4).map((service, index) => (
            <Reveal key={service.id} delay={index * 0.06}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="marble-surface px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <SectionHeading
              eyebrow="Sobre nosotras"
              title="Una casa de belleza pensada para mujeres con gusto por el detalle"
              description="Perfect Nails integra servicios de uñas, boutique femenina y productos de belleza en una plataforma elegante, con agenda online y una estética premium consistente."
              align="left"
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="rounded-lg border border-white/70 bg-white/70 p-4">
                  <benefit.icon aria-hidden="true" className="size-5 text-[var(--gold)]" />
                  <h3 className="mt-3 font-semibold text-[var(--ink)]">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{benefit.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative min-h-[520px] overflow-hidden rounded-lg shadow-[var(--shadow-soft)]">
              <Image
                src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=90"
                alt="Experiencia boutique de belleza"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Boutique"
            title="Moda y belleza con selección premium"
            description="Productos pensados para completar tu ritual: ropa femenina, cosméticos y cuidado diario."
          />
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.slice(0, 4).map((product, index) => (
            <Reveal key={product.id} delay={index * 0.06}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[var(--ink)] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--gold-soft)]">
              Agenda avanzada
            </p>
            <h2 className="mt-3 font-display text-5xl font-semibold leading-tight">
              Reserva por hora, confirma visualmente y gestiona tu historial
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              El calendario muestra estados de disponibilidad, servicios con duración automática
              y flujo de cuenta para proteger cada reserva.
            </p>
            <Button asChild className="mt-8" variant="gold">
              <Link href="/reservar">
                Abrir agenda
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
              {["09:00", "10:00", "11:00", "12:00", "14:00", "15:00"].map((hour, index) => (
                <div
                  key={hour}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.08] px-4 py-3"
                >
                  <span className="font-semibold">{hour}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--ink)]">
                    {index === 1 ? "Reservado" : index === 4 ? "Pendiente" : "Disponible"}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Galería"
            title="Detalles suaves, mármol cuarzo y brillo dorado"
            description="Una dirección visual limpia para que cada servicio y producto respire elegancia."
          />
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {galleryImages.map((image, index) => (
            <Reveal key={image} delay={index * 0.05}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-[var(--shadow-soft)]">
                <Image
                  src={image}
                  alt={`Galería Perfect Nails ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Testimonios"
            title="Clientas que vuelven por la experiencia"
          />
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-7xl gap-6 md:grid-cols-3">
          {reviews.map((review, index) => (
            <Reveal key={review.id} delay={index * 0.06}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-1 text-[var(--gold)]">
                    {Array.from({ length: review.rating }).map((_, starIndex) => (
                      <Star key={starIndex} aria-hidden="true" className="size-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-7 text-[var(--ink-soft)]">
                    “{review.comment}”
                  </p>
                  <Separator className="my-5" />
                  <div className="flex items-center gap-3">
                    <Image
                      src={review.imageUrl}
                      alt={review.authorName}
                      width={44}
                      height={44}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-[var(--ink)]">{review.authorName}</p>
                      <p className="text-xs text-[var(--ink-soft)]">Clienta verificada</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
