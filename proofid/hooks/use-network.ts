"use client";

import { useCallback, useState } from "react";
import { useChainId, useSwitchChain } from "wagmi";
import { toast } from "@/hooks/use-toast";
import { targetChain, TARGET_CHAIN_ID, TARGET_NETWORK_NAME } from "@/lib/web3/chains";
import { classifyWalletError, getNetworkLabel, isSupportedChain } from "@/utils/web3";

/**
 * Network status + the ability to switch (or, if missing, add) Polygon
 * Amoy in the connected wallet. wagmi's switchChain already falls back to
 * `wallet_addEthereumChain` for injected connectors when the chain is
 * unknown to the wallet, using the RPC/explorer metadata from `targetChain`.
 */
export function useNetwork() {
  const chainId = useChainId();
  const { switchChainAsync, isPending } = useSwitchChain();
  const [isSwitching, setIsSwitching] = useState(false);

  const switchToTargetNetwork = useCallback(async () => {
    setIsSwitching(true);
    try {
      await switchChainAsync({ chainId: TARGET_CHAIN_ID });
      toast({ title: "Network switched", description: `Connected to ${TARGET_NETWORK_NAME}.` });
    } catch (error) {
      const { message } = classifyWalletError(error);
      toast({ title: "Couldn't switch network", description: message });
    } finally {
      setIsSwitching(false);
    }
  }, [switchChainAsync]);

  return {
    chainId,
    networkName: getNetworkLabel(chainId),
    isSupportedNetwork: isSupportedChain(chainId),
    isWrongNetwork: chainId !== undefined && !isSupportedChain(chainId),
    targetChain,
    switchToTargetNetwork,
    isSwitching: isSwitching || isPending,
  };
}
