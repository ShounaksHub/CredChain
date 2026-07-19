"use client";

import { useReadContract, useAccount } from "wagmi";
import { proofIdRegistryConfig } from "@/lib/contracts/config";
import type { OnChainProfile, OffChainProfileData } from "@/types/contracts";
import type { Hex } from "viem";
import { useState, useEffect } from "react";
import { fetchProfileFromIPFS, verifyProfileIntegrity } from "@/lib/ipfs/client";

/**
 * Reads the full on-chain profile and retrieves the off-chain data from IPFS.
 * Falls back to the connected wallet when no address is provided.
 *
 * Verifies integrity of the IPFS data by comparing its hash with the on-chain profileHash.
 */
export function useProfile(walletAddress?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const targetAddress = walletAddress ?? connectedAddress;

  const { data, isLoading: loadingContract, isError, error, refetch: refetchContract } = useReadContract({
    ...proofIdRegistryConfig,
    functionName: "getProfile",
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
      retry: false,
    },
  });

  const [offChainData, setOffChainData] = useState<OffChainProfileData | null>(null);
  const [loadingIPFS, setLoadingIPFS] = useState(false);
  const [ipfsError, setIpfsError] = useState<string | null>(null);
  const [isHashVerified, setIsHashVerified] = useState<boolean | null>(null);

  // Parse the tuple returned by getProfile() into a typed object
  let profile: OnChainProfile | null = null;

  if (data) {
    const [
      wallet_,
      fullName,
      university,
      department,
      graduationYear,
      profileHash,
      createdAt,
      updatedAt,
      verified,
    ] = data as [
      `0x${string}`,
      string,
      string,
      string,
      number,
      Hex,
      number,
      number,
      boolean,
    ];

    profile = {
      walletAddress: wallet_,
      fullName,
      university,
      department,
      graduationYear: Number(graduationYear),
      profileHash,
      createdAt: Number(createdAt),
      updatedAt: Number(updatedAt),
      isVerified: verified,
    };
  }

  // Treat ProfileDoesNotExist as "no profile" rather than an error
  const isProfileMissing =
    isError &&
    error?.message?.toLowerCase().includes("profiledoesnotexist");

  useEffect(() => {
    if (!profile) {
      setOffChainData(null);
      setIsHashVerified(null);
      setIpfsError(null);
      return;
    }

    let active = true;
    const loadIPFS = async () => {
      setLoadingIPFS(true);
      setIpfsError(null);
      try {
        const result = await fetchProfileFromIPFS(profile.walletAddress);
        if (!active) return;

        if (result && result.profile) {
          setOffChainData(result.profile);
          const isValid = await verifyProfileIntegrity(result.profile, profile.profileHash);
          if (active) {
            setIsHashVerified(isValid);
          }
        } else {
          throw new Error("No profile content returned");
        }
      } catch (err: any) {
        if (active) {
          console.error("Failed to load off-chain profile:", err);
          setIpfsError(err.message || "Failed to retrieve profile from IPFS");
          setOffChainData(null);
          setIsHashVerified(false);
        }
      } finally {
        if (active) {
          setLoadingIPFS(false);
        }
      }
    };

    loadIPFS();

    return () => {
      active = false;
    };
  }, [profile?.walletAddress, profile?.profileHash]);

  const refetch = async () => {
    refetchContract();
  };

  return {
    profile,
    offChainData,
    isLoading: loadingContract || loadingIPFS,
    isError: (isError && !isProfileMissing) || !!ipfsError,
    ipfsError,
    isProfileMissing,
    isHashVerified,
    refetch,
  };
}
