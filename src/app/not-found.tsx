import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="marble-surface grid min-h-screen place-items-center px-4 pt-[4.5rem] text-center">
      <div className="max-w-lg">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--gold)]">404</p>
        <h1 className="mt-4 font-display text-5xl font-semibold text-[var(--ink)]">
          Esta página no está disponible
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
          Vuelve al inicio o agenda una cita para continuar tu experiencia Perfect Nails.
        </p>
        <Button asChild className="mt-7">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
