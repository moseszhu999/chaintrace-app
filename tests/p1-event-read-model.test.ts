import { describe, expect, it } from "vitest";

import {
  buildCaseSummariesFromEvents,
  buildOnChainCaseReadModel,
  projectRawRegistryEvents
} from "@/lib/contracts/p1-event-read-model";
import { P1RawRegistryEvent } from "@/lib/contracts/p1-event-read-model";

const caseId = "0x434153455f303030310000000000000000000000000000000000000000000000";
const commitment = "0x434f4d4d49544d454e5400000000000000000000000000000000000000000000";
const documentHash = "0x444f435f48415348000000000000000000000000000000000000000000000000";
const metadataHash = "0x4d4554415f484153480000000000000000000000000000000000000000000000";

const rawEvents: P1RawRegistryEvent[] = [
  {
    eventName: "RoleRegistered",
    blockNumber: 1n,
    transactionHash: "0xrole",
    args: {
      wallet: "0xABCDEF0000000000000000000000000000000001",
      role: 1n
    }
  },
  {
    eventName: "CaseCreated",
    blockNumber: 2n,
    transactionHash: "0xcase",
    args: {
      caseId,
      creator: "0xABCDEF0000000000000000000000000000000001",
      caseCommitment: commitment
    }
  },
  {
    eventName: "DocumentProofAdded",
    blockNumber: 3n,
    transactionHash: "0xproof",
    args: {
      caseId,
      documentHash,
      metadataHash,
      kind: 1
    }
  },
  {
    eventName: "CaseStateTransitioned",
    blockNumber: 4n,
    transactionHash: "0xstate",
    args: {
      caseId,
      fromState: 0,
      toState: 2
    }
  }
];

describe("P1 contract event read model", () => {
  it("projects raw registry events into typed ChainTrace events", () => {
    const events = projectRawRegistryEvents(rawEvents);

    expect(events.map((event) => event.type)).toEqual([
      "RoleRegistered",
      "CaseCreated",
      "DocumentProofAdded",
      "CaseStateTransitioned"
    ]);
    expect(events[0]).toMatchObject({ type: "RoleRegistered", role: "EXPORTER" });
    expect(events[2]).toMatchObject({ type: "DocumentProofAdded", kind: "INVOICE" });
  });

  it("builds case summary and read model from contract events", () => {
    const events = projectRawRegistryEvents(rawEvents);
    const summaries = buildCaseSummariesFromEvents(events);
    const readModel = buildOnChainCaseReadModel(caseId, events);

    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({ id: caseId, caseCommitment: commitment });
    expect(readModel.summary?.id).toBe(caseId);
    expect(readModel.graph.nodes).toHaveLength(1);
    expect(readModel.auditLog.map((entry) => entry.action)).toEqual([
      "CASE_CREATED",
      "DOCUMENT_PROOF_ADDED",
      "CASE_STATE_TRANSITIONED"
    ]);
    expect(readModel.state.state).toBe("PROOF_COLLECTED");
    expect(readModel.state.disbursementAllowed).toBe(false);
  });
});
