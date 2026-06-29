import type { EvaluatedLoanGateSummary } from "@/lib/gate-evaluator";
import { receivableReadinessReport } from "@/lib/receivable-readiness-fixture";
import type { TradeCaseRecord } from "@/lib/repositories/chaintrace-repository";

export type EvaluatedReadiness = {
  readinessScore: number;
  maxScore: number;
  statusZh: string;
  statusEn: string;
  preReviewAllowed: true;
  disbursementAllowed: false;
  blockerCode: "GATES_NOT_PASSED";
};

export function evaluateReadiness(tradeCase: TradeCaseRecord, gateSummary: EvaluatedLoanGateSummary): EvaluatedReadiness {
  return {
    readinessScore: tradeCase.readinessScore,
    maxScore: tradeCase.readinessMaxScore,
    statusZh: receivableReadinessReport.statusZh,
    statusEn: receivableReadinessReport.statusEn,
    preReviewAllowed: gateSummary.preReviewAllowed,
    disbursementAllowed: gateSummary.disbursementAllowed,
    blockerCode: gateSummary.blockerCode,
  };
}
