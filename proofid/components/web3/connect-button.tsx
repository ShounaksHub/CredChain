"use client";

import { Loader2, Wallet } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ConnectedBadge } from "@/components/web3/connected-badge";
import { useWallet } from "@/hooks/use-wallet";
import { useWalletAddress } from "@/hooks/use-wallet-address";

interface ConnectButtonProps extends Omit<ButtonProps, "onClick"> {
  connectingLabel?: string;
  idleLabel?: string;
}

/**
 * Drop-in replacement for the old placeholder "Connect Wallet" button.
 * Idle -> "Connect MetaMask" (with spinner while connecting).
 * Connected -> a green connected badge with the truncated address.
 */
export function ConnectButton({
  connectingLabel = "Connecting...",
  idleLabel = "Connect MetaMask",
  ...buttonProps
}: ConnectButtonProps) {
  const { isConnected, isConnecting, connectWallet } = useWallet();
  const { formattedAddress } = useWalletAddress();

  if (isConnected) {
    return <ConnectedBadge address={formattedAddress} />;
  }

  return (
    <Button onClick={connectWallet} disabled={isConnecting} {...buttonProps}>
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {connectingLabel}
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          {idleLabel}
        </>
      )}
    </Button>
  );
}
