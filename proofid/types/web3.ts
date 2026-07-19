export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

export interface WalletState {
  walletAddress: `0x${string}` | undefined;
  chainId: number | undefined;
  networkName: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  isWrongNetwork: boolean;
  connectorName: string | undefined;
}

export type WalletErrorKind =
  | "not-installed"
  | "user-rejected"
  | "wallet-locked"
  | "wrong-network"
  | "connection-failed"
  | "unknown";

export interface WalletError {
  kind: WalletErrorKind;
  message: string;
}
