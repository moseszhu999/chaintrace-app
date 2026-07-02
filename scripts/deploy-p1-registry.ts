import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { network } from "hardhat";

const { viem } = await network.connect();
const publicClient = await viem.getPublicClient();
const [deployer] = await viem.getWalletClients();
const registry = await viem.deployContract("ChainTraceP1Registry");
const chainId = await publicClient.getChainId();
const blockNumber = await publicClient.getBlockNumber();

const deployment = {
  chainId,
  address: registry.address,
  contract: "ChainTraceP1Registry",
  deployer: deployer.account.address,
  deployedAtBlock: blockNumber.toString(),
  deployedAt: new Date().toISOString()
};

const deploymentDir = path.join(process.cwd(), "deployments", chainId === 31337 ? "local" : String(chainId));
await mkdir(deploymentDir, { recursive: true });
await writeFile(
  path.join(deploymentDir, "ChainTraceP1Registry.json"),
  `${JSON.stringify(deployment, null, 2)}\n`,
  "utf8"
);

console.log(`ChainTraceP1Registry deployed to ${registry.address}`);
console.log(`Chain ID: ${chainId}`);
console.log(`Deployment artifact: ${path.relative(process.cwd(), path.join(deploymentDir, "ChainTraceP1Registry.json"))}`);
