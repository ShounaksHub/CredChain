import { createConfig, http, fallback } from "wagmi";
import { injected } from "wagmi/connectors";
import { targetChain } from "./chains";

/**
 * Wagmi config wired for the injected wallet (MetaMask browser extension).
 * Uses the `injected()` connector which connects directly to window.ethereum,
 * bypassing the MetaMask SDK multichain flow that can fail on localhost.
 */
export const wagmiConfig = createConfig({
  chains: [targetChain],
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
  transports: {
    [targetChain.id]: fallback(
      [
        http("https://polygon-amoy.g.alchemy.com/v2/demo", { retryCount: 3, timeout: 20000 }),
        http("https://rpc.ankr.com/polygon_amoy", { retryCount: 3, timeout: 20000 }),
        http("https://polygon-amoy-bor-rpc.publicnode.com", { retryCount: 3, timeout: 20000 }),
        http("https://polygon-amoy.drpc.org", { retryCount: 3, timeout: 20000 }),
        http("https://polygon-amoy.blockpi.network/v1/rpc/public", { retryCount: 3, timeout: 20000 }),
        http(targetChain.rpcUrls.default.http[0], { retryCount: 3, timeout: 20000 }),
      ],
      { rank: false, retryCount: 5 }
    ),
  },
  multiInjectedProviderDiscovery: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
