"use client";

import { Search, Sparkles, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import type { Category } from "@/domain/entities/category.entity";
import type { Product, ProductCategorySlug } from "@/domain/entities/product.entity";
import { ProductCard } from "@/components/catalog/product-card";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Reveal } from "@/presentation/components/motion/reveal";

type ProductCatalogClientProps = {
  categories: Category[];
  products: Product[];
};

export function ProductCatalogClient({ categories, products }: ProductCatalogClientProps) {
  const [activeCategory, setActiveCategory] = useState<ProductCategorySlug | "all">("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory =
        activeCategory === "all" ? true : product.categorySlug === activeCategory;
      const matchesQuery = query
        ? `${product.name} ${product.description}`.toLowerCase().includes(query.toLowerCase())
        : true;

      return matchesCategory && matchesQuery;
    });

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [activeCategory, products, query, sortBy]);

  return (
    <div className="pt-[4.5rem]">
      <section className="marble-surface px-4 py-20 sm:px-6 lg:px-8 border-b border-[var(--line)]">
        <Reveal>
          <SectionHeading
            eyebrow="Boutique Perfect"
            title="Selección curada para una belleza integral"
            description="Desde vestidos de seda hasta cosméticos de alta gama, cada pieza en nuestra boutique ha sido elegida para elevar tu estilo personal."
          />
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-16 space-y-10">
            {/* Elegant Search Area */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-3xl group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--gold)]/20 via-[var(--rose)]/20 to-[var(--gold)]/20 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 size-5 -translate-y-1/2 text-[var(--gold)] transition-transform group-focus-within:scale-110" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Encuentra tu próximo favorito..."
                    className="h-16 pl-14 pr-8 text-lg border-white/60 bg-white/40 backdrop-blur-md focus:bg-white/90 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[2rem] border-2 placeholder:text-[var(--ink-soft)]/40 focus:ring-2 focus:ring-[var(--gold)]/20"
                  />
                </div>
              </div>
            </div>
            
            {/* Refined Filters Row */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between pt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3 ml-2">
                  <div className="h-[1px] w-8 bg-[var(--gold)]/40" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">Explorar Colecciones</span>
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
                        : "bg-white/50 text-[var(--ink-soft)] border-white/80 hover:bg-white hover:border-[var(--gold)]/30 hover:text-[var(--gold)]"
                    )}
                  >
                    Todo
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveCategory(category.slug as ProductCategorySlug)}
                      className={cn(
                        "rounded-full px-8 h-11 text-xs font-bold uppercase tracking-widest transition-all border whitespace-nowrap shrink-0",
                        activeCategory === category.slug 
                          ? "bg-[var(--gold)] text-white border-[var(--gold)] shadow-lg shadow-[var(--gold)]/20 hover:bg-[var(--gold)]/90 hover:text-white" 
                          : "bg-white/50 text-[var(--ink-soft)] border-white/80 hover:bg-white hover:border-[var(--gold)]/30 hover:text-[var(--gold)]"
                      )}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Premium Segmented Control with Gold Accents */}
              <div className="space-y-4">
                <div className="flex items-center justify-end gap-3 mr-2 lg:justify-end">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)] opacity-70">Ordenar por</span>
                  <div className="h-[1px] w-8 bg-[var(--gold)]/20" />
                </div>
                <div className="inline-flex items-center p-1.5 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/80 shadow-sm">
                  {[
                    { id: "name", label: "Destacados" },
                    { id: "price-asc", label: "Precio Min" },
                    { id: "price-desc", label: "Precio Max" }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id as any)}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-500",
                        sortBy === option.id 
                          ? "bg-white text-[var(--gold)] shadow-md border border-[var(--gold)]/20 scale-[1.02] hover:bg-white" 
                          : "text-[var(--ink-soft)] hover:text-[var(--gold)] hover:bg-white/40"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {filteredProducts.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8 lg:gap-10">
            {filteredProducts.map((product, index) => (
              <div key={product.id} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.7rem)] xl:w-[calc(25%-1.9rem)] max-w-[320px]">
                <Reveal delay={index * 0.05}>
                  <ProductCard product={product} />
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
                  Sin coincidencias
                </h2>
                <p className="mt-4 text-lg text-[var(--ink-soft)] max-w-md mx-auto">
                  No encontramos productos para "{query}". Prueba con otra palabra clave o cambia de categoría.
                </p>
                <Button 
                  variant="luxury" 
                  className="mt-8" 
                  onClick={() => { setQuery(""); setActiveCategory("all"); }}
                >
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          </Reveal>
        )}
      </section>

      <section className="bg-[var(--ink)] text-white py-24 px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-30" />
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 items-center gap-16">
            <div>
              <Badge className="bg-[var(--gold)] text-white border-none mb-6">Boutique Experience</Badge>
              <h2 className="font-display text-5xl font-semibold leading-tight mb-6">
                Calidad garantizada en cada selección
              </h2>
              <p className="text-xl text-white/70 leading-relaxed mb-10">
                Todas nuestras prendas y cosméticos pasan por un control de calidad riguroso para asegurar que recibas solo lo mejor de la moda y belleza femenina.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[var(--gold)] font-bold uppercase tracking-widest text-xs mb-2">Envío Premium</h4>
                  <p className="text-sm text-white/50">Entrega cuidada y personalizada en empaques de lujo.</p>
                </div>
                <div>
                  <h4 className="text-[var(--gold)] font-bold uppercase tracking-widest text-xs mb-2">Devoluciones</h4>
                  <p className="text-sm text-white/50">Proceso sencillo y elegante si no estás satisfecha.</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-square lg:aspect-auto lg:h-[400px] rounded-2xl overflow-hidden border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80" 
                alt="Boutique Interior" 
                className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
              />
              <div className="absolute bottom-8 left-8 z-20">
                <p className="font-display text-3xl font-semibold italic text-[var(--gold-soft)]">"La elegancia es la única belleza que nunca se marchita"</p>
                <p className="mt-2 text-white/60 font-bold uppercase tracking-widest text-[10px]">— Audrey Hepburn</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
