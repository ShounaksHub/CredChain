"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-primary-2 to-primary text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-8px_rgba(76,126,255,0.55)] hover:shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_12px_28px_-8px_rgba(76,126,255,0.8)] hover:-translate-y-1 active:translate-y-0 active:scale-95",
        secondary:
          "glass glass-hover text-foreground hover:-translate-y-1 active:translate-y-0 active:scale-95",
        outline:
          "border border-border-subtle text-foreground hover:border-primary/50 hover:bg-white/5 hover:-translate-y-0.5 active:translate-y-0 active:scale-95",
        ghost: "text-muted hover:text-foreground hover:bg-white/5 active:scale-95",
        destructive: "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 active:scale-95",
        link: "text-primary-2 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
