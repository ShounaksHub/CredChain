import { Github, Linkedin, Globe, X as XIcon } from "lucide-react";
import { SocialLink } from "@/types";

const icons: Record<SocialLink["platform"], React.ElementType> = {
  GitHub: Github,
  LinkedIn: Linkedin,
  Portfolio: Globe,
  Twitter: XIcon,
};

export function SocialCard({ social }: { social: SocialLink }) {
  const Icon = icons[social.platform];
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      className="glass glass-hover flex items-center gap-3 rounded-xl p-3.5"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted">{social.platform}</p>
        <p className="truncate text-sm font-medium text-foreground">{social.handle}</p>
      </div>
    </a>
  );
}
