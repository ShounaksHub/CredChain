"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { proofIdRegistryConfig } from "@/lib/contracts/config";

/**
 * Hook providing verifyStudent() and removeVerification() write actions
 * for the admin portal. Both calls go through MetaMask and require the
 * connected wallet to be the contract owner (admin).
 */
export function useAdminActions() {
  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const verifyStudent = (walletAddress: `0x${string}`) => {
    reset();
    writeContract({
      ...proofIdRegistryConfig,
      functionName: "verifyStudent",
      args: [walletAddress],
    });
  };

  const removeVerification = (walletAddress: `0x${string}`) => {
    reset();
    writeContract({
      ...proofIdRegistryConfig,
      functionName: "removeVerification",
      args: [walletAddress],
    });
  };

  return {
    verifyStudent,
    removeVerification,
    txHash,
    isPending: isWritePending || isConfirming,
    isConfirmed,
    writeError,
    reset,
  };
}
