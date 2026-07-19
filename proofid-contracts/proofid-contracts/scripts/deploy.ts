import { ethers, network } from "hardhat";

/**
 * Deploys ProofIDRegistry with the deployer as the initial owner, then
 * prints the details needed for the next integration phase (contract
 * address, network, deployment tx hash).
 *
 * Usage:
 *   npm run deploy:amoy
 *   npm run deploy:local
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("──────────────────────────────────────────────");
  console.log("Deploying ProofIDRegistry");
  console.log("──────────────────────────────────────────────");
  console.log(`Network:      ${network.name}`);
  console.log(`Deployer:     ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance:      ${ethers.formatEther(balance)} POL`);

  const ProofIDRegistry = await ethers.getContractFactory("ProofIDRegistry");
  const registry = await ProofIDRegistry.deploy(deployer.address);
  await registry.waitForDeployment();

  const deployTx = registry.deploymentTransaction();
  const contractAddress = await registry.getAddress();

  console.log("──────────────────────────────────────────────");
  console.log("✔ Deployment complete");
  console.log("──────────────────────────────────────────────");
  console.log(`Contract Address:      ${contractAddress}`);
  console.log(`Network:               ${network.name}`);
  console.log(`Deployment Transaction: ${deployTx?.hash ?? "n/a"}`);

  if (network.name === "polygonAmoy") {
    console.log("──────────────────────────────────────────────");
    console.log("Verify with:");
    console.log(`  npx hardhat verify --network polygonAmoy ${contractAddress} ${deployer.address}`);
  }

  console.log("──────────────────────────────────────────────");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
