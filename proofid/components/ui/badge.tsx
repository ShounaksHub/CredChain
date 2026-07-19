import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/10 text-primary-2",
        accent: "border-accent/30 bg-accent/10 text-accent",
        verified: "border-verified/30 bg-verified/10 text-verified",
        muted: "border-border-subtle bg-white/[0.03] text-muted",
        warn: "border-warn/30 bg-warn/10 text-warn",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
