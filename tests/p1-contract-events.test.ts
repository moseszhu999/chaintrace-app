import { describe, expect, it } from "vitest";

import {
  buildAuditLogFromContractEvents,
  buildCaseStateFromContractEvents,
  buildProofGraphFromContractEvents,
  evaluateP1ContractGates
} from "@/lib/contracts/contract-event-projections";
import {
  buildDocumentProofPayload,
  hashDocumentMetadata
} from "@/lib/contracts/proof-payload";
import { ChainTraceContractEvent } from "@/lib/contracts/types";

const caseId = "0x434153455f303030310000000000000000000000000000000000000000000000";
const documentHash = "0x444f435f48415348000000000000000000000000000000000000000000000000";
const metadataHash = "0x4d4554415f484153480000000000000000000000000000000000000000000000";

describe("P1 contract event projections", () => {
  it("builds proof graph and audit log from contract-style events", () => {
    const events: ChainTraceContractEvent[] = [
      {
        type: "RoleRegistered",
        blockNumber: 1n,
        transactionHash: "0xrole",
        wallet: "0xExporter",
        role: "EXPORTER"
      },
      {
        type: "CaseCreated",
        blockNumber: 2n,
        transactionHash: "0xcase",
        caseId,
        creator: "0xExporter",
        caseCommitment: "0xcommitment"
      },
      {
        type: "DocumentProofAdded",
        blockNumber: 3n,
        transactionHash: "0xdocument",
        caseId,
        documentHash,
        metadataHash,
        kind: "INVOICE"
      },
      {
        type: "GateEvaluated",
        blockNumber: 4n,
        transactionHash: "0xgate",
        caseId,
        gateHash: "0xtradegate",
        passed: true
      }
    ];

    const graph = buildProofGraphFromContractEvents(caseId, events);
    expect(graph.caseId).toBe(caseId);
    expect(graph.nodes).toEqual([
      {
        id: `${caseId}:document:${documentHash}`,
        caseId,
        proofType: "DOCUMENT_PROOF",
        documentHash,
        metadataHash,
        kind: "INVOICE",
        status: "PASSED",
        transactionHash: "0xdocument",
        blockNumber: 3n
      }
    ]);

    const audit = buildAuditLogFromContractEvents(caseId, events);
    expect(audit.map((entry) => entry.action)).toEqual([
      "CASE_CREATED",
      "DOCUMENT_PROOF_ADDED",
      "GATE_EVALUATED"
    ]);
    expect(audit[1]).toMatchObject({
      actor: "contract",
      targetType: "DOCUMENT_PROOF",
      transactionHash: "0xdocument"
    });
  });

  it("keeps P1 gate and state evaluation pre-funding with disbursement disabled", () => {
    const events: ChainTraceContractEvent[] = [
      {
        type: "CaseCreated",
        blockNumber: 2n,
        transactionHash: "0xcase",
        caseId,
        creator: "0xExporter",
        caseCommitment: "0xcommitment"
      },
      {
        type: "DocumentProofAdded",
        blockNumber: 3n,
        transactionHash: "0xdocument",
        caseId,
        documentHash,
        metadataHash,
        kind: "INVOICE"
      },
      {
        type: "CaseStateTransitioned",
        blockNumber: 5n,
        transactionHash: "0xstate",
        caseId,
        fromState: "DRAFT_INTENT",
        toState: "PROOF_COLLECTED"
      }
    ];

    const gates = evaluateP1ContractGates(caseId, events);
    expect(gates.find((gate) => gate.gateType === "FUNDING_EXECUTION_GATE")).toMatchObject({
      status: "BLOCKED",
      disbursementAllowed: false
    });

    const state = buildCaseStateFromContractEvents(caseId, events);
    expect(state.state).toBe("PROOF_COLLECTED");
    expect(state.canExecuteFunding).toBe(false);
    expect(state.disbursementAllowed).toBe(false);
  });
});

describe("P1 local proof payload privacy", () => {
  it("hashes metadata deterministically without exposing plaintext metadata on chain", async () => {
    const metadata = {
      fileName: "invoice-ct-001.pdf",
      fileType: "application/pdf",
      fileSize: 12345,
      documentKind: "INVOICE" as const
    };

    await expect(hashDocumentMetadata(metadata)).resolves.toMatch(/^0x[a-f0-9]{64}$/);
    await expect(hashDocumentMetadata(metadata)).resolves.toBe(await hashDocumentMetadata({ ...metadata }));
  });

  it("builds a chain payload that excludes raw file bytes and plaintext metadata", async () => {
    const rawBytes = new Uint8Array([37, 80, 68, 70]);
    const payload = await buildDocumentProofPayload({
      rawBytes,
      metadata: {
        fileName: "invoice-ct-001.pdf",
        fileType: "application/pdf",
        fileSize: rawBytes.byteLength,
        documentKind: "INVOICE"
      }
    });

    expect(payload).toEqual({
      documentHash: expect.stringMatching(/^0x[a-f0-9]{64}$/),
      metadataHash: expect.stringMatching(/^0x[a-f0-9]{64}$/),
      kind: "INVOICE"
    });
    expect(JSON.stringify(payload)).not.toContain("invoice-ct-001.pdf");
    expect(JSON.stringify(payload)).not.toContain("37,80,68,70");
  });
});
