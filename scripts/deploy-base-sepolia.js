const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("Missing deployer. Set DEPLOYER_PRIVATE_KEY in GitHub Secrets or local env.");
  }

  const network = await hre.ethers.provider.getNetwork();
  console.log(`Deploying ChainTrace contracts to ${network.name} (${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);

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
    network: "baseSepolia",
    chainId: Number(network.chainId),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      TradeSigningRegistry: signingRegistryAddress,
      LogisticsEvidenceRegistry: logisticsEvidenceRegistryAddress,
      BankVault: bankVaultAddress,
    },
    nextSteps: [
      "Set supported USDC asset on BankVault.",
      "Deposit test USDC liquidity.",
      "Create signing slots for the concrete trade.",
      "Create logistics evidence gates for packing, VGM, export clearance, import permit, warehouse receipt, and arrival QC.",
      "Deploy ReceivableLoan with required signing slot IDs and logistics evidence IDs.",
      "Approve the loan contract in BankVault.",
    ],
  };

  const outDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "base-sepolia.json");
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2));
  console.log(`Deployment record written to ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
