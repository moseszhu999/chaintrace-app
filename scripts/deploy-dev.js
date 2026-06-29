const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer, riskOfficer] = await hre.ethers.getSigners();
  if (!deployer || !riskOfficer) {
    throw new Error("Missing Hardhat dev deployer.");
  }

  const network = await hre.ethers.provider.getNetwork();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deploying ChainTrace dev contracts to ${network.name} (${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Deployer balance: ${hre.ethers.formatEther(balance)} ETH`);

  const MockStablecoin = await hre.ethers.getContractFactory("MockStablecoin");
  const mockStablecoin = await MockStablecoin.deploy();
  await mockStablecoin.waitForDeployment();
  const mockStablecoinAddress = await mockStablecoin.getAddress();
  console.log(`MockStablecoin: ${mockStablecoinAddress}`);

  const LoanRequestRegistry = await hre.ethers.getContractFactory("LoanRequestRegistry");
  const loanRequestRegistry = await LoanRequestRegistry.deploy();
  await loanRequestRegistry.waitForDeployment();
  const loanRequestRegistryAddress = await loanRequestRegistry.getAddress();
  console.log(`LoanRequestRegistry: ${loanRequestRegistryAddress}`);

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
  const bankVault = await BankVault.deploy(riskOfficer.address);
  await bankVault.waitForDeployment();
  const bankVaultAddress = await bankVault.getAddress();
  console.log(`BankVault: ${bankVaultAddress}`);

  const FinancierPool = await hre.ethers.getContractFactory("FinancierPool");
  const financierPool = await FinancierPool.deploy(bankVaultAddress, mockStablecoinAddress, riskOfficer.address);
  await financierPool.waitForDeployment();
  const financierPoolAddress = await financierPool.getAddress();
  console.log(`FinancierPool: ${financierPoolAddress}`);

  await bankVault.transferOwnership(financierPoolAddress);

  const deployment = {
    network: "hardhat",
    chainId: Number(network.chainId),
    deployer: deployer.address,
    riskOfficer: riskOfficer.address,
    deployerBalanceEth: hre.ethers.formatEther(balance),
    deployedAt: new Date().toISOString(),
    contracts: {
      MockStablecoin: mockStablecoinAddress,
      LoanRequestRegistry: loanRequestRegistryAddress,
      TradeSigningRegistry: signingRegistryAddress,
      LogisticsEvidenceRegistry: logisticsEvidenceRegistryAddress,
      FinancierPool: financierPoolAddress,
      BankVault: bankVaultAddress,
    },
    nextSteps: [
      "Submit SME financing requests into LoanRequestRegistry with evidence-pack URI/hash.",
      "Financiers deposit test stablecoin into FinancierPool.",
      "FinancierPool funds BankVault and configures borrower credit lines.",
      "Create signing slots for PO, invoice, QC, B/L, warehouse receipt, and buyer acceptance.",
      "Create logistics evidence gates for packing, VGM, export clearance, import permit, warehouse receipt, and arrival QC.",
      "Deploy ReceivableLoan with both required signing slots and required logistics evidence IDs after review approval.",
      "Approve the loan contract through FinancierPool.",
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
