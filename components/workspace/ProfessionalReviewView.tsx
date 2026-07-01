import { professionalReviewItems, professionalReviewMetrics, type ProfessionalReviewStatus } from "@/lib/professional-review-fixture";
import type { EvidenceRecord } from "@/lib/repositories/chaintrace-repository";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import { DecisionPanel, MetricCard, MetricGrid, StatusList, WorkspaceHero } from "./WorkspacePrimitives";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusClass(status: ProfessionalReviewStatus) {
  const map: Record<ProfessionalReviewStatus, string> = {
    "auto-cleared": styles.statusVerified,
    "needs-review": styles.statusOpen,
    blocked: styles.statusRejected,
  };
  return `${styles.statusChip} ${map[status]}`;
}

function evidenceStatusClass(status: EvidenceRecord["status"]) {
  const map: Record<EvidenceRecord["status"], string> = {
    verified: styles.statusVerified,
    uploaded_pending_verification: styles.statusOpen,
    missing: styles.statusMissing,
    needs_agent_review: styles.statusMedium,
    rejected: styles.statusRejected,
  };
  return `${styles.statusChip} ${map[status]}`;
}

function documentLabel(record: EvidenceRecord) {
  return record.documentType.replace(/_/g, " ");
}

function gateImpactSummary(record: EvidenceRecord) {
  if (!record.gateImpacts.length) return "gateImpact=unmapped";
  return record.gateImpacts.map((impact) => `${impact.gateId}:${impact.status}`).join(" · ");
}

function buildReviewReceiptItems(records: EvidenceRecord[]) {
  return records
    .flatMap((record) => (record.reviewReceipts ?? []).map((receipt) => ({ record, receipt })))
    .sort((a, b) => b.receipt.reviewedAt.localeCompare(a.receipt.reviewedAt));
}

export function ProfessionalReviewView({
  zh,
  workspace,
  evidenceRecords,
}: {
  zh: boolean;
  workspace: WorkspaceSnapshot;
  evidenceRecords: EvidenceRecord[];
}) {
  const { activeTrade } = workspace;
  const reviewReceiptItems = buildReviewReceiptItems(evidenceRecords);

  return (
    <section className="workspace">
      <WorkspaceHero
        eyebrow={t(zh, "专业审查视图", "Professional review view")}
        title={t(zh, "银行和律所不再从零翻材料，而是审查 Agent + 合约工作流筛出的例外。", "Banks and law firms no longer start from raw materials; they review exceptions surfaced by agent + contract workflows.")}
        subtitle={`${t(zh, activeTrade.titleZh, activeTrade.titleEn)} · ${activeTrade.poNo} · ${activeTrade.invoiceNo}`}
      >
        <MetricGrid>
          {professionalReviewMetrics.map((metric) => (
            <MetricCard
              key={metric.labelEn}
              label={t(zh, metric.labelZh, metric.labelEn)}
              value={t(zh, metric.valueZh, metric.valueEn)}
              note={t(zh, metric.noteZh, metric.noteEn)}
            />
          ))}
        </MetricGrid>
      </WorkspaceHero>

      <DecisionPanel
        eyebrow={t(zh, "例外审查队列", "Exception review queue")}
        title={t(zh, "中介机构的数量级弱化，不是消失；它们从重复核验退到高价值判断节点。", "Order-of-magnitude intermediary compression does not mean disappearance; intermediaries move from repetitive verification to high-value judgment points.")}
      >
        <StatusList
          items={professionalReviewItems.map((item) => ({
            id: item.id,
            title: `${t(zh, item.areaZh, item.areaEn)} · ${t(zh, item.ownerZh, item.ownerEn)}`,
            meta: [
              `${t(zh, "Agent 初筛：", "Agent pre-check: ")}${t(zh, item.agentPrecheckZh, item.agentPrecheckEn)}`,
              `${t(zh, "专业机构职责：", "Professional role: ")}${t(zh, item.professionalRoleZh, item.professionalRoleEn)}`,
              `${t(zh, "例外/风险：", "Exception/risk: ")}${t(zh, item.exceptionZh, item.exceptionEn)}`,
            ],
            status: item.status,
            statusClassName: statusClass(item.status),
          }))}
        />
      </DecisionPanel>

      <DecisionPanel
        eyebrow={t(zh, "Review receipt handoff", "Review receipt handoff")}
        title={t(zh, "专业审查可以直接看到已持久化的人工证据审查轨迹。", "Professional review can see the persisted human evidence-review trail directly.")}
        subtitle="Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false"
        actions={[{ href: "/evidence", label: t(zh, "打开证据审计时间线", "Open evidence audit timeline") }]}
      >
        <StatusList
          items={
            reviewReceiptItems.length
              ? reviewReceiptItems.map(({ record, receipt }) => ({
                  id: receipt.id,
                  title: `${receipt.action} · ${documentLabel(record)} · ${record.documentNo}`,
                  meta: [
                    `reviewReceipt=${receipt.id}`,
                    `evidenceId=${receipt.evidenceId} · file=${record.fileName}`,
                    `${receipt.beforeStatus} -> ${receipt.afterStatus}`,
                    `reviewerRole=${receipt.reviewerRole} · reviewer=${receipt.reviewerName ?? "unknown"} · reviewedAt=${receipt.reviewedAt}`,
                    `gateImpact=${gateImpactSummary(record)}`,
                    `reason=${receipt.reason}`,
                    `${receipt.blockerCode} · disbursementAllowed=false · agentDecisionAuthority=${receipt.agentDecisionAuthority}`,
                  ],
                  status: receipt.afterStatus,
                  statusClassName: evidenceStatusClass(receipt.afterStatus),
                }))
              : [{
                  id: "no-review-receipts",
                  title: t(zh, "还没有人工证据审查 receipt", "No human evidence-review receipt yet"),
                  meta: [
                    t(zh, "先在 /evidence 对一份证据执行 Verify / Reject / Request more evidence。", "Run Verify / Reject / Request more evidence on /evidence first."),
                    "Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false",
                  ],
                  status: "not_started",
                  statusClassName: `${styles.statusChip} ${styles.statusOpen}`,
                }]
          }
        />
      </DecisionPanel>

      <DecisionPanel
        eyebrow={t(zh, "前端层定位", "Frontend-layer positioning")}
        title={t(zh, "Next.js / React / TypeScript 前端层现在覆盖：业务工作台、融资评分、Agent 工作台、合约控制台、资金方视图、专业审查视图。", "The Next.js / React / TypeScript frontend layer now covers: business workspace, readiness score, agent workbench, contract console, financier view, and professional review view.")}
        actions={[
          { href: "/business-ops", label: t(zh, "查看 Agent 工作台", "View Agent workbench"), primary: true },
          { href: "/business-readiness", label: t(zh, "查看融资评分", "View readiness score") },
          { href: "/business-architecture", label: t(zh, "查看业务架构", "View business architecture") },
        ]}
      />
    </section>
  );
}
