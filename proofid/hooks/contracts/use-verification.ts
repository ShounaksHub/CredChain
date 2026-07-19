"use client";

import { useAccount } from "wagmi";
import { useProfile } from "@/hooks/contracts/use-profile";
import { PROOFID_REGISTRY_ADDRESS } from "@/lib/contracts/config";
import { TARGET_NETWORK_NAME } from "@/lib/web3/chains";
import type { VerificationInfo } from "@/types/contracts";

/**
 * Aggregates on-chain verification data for display on /verify.
 * Reads the profile to get timestamps, verification status, and hash.
 *
 * Note: The creation transaction hash isn't stored in the profile struct,
 * so we show the profile hash and on-chain timestamps as proof. A full
 * tx-hash lookup would require an indexer or event scanning which we
 * handle separately.
 */
export function useVerification(walletAddress?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const targetAddress = walletAddress ?? connectedAddress;
  const { profile, isLoading, isError, isProfileMissing } =
    useProfile(targetAddress);

  let verification: VerificationInfo | null = null;

  if (profile) {
    const createdDate = new Date(profile.createdAt * 1000);
    verification = {
      walletAddress: profile.walletAddress,
      transactionHash: profile.profileHash, // display the profile hash as the verifiable identifier
      network: TARGET_NETWORK_NAME,
      blockNumber: "—", // would require event log scan
      createdAt: createdDate.toISOString().replace("T", " ").slice(0, 19) + " UTC",
      isVerified: profile.isVerified,
      contractAddress: PROOFID_REGISTRY_ADDRESS,
      profileHash: profile.profileHash,
    };
  }

  return {
    verification,
    isLoading,
    isError,
    isProfileMissing,
  };
}
