import Link from "next/link";
import { agentRuns, agentWorkbenchMetrics, type AgentRunStatus } from "@/lib/agent-workbench-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusClass(status: AgentRunStatus) {
  const map: Record<AgentRunStatus, string> = {
    done: styles.statusVerified,
    running: styles.statusOpen,
    blocked: styles.statusRejected,
  };
  return `${styles.statusChip} ${map[status]}`;
}

export function AgentWorkbenchView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "Agent-first MVP", "Agent-first MVP")}</span>
          <h2>{t(zh, "AI Agent 替代人工证据运营，智能合约减少放款流程摩擦。", "AI agents replace manual evidence operations, while smart contracts reduce disbursement-process friction.")}</h2>
          <p>{t(zh, activeTrade.titleZh, activeTrade.titleEn)} · {activeTrade.poNo} · {activeTrade.invoiceNo}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {agentWorkbenchMetrics.map((metric) => (
            <article key={metric.labelEn} style={{ border: "1px solid var(--border)", borderRadius: 26, padding: 20 }}>
              <span style={{ color: "#18794e", fontWeight: 900, fontSize: 13 }}>{t(zh, metric.labelZh, metric.labelEn)}</span>
              <h3 className={styles.rowTitle}>{t(zh, metric.valueZh, metric.valueEn)}</h3>
              <p className={styles.rowMeta}>{t(zh, metric.noteZh, metric.noteEn)}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "Agent 替代人工链路", "Agent replacement workflow")}</span>
          <h2>{t(zh, "目标不是多一个聊天框，而是把银行、律所、保理商过去大量重复核验和文书环节压缩成 Agent + 合约工作流。", "The goal is not another chat box, but compressing repetitive verification and paperwork done by banks, law firms, and factors into an agent + contract workflow.")}</h2>
        </div>
        <div className={styles.list}>
          {agentRuns.map((run) => (
            <article className={styles.listRow} key={run.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, run.agentZh, run.agentEn)}</h3>
                  <p className={styles.rowMeta}>{t(zh, "替代人工：", "Replaces manual work: ")}{t(zh, run.replacedManualWorkZh, run.replacedManualWorkEn)}</p>
                  <p className={styles.rowMeta}>{t(zh, "输入：", "Input: ")}{t(zh, run.inputZh, run.inputEn)}</p>
                  <p className={styles.rowMeta}>{t(zh, "输出：", "Output: ")}{t(zh, run.outputZh, run.outputEn)}</p>
                  <p className={styles.rowMeta}>{t(zh, "减少摩擦：", "Friction reduced: ")}{(zh ? run.frictionReducedZh : run.frictionReducedEn).join(" / ")}</p>
                </div>
                <span className={statusClass(run.status)}>{run.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "下一步产品化", "Next productization step")}</span>
          <h2>{t(zh, "把这些 fixture 变成真实 Agent API：上传文件后自动生成 evidence metadata、gate status、gap report、memo 和 follow-up tasks。", "Turn these fixtures into real Agent APIs: after upload, generate evidence metadata, gate status, gap report, memo, and follow-up tasks automatically.")}</h2>
        </div>
        <div className={styles.rowActions}>
          <Link className="primary-button" href="/business-readiness">{t(zh, "查看融资评分", "View readiness score")}</Link>
          <Link className="secondary-button" href="/business-architecture">{t(zh, "查看业务架构", "View business architecture")}</Link>
          <Link className="secondary-button" href="/api/financing-pack" target="_blank">{t(zh, "打开融资包 API", "Open financing-pack API")}</Link>
        </div>
      </div>
    </section>
  );
}
