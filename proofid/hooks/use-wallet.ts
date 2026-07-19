import { useWalletContext } from "@/context/wallet-context";

/**
 * Primary hook for reading wallet connection state and triggering
 * connect/disconnect. Thin wrapper around WalletContext so consumers don't
 * need to know it's context-backed.
 */
export function useWallet() {
  return useWalletContext();
}
