const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoanRequestRegistry", function () {
  const Status = {
    PreReview: 2n,
    ReviewBlocked: 3n,
    Approved: 4n,
    Rejected: 5n,
    Cancelled: 6n,
    ConvertedToLoan: 7n,
  };

  async function deployRegistry() {
    const [owner, requester, borrower, beneficiary, asset, loanContract] = await ethers.getSigners();
    const registry = await ethers.deployContract("LoanRequestRegistry");
    return { owner, requester, borrower, beneficiary, asset, loanContract, registry };
  }

  async function submitVietnamCoffeeRequest(context, overrides = {}) {
    const tradeId = overrides.tradeId ?? ethers.encodeBytes32String("VN-SG-0007");
    const evidencePackHash = overrides.evidencePackHash ?? ethers.keccak256(ethers.toUtf8Bytes("financing-pack-v0.1"));

    await context.registry.connect(context.requester).submitPreReviewRequest(
      tradeId,
      context.borrower.address,
      context.beneficiary.address,
      context.asset.address,
      overrides.receivableAmount ?? 52_800n,
      overrides.requestedAdvance ?? 29_500n,
      overrides.readinessScore ?? 62,
      overrides.maxScore ?? 100,
      overrides.evidencePackURI ?? "ipfs://chaintrace/vn-coffee/financing-pack.json",
      evidencePackHash,
      overrides.blockerCode ?? "GATES_NOT_PASSED",
    );

    const [requestId] = await context.registry.getRequesterRequestIds(context.requester.address);
    return { requestId, tradeId, evidencePackHash };
  }

  it("records an SME pre-review financing request", async function () {
    const context = await deployRegistry();
    const { requester, borrower, beneficiary, asset, registry } = context;
    const tradeId = ethers.encodeBytes32String("VN-SG-0007");
    const evidencePackHash = ethers.keccak256(ethers.toUtf8Bytes("financing-pack-v0.1"));

    await expect(
      registry.connect(requester).submitPreReviewRequest(
        tradeId,
        borrower.address,
        beneficiary.address,
        asset.address,
        52_800n,
        29_500n,
        62,
        100,
        "ipfs://chaintrace/vn-coffee/financing-pack.json",
        evidencePackHash,
        "GATES_NOT_PASSED",
      ),
    ).to.emit(registry, "LoanRequestSubmitted");

    const requestIds = await registry.getRequesterRequestIds(requester.address);
    expect(requestIds.length).to.equal(1);

    const request = await registry.getRequest(requestIds[0]);
    expect(request.tradeId).to.equal(tradeId);
    expect(request.requester).to.equal(requester.address);
    expect(request.borrower).to.equal(borrower.address);
    expect(request.beneficiary).to.equal(beneficiary.address);
    expect(request.asset).to.equal(asset.address);
    expect(request.receivableAmount).to.equal(52_800n);
    expect(request.requestedAdvance).to.equal(29_500n);
    expect(request.readinessScore).to.equal(62n);
    expect(request.maxScore).to.equal(100n);
    expect(request.status).to.equal(Status.PreReview);
    expect(request.evidencePackHash).to.equal(evidencePackHash);
    expect(request.blockerCode).to.equal("GATES_NOT_PASSED");
  });

  it("allows owner review and conversion after approval", async function () {
    const context = await deployRegistry();
    const { requester, loanContract, registry } = context;
    const { requestId } = await submitVietnamCoffeeRequest(context, {
      readinessScore: 88,
      evidencePackURI: "ipfs://chaintrace/vn-coffee/financing-pack-v2.json",
      blockerCode: "",
    });

    await expect(registry.connect(requester).setReviewStatus(requestId, Status.Approved, ""))
      .to.be.revertedWith("NOT_OWNER");

    await expect(registry.setReviewStatus(requestId, Status.Approved, ""))
      .to.emit(registry, "LoanRequestStatusChanged");

    await expect(registry.convertToLoan(requestId, loanContract.address))
      .to.emit(registry, "LoanRequestConverted")
      .withArgs(requestId, loanContract.address);

    const request = await registry.getRequest(requestId);
    expect(request.status).to.equal(Status.ConvertedToLoan);
  });

  it("updates the evidence pack while the request is in pre-review", async function () {
    const context = await deployRegistry();
    const { registry, requester } = context;
    const { requestId } = await submitVietnamCoffeeRequest(context);
    const nextHash = ethers.keccak256(ethers.toUtf8Bytes("financing-pack-v0.2"));

    await expect(
      registry.connect(requester).updateEvidencePack(
        requestId,
        "ipfs://chaintrace/vn-coffee/financing-pack-v0.2.json",
        nextHash,
      ),
    )
      .to.emit(registry, "LoanRequestEvidencePackUpdated")
      .withArgs(requestId, "ipfs://chaintrace/vn-coffee/financing-pack-v0.2.json", nextHash);

    const request = await registry.getRequest(requestId);
    expect(request.evidencePackURI).to.equal("ipfs://chaintrace/vn-coffee/financing-pack-v0.2.json");
    expect(request.evidencePackHash).to.equal(nextHash);
    expect(request.status).to.equal(Status.PreReview);
  });

  it("cancels a pre-review request without approving financing", async function () {
    const context = await deployRegistry();
    const { registry, requester } = context;
    const { requestId } = await submitVietnamCoffeeRequest(context);

    await expect(registry.connect(requester).cancel(requestId, "EXPORTER_WITHDREW_REQUEST"))
      .to.emit(registry, "LoanRequestStatusChanged")
      .withArgs(requestId, Status.PreReview, Status.Cancelled, "EXPORTER_WITHDREW_REQUEST");

    const request = await registry.getRequest(requestId);
    expect(request.status).to.equal(Status.Cancelled);
    expect(request.blockerCode).to.equal("EXPORTER_WITHDREW_REQUEST");
  });

  it("blocks non-owner review approval and rejection", async function () {
    const context = await deployRegistry();
    const { registry, requester } = context;
    const { requestId } = await submitVietnamCoffeeRequest(context);

    await expect(registry.connect(requester).setReviewStatus(requestId, Status.Approved, ""))
      .to.be.revertedWith("NOT_OWNER");

    await expect(registry.connect(requester).setReviewStatus(requestId, Status.Rejected, "UNDERWRITING_REJECTED"))
      .to.be.revertedWith("NOT_OWNER");
  });

  it("does not convert a request to a loan unless review status is approved", async function () {
    const context = await deployRegistry();
    const { registry, loanContract } = context;
    const { requestId } = await submitVietnamCoffeeRequest(context);

    await expect(registry.convertToLoan(requestId, loanContract.address))
      .to.be.revertedWith("NOT_APPROVED");

    await registry.setReviewStatus(requestId, Status.ReviewBlocked, "GATES_NOT_PASSED");
    await expect(registry.convertToLoan(requestId, loanContract.address))
      .to.be.revertedWith("NOT_APPROVED");
  });

  it("reverts registry actions for unknown requests", async function () {
    const context = await deployRegistry();
    const { registry, loanContract } = context;
    const unknownRequestId = ethers.keccak256(ethers.toUtf8Bytes("missing-request"));

    await expect(registry.getRequest(unknownRequestId)).to.be.revertedWith("UNKNOWN_REQUEST");
    await expect(registry.updateEvidencePack(unknownRequestId, "ipfs://chaintrace/missing.json", ethers.ZeroHash))
      .to.be.revertedWith("UNKNOWN_REQUEST");
    await expect(registry.setReviewStatus(unknownRequestId, Status.ReviewBlocked, "GATES_NOT_PASSED"))
      .to.be.revertedWith("UNKNOWN_REQUEST");
    await expect(registry.convertToLoan(unknownRequestId, loanContract.address))
      .to.be.revertedWith("UNKNOWN_REQUEST");
    await expect(registry.cancel(unknownRequestId, "MISSING"))
      .to.be.revertedWith("UNKNOWN_REQUEST");
  });

  it("blocks bad request terms", async function () {
    const { requester, borrower, beneficiary, asset, registry } = await deployRegistry();
    const tradeId = ethers.encodeBytes32String("VN-SG-0007");
    const evidencePackHash = ethers.keccak256(ethers.toUtf8Bytes("financing-pack-v0.1"));

    await expect(
      registry.connect(requester).submitPreReviewRequest(
        tradeId,
        borrower.address,
        beneficiary.address,
        asset.address,
        29_000n,
        29_500n,
        62,
        100,
        "ipfs://chaintrace/vn-coffee/financing-pack.json",
        evidencePackHash,
        "GATES_NOT_PASSED",
      ),
    ).to.be.revertedWith("ADVANCE_TOO_HIGH");

    await expect(
      registry.connect(requester).submitPreReviewRequest(
        tradeId,
        borrower.address,
        beneficiary.address,
        asset.address,
        52_800n,
        29_500n,
        101,
        100,
        "ipfs://chaintrace/vn-coffee/financing-pack.json",
        evidencePackHash,
        "GATES_NOT_PASSED",
      ),
    ).to.be.revertedWith("BAD_SCORE");
  });
});
