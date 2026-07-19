"use client";

import { useReadContract, useAccount } from "wagmi";
import { proofIdRegistryConfig } from "@/lib/contracts/config";
import type { Hex } from "viem";

/**
 * Reads just the profileHash for a wallet.
 * Useful for integrity verification without fetching the full profile.
 */
export function useProfileHash(walletAddress?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const targetAddress = walletAddress ?? connectedAddress;

  const { data, isLoading, isError, refetch } = useReadContract({
    ...proofIdRegistryConfig,
    functionName: "getProfileHash",
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
      retry: false,
    },
  });

  return {
    profileHash: data as Hex | undefined,
    isLoading,
    isError,
    refetch,
  };
}
