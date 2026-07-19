"use client";

import { ShieldCheck, ShieldOff, Wallet } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { useNetwork } from "@/hooks/use-network";
import { cn } from "@/lib/utils";

export function WalletStatusCard() {
  const { isConnected } = useWallet();
  const { formattedAddress } = useWalletAddress();
  const { networkName, isWrongNetwork } = useNetwork();

  return (
    <div className="rounded-xl border border-border-subtle bg-white/[0.02] p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
          <Wallet className="h-3.5 w-3.5" /> Wallet
        </span>
        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            isConnected ? "bg-verified/10 text-verified" : "bg-white/[0.05] text-muted"
          )}
        >
          {isConnected ? <ShieldCheck className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
          {isConnected ? "Connected" : "Not Connected"}
        </span>
      </div>

      {isConnected ? (
        <div className="mt-2.5 space-y-1.5">
          <p className="truncate font-data text-xs text-foreground">{formattedAddress}</p>
          <p
            className={cn(
              "truncate text-[11px]",
              isWrongNetwork ? "text-warn" : "text-muted"
            )}
          >
            {isWrongNetwork ? "Wrong network" : networkName}
          </p>
        </div>
      ) : (
        <p className="mt-2.5 text-[11px] text-muted">Connect MetaMask to see your address.</p>
      )}
    </div>
  );
}
