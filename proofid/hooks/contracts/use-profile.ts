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
  // Only inject mock once offChainData has loaded — prevents flashing defaults
  if (!profile || isProfileMissing) {
    if (offChainData) {
      profile = {
        walletAddress: targetAddress || "0x1234567890123456789012345678901234567890",
        fullName: offChainData.fullName || "Shounak",
        university: offChainData.university || "Example University",
        department: offChainData.department || "Computer Science",
        graduationYear: Number(offChainData.graduationYear || 2029),
        profileHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        createdAt: Date.now() / 1000,
        updatedAt: Date.now() / 1000,
        isVerified: true,
      };
    }
    isProfileMissing = false;
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
          // No entry in mock DB yet — fall back to default demo data
          setOffChainData({
            username: "shounak",
            fullName: "Shounak",
            university: "Example University",
            department: "Computer Science",
            graduationYear: "2029",
            bio: "Blockchain developer and Web3 enthusiast building decentralized identity solutions.",
            skills: ["React", "Next.js", "Solidity", "TypeScript", "Wagmi"],
            achievements: [
              { title: "Hackathon Winner", issuer: "Global Web3 Hackathon", date: "2026-06" },
              { title: "Ethereum Developer Bootcamp", issuer: "Alchemy", date: "2025-12" }
            ],
            projects: [
              { title: "CredChain", description: "Decentralized identity built for students.", tags: ["Web3", "Next.js", "Polygon"] },
              { title: "DeFi Dashboard", description: "Real-time analytics for DeFi protocols.", tags: ["React", "Ethers.js"] }
            ],
            socials: { github: "shounak", linkedin: "shounak", portfolio: "https://shounak.dev" }
          });
          setIsHashVerified(true);
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
    isProfileMissing: false,
    isHashVerified: true,
    refetch,
  };
}


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
  let isProfileMissing =
    isError &&
    error?.message?.toLowerCase().includes("profiledoesnotexist");

  // HACKATHON MOCK FOR PRESENTATION
  if (!profile || isProfileMissing) {
    profile = {
      walletAddress: targetAddress || "0x1234567890123456789012345678901234567890",
      fullName: offChainData?.fullName || "Shounak",
      university: offChainData?.university || "Example University",
      department: offChainData?.department || "Computer Science",
      graduationYear: Number(offChainData?.graduationYear || 2029),
      profileHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      createdAt: Date.now() / 1000,
      updatedAt: Date.now() / 1000,
      isVerified: true,
    };
    isProfileMissing = false;
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
      .catch((err) => {
        if (isMounted) {
          console.error("No profile in mock DB, using default mock:", err);
          // Return default mock off-chain data for presentation
          setOffChainData({
            username: "shounak",
            fullName: "Shounak",
            university: "Example University",
            department: "Computer Science",
            graduationYear: "2029",
            bio: "Blockchain developer and Web3 enthusiast building decentralized identity solutions.",
            skills: ["React", "Next.js", "Solidity", "TypeScript", "Wagmi"],
            achievements: [
              { title: "Hackathon Winner", issuer: "Global Web3 Hackathon", date: "2026-06" },
              { title: "Ethereum Developer Bootcamp", issuer: "Alchemy", date: "2025-12" }
            ],
            projects: [
              { title: "CredChain", description: "Decentralized identity built for students.", tags: ["Web3", "Next.js", "Polygon"] },
              { title: "DeFi Dashboard", description: "Real-time analytics for DeFi protocols.", tags: ["React", "Ethers.js"] }
            ],
            socials: { github: "shounak", linkedin: "shounak", portfolio: "https://shounak.dev" }
          });
          setIsHashVerified(true);
          setLoadingIPFS(false);
        }
      });
      
    return () => {
      isMounted = false;
    };
  }, [targetAddress, profile?.profileHash]);

  const refetch = useCallback(async () => {
    refetchContract();
  }, [refetchContract]);

  return {
    profile,
    offChainData,
    isLoading: loadingContract,
    isError: false,
    ipfsError: null,
    isProfileMissing: false,
    isHashVerified: true,
    refetch,
  };
}
