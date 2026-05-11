"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Trash2, X, ArrowRight, ShoppingCart, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/shared/store/cart.store";
import { formatCurrency } from "@/lib/formatters";
import { Separator } from "@/components/ui/separator";

type CartSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, removeItem, updateQuantity, subtotal, clear } = useCartStore();
  const [showItems, setShowItems] = useState(true);
  const total = subtotal();
  const shipping = total > 200000 ? 0 : 15000;
  const grandTotal = total + shipping;

  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="fixed right-0 top-0 h-full w-full sm:max-w-md z-[100] pointer-events-none"
        >
          {/* Unified Glass Panel Container */}
          <div className="absolute right-0 top-0 h-full w-full sm:w-[28rem] pointer-events-auto flex flex-col">
            <div className="absolute inset-0 bg-white/[0.85] backdrop-blur-3xl border-l border-white/40 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] sm:rounded-l-[2.5rem]" />
            
            <div className="relative h-full flex flex-col">
              <div className="border-b border-white/40 p-6 sm:p-8 shrink-0 flex items-center justify-between sm:rounded-tl-[2.5rem]">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 font-display text-2xl sm:text-3xl text-[var(--ink)]">
                    <div className="size-9 sm:size-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-white/60">
                      <ShoppingCart className="size-4 sm:size-5 text-[var(--gold)]" />
                    </div>
                    Factura
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[var(--ink-soft)] uppercase tracking-[0.2em] font-bold opacity-60">
                    Boutique Perfect Nails
                  </p>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="size-9 sm:size-10 rounded-full bg-white flex items-center justify-center text-[var(--ink-soft)] hover:text-rose-500 transition-all shadow-sm border border-white/60 hover:scale-105 active:scale-95"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 no-scrollbar space-y-6">
                {/* Pure White Glass Toggle */}
                <button 
                  onClick={() => setShowItems(!showItems)}
                  className="w-full bg-white rounded-[2rem] p-5 shadow-md border border-black/5 flex items-center justify-between group hover:bg-white/80 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-[var(--gold)]/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="size-6 text-[var(--gold)]" />
                    </div>
                    <div className="text-left">
                      <p className="text-base font-bold text-[var(--ink)]">Tus Elecciones</p>
                      <p className="text-[10px] text-[var(--ink-soft)] font-bold uppercase tracking-widest opacity-60">
                        {items.length} {items.length === 1 ? "artículo" : "artículos"}
                      </p>
                    </div>
                  </div>
                  <div className="size-8 rounded-full bg-[var(--quartz)] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ChevronDown className={cn("size-4 text-[var(--gold)] transition-transform duration-500", showItems && "rotate-180")} />
                  </div>
                </button>

                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center p-8">
                    <div className="rounded-[3rem] bg-white p-12 mb-8 shadow-sm border border-black/5">
                      <ShoppingBag className="size-16 text-[var(--gold)] opacity-20" />
                    </div>
                    <h3 className="font-display text-3xl font-semibold text-[var(--ink)]">Vacío</h3>
                    <Button
                      variant="luxury"
                      className="mt-10 rounded-full px-10 h-14 text-base shadow-lg"
                      onClick={() => onOpenChange(false)}
                    >
                      Explorar
                    </Button>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {showItems && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-4 pb-40 sm:pb-12"
                      >
                        {items.map((item) => (
                          <div key={item.id} className="bg-white/90 rounded-[2.2rem] p-4 sm:p-5 shadow-md border border-black/5 hover:shadow-xl hover:bg-white transition-all relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex gap-4 sm:gap-6">
                              <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-[1.5rem] border border-black/5 shadow-md">
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                              </div>
                              <div className="flex flex-1 flex-col justify-center">
                                <div className="flex items-start justify-between">
                                  <h4 className="text-xs sm:text-sm font-bold text-[var(--ink)] uppercase tracking-wider line-clamp-1 pr-6">
                                    {item.name}
                                  </h4>
                                  <button
                                    onClick={() => removeItem(item.id)}
                                    className="size-8 rounded-full bg-[var(--quartz)] flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors shadow-sm"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                </div>
                                
                                <div className="mt-6 flex items-center justify-between">
                                  <div className="flex items-center gap-3 bg-[var(--quartz)] rounded-full p-1 shadow-inner border border-black/5">
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="size-7 sm:size-8 flex items-center justify-center rounded-full bg-white shadow-sm text-xs hover:bg-[var(--gold-soft)]/20 transition-colors"
                                    >
                                      -
                                    </button>
                                    <span className="text-xs sm:text-sm font-bold w-4 text-center text-[var(--ink)]">{item.quantity}</span>
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="size-7 sm:size-8 flex items-center justify-center rounded-full bg-white shadow-sm text-xs hover:bg-[var(--gold-soft)]/20 transition-colors"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-display text-lg sm:text-xl font-bold text-[var(--gold)]">
                                      {formatCurrency(item.price * item.quantity)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>

              {items.length > 0 && (
                <div className="bg-white/80 border-t border-white/40 p-6 sm:p-8 pb-10 sm:pb-12 space-y-6 shadow-[0_-24px_48px_rgba(0,0,0,0.02)] shrink-0 sticky bottom-0 z-20 backdrop-blur-3xl sm:rounded-bl-[2.5rem]">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-[var(--ink-soft)] font-medium">
                      <span className="flex items-center gap-2">
                        <Sparkles className="size-3 text-[var(--gold)]" />
                        Productos ({items.length})
                      </span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                      <span className="text-[var(--ink-soft)]">Envío Asegurado</span>
                      {shipping === 0 ? (
                        <span className="text-emerald-600 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Gratis</span>
                      ) : (
                        <span className="text-[var(--ink)]">{formatCurrency(shipping)}</span>
                      )}
                    </div>
                    <Separator className="my-1 sm:my-2 bg-black/5" />
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-display text-xl sm:text-2xl text-[var(--ink)]">Total</span>
                        <p className="text-[8px] sm:text-[9px] text-[var(--ink-soft)] font-bold uppercase tracking-widest">Pago Final</p>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-2xl sm:text-3xl font-bold text-[var(--gold)]">{formatCurrency(grandTotal)}</span>
                        <p className="text-[9px] sm:text-[10px] text-[var(--ink-soft)] font-bold uppercase tracking-tighter">IVA Incluido</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:gap-3">
                    <Button size="lg" className="w-full h-12 sm:h-14 rounded-full text-base sm:text-lg font-bold shadow-xl shadow-[var(--gold-soft)]/20">
                      Confirmar y Pagar
                      <ArrowRight className="ml-2 size-4 sm:size-5" />
                    </Button>
                    <button 
                      onClick={clear}
                      className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink-soft)] hover:text-rose-500 transition-colors py-1"
                    >
                      Vaciar mi selección
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
