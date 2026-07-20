"use client";

import { useProfile } from "./use-profile";

/**
 * Lightweight check for whether a wallet already has a profile.
 * Used for routing decisions (dashboard vs. create-profile).
 */
export function useProfileExists(walletAddress?: `0x${string}`) {
  const { isProfileMissing, isLoading, refetch } = useProfile(walletAddress);

  return {
    exists: !isProfileMissing && !isLoading,
    isLoading,
    refetch,
  };
}
