import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Ignition module for ProofIDRegistry.
 *
 * Usage:
 *   npx hardhat ignition deploy ignition/modules/ProofIDRegistry.ts --network polygonAmoy
 */
export default buildModule("ProofIDRegistryModule", (m) => {
  const initialOwner = m.getAccount(0);

  const registry = m.contract("ProofIDRegistry", [initialOwner]);

  return { registry };
});
