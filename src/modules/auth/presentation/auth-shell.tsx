import Link from "next/link";
import Image from "next/image";
import { Gem } from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="relative overflow-hidden bg-[#f8f9fa] flex min-h-screen items-center justify-center px-4 py-28 sm:px-6">
      <Image
        src="/images/backgrounds/auth.png"
        alt="Auth Background"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-100 pointer-events-none grayscale"
      />
      <div className="absolute inset-0 bg-white/50 pointer-events-none" />
      <div className="w-full max-w-md p-8 glass-panel relative z-10">
        <Link href="/" className="mx-auto flex w-fit items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full border border-[var(--line)] bg-white">
            <Gem aria-hidden="true" className="size-5 text-[var(--gold)]" />
          </span>
          <span className="font-display text-3xl font-semibold">
            Perfect Nails
          </span>
        </Link>
        <div className="mt-8 text-center">
          <h1 className="font-display text-4xl font-semibold text-[var(--ink)]">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
            {description}
          </p>
        </div>
        <div className="mt-8">{children}</div>
        <div className="mt-6 text-center text-sm text-[var(--ink-soft)]">
          {footer}
        </div>
      </div>
    </div>
  );
}
