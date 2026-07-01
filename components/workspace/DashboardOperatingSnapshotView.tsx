import Link from "next/link";
import type { CaseOperatingSnapshot } from "@/lib/case-operating-snapshot";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusClass(status: string) {
  if (["passed", "resolved", "verified"].includes(status)) return `${styles.statusChip} ${styles.statusVerified}`;
  if (["pending", "open", "in_progress", "waiting_counterparty"].includes(status)) return `${styles.statusChip} ${styles.statusMedium}`;
  if (["blocked", "rejected"].includes(status)) return `${styles.statusChip} ${styles.statusHigh}`;
  return `${styles.statusChip} ${styles.statusOpen}`;
}

export function DashboardOperatingSnapshotView({ zh, workspace, snapshot }: { zh: boolean; workspace: WorkspaceSnapshot; snapshot: CaseOperatingSnapshot }) {
  const trade = snapshot.case;
  const latestTask = snapshot.tasks.latest[0];
  const latestReceipt = snapshot.reviewReceipts.latest[0];

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "Active case command center", "Active case command center")}</span>
          <h2>{t(zh, trade.titleZh, trade.titleEn)}</h2>
          <p>{trade.id} · {trade.poNo} · {trade.invoiceNo}</p>
          <p>Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false</p>
        </div>
        <div className="proof-flow-grid">
          <article className="proof-flow-card"><strong>Readiness</strong><span>{snapshot.readiness.readinessScore}/{snapshot.readiness.maxScore}</span><span>{snapshot.readiness.blockerCode}</span></article>
          <article className="proof-flow-card"><strong>Gates</strong><span>{snapshot.gates.summary.passed}/{snapshot.gates.summary.total}</span><span>pending {snapshot.gates.summary.pending} · blocked {snapshot.gates.summary.blocked}</span></article>
          <article className="proof-flow-card"><strong>Evidence</strong><span>verified {snapshot.evidenceSummary.verified}/{snapshot.evidenceSummary.total}</span><span>to resolve {snapshot.evidenceSummary.pending + snapshot.evidenceSummary.missingOrRejected}</span></article>
          <article className="proof-flow-card"><strong>Tasks</strong><span>open {snapshot.tasks.open}/{snapshot.tasks.total}</span><span>resolved {snapshot.tasks.resolved}</span></article>
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "Next human action", "Next human action")}</span>
          <h2>{snapshot.nextHumanAction}</h2>
          <p>{t(zh, "Dashboard 只读取 operating snapshot，不自己创造业务状态。", "The dashboard only reads the operating snapshot and does not create separate business state.")}</p>
        </div>
        <div className="hero-actions">
          <Link className="primary-button" href={`/cases/${trade.id}/evidence`}>{t(zh, "进入证据", "Open evidence")}</Link>
          <Link className="secondary-button" href={`/cases/${trade.id}/tasks`}>{t(zh, "查看任务", "View tasks")}</Link>
          <Link className="secondary-button" href={`/cases/${trade.id}/handoff`}>Handoff</Link>
        </div>
      </div>

      <div className="panel">
        <div className="section-heading"><span>Blocked gates</span><h2>{t(zh, "当前阻断项", "Current blockers")}</h2></div>
        <div className={styles.list}>
          {snapshot.gates.blocked.map((gate) => (
            <article className={styles.listRow} key={gate.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}><h3 className={styles.rowTitle}>{t(zh, gate.titleZh, gate.titleEn)}</h3><p className={styles.rowMeta}>gateId={gate.id} · sourceEvidence={gate.sourceEvidenceIds.join(", ") || "none"}</p></div>
                <span className={statusClass(gate.status)}>{gate.status}</span>
              </div>
            </article>
          ))}
          {snapshot.gates.blocked.length === 0 && <div className={styles.emptyRow}>No blocked gates.</div>}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading"><span>Open tasks</span><h2>{t(zh, "由证据和 gate 生成的任务", "Tasks generated from evidence and gates")}</h2></div>
        <div className={styles.list}>
          {snapshot.tasks.latest.map((task) => (
            <article className={styles.listRow} key={task.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}><h3 className={styles.rowTitle}>{task.title}</h3><p className={styles.rowMeta}>evidenceId={task.evidenceId} · gate={task.gateId ?? "unmapped"}</p><p className={styles.rowMeta}>{task.reason}</p></div>
                <span className={statusClass(task.taskStatus)}>{task.taskStatus}</span>
              </div>
            </article>
          ))}
          {!latestTask && <div className={styles.emptyRow}>No evidence task.</div>}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading"><span>Latest receipts</span><h2>{t(zh, "最近审查记录", "Recent review receipts")}</h2></div>
        <div className={styles.list}>
          {snapshot.reviewReceipts.latest.map((receipt) => (
            <article className={styles.listRow} key={receipt.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}><h3 className={styles.rowTitle}>{receipt.action} · {receipt.evidenceId}</h3><p className={styles.rowMeta}>{receipt.beforeStatus} to {receipt.afterStatus} · {receipt.reviewedAt}</p></div>
                <span className={statusClass(receipt.afterStatus)}>{receipt.afterStatus}</span>
              </div>
            </article>
          ))}
          {!latestReceipt && <div className={styles.emptyRow}>No review receipt yet.</div>}
        </div>
      </div>

      <div className="typed-data-status ai-boundary-status"><strong>snapshot={snapshot.generatedAt}</strong><span>caseId={trade.id}</span><span>workspace={workspace.organization.name}</span><span>mode={snapshot.boundary.mode}</span></div>
    </section>
  );
}
