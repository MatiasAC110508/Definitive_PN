"use client";

import Image from "next/image";
import { ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/domain/entities/product.entity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/shared/store/cart.store";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const currentItem = cartItems.find((item) => item.id === product.id);
  const isOutOfStock = product.stock <= 0;
  const isAtLimit = currentItem && currentItem.quantity >= product.stock;

  return (
    <Card className="group overflow-hidden">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className={cn("object-cover transition duration-700 group-hover:scale-105", isOutOfStock && "grayscale opacity-80")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        {product.isFeatured ? (
          <Badge variant="rose" className="absolute left-4 top-4">
            Boutique
          </Badge>
        ) : null}
        {isOutOfStock && (
          <Badge variant="secondary" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 text-red-500 border-red-100 shadow-xl py-2 px-6 text-sm">
            Agotado
          </Badge>
        )}
      </div>
      <CardContent className="space-y-4 p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-2xl font-semibold leading-7 text-[var(--ink)]">
              {product.name}
            </h3>
            <span className="text-sm font-bold text-[var(--gold)]">
              {formatCurrency(product.price)}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)] line-clamp-2">{product.description}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold",
            isOutOfStock ? "bg-red-50 text-red-400" : "bg-[var(--quartz-soft)] text-[var(--ink-soft)]"
          )}>
            <Sparkles aria-hidden="true" className={cn("size-4", isOutOfStock ? "text-red-300" : "text-[var(--gold)]")} />
            {isOutOfStock ? "Sin stock" : `${product.stock} disponibles`}
          </span>
          <Button
            type="button"
            size="sm"
            disabled={isOutOfStock || isAtLimit}
            onClick={() => {
              if (isAtLimit) {
                toast.error(`No hay más unidades de ${product.name} disponibles.`);
                return;
              }
              addItem(product);
              toast.success(`${product.name} agregado.`, {
                action: {
                  label: "Ver Carrito",
                  onClick: () => useCartStore.getState().setIsOpen(true),
                },
              });
            }}
          >
            {isOutOfStock ? "Agotado" : (
              <>
                <ShoppingBag aria-hidden="true" />
                Agregar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
