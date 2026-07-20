"use client";

import { useReadContract, useAccount } from "wagmi";
import { proofIdRegistryConfig } from "@/lib/contracts/config";

/**
 * Lightweight check for whether a wallet already has a profile.
 * Used for routing decisions (dashboard vs. create-profile).
 */
export function useProfileExists(walletAddress?: `0x${string}`) {
  // HACKATHON MOCK: Force exists to true so the dashboard doesn't redirect
  // us back to create-profile, since we are mocking the on-chain data.
  return {
    exists: true,
    isLoading: false,
    refetch: async () => {},
  };
}
