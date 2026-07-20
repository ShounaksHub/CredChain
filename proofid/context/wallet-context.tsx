"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
} from "wagmi";
import { toast } from "@/hooks/use-toast";
import { classifyWalletError, getNetworkLabel, isSupportedChain } from "@/utils/web3";
import type { WalletState } from "@/types/web3";

interface WalletContextValue extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, isConnecting, isReconnecting, connector } = useAccount();
  const chainId = useChainId();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  const connectWallet = useCallback(async () => {
    const metaMaskConnector = connectors.find((c) => c.id === "injected") ?? connectors[0];

    if (!metaMaskConnector) {
      toast({ title: "MetaMask not found", description: "No MetaMask connector is configured." });
      return;
    }

    try {
      await connectAsync({ connector: metaMaskConnector });
      toast({ title: "Wallet connected", description: "MetaMask connected successfully." });
    } catch (error) {
      const { message } = classifyWalletError(error);
      toast({ title: "Connection failed", description: message });
    }
  }, [connectAsync, connectors]);

  const disconnectWallet = useCallback(() => {
    disconnect();
    toast({ title: "Wallet disconnected" });
  }, [disconnect]);

  // Before mount, provide safe defaults so SSR/hydration doesn't trigger
  // state updates from wagmi's reconnection logic.
  const value = useMemo<WalletContextValue>(
    () => ({
      walletAddress: mounted ? address : undefined,
      chainId: mounted ? chainId : undefined,
      networkName: mounted && isConnected ? getNetworkLabel(chainId) : undefined,
      isConnected: mounted ? isConnected : false,
      isConnecting: mounted ? isConnecting || isPending : false,
      isReconnecting: mounted ? isReconnecting : false,
      isWrongNetwork: mounted && isConnected ? !isSupportedChain(chainId) : false,
      connectorName: mounted ? connector?.name : undefined,
      connectWallet,
      disconnectWallet,
    }),
    [mounted, address, chainId, isConnected, isConnecting, isPending, isReconnecting, connector, connectWallet, disconnectWallet]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return ctx;
}
