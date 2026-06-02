"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { CalendarDays, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { ServiceCard } from "@/components/catalog/service-card";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/presentation/components/motion/reveal";
import type { BeautyService } from "@/domain/entities/service.entity";
import { cn } from "@/lib/utils";

type ServiceCatalogClientProps = {
  services: BeautyService[];
};

const CATEGORIES = [
  { slug: "unas-premium", label: "Cuidado de Uñas" },
  { slug: "masajes", label: "Masajes y Relajación" },
  { slug: "facial-laser", label: "Facial y Láser" },
  { slug: "corporal-aparatologia", label: "Corporal y Aparatología" },
  { slug: "depilacion-cera", label: "Depilación con Cera" },
];

function getLaserDisplayName(service: BeautyService): BeautyService {
  if (service.categorySlug === "depilacion-laser") {
    return {
      ...service,
      name: service.name.replace("Depilación Láser - ", ""),
    };
  }
  return service;
}

export function ServiceCatalogClient({ services }: ServiceCatalogClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filteredServices = useMemo(() => {
    return services.map(getLaserDisplayName).filter((service) => {
      const matchesCategory =
        activeCategory === "all"
          ? true
          : service.categorySlug === activeCategory;
      const matchesQuery = query
        ? `${service.name} ${service.description}`
            .toLowerCase()
            .includes(query.toLowerCase())
        : true;
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, services, query]);

  return (
    <div className="pt-[4.5rem]">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#f8f9fa] px-4 py-20 sm:px-6 lg:px-8 border-b-0">
        <Image
          src="/images/backgrounds/services.png"
          alt="Spa Background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-100 pointer-events-none"
        />
        {/* Strong white top overlay for perfect text legibility, fading to background color */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/60 to-[#f8f9fa] pointer-events-none" />
        <Reveal className="relative z-10">
          <SectionHeading
            eyebrow="Catálogo de servicios"
            title="Belleza, bienestar y tratamientos premium"
            description="Depilación láser diodo, Hollywood Peeling, uñas acrílicas y masajes relajantes. Elige tu servicio y agenda en línea con disponibilidad inmediata."
          />
        </Reveal>
      </section>

      {/* ── Filtros + Grid ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-16 space-y-10">
            {/* Buscador */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-3xl group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--gold)]/20 via-[var(--rose)]/20 to-[var(--gold)]/20 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 size-5 -translate-y-1/2 text-[var(--gold)] transition-transform group-focus-within:scale-110" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Busca un servicio..."
                    className="h-16 pl-14 pr-8 text-lg bg-white border-2 border-[var(--gold)]/30 text-[var(--ink)] transition-all shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-[2rem] placeholder:text-[var(--ink-soft)]/60 focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)]/60"
                  />
                </div>
              </div>
            </div>

            {/* Pills de categoría */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 ml-2">
                <div className="h-[1px] w-8 bg-[var(--gold)]/40" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
                  Explorar servicios
                </span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveCategory("all")}
                  className={cn(
                    "rounded-full px-8 h-11 text-xs font-bold uppercase tracking-widest transition-all border shrink-0",
                    activeCategory === "all"
                      ? "bg-[var(--gold)] text-white border-[var(--gold)] shadow-lg shadow-[var(--gold)]/20 hover:bg-[var(--gold)]/90 hover:text-white"
                      : "bg-white/50 text-[var(--ink-soft)] border-white/80 hover:bg-white hover:border-[var(--gold)]/30 hover:text-[var(--gold)]",
                  )}
                >
                  Todos
                </Button>
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat.slug}
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveCategory(cat.slug)}
                    className={cn(
                      "rounded-full px-8 h-11 text-xs font-bold uppercase tracking-widest transition-all border whitespace-nowrap shrink-0",
                      activeCategory === cat.slug
                        ? "bg-[var(--gold)] text-white border-[var(--gold)] shadow-lg shadow-[var(--gold)]/20 hover:bg-[var(--gold)]/90 hover:text-white"
                        : "bg-white/50 text-[var(--ink-soft)] border-white/80 hover:bg-white hover:border-[var(--gold)]/30 hover:text-[var(--gold)]",
                    )}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Grid de servicios */}
        {filteredServices.length > 0 ? (
          <div className="flex flex-wrap items-start justify-center gap-8 lg:gap-10">
            {filteredServices.map((service, index) => (
              <div
                key={service.id}
                className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.7rem)] xl:w-[calc(25%-1.9rem)] max-w-[340px]"
              >
                <Reveal delay={index * 0.05} className="h-full">
                  <ServiceCard service={service} />
                </Reveal>
              </div>
            ))}
          </div>
        ) : (
          <Reveal>
            <Card className="border-dashed border-2 border-[var(--line)] bg-white/30 backdrop-blur-sm">
              <CardContent className="p-20 text-center">
                <div className="mx-auto size-16 rounded-full bg-[var(--quartz-soft)] flex items-center justify-center mb-6">
                  <Sparkles className="size-8 text-[var(--gold)] opacity-30" />
                </div>
                <h2 className="font-display text-4xl font-semibold text-[var(--ink)]">
                  Sin resultados
                </h2>
                <p className="mt-4 text-lg text-[var(--ink-soft)] max-w-md mx-auto">
                  No encontramos servicios para &quot;{query}&quot;. Prueba con
                  otra palabra o cambia de categoría.
                </p>
                <Button
                  variant="ghost"
                  className="mt-8"
                  onClick={() => {
                    setQuery("");
                    setActiveCategory("all");
                  }}
                >
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          </Reveal>
        )}
      </section>

      {/* ── Sección final de marca ────────────────────────────────── */}
      <section className="bg-[var(--ink)] text-white py-24 px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-30" />
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 items-center gap-16">
            <div>
              <Badge className="bg-[var(--gold)] text-white border-none mb-6">
                Tecnología & Bienestar
              </Badge>
              <h2 className="font-display text-5xl font-semibold leading-tight mb-6">
                Resultados visibles desde la primera sesión
              </h2>
              <p className="text-xl text-white/70 leading-relaxed mb-10">
                Desde depilación láser diodo hasta rituales faciales y masajes
                terapéuticos, cada servicio está diseñado para ofrecerte una
                experiencia premium y resultados duraderos.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[var(--gold)] font-bold uppercase tracking-widest text-xs mb-2">
                    Tecnología diodo
                  </h4>
                  <p className="text-sm text-white/50">
                    Láser de última generación, indoloro y apto para todo tipo
                    de piel.
                  </p>
                </div>
                <div>
                  <h4 className="text-[var(--gold)] font-bold uppercase tracking-widest text-xs mb-2">
                    Agenda en línea
                  </h4>
                  <p className="text-sm text-white/50">
                    Reserva tu cita en segundos con disponibilidad en tiempo
                    real.
                  </p>
                </div>
              </div>
              <Button asChild variant="gold" size="lg" className="mt-10">
                <Link href={"/reservar" as Route}>
                  <CalendarDays aria-hidden="true" />
                  Agenda tu cita ahora
                </Link>
              </Button>
            </div>
            <div className="relative aspect-square lg:aspect-auto lg:h-[420px] rounded-2xl overflow-hidden border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <Image
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80"
                alt="Tratamiento estético premium"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover grayscale-[0.1] contrast-[1.05]"
              />
              <div className="absolute bottom-8 left-8 z-20">
                <p className="font-display text-2xl font-semibold italic text-[var(--gold-soft)]">
                  &ldquo;Cuídate como la prioridad que eres&rdquo;
                </p>
                <p className="mt-2 text-white/60 font-bold uppercase tracking-widest text-[10px]">
                  — Perfect Nails & Beauty
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
