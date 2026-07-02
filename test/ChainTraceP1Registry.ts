import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { keccak256, stringToBytes } from "viem";

const Role = {
  EXPORTER: 1,
  BUYER: 2
} as const;

const DocumentKind = {
  INVOICE: 1
} as const;

const CaseState = {
  DRAFT_INTENT: 0,
  PROOF_COLLECTED: 2
} as const;

describe("ChainTraceP1Registry", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();

  async function deployRegistry() {
    const [exporter, buyer, unregistered] = await viem.getWalletClients();
    const registry = await viem.deployContract("ChainTraceP1Registry");
    return { registry, exporter, buyer, unregistered };
  }

  async function createExporterCase() {
    const setup = await deployRegistry();
    const deploymentBlock = await publicClient.getBlockNumber();
    const caseCommitment = keccak256(stringToBytes("case commitment"));

    await setup.registry.write.registerRole([Role.EXPORTER], { account: setup.exporter.account });
    await setup.registry.write.createCase([caseCommitment], { account: setup.exporter.account });
    const events = await publicClient.getContractEvents({
      address: setup.registry.address,
      abi: setup.registry.abi,
      eventName: "CaseCreated",
      fromBlock: deploymentBlock,
      strict: true
    });

    return {
      ...setup,
      caseCommitment,
      caseId: events.at(-1)?.args.caseId
    };
  }

  it("lets a wallet register one role and rejects role changes", async function () {
    const { registry, exporter } = await deployRegistry();

    await registry.write.registerRole([Role.EXPORTER], { account: exporter.account });
    assert.equal(await registry.read.roles([exporter.account.address]), Role.EXPORTER);

    await assert.rejects(
      registry.write.registerRole([Role.BUYER], { account: exporter.account }),
      /RoleAlreadyRegistered/
    );
  });

  it("blocks unregistered and non-exporter wallets from creating cases", async function () {
    const { registry, buyer, unregistered } = await deployRegistry();
    const caseCommitment = keccak256(stringToBytes("case commitment"));

    await assert.rejects(
      registry.write.createCase([caseCommitment], { account: unregistered.account }),
      /ExporterRoleRequired/
    );

    await registry.write.registerRole([Role.BUYER], { account: buyer.account });
    await assert.rejects(
      registry.write.createCase([caseCommitment], { account: buyer.account }),
      /ExporterRoleRequired/
    );
  });

  it("lets exporter create a case and emits the audit source event", async function () {
    const { registry, exporter } = await deployRegistry();
    const deploymentBlock = await publicClient.getBlockNumber();
    const caseCommitment = keccak256(stringToBytes("case commitment"));

    await registry.write.registerRole([Role.EXPORTER], { account: exporter.account });
    await registry.write.createCase([caseCommitment], { account: exporter.account });
    const events = await publicClient.getContractEvents({
      address: registry.address,
      abi: registry.abi,
      eventName: "CaseCreated",
      fromBlock: deploymentBlock,
      strict: true
    });

    assert.equal(events.length, 1);
    assert.equal(events[0].args.creator.toLowerCase(), exporter.account.address.toLowerCase());
    assert.equal(events[0].args.caseCommitment, caseCommitment);
  });

  it("adds document proof hashes without storing raw document data", async function () {
    const { registry, exporter, caseId } = await createExporterCase();
    assert.ok(caseId);
    const documentHash = keccak256(stringToBytes("local raw file hash"));
    const metadataHash = keccak256(stringToBytes("redacted metadata hash"));

    await registry.write.addDocumentProof(
      [caseId, documentHash, metadataHash, DocumentKind.INVOICE],
      { account: exporter.account }
    );

    assert.equal(await registry.read.getDocumentProofCount([caseId]), 1n);
    const proof = await registry.read.getDocumentProof([caseId, 0n]);
    assert.equal(proof.documentHash, documentHash);
    assert.equal(proof.metadataHash, metadataHash);
    assert.equal(proof.kind, DocumentKind.INVOICE);
  });

  it("records non-funding gates but refuses fully passed funding execution", async function () {
    const { registry, exporter, caseId } = await createExporterCase();
    assert.ok(caseId);
    const tradeGate = keccak256(stringToBytes("TRADE_EVIDENCE_GATE"));
    const fundingGate = await registry.read.fundingExecutionGateHash();

    await registry.write.recordGateEvaluation([caseId, tradeGate, true], { account: exporter.account });
    assert.equal(await registry.read.gateEvaluations([caseId, tradeGate]), true);

    await assert.rejects(
      registry.write.recordGateEvaluation([caseId, fundingGate, true], { account: exporter.account }),
      /FundingExecutionForbidden/
    );

    await registry.write.recordGateEvaluation([caseId, fundingGate, false], { account: exporter.account });
    assert.equal(await registry.read.gateEvaluations([caseId, fundingGate]), false);
  });

  it("keeps case state inside P1 pre-funding states and disbursement disabled", async function () {
    const { registry, exporter, caseId } = await createExporterCase();
    assert.ok(caseId);

    await registry.write.transitionCaseState([caseId, CaseState.PROOF_COLLECTED], { account: exporter.account });
    const tradeCase = await registry.read.cases([caseId]);

    assert.equal(tradeCase[2], CaseState.PROOF_COLLECTED);
    assert.equal(await registry.read.disbursementAllowed([caseId]), false);
    assert.equal(CaseState.DRAFT_INTENT, 0);
  });
});
