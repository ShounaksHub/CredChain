import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  className,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle px-6 py-14 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] text-muted">
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-display text-base font-medium text-foreground">{title}</p>
      {description && <p className="mt-1.5 max-w-xs text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
