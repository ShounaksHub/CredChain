import { Award, ShieldCheck } from "lucide-react";
import { Achievement } from "@/types";
import { cn } from "@/lib/utils";

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <div className="glass glass-hover flex items-start gap-3 rounded-xl p-4">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          achievement.verified ? "bg-verified/10 text-verified" : "bg-white/[0.05] text-muted"
        )}
      >
        <Award className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium text-foreground">{achievement.title}</p>
          {achievement.verified && (
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-verified" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted">
          {achievement.issuer} · {achievement.date}
        </p>
      </div>
    </div>
  );
}
