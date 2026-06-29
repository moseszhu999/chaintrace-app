import { getLoanGateChecklist, type LoanGateChecklistItem, type LoanGateStatus } from "@/lib/loan-gate-fixture";
import type { EvidenceRecord, GateImpact } from "@/lib/repositories/chaintrace-repository";

export type EvaluatedLoanGate = LoanGateChecklistItem & {
  sourceEvidenceIds: string[];
};

export type EvaluatedLoanGateSummary = {
  passed: number;
  pending: number;
  blocked: number;
  total: number;
  preReviewAllowed: true;
  disbursementAllowed: false;
  blockerCode: "GATES_NOT_PASSED";
};

export type EvaluatedLoanGateResult = {
  checklist: EvaluatedLoanGate[];
  summary: EvaluatedLoanGateSummary;
};

function hasVerifiedSupport(evidenceRecords: EvidenceRecord[], gateId: string) {
  return evidenceRecords.some((record) =>
    record.status === "verified" &&
    record.gateImpacts.some((impact) => impact.gateId === gateId && impact.status === "supports_passed_gate"),
  );
}

function hasCandidateEvidence(evidenceRecords: EvidenceRecord[], gateId: string) {
  return evidenceRecords.some((record) =>
    record.gateImpacts.some((impact) => impact.gateId === gateId && impact.status === "candidate_pending_gate"),
  );
}

function sourceEvidenceIds(evidenceRecords: EvidenceRecord[], gateId: string) {
  return evidenceRecords
    .filter((record) => record.gateImpacts.some((impact: GateImpact) => impact.gateId === gateId))
    .map((record) => record.id);
}

function evaluateGateStatus(baseGate: LoanGateChecklistItem, evidenceRecords: EvidenceRecord[]): LoanGateStatus {
  if (hasVerifiedSupport(evidenceRecords, baseGate.id)) return "passed";
  if (hasCandidateEvidence(evidenceRecords, baseGate.id)) return "pending";
  return baseGate.status === "passed" ? "blocked" : baseGate.status;
}

export function evaluateLoanGates(evidenceRecords: EvidenceRecord[]): EvaluatedLoanGateResult {
  const checklist = getLoanGateChecklist().map((gate) => ({
    ...gate,
    status: evaluateGateStatus(gate, evidenceRecords),
    sourceEvidenceIds: sourceEvidenceIds(evidenceRecords, gate.id),
  }));

  return {
    checklist,
    summary: {
      passed: checklist.filter((gate) => gate.status === "passed").length,
      pending: checklist.filter((gate) => gate.status === "pending").length,
      blocked: checklist.filter((gate) => gate.status === "blocked").length,
      total: checklist.length,
      preReviewAllowed: true,
      disbursementAllowed: false,
      blockerCode: "GATES_NOT_PASSED",
    },
  };
}
