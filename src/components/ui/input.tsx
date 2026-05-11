import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "premium-focus flex h-11 w-full rounded-full border border-[var(--line)] bg-white/80 px-4 text-sm text-[var(--ink)] shadow-sm transition placeholder:text-[var(--ink-soft)]/55 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
