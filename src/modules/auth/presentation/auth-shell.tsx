import Link from "next/link";
import { Gem } from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="marble-surface flex min-h-screen items-center justify-center px-4 py-28 sm:px-6">
      <div className="w-full max-w-md rounded-lg border border-white/70 bg-white/80 p-6 shadow-[var(--shadow-soft)] backdrop-blur-xl">
        <Link href="/" className="mx-auto flex w-fit items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full border border-[var(--line)] bg-white">
            <Gem aria-hidden="true" className="size-5 text-[var(--gold)]" />
          </span>
          <span className="font-display text-3xl font-semibold">Perfect Nails</span>
        </Link>
        <div className="mt-8 text-center">
          <h1 className="font-display text-4xl font-semibold text-[var(--ink)]">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{description}</p>
        </div>
        <div className="mt-8">{children}</div>
        <div className="mt-6 text-center text-sm text-[var(--ink-soft)]">{footer}</div>
      </div>
    </div>
  );
}
