const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const FlowType = {
  Commercial: 0,
  Logistics: 1,
  Funds: 2,
  Information: 3,
};

const EvidenceType = {
  Container: 0,
  Seal: 1,
  Packing: 2,
  VGM: 3,
  ExportCustoms: 4,
  BillOfLading: 5,
  ImportPermit: 6,
  WarehouseReceipt: 7,
  QualityInspection: 8,
  BuyerAcceptance: 9,
  Other: 10,
};

function id(value) {
  return hre.ethers.id(value);
}

async function deploy(contractName, ...args) {
  const Factory = await hre.ethers.getContractFactory(contractName);
  const contract = await Factory.deploy(...args);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`${contractName}: ${address}`);
  return contract;
}

async function main() {
  const [deployer, riskOfficer, borrower, financier, buyer, exporter, logistics, warehouse] = await hre.ethers.getSigners();
  if (!deployer || !riskOfficer || !borrower || !financier || !buyer || !exporter || !logistics || !warehouse) {
    throw new Error("Missing Hardhat signers for the Vietnam coffee case fixture.");
  }

  const network = await hre.ethers.provider.getNetwork();
  console.log(`Deploying Vietnam coffee case to ${network.name} (${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);

  const tradeId = id("trade_vn_coffee_sg_2026_0007");
  const dueAt = Math.floor(Date.now() / 1000) + 7 * 86400;

  const stablecoin = await deploy("MockStablecoin");
  const stablecoinAddress = await stablecoin.getAddress();
  await stablecoin.issue(deployer.address, hre.ethers.parseUnits("1000000", 6));

  const signingRegistry = await deploy("TradeSigningRegistry");
  const signingRegistryAddress = await signingRegistry.getAddress();

  const logisticsRegistry = await deploy("LogisticsEvidenceRegistry");
  const logisticsRegistryAddress = await logisticsRegistry.getAddress();

  const bankVault = await deploy("BankVault", riskOfficer.address);
  const bankVaultAddress = await bankVault.getAddress();

  await bankVault.setSupportedAsset(stablecoinAddress, true);
  await stablecoin.approve(bankVaultAddress, hre.ethers.parseUnits("100000", 6));
  await bankVault.depositLiquidity(stablecoinAddress, hre.ethers.parseUnits("100000", 6));
  await bankVault.connect(riskOfficer).grantCreditLine(borrower.address, stablecoinAddress, hre.ethers.parseUnits("50000", 6));

  const signingSlots = {
    po: id("sign_po_buyer"),
    invoice: id("seal_invoice_exporter"),
    quality: id("seal_quality_exporter"),
    bl: id("seal_bl_logistics"),
    warehouse: id("seal_warehouse_entry"),
    acceptance: id("sign_buyer_acceptance"),
  };

  await signingRegistry.createSlot(tradeId, signingSlots.po, FlowType.Commercial, buyer.address, id("BUYER"), id("po-initial"), dueAt, "ipfs://po");
  await signingRegistry.createSlot(tradeId, signingSlots.invoice, FlowType.Commercial, exporter.address, id("EXPORTER"), id("invoice-initial"), dueAt, "ipfs://invoice");
  await signingRegistry.createSlot(tradeId, signingSlots.quality, FlowType.Information, exporter.address, id("EXPORTER"), id("quality-initial"), dueAt, "ipfs://quality");
  await signingRegistry.createSlot(tradeId, signingSlots.bl, FlowType.Logistics, logistics.address, id("LOGISTICS"), id("bl-initial"), dueAt, "ipfs://bl");
  await signingRegistry.createSlot(tradeId, signingSlots.warehouse, FlowType.Logistics, warehouse.address, id("WAREHOUSE"), id("warehouse-initial"), dueAt, "ipfs://warehouse");
  await signingRegistry.createSlot(tradeId, signingSlots.acceptance, FlowType.Logistics, buyer.address, id("BUYER"), id("acceptance-initial"), dueAt, "ipfs://acceptance");

  await signingRegistry.connect(buyer).signSlot(signingSlots.po, id("po-final"), "ipfs://po-final");
  await signingRegistry.connect(exporter).signSlot(signingSlots.invoice, id("invoice-final"), "ipfs://invoice-final");
  await signingRegistry.connect(exporter).signSlot(signingSlots.quality, id("quality-final"), "ipfs://quality-final");

  const logisticsGates = {
    packing: id("log_stuffing"),
    sealVgm: id("log_vgm"),
    exportClearance: id("log_export_clearance"),
    sgPermit: id("log_sg_permit"),
    warehouse: id("log_warehouse"),
    arrivalQc: id("log_qc_acceptance"),
  };

  await logisticsRegistry.createGate(tradeId, logisticsGates.packing, EvidenceType.Packing, exporter.address, id("EXPORTER"), id("packing-initial"), dueAt, "ipfs://packing");
  await logisticsRegistry.createGate(tradeId, logisticsGates.sealVgm, EvidenceType.VGM, logistics.address, id("LOGISTICS"), id("vgm-initial"), dueAt, "ipfs://vgm");
  await logisticsRegistry.createGate(tradeId, logisticsGates.exportClearance, EvidenceType.ExportCustoms, logistics.address, id("LOGISTICS"), id("export-initial"), dueAt, "ipfs://export-clearance");
  await logisticsRegistry.createGate(tradeId, logisticsGates.sgPermit, EvidenceType.ImportPermit, buyer.address, id("BUYER"), id("sg-permit-initial"), dueAt, "ipfs://sg-permit");
  await logisticsRegistry.createGate(tradeId, logisticsGates.warehouse, EvidenceType.WarehouseReceipt, warehouse.address, id("WAREHOUSE"), id("warehouse-initial"), dueAt, "ipfs://warehouse-receipt");
  await logisticsRegistry.createGate(tradeId, logisticsGates.arrivalQc, EvidenceType.QualityInspection, buyer.address, id("BUYER"), id("qc-initial"), dueAt, "ipfs://arrival-qc");

  await logisticsRegistry.connect(exporter).verifyEvidence(logisticsGates.packing, id("packing-final"), "ipfs://packing-final");
  await logisticsRegistry.connect(logistics).verifyEvidence(logisticsGates.sealVgm, id("vgm-final"), "ipfs://vgm-final");
  await logisticsRegistry.connect(logistics).verifyEvidence(logisticsGates.exportClearance, id("export-final"), "ipfs://export-final");

  const ReceivableLoan = await hre.ethers.getContractFactory("ReceivableLoan");
  const loan = await ReceivableLoan.deploy(
    bankVaultAddress,
    signingRegistryAddress,
    logisticsRegistryAddress,
    tradeId,
    stablecoinAddress,
    borrower.address,
    financier.address,
    hre.ethers.parseUnits("36960", 6),
    hre.ethers.parseUnits("29500", 6),
    hre.ethers.parseUnits("737.5", 6),
    dueAt + 45 * 86400,
    [signingSlots.po, signingSlots.invoice, signingSlots.quality, signingSlots.bl, signingSlots.warehouse, signingSlots.acceptance],
    [logisticsGates.packing, logisticsGates.sealVgm, logisticsGates.exportClearance, logisticsGates.sgPermit, logisticsGates.warehouse, logisticsGates.arrivalQc]
  );
  await loan.waitForDeployment();
  const loanAddress = await loan.getAddress();
  console.log(`ReceivableLoan: ${loanAddress}`);

  await bankVault.approveLoanContract(loanAddress, true);

  const [passed, total, allPassed] = await loan.checkGates();
  console.log(`Loan gates: ${passed}/${total}, allPassed=${allPassed}`);

  const deployment = {
    network: network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    case: {
      tradeId: "trade_vn_coffee_sg_2026_0007",
      title: "Vietnam Robusta coffee beans to Singapore",
      poNo: "PO-SG-88421",
      invoiceNo: "INV-VN-2026-0318",
      containerNo: "TCLU-482913-2",
      sealNo: "VNCT-739184",
      tradeValue: "USD 52,800",
      blockedBalance: "USD 36,960",
      requestedAdvance: "USDC 29,500",
      status: "pre-review only; final B/L, Singapore permit, warehouse receipt, arrival QC, and buyer acceptance are still incomplete",
    },
    parties: {
      deployer: deployer.address,
      riskOfficer: riskOfficer.address,
      borrower: borrower.address,
      financier: financier.address,
      buyer: buyer.address,
      exporter: exporter.address,
      logistics: logistics.address,
      warehouse: warehouse.address,
    },
    contracts: {
      MockStablecoin: stablecoinAddress,
      TradeSigningRegistry: signingRegistryAddress,
      LogisticsEvidenceRegistry: logisticsRegistryAddress,
      BankVault: bankVaultAddress,
      ReceivableLoan: loanAddress,
    },
    signingSlots: Object.fromEntries(Object.entries(signingSlots).map(([key, value]) => [key, value])),
    logisticsGates: Object.fromEntries(Object.entries(logisticsGates).map(([key, value]) => [key, value])),
    loanGateStatus: {
      passed: passed.toString(),
      total: total.toString(),
      allPassed,
    },
    nextSteps: [
      "Verify final B/L with logistics provider.",
      "Verify Singapore import permit status with buyer or customs agent.",
      "Verify warehouse receipt with Jurong warehouse.",
      "Resolve arrival QC moisture dispute.",
      "Collect buyer accept / discount / reject signature.",
      "Then call loan.disburse() from financier or owner.",
    ],
  };

  const outDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "vn-coffee-case-hardhat.json");
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2));
  console.log(`Vietnam coffee case deployment record written to ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
