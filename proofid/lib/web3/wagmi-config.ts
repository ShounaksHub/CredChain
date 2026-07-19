import { createConfig, http } from "wagmi";
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
    [targetChain.id]: http(targetChain.rpcUrls.default.http[0]),
  },
  multiInjectedProviderDiscovery: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
