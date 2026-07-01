import { roleCan, type DemoRole } from "@/lib/demo-roles";
import type { CaseReviewHandoffPack } from "@/lib/case-review-handoff";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import { ProfessionalReviewActions } from "./ProfessionalReviewActions";
import { DecisionPanel, MetricCard, MetricGrid, StatusList, WorkspaceHero } from "./WorkspacePrimitives";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusClass(status: string) {
  if (["passed", "verified", "resolved"].includes(status)) return `${styles.statusChip} ${styles.statusVerified}`;
  if (["pending", "uploaded_pending_verification", "needs_agent_review", "open", "waiting_counterparty"].includes(status)) {
    return `${styles.statusChip} ${styles.statusMedium}`;
  }
  if (["blocked", "missing", "rejected"].includes(status)) return `${styles.statusChip} ${styles.statusRejected}`;
  return `${styles.statusChip} ${styles.statusOpen}`;
}

function documentLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function ProfessionalReviewView({
  zh,
  workspace,
  role,
  handoffPack,
}: {
  zh: boolean;
  workspace: WorkspaceSnapshot;
  role: DemoRole;
  handoffPack: CaseReviewHandoffPack;
}) {
  const caseSummary = handoffPack.caseSummary;
  const latestReceipt = handoffPack.reviewReceiptTimeline[0];
  const canWriteProfessionalReview = roleCan(role, "professional_review:note");

  return (
    <section className="workspace">
      <WorkspaceHero
        eyebrow={t(zh, "专业审查 Handoff Pack", "Professional review handoff pack")}
        title={t(zh, "银行、律所和保理方读取同一个 case snapshot，而不是 fixture 队列。", "Banks, law firms, and factors read the same case snapshot instead of a fixture queue.")}
        subtitle={`${t(zh, caseSummary.titleZh, caseSummary.titleEn)} · ${caseSummary.poNo} · ${caseSummary.invoiceNo}`}
        actions={[
          { href: `/api/cases/${caseSummary.id}/handoff`, label: "Open JSON", primary: true },
          { href: `/api/cases/${caseSummary.id}/review-summary`, label: "Review summary" },
        ]}
      >
        <MetricGrid>
          <MetricCard
            label={t(zh, "Readiness", "Readiness")}
            value={`${handoffPack.readiness.readinessScore}/${handoffPack.readiness.maxScore}`}
            note={`${handoffPack.readiness.blockerCode} · disbursementAllowed=false`}
          />
          <MetricCard
            label={t(zh, "Gates", "Gates")}
            value={`${handoffPack.gateStatus.summary.passed}/${handoffPack.gateStatus.summary.total}`}
            note={`blocked ${handoffPack.gateStatus.summary.blocked} · pending ${handoffPack.gateStatus.summary.pending}`}
          />
          <MetricCard
            label={t(zh, "Evidence", "Evidence")}
            value={`${handoffPack.evidenceSummary.verified}/${handoffPack.evidenceSummary.total}`}
            note={`missingOrRejected ${handoffPack.evidenceSummary.missingOrRejected}`}
          />
          <MetricCard
            label={t(zh, "Receipts", "Receipts")}
            value={`${handoffPack.reviewReceiptTimeline.length}`}
            note={latestReceipt ? `${latestReceipt.action} · ${latestReceipt.evidenceId}` : "No review receipt yet"}
          />
        </MetricGrid>
      </WorkspaceHero>

      <DecisionPanel
        eyebrow={t(zh, "Boundary statement", "Boundary statement")}
        title={t(zh, "这个包只用于专业预审交接，不形成批准结论。", "This pack is only for professional pre-review handoff and does not create an approval decision.")}
        subtitle={handoffPack.boundary.statement}
      >
        <div className="typed-data-status ai-boundary-status">
          <strong>mode={handoffPack.boundary.mode}</strong>
          <span>blockerCode={handoffPack.boundary.blockerCode}</span>
          <span>disbursementAllowed={String(handoffPack.boundary.disbursementAllowed)}</span>
          <span>not a legal opinion · not a credit approval</span>
        </div>
      </DecisionPanel>

      <DecisionPanel
        eyebrow={t(zh, "Blocked gates and exceptions", "Blocked gates and exceptions")}
        title={t(zh, "专业机构先看阻断原因、缺失证据和开放例外。", "Professional reviewers start from blocked reasons, missing evidence, and open exceptions.")}
      >
        <StatusList
          items={handoffPack.blockedReasons.map((reason) => ({
            id: reason.gateId,
            title: `${t(zh, reason.labelZh, reason.labelEn)} · gate=${reason.gateId}`,
            meta: [
              `evidenceId=${reason.evidenceId} · sourceEvidence=${reason.sourceEvidenceIds.join(", ") || "none"}`,
              t(zh, reason.reasonZh, reason.reasonEn),
              "Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false",
            ],
            status: "blocked",
            statusClassName: statusClass("blocked"),
          }))}
        />
      </DecisionPanel>

      {canWriteProfessionalReview && (
        <ProfessionalReviewActions caseId={caseSummary.id} role={role} zh={zh} />
      )}

      <DecisionPanel
        eyebrow={t(zh, "Missing evidence", "Missing evidence")}
        title={t(zh, "缺口直接来自 evidence records 和 linked tasks。", "Gaps come directly from evidence records and linked tasks.")}
      >
        <StatusList
          items={
            handoffPack.missingEvidence.length
              ? handoffPack.missingEvidence.map((item) => ({
                  id: item.evidenceId,
                  title: `${documentLabel(item.documentType)} · ${item.documentNo}`,
                  meta: [`gate=${item.gateId}`, t(zh, item.reasonZh, item.reasonEn)],
                  status: item.status,
                  statusClassName: statusClass(item.status),
                }))
              : [{
                  id: "missing-evidence-empty",
                  title: t(zh, "没有缺失证据", "No missing evidence"),
                  meta: ["Snapshot currently has no missing evidence record."],
                  status: "verified",
                  statusClassName: statusClass("verified"),
                }]
          }
        />
      </DecisionPanel>

      <DecisionPanel
        eyebrow={t(zh, "Open exceptions", "Open exceptions")}
        title={t(zh, "未闭合例外保留给专业机构判断。", "Open exceptions remain for professional reviewers to judge.")}
      >
        <StatusList
          items={handoffPack.openExceptions.map((item) => ({
            id: item.id,
            title: item.title,
            meta: [
              `evidenceId=${item.evidenceId} · gate=${item.gateId}`,
              t(zh, item.reasonZh, item.reasonEn),
              "not a legal opinion · not lending approval · not a credit approval",
            ],
            status: item.status,
            statusClassName: statusClass(item.status),
          }))}
        />
      </DecisionPanel>

      <DecisionPanel
        eyebrow={t(zh, "Review receipt timeline", "Review receipt timeline")}
        title={t(zh, "页面显示完整人工审查 receipt 历史。", "The page shows the full human review receipt history.")}
      >
        <StatusList
          items={
            handoffPack.reviewReceiptTimeline.length
              ? handoffPack.reviewReceiptTimeline.map((receipt) => ({
                  id: receipt.id,
                  title: `${receipt.action} · ${documentLabel(receipt.documentType)} · ${receipt.documentNo}`,
                  meta: [
                    `reviewReceipt=${receipt.id}`,
                    `${receipt.beforeStatus} -> ${receipt.afterStatus} · reviewedAt=${receipt.reviewedAt}`,
                    `reviewerRole=${receipt.reviewerRole} · reviewer=${receipt.reviewerName ?? "unknown"}`,
                    `${receipt.blockerCode} · disbursementAllowed=false · agentDecisionAuthority=${receipt.agentDecisionAuthority}`,
                    `file=${receipt.fileName} · reason=${receipt.reason}`,
                  ],
                  status: receipt.afterStatus,
                  statusClassName: statusClass(receipt.afterStatus),
                }))
              : [{
                  id: "no-review-receipts",
                  title: t(zh, "还没有人工证据审查 receipt", "No human evidence-review receipt yet"),
                  meta: [
                    t(zh, `先在 /cases/${caseSummary.id}/evidence 对一份证据执行 Verify / Reject / Request more evidence。`, `Run Verify / Reject / Request more evidence on /cases/${caseSummary.id}/evidence first.`),
                    "Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false",
                  ],
                  status: "open",
                  statusClassName: statusClass("open"),
                }]
          }
        />
      </DecisionPanel>

      <DecisionPanel
        eyebrow={t(zh, "Recommended next actions", "Recommended next actions")}
        title={t(zh, "下一步动作来自 evidence-linked tasks 和 blocked gates。", "Next actions come from evidence-linked tasks and blocked gates.")}
      >
        <StatusList
          items={handoffPack.recommendedNextActions.map((action) => ({
            id: action.id,
            title: action.title,
            meta: [
              `ownerRole=${action.ownerRole} · evidenceId=${action.evidenceId}`,
              `gate=${action.gateId}`,
              action.reason,
            ],
            status: "open",
            statusClassName: statusClass("open"),
          }))}
        />
      </DecisionPanel>

      <div className="typed-data-status ai-boundary-status">
        <strong>caseId={caseSummary.id}</strong>
        <span>workspace={workspace.organization.name}</span>
        <span>generatedAt={handoffPack.generatedAt}</span>
        <span>allowedAction={handoffPack.boundary.allowedAction}</span>
      </div>
    </section>
  );
}
