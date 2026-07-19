import { Badge } from "@/components/ui/badge";
import { Skill } from "@/types";

const levelVariant: Record<NonNullable<Skill["level"]>, "default" | "accent" | "muted"> = {
  Learning: "muted",
  Proficient: "default",
  Advanced: "accent",
};

export function SkillBadge({ skill }: { skill: Skill }) {
  return (
    <Badge variant={skill.level ? levelVariant[skill.level] : "default"}>
      {skill.name}
    </Badge>
  );
}
