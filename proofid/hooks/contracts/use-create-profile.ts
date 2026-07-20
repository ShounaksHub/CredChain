"use client";

import { useState } from "react";
import type { Hex } from "viem";

/**
 * Handles the full createProfile() transaction lifecycle.
 * (MOCKED FOR HACKATHON DUE TO RPC OUTAGES)
 */
export function useCreateProfile() {
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [writeError, setWriteError] = useState<Error | null>(null);

  function reset() {
    setIsPending(false);
    setIsConfirming(false);
    setIsSuccess(false);
    setTxHash(undefined);
    setWriteError(null);
  }

  function createProfile(args: {
    fullName: string;
    university: string;
    department: string;
    graduationYear: number;
    profileHash: Hex;
  }) {
    setIsPending(true);
    
    // Simulate MetaMask popup and user approval delay
    setTimeout(() => {
      setIsPending(false);
      setTxHash("0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(""));
      setIsConfirming(true);
      
      // Simulate on-chain block mining delay
      setTimeout(() => {
        setIsConfirming(false);
        setIsSuccess(true);
      }, 2500);
    }, 1200);
  }

  return {
    createProfile,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    receipt: isSuccess ? { status: "success" } : undefined,
    writeError,
    reset,
  };
}
