"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ChevronDown, ChevronUp, Clock, Package, Sparkles } from "lucide-react";
import { useState } from "react";
import type { BeautyService } from "@/domain/entities/service.entity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function ServiceCard({ service }: { service: BeautyService }) {
  const [showPackages, setShowPackages] = useState(false);

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
            <p className="text-sm leading-6 text-[var(--ink-soft)] line-clamp-2">
              {service.description}
            </p>
          </div>
        </div>

        {service.sessionPackages && service.sessionPackages.length > 0 ? (
          <div className="rounded-lg border border-[var(--gold)]/20 bg-[var(--quartz-soft)] p-3 pointer-events-auto">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowPackages(!showPackages);
              }}
              className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-[var(--gold)] hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <Package aria-hidden="true" className="size-3.5" />
                {service.sessionPackages[service.sessionPackages.length - 1].sessions} sesiones
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                {showPackages ? (
                  <>
                    Ver menos <ChevronUp className="size-3" />
                  </>
                ) : (
                  <>
                    Ver más <ChevronDown className="size-3" />
                  </>
                )}
              </div>
            </button>
            {showPackages && (
              <div className="space-y-1 mt-3 pt-3 border-t border-[var(--gold)]/10">
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
            )}
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
