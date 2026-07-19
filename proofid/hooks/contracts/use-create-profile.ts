"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { proofIdRegistryConfig } from "@/lib/contracts/config";
import type { Hex } from "viem";
import { TARGET_CHAIN_ID } from "@/lib/web3/chains";

/**
 * Handles the full createProfile() transaction lifecycle:
 * submit → MetaMask confirmation → on-chain confirmation.
 */
export function useCreateProfile() {
  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function createProfile(args: {
    fullName: string;
    university: string;
    department: string;
    graduationYear: number;
    profileHash: Hex;
  }) {
    writeContract({
      ...proofIdRegistryConfig,
      chainId: TARGET_CHAIN_ID,
      functionName: "createProfile",
      args: [
        args.fullName,
        args.university,
        args.department,
        args.graduationYear,
        args.profileHash,
      ],
    });
  }

  return {
    createProfile,
    isPending, // waiting for user to confirm in MetaMask
    isConfirming, // waiting for on-chain confirmation
    isSuccess,
    txHash,
    receipt,
    writeError,
    reset,
  };
}
