"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { proofIdRegistryConfig } from "@/lib/contracts/config";
import type { Hex } from "viem";
import { TARGET_CHAIN_ID } from "@/lib/web3/chains";

/**
 * Handles the updateProfile() transaction lifecycle.
 * Only profileHash, department, and graduationYear are mutable post-creation.
 */
export function useUpdateProfile() {
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

  function updateProfile(args: {
    newProfileHash: Hex;
    newDepartment: string;
    newGraduationYear: number;
  }) {
    writeContract({
      ...proofIdRegistryConfig,
      chainId: TARGET_CHAIN_ID,
      functionName: "updateProfile",
      args: [args.newProfileHash, args.newDepartment, args.newGraduationYear],
    });
  }

  return {
    updateProfile,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    receipt,
    writeError,
    reset,
  };
}
