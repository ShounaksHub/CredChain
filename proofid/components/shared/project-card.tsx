import { ArrowUpRight, FolderGit2 } from "lucide-react";
import { Project } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusVariant: Record<Project["status"], "verified" | "warn" | "muted"> = {
  Live: "verified",
  "In Progress": "warn",
  Archived: "muted",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="glass glass-hover group flex flex-col gap-3 rounded-xl p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary-2">
          <FolderGit2 className="h-4.5 w-4.5" />
        </div>
        <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <h4 className="font-display text-[15px] font-semibold">{project.title}</h4>
          <ArrowUpRight
            className={cn(
              "h-3.5 w-3.5 text-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
            )}
          />
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{project.description}</p>
      </div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-border-subtle bg-white/[0.03] px-2 py-0.5 font-data text-[11px] text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
