import { useMemo } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { formatAddress } from "@/utils/web3";

/**
 * Returns both the raw and display-formatted wallet address, so components
 * don't each re-implement truncation.
 */
export function useWalletAddress() {
  const { walletAddress } = useWallet();

  const formatted = useMemo(() => formatAddress(walletAddress), [walletAddress]);

  return {
    address: walletAddress,
    formattedAddress: formatted,
  };
}
