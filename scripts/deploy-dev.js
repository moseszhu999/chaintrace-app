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

  const LogisticsEvidenceRegistry = await hre.ethers.getContractFactory("LogisticsEvidenceRegistry");
  const logisticsEvidenceRegistry = await LogisticsEvidenceRegistry.deploy();
  await logisticsEvidenceRegistry.waitForDeployment();
  const logisticsEvidenceRegistryAddress = await logisticsEvidenceRegistry.getAddress();
  console.log(`LogisticsEvidenceRegistry: ${logisticsEvidenceRegistryAddress}`);

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
      LogisticsEvidenceRegistry: logisticsEvidenceRegistryAddress,
      BankVault: bankVaultAddress,
    },
    nextSteps: [
      "Create signing slots for PO, invoice, QC, B/L, warehouse receipt, and buyer acceptance.",
      "Create logistics evidence gates for packing, VGM, export clearance, import permit, warehouse receipt, and arrival QC.",
      "Deploy ReceivableLoan with both required signing slots and required logistics evidence IDs.",
      "Approve the loan contract in BankVault.",
    ],
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
