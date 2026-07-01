"use client";

import { useState } from "react";
import type { EvidenceRecord, EvidenceReviewAction, EvidenceReviewReceipt } from "@/lib/repositories/chaintrace-repository";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

type ReviewResponse = {
  accepted: boolean;
  reviewReceipt?: EvidenceReviewReceipt;
  evidenceRecord?: EvidenceRecord;
  gateSummary?: {
    passed: number;
    pending: number;
    blocked: number;
    total: number;
    blockerCode: "GATES_NOT_PASSED";
    disbursementAllowed: false;
  };
  readiness?: {
    readinessScore: number;
    maxScore: number;
    blockerCode: "GATES_NOT_PASSED";
    disbursementAllowed: false;
  };
  evidencePackHash?: string;
  error?: string;
};

type ReviewTimelineItem = {
  record: EvidenceRecord;
  receipt: EvidenceReviewReceipt;
};

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function documentTypeLabel(record: EvidenceRecord, zh: boolean) {
  const fallback = record.documentType.replace(/_/g, " ");
  return zh ? fallback : fallback;
}

function statusLabel(status: EvidenceRecord["status"], zh: boolean) {
  const map: Record<EvidenceRecord["status"], { zh: string; en: string }> = {
    verified: { zh: "已验证", en: "Verified" },
    uploaded_pending_verification: { zh: "待核验", en: "Pending verification" },
    missing: { zh: "缺失", en: "Missing" },
    needs_agent_review: { zh: "待 Agent / 人工审查", en: "Needs Agent / human review" },
    rejected: { zh: "已拒绝", en: "Rejected" },
  };
  return zh ? map[status].zh : map[status].en;
}

function statusClass(status: EvidenceRecord["status"]) {
  const map: Record<EvidenceRecord["status"], string> = {
    verified: styles.statusVerified,
    uploaded_pending_verification: styles.statusOpen,
    missing: styles.statusMissing,
    needs_agent_review: styles.statusMedium,
    rejected: styles.statusRejected,
  };
  return `${styles.statusChip} ${map[status]}`;
}

function canReview(record: EvidenceRecord) {
  return record.status === "uploaded_pending_verification" || record.status === "needs_agent_review" || record.status === "rejected";
}

function actionLabel(action: EvidenceReviewAction, zh: boolean) {
  const labels: Record<EvidenceReviewAction, { zh: string; en: string }> = {
    verify: { zh: "确认证据", en: "Verify evidence" },
    reject: { zh: "拒绝证据", en: "Reject evidence" },
    request_more_evidence: { zh: "要求补证", en: "Request more evidence" },
  };
  return zh ? labels[action].zh : labels[action].en;
}

function actionReceiptLabel(action: EvidenceReviewAction, zh: boolean) {
  const labels: Record<EvidenceReviewAction, { zh: string; en: string }> = {
    verify: { zh: "verified by human review", en: "verified by human review" },
    reject: { zh: "rejected by human review", en: "rejected by human review" },
    request_more_evidence: { zh: "more evidence requested", en: "more evidence requested" },
  };
  return zh ? labels[action].zh : labels[action].en;
}

function gateImpactSummary(record: EvidenceRecord, zh: boolean) {
  if (record.gateImpacts.length === 0) return t(zh, "未映射 gate impact", "No mapped gate impact");
  return record.gateImpacts
    .map((impact) => `${impact.gateId}: ${impact.status}`)
    .join(" · ");
}

function buildReviewTimeline(records: EvidenceRecord[]): ReviewTimelineItem[] {
  return records
    .flatMap((record) => (record.reviewReceipts ?? []).map((receipt) => ({ record, receipt })))
    .sort((a, b) => b.receipt.reviewedAt.localeCompare(a.receipt.reviewedAt));
}

