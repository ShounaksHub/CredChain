import { TARGET_CHAIN_ID, TARGET_NETWORK_NAME } from "@/lib/web3/chains";
import type { WalletError, WalletErrorKind } from "@/types/web3";

/** Formats an address like 0x5A91...8F23 */
export function formatAddress(address?: string, head = 6, tail = 4): string {
  if (!address) return "";
  if (address.length <= head + tail + 2) return address;
  return `${address.slice(0, head)}...${address.slice(-tail)}`;
}

export function isMetaMaskInstalled(): boolean {
  if (typeof window === "undefined") return false;
  const ethereum = (window as unknown as { ethereum?: { isMetaMask?: boolean; providers?: { isMetaMask?: boolean }[] } }).ethereum;
  if (!ethereum) return false;
  if (ethereum.isMetaMask) return true;
  return Boolean(ethereum.providers?.some((p) => p.isMetaMask));
}

export function isSupportedChain(chainId?: number): boolean {
  return chainId === TARGET_CHAIN_ID;
}

export function getNetworkLabel(chainId?: number, fallbackName?: string): string {
  if (chainId === TARGET_CHAIN_ID) return TARGET_NETWORK_NAME;
  if (fallbackName) return fallbackName;
  if (chainId) return `Chain ${chainId}`;
  return "Unknown Network";
}

/**
 * Normalizes wagmi / MetaMask errors into a small set of known kinds so the
 * UI can show consistent, clean messages instead of raw provider errors.
 */
export function classifyWalletError(error: unknown): WalletError {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  let kind: WalletErrorKind = "unknown";

  if (!isMetaMaskInstalled()) {
    kind = "not-installed";
  } else if (
    lower.includes("user rejected") ||
    lower.includes("user denied") ||
    lower.includes("rejected the request")
  ) {
    kind = "user-rejected";
  } else if (lower.includes("locked") || lower.includes("unauthorized")) {
    kind = "wallet-locked";
  } else if (lower.includes("chain") && (lower.includes("mismatch") || lower.includes("unsupported"))) {
    kind = "wrong-network";
  } else if (lower.includes("failed to connect") || lower.includes("connection")) {
    kind = "connection-failed";
  }

  const messages: Record<WalletErrorKind, string> = {
    "not-installed": "MetaMask isn't installed. Install the browser extension to connect.",
    "user-rejected": "Connection request was declined.",
    "wallet-locked": "MetaMask is locked. Unlock it and try again.",
    "wrong-network": "Wrong network. Switch to Polygon Amoy to continue.",
    "connection-failed": "Couldn't connect to MetaMask. Please try again.",
    unknown: "Something went wrong while connecting your wallet.",
  };

  return { kind, message: messages[kind] };
}

/**
 * Parses viem contract revert errors (custom Solidity errors from
 * ProofIDRegistry) into human-friendly title + description pairs
 * suitable for toast notifications.
 */
export function classifyContractError(error: unknown): {
  title: string;
  message: string;
} {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();

  // ── Custom contract errors ──
  if (lower.includes("profilealreadyexists")) {
    return {
      title: "Profile already exists",
      message: "This wallet already owns a profile. Go to your dashboard to view it.",
    };
  }
  if (lower.includes("profiledoesnotexist")) {
    return {
      title: "Profile not found",
      message: "No profile exists for this wallet. Create one first.",
    };
  }
  if (lower.includes("emptyname")) {
    return { title: "Name required", message: "Full name cannot be empty." };
  }
  if (lower.includes("emptyuniversity")) {
    return { title: "University required", message: "University cannot be empty." };
  }
  if (lower.includes("emptydepartment")) {
    return { title: "Department required", message: "Department cannot be empty." };
  }
  if (lower.includes("invalidgraduationyear")) {
    return {
      title: "Invalid graduation year",
      message: "Graduation year must be between 2000 and 2100.",
    };
  }
  if (lower.includes("invalidprofilehash")) {
    return {
      title: "Invalid profile hash",
      message: "Profile hash cannot be empty. Please fill in your profile details.",
    };
  }
  if (lower.includes("notprofileowner")) {
    return {
      title: "Not authorized",
      message: "Only the profile owner can perform this action.",
    };
  }

  // ── Wallet / transaction errors ──
  if (
    lower.includes("user rejected") ||
    lower.includes("user denied") ||
    lower.includes("rejected the request")
  ) {
    return {
      title: "Transaction cancelled",
      message: "You rejected the transaction in MetaMask.",
    };
  }
  if (lower.includes("insufficient funds") || lower.includes("insufficient balance")) {
    return {
      title: "Insufficient funds",
      message: "Your wallet doesn't have enough POL to cover gas fees.",
    };
  }

  console.error("Raw Contract Error:", error);
  return {
    title: "Transaction failed",
    message: raw || "Something went wrong. Please try again.",
  };
}
