import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  return (
    <div className={cn("mx-auto max-w-3xl", align === "center" ? "text-center" : "text-left")}>
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--gold)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-8 text-[var(--ink-soft)]">{description}</p>
      ) : null}
    </div>
  );
}
