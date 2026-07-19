import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerificationCard({
  icon: Icon,
  label,
  value,
  mono = false,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="glass flex items-start gap-4 rounded-xl p-5">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          accent ? "bg-verified/10 text-verified" : "bg-primary/10 text-primary-2"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
        <p
          className={cn(
            "mt-1 break-all text-sm font-medium text-foreground",
            mono && "font-data text-[13px]"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
