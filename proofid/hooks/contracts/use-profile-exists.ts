"use client";

import { useReadContract, useAccount } from "wagmi";
import { proofIdRegistryConfig } from "@/lib/contracts/config";

/**
 * Lightweight check for whether a wallet already has a profile.
 * Used for routing decisions (dashboard vs. create-profile).
 */
export function useProfileExists(walletAddress?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const targetAddress = walletAddress ?? connectedAddress;

  const { data, isLoading, refetch } = useReadContract({
    ...proofIdRegistryConfig,
    functionName: "profileExists",
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    },
  });

  return {
    exists: data as boolean | undefined,
    isLoading,
    refetch,
  };
}
