"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ChevronDown, ChevronUp, Clock, Package, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { BeautyService } from "@/domain/entities/service.entity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function ServiceCard({ service }: { service: BeautyService }) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = descRef.current;
    if (el) {
      setIsClamped(el.scrollHeight > el.clientHeight + 2);
    }
  }, [service.description]);

  return (
    <Card className="group flex h-full w-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={service.imageUrl}
          alt={service.name}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {service.isFeatured ? (
          <Badge variant="gold" className="absolute left-4 top-4">
            Favorito
          </Badge>
        ) : null}
      </div>
      <CardContent className="flex flex-1 flex-col space-y-5 p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl font-semibold leading-snug text-[var(--ink)]">
              {service.name}
            </h3>
            <span className="shrink-0 text-sm font-bold text-[var(--gold)]">
              {formatCurrency(service.price)}
            </span>
          </div>
          <div className="mt-3">
            <p
              ref={descRef}
              className={cn(
                "text-sm leading-6 text-[var(--ink-soft)]",
                !expanded && "line-clamp-2",
              )}
            >
              {service.description}
            </p>
            {isClamped && (
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--gold)] transition hover:opacity-75"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="size-3.5" aria-hidden="true" />
                    Ver menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3.5" aria-hidden="true" />
                    Ver más
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {service.sessionPackages && service.sessionPackages.length > 0 ? (
          <div className="rounded-lg border border-[var(--gold)]/20 bg-[var(--quartz-soft)] p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--gold)]">
              <Package aria-hidden="true" className="size-3.5" />
              Paquetes de sesiones
            </div>
            <div className="space-y-1">
              {service.sessionPackages.map((pkg) => (
                <div
                  key={pkg.sessions}
                  className="flex items-center justify-between text-xs text-[var(--ink-soft)]"
                >
                  <span>{pkg.sessions} sesiones</span>
                  <span className="font-semibold text-[var(--ink)]">
                    {formatCurrency(pkg.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--ink-soft)]">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--quartz-soft)] px-3 py-2">
            <Clock aria-hidden="true" className="size-4 text-[var(--gold)]" />
            {service.durationMinutes} min
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--quartz-soft)] px-3 py-2">
            <Sparkles aria-hidden="true" className="size-4 text-[var(--gold)]" />
            Acabado premium
          </span>
        </div>
        <Button asChild className="w-full">
          <Link href={`/reservar?serviceId=${service.id}` as Route}>Reservar servicio</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
