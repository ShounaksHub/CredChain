"use client";

import { useState, useEffect } from "react";

/**
 * Resolves a username (e.g. "shounak") to a wallet address.
 *
 * Queries Pinata IPFS mapping.
 * Returns the wallet address or null if not found.
 */
export function useResolveUsername(username: string) {
  const [walletAddress, setWalletAddress] = useState<`0x${string}` | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (!username) {
      setIsLoading(false);
      setIsNotFound(true);
      return;
    }

    setIsLoading(true);
    fetch(`/api/ipfs/resolve-username?username=${username.toLowerCase()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        if (data.walletAddress) {
          setWalletAddress(data.walletAddress as `0x${string}`);
          setIsNotFound(false);
        } else {
          setWalletAddress(null);
          setIsNotFound(true);
        }
      })
      .catch(() => {
        // HACKATHON FALLBACK: Check localStorage in case Vercel Lambda wiped the mock DB
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem(`mock_username_${username.toLowerCase()}`);
            if (raw) {
              const data = JSON.parse(raw);
              if (data.walletAddress) {
                setWalletAddress(data.walletAddress as `0x${string}`);
                setIsNotFound(false);
                return;
              }
            }
          } catch (e) {
            console.warn("Failed to read from localStorage", e);
          }
        }
        
        setWalletAddress(null);
        setIsNotFound(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [username]);

  return {
    walletAddress,
    isLoading,
    isNotFound,
  };
}
