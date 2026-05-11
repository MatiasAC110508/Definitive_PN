import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Clock, Sparkles } from "lucide-react";
import type { BeautyService } from "@/domain/entities/service.entity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

export function ServiceCard({ service }: { service: BeautyService }) {
  return (
    <Card className="group overflow-hidden">
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
      <CardContent className="space-y-5 p-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-2xl font-semibold text-[var(--ink)]">
              {service.name}
            </h3>
            <span className="text-sm font-bold text-[var(--gold)]">
              {formatCurrency(service.price)}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{service.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--ink-soft)]">
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
