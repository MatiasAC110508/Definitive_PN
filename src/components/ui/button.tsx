import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "premium-focus inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ink)] text-white shadow-[var(--shadow-gold)] hover:-translate-y-0.5 hover:bg-black",
        luxury:
          "border border-[var(--line)] bg-white/80 text-[var(--ink)] shadow-sm hover:-translate-y-0.5 hover:border-[var(--gold)] hover:bg-white",
        gold:
          "bg-[var(--gold)] text-white shadow-[var(--shadow-gold)] hover:-translate-y-0.5 hover:bg-[#b68e47]",
        ghost:
          "bg-transparent text-[var(--ink-soft)] hover:bg-white/70 hover:text-[var(--ink)]",
        destructive:
          "bg-rose-700 text-white hover:bg-rose-800",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-11 px-5",
        lg: "h-12 px-7 text-base",
        icon: "size-11 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { buttonVariants };
