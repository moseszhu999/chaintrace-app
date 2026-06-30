import { createHash } from "crypto";
import { evaluateLoanGates } from "@/lib/gate-evaluator";
import { evaluateReadiness } from "@/lib/readiness-evaluator";
import { receivableReadinessReport } from "@/lib/receivable-readiness-fixture";
import {
  getCurrentTradeCase,
  listEvidenceRecords,
  type EvidenceRecord,
  type TradeCaseRecord,
} from "@/lib/repositories/chaintrace-repository";

export type FinancingPackEvidence = {
  id: string;
  documentType: EvidenceRecord["documentType"];
  fileName: string;
  documentNo: string;
  status: EvidenceRecord["status"];
  hash: string | null;
  gateImpacts: EvidenceRecord["gateImpacts"];
};

export type GeneratedFinancingPack = {
  version: "chaintrace-financing-pack-v0.2";
  packId: string;
  tradeId: string;
  evidencePackURI: string;
  evidencePackHash: `0x${string}`;
  evidencePackHashAlgorithm: "sha256";
  storageBoundary: string;
  case: {
    titleZh: string;
    titleEn: string;
    poNo: string;
    invoiceNo: string;
    totalAmount: string;
    receivableAmount: string;
    requestedAdvance: string;
  };
  evidence: {
    total: number;
    verifiedCount: number;
    openCount: number;
    records: FinancingPackEvidence[];
  };
  gates: ReturnType<typeof evaluateLoanGates>;
  readiness: ReturnType<typeof evaluateReadiness>;
  report: typeof receivableReadinessReport;
  financingPack: typeof receivableReadinessReport.financingPack;
  financierMemo: typeof receivableReadinessReport.financierMemo;
  nextActionsZh: string[];
  nextActionsEn: string[];
  contractAnchor: {
    target: "LoanRequestRegistry.submitPreReviewRequest";
    evidencePackURI: string;
    evidencePackHash: `0x${string}`;
    blockerCode: "GATES_NOT_PASSED";
    preReviewAllowed: true;
    disbursementAllowed: false;
  };
};

function buildEvidencePackURI(trade: TradeCaseRecord) {
  return `ipfs://chaintrace/${trade.id}/financing-pack-v0.2.json`;
}

function mapEvidenceRecord(record: EvidenceRecord): FinancingPackEvidence {
  return {
    id: record.id,
    documentType: record.documentType,
    fileName: record.fileName,
    documentNo: record.documentNo,
    status: record.status,
    hash: record.hash ?? null,
    gateImpacts: record.gateImpacts,
  };
}

function hashPackPayload(payload: object): `0x${string}` {
  return `0x${createHash("sha256").update(JSON.stringify(payload)).digest("hex")}`;
}

export async function buildFinancingPack(): Promise<GeneratedFinancingPack> {
  const trade = await getCurrentTradeCase();
  const evidenceRecords = await listEvidenceRecords(trade.id);
  const gates = evaluateLoanGates(evidenceRecords);
  const readiness = evaluateReadiness(trade, gates.summary);
  const evidence = evidenceRecords.map(mapEvidenceRecord);
  const verifiedCount = evidenceRecords.filter((record) => record.status === "verified").length;
  const evidencePackURI = buildEvidencePackURI(trade);

  const packPayload = {
    version: "chaintrace-financing-pack-v0.2",
    tradeId: trade.id,
    case: {
      poNo: trade.poNo,
      invoiceNo: trade.invoiceNo,
      totalAmount: trade.totalAmount,
      receivableAmount: trade.receivableAmount,
      requestedAdvance: trade.requestedAdvance,
    },
    evidence,
    gates: {
      summary: gates.summary,
      checklist: gates.checklist.map((gate) => ({
        id: gate.id,
        status: gate.status,
        evidenceId: gate.evidenceId,
        sourceEvidenceIds: gate.sourceEvidenceIds,
      })),
    },
    readiness,
    blockerCode: readiness.blockerCode,
    disbursementAllowed: readiness.disbursementAllowed,
  };
  const evidencePackHash = hashPackPayload(packPayload);

  return {
    version: "chaintrace-financing-pack-v0.2",
    packId: `financing_pack_${trade.id}_v0_2`,
    tradeId: trade.id,
    evidencePackURI,
    evidencePackHash,
    evidencePackHashAlgorithm: "sha256",
    storageBoundary: "hash-and-metadata anchor only; raw commercial documents stay off-chain",
    case: {
      titleZh: trade.titleZh,
      titleEn: trade.titleEn,
      poNo: trade.poNo,
      invoiceNo: trade.invoiceNo,
      totalAmount: trade.totalAmount,
      receivableAmount: trade.receivableAmount,
      requestedAdvance: trade.requestedAdvance,
    },
    evidence: {
      total: evidenceRecords.length,
      verifiedCount,
      openCount: evidenceRecords.length - verifiedCount,
      records: evidence,
    },
    gates,
    readiness,
    report: receivableReadinessReport,
    financingPack: receivableReadinessReport.financingPack,
    financierMemo: receivableReadinessReport.financierMemo,
    nextActionsZh: receivableReadinessReport.nextActionsZh,
    nextActionsEn: receivableReadinessReport.nextActionsEn,
    contractAnchor: {
      target: "LoanRequestRegistry.submitPreReviewRequest",
      evidencePackURI,
      evidencePackHash,
      blockerCode: readiness.blockerCode,
      preReviewAllowed: readiness.preReviewAllowed,
      disbursementAllowed: readiness.disbursementAllowed,
    },
  };
}
