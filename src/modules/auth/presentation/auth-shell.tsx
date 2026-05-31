import Link from "next/link";
import Image from "next/image";

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
    <div className="relative flex min-h-screen bg-[#f8f9fa] lg:flex-row">
      {/* Background/Visual Section */}
      <div className="absolute inset-0 lg:relative lg:flex lg:flex-1 lg:max-w-[45vw] xl:max-w-[50vw] items-end lg:p-8 overflow-hidden z-0">
        <Image
          src="/images/backgrounds/auth.png"
          alt="Perfect Nails Atmosphere"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center transition-all duration-1000"
        />
        {/* Mobile Gradient (ensures readability for the glass card on top) */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] lg:hidden" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fa] via-[#f8f9fa]/90 to-white/20 lg:hidden" />

        {/* Desktop Gradient */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-t from-[var(--ink)]/90 via-[var(--ink)]/20 to-transparent" />
        <div className="hidden lg:block absolute inset-0 bg-[var(--ink)]/10 mix-blend-multiply" />

        {/* Desktop Quote */}
        <div className="relative z-10 w-full lg:mb-16 hidden lg:block">
          <blockquote className="space-y-2">
            <p className="text-xl font-medium text-white font-display leading-tight xl:text-3xl lg:max-w-[80%]">
              "Una experiencia boutique donde cada detalle refleja el lujo y
              cuidado que mereces."
            </p>
            <footer className="text-sm text-white/80 uppercase tracking-widest pt-4">
              Perfect Nails Experience
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Form Section */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-4 sm:p-8 lg:p-16">
        <div className="w-full max-w-[400px] mt-16 lg:mt-0 rounded-2xl bg-white/85 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none p-8 lg:p-0 shadow-2xl lg:shadow-none border border-white/60 lg:border-none">
          <Link href="/" className="flex items-center gap-4 mb-10 lg:pl-2">
            <span className="flex size-14 items-center justify-center rounded-full border shadow-sm border-[var(--line)] bg-white overflow-hidden">
              <Image
                src="/logo.jpg"
                alt="Perfect Nails"
                width={56}
                height={56}
                className="object-cover size-14"
              />
            </span>
            <span className="font-display text-4xl font-semibold text-[var(--ink)] lg:drop-shadow-none">
              Perfect Nails
            </span>
          </Link>

          <div className="mb-10 lg:pl-2">
            <h1 className="font-display text-3xl font-semibold text-[var(--ink)] tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)] max-w-sm">
              {description}
            </p>
          </div>

          <div className="lg:pl-2">{children}</div>

          <div className="mt-8 text-center text-sm text-[var(--ink-soft)] pt-8 border-t border-black/10">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
