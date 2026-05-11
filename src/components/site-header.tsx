"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { CalendarDays, Gem, Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/shared/store/cart.store";
import { CartSheet } from "./cart-sheet";

const navigation = [
  { label: "Servicios", href: "/servicios" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Reservar", href: "/reservar" },
  { label: "Mi panel", href: "/panel" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const { totalItems: countItems, isOpen: cartOpen, setIsOpen: setCartOpen } = useCartStore();
  const totalItems = countItems();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/40 bg-white/[0.72] backdrop-blur-2xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="premium-focus flex items-center gap-3 rounded-full">
            <span className="flex size-10 items-center justify-center rounded-full border border-[var(--line)] bg-white shadow-sm">
              <Gem aria-hidden="true" className="size-5 text-[var(--gold)]" />
            </span>
            <span className="font-display text-2xl font-semibold tracking-wide text-[var(--ink)]">
              Perfect Nails
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "premium-focus rounded-full px-4 py-2 text-sm font-semibold text-[var(--ink-soft)] transition hover:bg-white hover:text-[var(--ink)]",
                  pathname === item.href && "bg-white text-[var(--ink)] shadow-sm",
                )}
              >
                {item.label}
              </Link>
            ))}
            {session?.user.role === "ADMIN" ? (
              <Link
                href="/admin"
                className={cn(
                  "premium-focus rounded-full px-4 py-2 text-sm font-semibold text-[var(--ink-soft)] transition hover:bg-white hover:text-[var(--ink)]",
                  pathname === "/admin" && "bg-white text-[var(--ink)] shadow-sm",
                )}
              >
                Administración
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="premium-focus relative flex size-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/75 text-[var(--ink)] shadow-sm transition hover:bg-white"
              aria-label="Ver carrito"
            >
              <ShoppingBag aria-hidden="true" className="size-4" />
              {totalItems > 0 ? (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[var(--gold)] text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              ) : null}
            </button>

            <div className="hidden items-center gap-2 lg:flex">
              {session?.user ? (
                <Button variant="luxury" size="sm" onClick={() => void signOut()}>
                  <UserRound aria-hidden="true" />
                  Salir
                </Button>
              ) : (
                <Button asChild variant="luxury" size="sm">
                  <Link href="/login">Ingresar</Link>
                </Button>
              )}
              <Button asChild size="sm">
                <Link href="/reservar">
                  <CalendarDays aria-hidden="true" />
                  Reservar
                </Link>
              </Button>
            </div>

            <button
              className="premium-focus flex size-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 lg:hidden"
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
            >
              {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="border-t border-white/50 bg-white/90 px-4 py-4 shadow-lg backdrop-blur-xl lg:hidden">
            <nav className="grid gap-2" aria-label="Principal móvil">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-full px-4 py-3 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--quartz-soft)]"
                >
                  {item.label}
                </Link>
              ))}
              {session?.user.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-4 py-3 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--quartz-soft)]"
                >
                  Administración
                </Link>
              ) : null}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="luxury">
                  <Link href={session?.user ? "/panel" : "/login"} onClick={() => setOpen(false)}>
                    {session?.user ? "Mi cuenta" : "Ingresar"}
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/reservar" onClick={() => setOpen(false)}>
                    Reservar
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        ) : null}
      </header>
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
