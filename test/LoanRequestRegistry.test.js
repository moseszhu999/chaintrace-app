const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoanRequestRegistry", function () {
  async function deployRegistry() {
    const [owner, requester, borrower, beneficiary, asset, loanContract] = await ethers.getSigners();
    const registry = await ethers.deployContract("LoanRequestRegistry");
    return { owner, requester, borrower, beneficiary, asset, loanContract, registry };
  }

  it("records an SME pre-review financing request", async function () {
    const { requester, borrower, beneficiary, asset, registry } = await deployRegistry();
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
    expect(request.status).to.equal(2n); // PreReview
    expect(request.evidencePackHash).to.equal(evidencePackHash);
    expect(request.blockerCode).to.equal("GATES_NOT_PASSED");
  });

  it("allows owner review and conversion after approval", async function () {
    const { requester, borrower, beneficiary, asset, loanContract, registry } = await deployRegistry();
    const tradeId = ethers.encodeBytes32String("VN-SG-0007");
    const evidencePackHash = ethers.keccak256(ethers.toUtf8Bytes("financing-pack-v0.1"));

    await registry.connect(requester).submitPreReviewRequest(
      tradeId,
      borrower.address,
      beneficiary.address,
      asset.address,
      52_800n,
      29_500n,
      88,
      100,
      "ipfs://chaintrace/vn-coffee/financing-pack-v2.json",
      evidencePackHash,
      "",
    );
    const [requestId] = await registry.getRequesterRequestIds(requester.address);

    await expect(registry.connect(requester).setReviewStatus(requestId, 4, ""))
      .to.be.revertedWith("NOT_OWNER");

    await expect(registry.setReviewStatus(requestId, 4, ""))
      .to.emit(registry, "LoanRequestStatusChanged");

    await expect(registry.convertToLoan(requestId, loanContract.address))
      .to.emit(registry, "LoanRequestConverted")
      .withArgs(requestId, loanContract.address);

    const request = await registry.getRequest(requestId);
    expect(request.status).to.equal(7n); // ConvertedToLoan
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
