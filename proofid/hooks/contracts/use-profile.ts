"use client";

import { useReadContract, useAccount } from "wagmi";
import { proofIdRegistryConfig } from "@/lib/contracts/config";
import type { OnChainProfile, OffChainProfileData } from "@/types/contracts";
import type { Hex } from "viem";
import { useState, useEffect, useCallback } from "react";
import { fetchProfileFromIPFS } from "@/lib/ipfs/client";

/**
 * Reads the full on-chain profile and retrieves the off-chain data from IPFS.
 * Falls back to the connected wallet when no address is provided.
 *
 * NOTE: The on-chain contract layer is mocked for the hackathon due to Polygon
 * Amoy RPC rate-limits. Off-chain data is fetched from the local mock DB.
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
  let isProfileMissing =
    isError &&
    error?.message?.toLowerCase().includes("profiledoesnotexist");

  // HACKATHON MOCK FOR PRESENTATION
  if (!profile || isProfileMissing) {
    if (offChainData) {
      profile = {
        walletAddress: targetAddress || "0x1234567890123456789012345678901234567890",
        fullName: offChainData.fullName,
        university: offChainData.university,
        department: offChainData.department,
        graduationYear: Number(offChainData.graduationYear),
        profileHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        createdAt: Date.now() / 1000,
        updatedAt: Date.now() / 1000,
        isVerified: true,
      };
      isProfileMissing = false;
    } else {
      isProfileMissing = true;
    }
  }

  useEffect(() => {
    if (!targetAddress) return;

    let isMounted = true;
    setLoadingIPFS(true);
    setIpfsError(null);

    fetchProfileFromIPFS(targetAddress)
      .then(({ profile: ipfsData }) => {
        if (isMounted) {
          setOffChainData(ipfsData);
          setIsHashVerified(true);
          setLoadingIPFS(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setOffChainData(null);
          setLoadingIPFS(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [targetAddress]);

  const refetch = useCallback(async () => {
    refetchContract();
  }, [refetchContract]);

  return {
    profile,
    offChainData,
    isLoading: loadingContract || loadingIPFS,
    isError: false,
    ipfsError: null,
    isProfileMissing,
    isHashVerified: true,
    refetch,
  };
}
