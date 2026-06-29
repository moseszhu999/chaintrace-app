const { expect } = require("chai");
const { ethers } = require("hardhat");

const FlowType = {
  Commercial: 0,
  Logistics: 1,
  Funds: 2,
  Information: 3,
};

function id(value) {
  return ethers.id(value);
}

async function deployMockStablecoin(owner) {
  const MockStablecoin = await ethers.getContractFactory("MockStablecoin");
  const token = await MockStablecoin.deploy();
  await token.waitForDeployment();
  await token.issue(owner.address, ethers.parseUnits("1000000", 6));
  return token;
}

describe("ChainTrace contract suite", function () {
  async function fixture() {
    const [owner, riskOfficer, borrower, financier, buyer, exporter, logistics, warehouse, investor] = await ethers.getSigners();

    const stablecoin = await deployMockStablecoin(owner);

    const Registry = await ethers.getContractFactory("TradeSigningRegistry");
    const registry = await Registry.deploy();
    await registry.waitForDeployment();

    const BankVault = await ethers.getContractFactory("BankVault");
    const bank = await BankVault.deploy(riskOfficer.address);
    await bank.waitForDeployment();

    await bank.setSupportedAsset(await stablecoin.getAddress(), true);
    await stablecoin.approve(await bank.getAddress(), ethers.parseUnits("100000", 6));
    await bank.depositLiquidity(await stablecoin.getAddress(), ethers.parseUnits("100000", 6));
    await bank.connect(riskOfficer).grantCreditLine(borrower.address, await stablecoin.getAddress(), ethers.parseUnits("50000", 6));

    const tradeId = id("trade_vn_coffee_sg_2026_0007");
    const poSlot = id("sign_po_buyer");
    const invoiceSlot = id("seal_invoice_exporter");
    const qualitySlot = id("seal_quality_exporter");
    const blSlot = id("seal_bl_logistics");
    const warehouseSlot = id("seal_warehouse_entry");
    const acceptanceSlot = id("sign_buyer_acceptance");

    const dueAt = Math.floor(Date.now() / 1000) + 86400;

    await registry.createSlot(tradeId, poSlot, FlowType.Commercial, buyer.address, id("BUYER"), id("po-initial"), dueAt, "ipfs://po");
    await registry.createSlot(tradeId, invoiceSlot, FlowType.Commercial, exporter.address, id("EXPORTER"), id("invoice-initial"), dueAt, "ipfs://invoice");
    await registry.createSlot(tradeId, qualitySlot, FlowType.Information, exporter.address, id("EXPORTER"), id("quality-initial"), dueAt, "ipfs://quality");
    await registry.createSlot(tradeId, blSlot, FlowType.Logistics, logistics.address, id("LOGISTICS"), id("bl-initial"), dueAt, "ipfs://bl");
    await registry.createSlot(tradeId, warehouseSlot, FlowType.Logistics, warehouse.address, id("WAREHOUSE"), id("warehouse-initial"), dueAt, "ipfs://warehouse");
    await registry.createSlot(tradeId, acceptanceSlot, FlowType.Logistics, buyer.address, id("BUYER"), id("acceptance-initial"), dueAt, "ipfs://acceptance");

    await registry.connect(buyer).signSlot(poSlot, id("po-final"), "ipfs://po-final");
    await registry.connect(exporter).signSlot(invoiceSlot, id("invoice-final"), "ipfs://invoice-final");
    await registry.connect(exporter).signSlot(qualitySlot, id("quality-final"), "ipfs://quality-final");

    const ReceivableLoan = await ethers.getContractFactory("ReceivableLoan");
    const loan = await ReceivableLoan.deploy(
      await bank.getAddress(),
      await registry.getAddress(),
      tradeId,
      await stablecoin.getAddress(),
      borrower.address,
      financier.address,
      ethers.parseUnits("36960", 6),
      ethers.parseUnits("29500", 6),
      ethers.parseUnits("737.5", 6),
      dueAt + 45 * 86400,
      [poSlot, invoiceSlot, qualitySlot, blSlot, warehouseSlot, acceptanceSlot]
    );
    await loan.waitForDeployment();
    await bank.approveLoanContract(await loan.getAddress(), true);

    return {
      owner,
      riskOfficer,
      borrower,
      financier,
      buyer,
      exporter,
      logistics,
      warehouse,
      investor,
      stablecoin,
      registry,
      bank,
      loan,
      slots: { poSlot, invoiceSlot, qualitySlot, blSlot, warehouseSlot, acceptanceSlot },
    };
  }

  it("blocks loan disbursement until all signing gates pass", async function () {
    const { loan, financier } = await fixture();

    const [passed, total, allPassed] = await loan.checkGates();
    expect(passed).to.equal(3n);
    expect(total).to.equal(6n);
    expect(allPassed).to.equal(false);

    await expect(loan.connect(financier).disburse()).to.be.revertedWith("GATES_NOT_PASSED");
  });

  it("disburses through BankVault after all signing gates pass", async function () {
    const { borrower, financier, buyer, logistics, warehouse, stablecoin, registry, loan, slots } = await fixture();

    await registry.connect(logistics).signSlot(slots.blSlot, id("bl-final"), "ipfs://bl-final");
    await registry.connect(warehouse).signSlot(slots.warehouseSlot, id("warehouse-final"), "ipfs://warehouse-final");
    await registry.connect(buyer).signSlot(slots.acceptanceSlot, id("acceptance-final"), "ipfs://acceptance-final");

    const [passed, total, allPassed] = await loan.checkGates();
    expect(passed).to.equal(6n);
    expect(total).to.equal(6n);
    expect(allPassed).to.equal(true);

    await expect(loan.connect(financier).disburse()).to.emit(loan, "Disbursed");
    expect(await stablecoin.balanceOf(borrower.address)).to.equal(ethers.parseUnits("29500", 6));
  });

  it("records repayment and closes the loan", async function () {
    const { borrower, financier, buyer, logistics, warehouse, stablecoin, registry, loan, slots } = await fixture();

    await registry.connect(logistics).signSlot(slots.blSlot, id("bl-final"), "ipfs://bl-final");
    await registry.connect(warehouse).signSlot(slots.warehouseSlot, id("warehouse-final"), "ipfs://warehouse-final");
    await registry.connect(buyer).signSlot(slots.acceptanceSlot, id("acceptance-final"), "ipfs://acceptance-final");
    await loan.connect(financier).disburse();

    const repayment = ethers.parseUnits("30237.5", 6);
    await stablecoin.issue(borrower.address, repayment);
    await stablecoin.connect(borrower).approve(await loan.getAddress(), repayment);
    await expect(loan.connect(borrower).repay(repayment)).to.emit(loan, "Repaid");

    expect(await loan.status()).to.equal(4n); // Repaid
  });

  it("enforces whitelist transfer controls on restricted receivable token", async function () {
    const { owner, investor, borrower } = await fixture();
    const Token = await ethers.getContractFactory("RestrictedReceivableToken");
    const token = await Token.deploy("ChainTrace Receivable VN-SG 0007", "CTRWA-0007", owner.address, id("trade_vn_coffee_sg_2026_0007"), id("receivable-hash"));
    await token.waitForDeployment();

    await token.setWhitelist(investor.address, true);
    await token.mint(investor.address, 1000n);
    expect(await token.balanceOf(investor.address)).to.equal(1000n);

    await expect(token.connect(investor).transfer(borrower.address, 100n)).to.be.revertedWith("NOT_WHITELISTED");

    await token.setWhitelist(borrower.address, true);
    await token.connect(investor).transfer(borrower.address, 100n);
    expect(await token.balanceOf(borrower.address)).to.equal(100n);
  });
});
