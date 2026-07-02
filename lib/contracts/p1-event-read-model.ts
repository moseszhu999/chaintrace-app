import {
  buildAuditLogFromContractEvents,
  buildCaseStateFromContractEvents,
  buildProofGraphFromContractEvents,
  evaluateP1ContractGates
} from "@/lib/contracts/contract-event-projections";
import {
  contractValueToCaseState,
  contractValueToDocumentKind,
  contractValueToRole
} from "@/lib/contracts/p1-contract-values";
import {
  ChainTraceContractEvent,
  ContractAuditLogEntry,
  ContractDerivedCaseState,
  ContractGate,
  ContractProofGraph,
  Hex32
} from "@/lib/contracts/types";

export type P1RegistryEventName =
  | "RoleRegistered"
  | "CaseCreated"
  | "DocumentProofAdded"
  | "GateEvaluated"
  | "CaseStateTransitioned";

export interface P1RawRegistryEvent {
  eventName: P1RegistryEventName;
  blockNumber: bigint;
  transactionHash: string;
  args: Record<string, unknown>;
}

export interface P1OnChainCaseSummary {
  id: Hex32;
  creator: string;
  caseCommitment: string;
  blockNumber: bigint;
  transactionHash: string;
}

export interface P1OnChainCaseReadModel {
  caseId: Hex32;
  summary: P1OnChainCaseSummary | null;
  graph: ContractProofGraph;
  gates: ContractGate[];
  state: ContractDerivedCaseState;
  auditLog: ContractAuditLogEntry[];
}

export function projectRawRegistryEvents(rawEvents: P1RawRegistryEvent[]): ChainTraceContractEvent[] {
  return rawEvents
    .map(projectRawRegistryEvent)
    .filter((event): event is ChainTraceContractEvent => event !== null)
    .sort((left, right) => {
      if (left.blockNumber === right.blockNumber) {
        return left.transactionHash.localeCompare(right.transactionHash);
      }
      return left.blockNumber < right.blockNumber ? -1 : 1;
    });
}

export function projectRawRegistryEvent(raw: P1RawRegistryEvent): ChainTraceContractEvent | null {
  if (raw.eventName === "RoleRegistered") {
    const role = contractValueToRole(asNumber(raw.args.role));
    const wallet = asString(raw.args.wallet);
    return role && wallet
      ? {
          type: "RoleRegistered",
          blockNumber: raw.blockNumber,
          transactionHash: raw.transactionHash,
          wallet: wallet.toLowerCase(),
          role
        }
      : null;
  }

  if (raw.eventName === "CaseCreated") {
    const caseId = asHex32(raw.args.caseId);
    const creator = asString(raw.args.creator);
    const caseCommitment = asString(raw.args.caseCommitment);
    return caseId && creator && caseCommitment
      ? {
          type: "CaseCreated",
          blockNumber: raw.blockNumber,
          transactionHash: raw.transactionHash,
          caseId,
          creator: creator.toLowerCase(),
          caseCommitment
        }
      : null;
  }

  if (raw.eventName === "DocumentProofAdded") {
    const caseId = asHex32(raw.args.caseId);
    const documentHash = asHex32(raw.args.documentHash);
    const metadataHash = asHex32(raw.args.metadataHash);
    return caseId && documentHash && metadataHash
      ? {
          type: "DocumentProofAdded",
          blockNumber: raw.blockNumber,
          transactionHash: raw.transactionHash,
          caseId,
          documentHash,
          metadataHash,
          kind: contractValueToDocumentKind(asNumber(raw.args.kind))
        }
      : null;
  }

  if (raw.eventName === "GateEvaluated") {
    const caseId = asHex32(raw.args.caseId);
    const gateHash = asString(raw.args.gateHash);
    return caseId && gateHash
      ? {
          type: "GateEvaluated",
          blockNumber: raw.blockNumber,
          transactionHash: raw.transactionHash,
          caseId,
          gateHash,
          passed: Boolean(raw.args.passed)
        }
      : null;
  }

  if (raw.eventName === "CaseStateTransitioned") {
    const caseId = asHex32(raw.args.caseId);
    return caseId
      ? {
          type: "CaseStateTransitioned",
          blockNumber: raw.blockNumber,
          transactionHash: raw.transactionHash,
          caseId,
          fromState: contractValueToCaseState(asNumber(raw.args.fromState)),
          toState: contractValueToCaseState(asNumber(raw.args.toState))
        }
      : null;
  }

  return null;
}

export function buildCaseSummariesFromEvents(events: ChainTraceContractEvent[]): P1OnChainCaseSummary[] {
  return events
    .filter((event): event is Extract<ChainTraceContractEvent, { type: "CaseCreated" }> => event.type === "CaseCreated")
    .map((event) => ({
      id: event.caseId,
      creator: event.creator,
      caseCommitment: event.caseCommitment,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash
    }));
}

export function buildOnChainCaseReadModel(
  caseId: Hex32,
  events: ChainTraceContractEvent[]
): P1OnChainCaseReadModel {
  const summary = buildCaseSummariesFromEvents(events).find((item) => item.id === caseId) ?? null;
  const caseEvents = events.filter((event) => !("caseId" in event) || event.caseId === caseId);

  return {
    caseId,
    summary,
    graph: buildProofGraphFromContractEvents(caseId, caseEvents),
    gates: evaluateP1ContractGates(caseId, caseEvents),
    state: buildCaseStateFromContractEvents(caseId, caseEvents),
    auditLog: buildAuditLogFromContractEvents(caseId, caseEvents)
  };
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asHex32(value: unknown): Hex32 | null {
  return typeof value === "string" && /^0x[a-fA-F0-9]{64}$/.test(value) ? (value as Hex32) : null;
}

function asNumber(value: unknown): number {
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number(value);
  }
  return 0;
}
