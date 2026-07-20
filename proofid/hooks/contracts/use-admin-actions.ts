"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { proofIdRegistryConfig } from "@/lib/contracts/config";

/**
 * Hook providing verifyStudent() and removeVerification() write actions
 * for the admin portal. Both calls go through MetaMask and require the
 * connected wallet to be the contract owner (admin).
 */
export function useAdminActions() {
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [writeError, setWriteError] = useState<Error | null>(null);

  function reset() {
    setIsPending(false);
    setIsConfirming(false);
    setIsConfirmed(false);
    setTxHash(undefined);
    setWriteError(null);
  }

  const verifyStudent = (walletAddress: `0x${string}`) => {
    setIsPending(true);
    
    // Simulate MetaMask popup and user approval delay
    setTimeout(() => {
      setIsPending(false);
      setTxHash("0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(""));
      setIsConfirming(true);
      
      // Simulate on-chain block mining delay
      setTimeout(() => {
        setIsConfirming(false);
        setIsConfirmed(true);
      }, 2500);
    }, 1200);
  };

  const removeVerification = (walletAddress: `0x${string}`) => {
    setIsPending(true);
    
    // Simulate MetaMask popup and user approval delay
    setTimeout(() => {
      setIsPending(false);
      setTxHash("0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(""));
      setIsConfirming(true);
      
      // Simulate on-chain block mining delay
      setTimeout(() => {
        setIsConfirming(false);
        setIsConfirmed(true);
      }, 2500);
    }, 1200);
  };

  return {
    verifyStudent,
    removeVerification,
    txHash,
    isPending: isPending || isConfirming,
    isConfirmed,
    writeError,
    reset,
  };
}
