import type { DemoRole } from "@/lib/demo-roles";
import type { TradeMilestoneStatus } from "@/lib/concrete-trade-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import { OperatorTaskWorkflowClient } from "./OperatorTaskWorkflowClient";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusClass(status: TradeMilestoneStatus) {
  const map: Record<TradeMilestoneStatus, string> = {
    done: styles.statusVerified,
    working: styles.statusOpen,
    blocked: styles.statusHigh,
    waiting: styles.statusMedium,
  };
  return `${styles.statusChip} ${map[status]}`;
}

export function TasksView({ zh, workspace, role }: { zh: boolean; workspace: WorkspaceSnapshot; role: DemoRole }) {
  const { activeTrade } = workspace;
  const actionMilestones = activeTrade.milestones.filter((item) => item.status !== "done");
  const missingDocs = activeTrade.documents.filter((doc) => doc.status === "missing" || doc.status === "rejected");

  function partyName(id: string) {
    return activeTrade.parties.find((party) => party.id === id)?.name ?? id;
  }

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading"><span>{t(zh, "交易任务", "Trade tasks")}</span><h2>{t(zh, "任务来自这笔咖啡豆交易的真实卡点。", "Tasks come from real blockers in this coffee-bean trade.")}</h2></div>
        <div className={styles.list}>
          {actionMilestones.map((task) => (
            <article className={styles.listRow} key={task.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, task.titleZh, task.titleEn)}</h3>
                  <p className={styles.rowMeta}>{t(zh, "负责人：", "Owner: ")}{partyName(task.ownerPartyId)} · {t(zh, "期限：", "Due: ")}{task.dueDate}</p>
                  {task.blockerZh && <p className={styles.rowMeta}>{t(zh, task.blockerZh, task.blockerEn ?? task.blockerZh)}</p>}
                  <p className={styles.rowMeta}>{t(zh, "Agent 下一步：", "Agent next step: ")}{t(zh, task.nextActionZh, task.nextActionEn)}</p>
                </div>
                <span className={statusClass(task.status)}>{task.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="panel">
        <div className="section-heading"><span>{t(zh, "风险与收款影响", "Risk & collection impact")}</span><h2>{t(zh, "缺口不是提醒事项，而是尾款和融资条件。", "Gaps are not reminders; they are payment and financing conditions.")}</h2></div>
        <div className={styles.list}>
          {missingDocs.map((doc) => (
            <article className={styles.listRow} key={doc.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, doc.typeZh, doc.typeEn)} · {doc.documentNo}</h3>
                  <p className={styles.rowMeta}>{t(zh, doc.noteZh, doc.noteEn)}</p>
                  <p className={styles.rowMeta}>{t(zh, "责任方：", "Owner: ")}{partyName(doc.issuerPartyId)}</p>
                </div>
                <span className={`${styles.statusChip} ${styles.statusHigh}`}>{doc.status}</span>
              </div>
            </article>
          ))}
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "当前业务后果", "Current business consequence")}</h3>
            <p className={styles.rowMeta}>{t(zh, "70% 尾款 USD 36,960 被买家验收卡住；资金方只能预审，不能正式提交融资。", "The 70% balance of USD 36,960 is blocked by buyer acceptance; the financier can only pre-review, not formally process financing.")}</p>
          </article>
        </div>
      </div>
      <OperatorTaskWorkflowClient zh={zh} role={role} />
    </section>
  );
}
