const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("Missing Hardhat dev deployer.");
  }

  const network = await hre.ethers.provider.getNetwork();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deploying ChainTrace dev contracts to ${network.name} (${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Deployer balance: ${hre.ethers.formatEther(balance)} ETH`);

  const TradeSigningRegistry = await hre.ethers.getContractFactory("TradeSigningRegistry");
  const signingRegistry = await TradeSigningRegistry.deploy();
  await signingRegistry.waitForDeployment();
  const signingRegistryAddress = await signingRegistry.getAddress();
  console.log(`TradeSigningRegistry: ${signingRegistryAddress}`);

  const BankVault = await hre.ethers.getContractFactory("BankVault");
  const bankVault = await BankVault.deploy(deployer.address);
  await bankVault.waitForDeployment();
  const bankVaultAddress = await bankVault.getAddress();
  console.log(`BankVault: ${bankVaultAddress}`);

  const deployment = {
    network: "hardhat",
    chainId: Number(network.chainId),
    deployer: deployer.address,
    deployerBalanceEth: hre.ethers.formatEther(balance),
    deployedAt: new Date().toISOString(),
    contracts: {
      TradeSigningRegistry: signingRegistryAddress,
      BankVault: bankVaultAddress,
    },
    note: "Ephemeral Hardhat dev-chain deployment. Addresses are for CI validation only and are not persistent.",
  };

  const outDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "hardhat-dev.json");
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2));
  console.log(`Dev deployment record written to ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
