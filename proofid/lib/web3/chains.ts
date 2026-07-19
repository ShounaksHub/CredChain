import { polygonAmoy } from "viem/chains";
import type { Chain } from "viem";

/**
 * Polygon Amoy Testnet — the only chain this app expects wallets to be on.
 * Sourced from viem/chains, which already matches the required RPC and
 * explorer values, kept here as an explicit re-export so the rest of the
 * app has one place to import "the target chain" from.
 */
export const targetChain: Chain = polygonAmoy;

export const SUPPORTED_CHAINS = [targetChain] as const;

export const TARGET_CHAIN_ID = targetChain.id;

export const TARGET_NETWORK_NAME = targetChain.name;
