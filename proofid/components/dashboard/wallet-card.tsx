"use client";

import { useState } from "react";
import { Copy, Check, WalletMinimal, Loader2, ShieldCheck, ShieldOff, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WrongNetworkBanner } from "@/components/web3/wrong-network-banner";
import { useWallet } from "@/hooks/use-wallet";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { useNetwork } from "@/hooks/use-network";
import { useProfile } from "@/hooks/contracts/use-profile";
import { cn } from "@/lib/utils";

export function WalletCard() {
  const [copied, setCopied] = useState(false);
  const { isConnected, isConnecting, connectWallet, walletAddress } = useWallet();
  const { address, formattedAddress } = useWalletAddress();
  const { chainId, networkName, isWrongNetwork } = useNetwork();
  const { profile, offChainData: offChain } = useProfile();

  const displayUsername = offChain?.username ?? "";
  const isVerified = profile?.isVerified ?? false;

  function handleCopy() {
    if (!address) return;
    navigator.clipboard?.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-primary-2", isConnected ? "bg-primary/20 shadow-[0_0_15px_rgba(76,126,255,0.3)] animate-pulse" : "bg-primary/10")}>
              <WalletMinimal className="h-4.5 w-4.5" />
            </div>
            <p className="font-display text-sm font-semibold">Linked Wallet</p>
          </div>
          <Badge variant={isConnected ? (isWrongNetwork ? "warn" : "verified") : "muted"} className={isConnected && !isWrongNetwork ? "animate-pulse" : ""}>
            {isConnected ? (isWrongNetwork ? "Wrong Network" : "Connected") : "Not Connected"}
          </Badge>
        </div>

        {isConnected ? (
          <>
            <button
              onClick={handleCopy}
              className="mt-5 flex w-full items-center justify-between rounded-xl border border-border-subtle bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-primary/40"
            >
              <span className="font-data text-sm text-foreground">{formattedAddress}</span>
              {copied ? (
                <Check className="h-4 w-4 text-verified" />
              ) : (
                <Copy className="h-4 w-4 text-muted" />
              )}
            </button>

            <div className="mt-4 grid grid-cols-2 gap-3 font-data text-xs">
              <div className="rounded-lg border border-border-subtle bg-white/[0.02] px-3 py-2.5">
                <p className="text-muted">Network</p>
                <p className="mt-0.5 truncate text-foreground">{networkName}</p>
              </div>
              <div className="rounded-lg border border-border-subtle bg-white/[0.02] px-3 py-2.5">
                <p className="text-muted">Chain ID</p>
                <p className="mt-0.5 text-foreground">{chainId ?? "—"}</p>
              </div>
            </div>

            {/* ── Profile status ── */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-white/[0.02] px-3 py-2.5 text-xs">
                <User className="h-3.5 w-3.5 text-primary-2" />
                <span className="text-muted">Profile:</span>
                <span className="text-foreground">
                  {profile ? "Created ✓" : "Not Created"}
                </span>
              </div>
              {displayUsername && (
                <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-white/[0.02] px-3 py-2.5 text-xs">
                  <span className="text-muted">Username:</span>
                  <span className="text-primary-2 font-medium">
                    @{displayUsername}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-white/[0.02] px-3 py-2.5 text-xs">
                {isVerified ? (
                  <ShieldCheck className="h-3.5 w-3.5 text-verified" />
                ) : (
                  <ShieldOff className="h-3.5 w-3.5 text-muted" />
                )}
                <span className="text-muted">Verified:</span>
                <Badge
                  variant={isVerified ? "verified" : "muted"}
                  className="text-[10px] px-1.5 py-0"
                >
                  {isVerified ? "Yes" : "No"}
                </Badge>
              </div>
            </div>

            {isWrongNetwork && (
              <div className="mt-4">
                <WrongNetworkBanner />
              </div>
            )}
          </>
        ) : (
          <>
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="mt-5 w-full"
              variant="secondary"
            >
              {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <WalletMinimal className="h-4 w-4" />}
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </Button>
            <p className="mt-3 text-xs text-muted">
              Connect MetaMask to anchor your credentials on-chain.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