export function EvidenceView({
  zh,
  workspace,
  initialEvidenceRecords,
}: {
  zh: boolean;
  workspace: WorkspaceSnapshot;
  initialEvidenceRecords: EvidenceRecord[];
}) {
  const { activeTrade } = workspace;
  const [evidenceRecords, setEvidenceRecords] = useState(initialEvidenceRecords);
  const [reviewReceipt, setReviewReceipt] = useState<EvidenceReviewReceipt | null>(null);
  const [gateSummary, setGateSummary] = useState<ReviewResponse["gateSummary"] | null>(null);
  const [readiness, setReadiness] = useState<ReviewResponse["readiness"] | null>(null);
  const [evidencePackHash, setEvidencePackHash] = useState("");
  const [isReviewing, setIsReviewing] = useState("");
  const [error, setError] = useState("");

  const missingDocs = evidenceRecords.filter((doc) => doc.status === "missing" || doc.status === "rejected" || doc.status === "needs_agent_review");
  const verifiedDocs = evidenceRecords.filter((doc) => doc.status === "verified");
  const reviewTimeline = buildReviewTimeline(evidenceRecords);

  function partyName(id: string) {
    return activeTrade.parties.find((party) => party.id === id)?.name ?? id;
  }

  async function reviewEvidence(evidenceId: string, action: EvidenceReviewAction) {
    setError("");
    setIsReviewing(`${evidenceId}:${action}`);
    try {
      const response = await fetch(`/api/evidence/${encodeURIComponent(evidenceId)}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reviewerRole: "operator",
          reviewerName: "ChainTrace Operator",
          reason: `Operator page action: ${action}`,
        }),
      });
      const json = (await response.json()) as ReviewResponse;
      if (!response.ok || !json.accepted || !json.evidenceRecord) {
        throw new Error(json.error ?? "Evidence review was rejected.");
      }
      setEvidenceRecords((records) => records.map((record) => (record.id === json.evidenceRecord?.id ? json.evidenceRecord : record)));
      setReviewReceipt(json.reviewReceipt ?? null);
      setGateSummary(json.gateSummary ?? null);
      setReadiness(json.readiness ?? null);
      setEvidencePackHash(json.evidencePackHash ?? "");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not review evidence.");
    } finally {
      setIsReviewing("");
    }
  }

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "交易文件", "Trade documents")}</span>
          <h2>{t(zh, activeTrade.titleZh, activeTrade.titleEn)}</h2>
          <p>{activeTrade.poNo} · {activeTrade.invoiceNo} · {activeTrade.containerNo} · {verifiedDocs.length}/{evidenceRecords.length} {t(zh, "项已验证", "verified")}</p>
          <p>Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false</p>
        </div>
        {error && <div className="error">{error}</div>}
        {(reviewReceipt || gateSummary || evidencePackHash) && (
          <div className="typed-data-status ai-boundary-status" style={{ marginBottom: 16 }}>
            <strong>{reviewReceipt ? `reviewReceipt=${reviewReceipt.id}` : "reviewReceipt=none"}</strong>
            {gateSummary && <span>gates={gateSummary.passed}/{gateSummary.total} · {gateSummary.blockerCode}</span>}
            {readiness && <span>readiness={readiness.readinessScore}/{readiness.maxScore} · disbursementAllowed=false</span>}
            {evidencePackHash && <span>evidencePackHash={evidencePackHash.slice(0, 18)}...</span>}
          </div>
        )}
        <div className={styles.list}>
          {evidenceRecords.map((doc) => (
            <article className={styles.listRow} key={doc.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{documentTypeLabel(doc, zh)} · {doc.documentNo}</h3>
                  <p className={styles.rowMeta}>{doc.fileName} · {t(zh, "签发方：", "Issuer: ")}{partyName(doc.issuerPartyId ?? "unknown")} · {doc.issuedAt ?? t(zh, "未标注日期", "undated")}</p>
                  <p className={styles.rowMeta}>{doc.amount ? `${doc.amount} · ` : ""}{t(zh, doc.noteZh ?? "等待审查。", doc.noteEn ?? "Waiting for review.")}</p>
                  {doc.hash && <p className={styles.rowMeta}>Hash: {doc.hash}</p>}
                  {(doc.reviewReceipts?.length ?? 0) > 0 && <p className={styles.rowMeta}>latestReview={doc.reviewReceipts[0].action} · reviewerRole={doc.reviewReceipts[0].reviewerRole}</p>}
                </div>
                <span className={statusClass(doc.status)}>{statusLabel(doc.status, zh)}</span>
              </div>
              {canReview(doc) && (
                <div className={styles.rowActions}>
                  {(["verify", "reject", "request_more_evidence"] as EvidenceReviewAction[]).map((action) => (
                    <button
                      type="button"
                      className={action === "verify" ? "primary-button" : "secondary-button"}
                      key={action}
                      onClick={() => reviewEvidence(doc.id, action)}
                      disabled={Boolean(isReviewing)}
                    >
                      {isReviewing === `${doc.id}:${action}` ? "Saving..." : actionLabel(action, zh)}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "审计时间线", "Review audit timeline")}</span>
          <h2>{t(zh, "每一次人工确认都会留下可追踪 receipt。", "Every human review action leaves a traceable receipt.")}</h2>
          <p>{t(zh, "时间线来自 durable evidence records 的 reviewReceipts；刷新后仍可看到。", "The timeline is built from reviewReceipts on durable evidence records and remains visible after refresh.")}</p>
          <p>Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false</p>
        </div>
        {(gateSummary || readiness || evidencePackHash) && (
          <div className="typed-data-status ai-boundary-status" style={{ marginBottom: 16 }}>
            {gateSummary && <span>currentGates={gateSummary.passed}/{gateSummary.total} · {gateSummary.blockerCode}</span>}
            {readiness && <span>currentReadiness={readiness.readinessScore}/{readiness.maxScore} · disbursementAllowed=false</span>}
            {evidencePackHash && <span>currentEvidencePackHash={evidencePackHash}</span>}
          </div>
        )}
        <div className={styles.list}>
          {reviewTimeline.map(({ record, receipt }) => (
            <article className={styles.listRow} key={receipt.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{actionReceiptLabel(receipt.action, zh)} · {documentTypeLabel(record, zh)}</h3>
                  <p className={styles.rowMeta}>reviewReceipt={receipt.id}</p>
                  <p className={styles.rowMeta}>evidenceId={receipt.evidenceId} · documentNo={record.documentNo}</p>
                  <p className={styles.rowMeta}>{receipt.beforeStatus} → {receipt.afterStatus} · reviewerRole={receipt.reviewerRole} · reviewer={receipt.reviewerName ?? "unknown"}</p>
                  <p className={styles.rowMeta}>reviewedAt={receipt.reviewedAt}</p>
                  <p className={styles.rowMeta}>gateImpact={gateImpactSummary(record, zh)}</p>
                  <p className={styles.rowMeta}>reason={receipt.reason}</p>
                  <p className={styles.rowMeta}>{receipt.blockerCode} · disbursementAllowed=false · agentDecisionAuthority={receipt.agentDecisionAuthority}</p>
                </div>
                <span className={statusClass(receipt.afterStatus)}>{statusLabel(receipt.afterStatus, zh)}</span>
              </div>
            </article>
          ))}
          {reviewTimeline.length === 0 && (
            <div className={styles.emptyRow}>{t(zh, "还没有人工审查 receipt。先对一份证据执行 Verify / Reject / Request more evidence。", "No human review receipt yet. Run Verify / Reject / Request more evidence on an evidence record first.")}</div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading"><span>{t(zh, "缺口任务", "Gap tasks")}</span><h2>{t(zh, "这里测试 Agent 能不能基于具体文件缺口生成动作。", "This tests whether the agent can generate actions from concrete document gaps.")}</h2></div>
        <div className={styles.list}>
          {missingDocs.map((doc) => (
            <article className={styles.listRow} key={doc.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, "待补文件", "Missing document")}</h3>
                  <p className={styles.rowMeta}>{t(zh, `请 ${partyName(doc.issuerPartyId ?? "unknown")} 补齐或确认：${documentTypeLabel(doc, zh)}（${doc.documentNo}）`, `Ask ${partyName(doc.issuerPartyId ?? "unknown")} to complete or confirm: ${documentTypeLabel(doc, zh)} (${doc.documentNo})`)}</p>
                </div>
                <span className={`${styles.statusChip} ${styles.statusOpen}`}>{t(zh, "待处理", "Open")}</span>
              </div>
            </article>
          ))}
          {missingDocs.length === 0 && <div className={styles.emptyRow}>{t(zh, "这笔交易文件已经齐备，可以进入验收、收款和融资准备。", "Documents are complete; this trade can move to acceptance, collection, and financing readiness.")}</div>}
        </div>
      </div>
    </section>
  );
}
