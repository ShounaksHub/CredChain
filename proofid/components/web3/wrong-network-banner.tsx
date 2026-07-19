"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { useNetwork } from "@/hooks/use-network";
import { TARGET_NETWORK_NAME } from "@/lib/web3/chains";

export function WrongNetworkBanner() {
  const { isConnected } = useWallet();
  const { isWrongNetwork, switchToTargetNetwork, isSwitching } = useNetwork();

  if (!isConnected || !isWrongNetwork) return null;

  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-warn/30 bg-warn/[0.08] px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2.5">
        <TriangleAlert className="h-4.5 w-4.5 shrink-0 text-warn" />
        <div>
          <p className="text-sm font-medium text-foreground">Wrong Network</p>
          <p className="text-xs text-muted">Switch to {TARGET_NETWORK_NAME} to use CredChain.</p>
        </div>
      </div>
      <Button size="sm" variant="secondary" onClick={switchToTargetNetwork} disabled={isSwitching}>
        {isSwitching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Switch to {TARGET_NETWORK_NAME}
      </Button>
    </div>
  );
}
