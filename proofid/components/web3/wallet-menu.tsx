"use client";

import { LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/web3/connect-button";
import { useWallet } from "@/hooks/use-wallet";
import { useWalletAddress } from "@/hooks/use-wallet-address";

/**
 * Navbar wallet control. Before connecting: the "Connect MetaMask" CTA.
 * After connecting: wallet icon + truncated address + a disconnect button.
 */
export function WalletMenu({ size = "sm" }: { size?: "sm" | "default" }) {
  const { isConnected, disconnectWallet } = useWallet();
  const { formattedAddress } = useWalletAddress();

  if (!isConnected) {
    return <ConnectButton size={size} />;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="glass flex items-center gap-2 rounded-xl px-3 py-2">
        <Wallet className="h-4 w-4 text-primary-2" />
        <span className="font-data text-[13px] text-foreground">{formattedAddress}</span>
      </div>
      <Button
        size="icon"
        variant="secondary"
        onClick={disconnectWallet}
        aria-label="Disconnect wallet"
        title="Disconnect"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
