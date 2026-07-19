import { Wallet } from "lucide-react";

export function ConnectedBadge({ address }: { address: string }) {
  return (
    <div className="glass inline-flex items-center gap-2 rounded-xl border-verified/30 bg-verified/[0.07] px-3.5 py-2">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verified opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-verified" />
      </span>
      <Wallet className="h-3.5 w-3.5 text-verified" />
      <span className="font-data text-[13px] font-medium text-foreground">{address}</span>
    </div>
  );
}
