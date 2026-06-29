import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function severityClass(severity: string) {
  const normalized = severity.toLowerCase();
  if (normalized.includes("high")) return `${styles.statusChip} ${styles.statusHigh}`;
  if (normalized.includes("medium")) return `${styles.statusChip} ${styles.statusMedium}`;
  return `${styles.statusChip} ${styles.statusLow}`;
}

export function TasksView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { riskGaps, tasks } = workspace;

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading"><span>{t(zh, "任务中心", "Task center")}</span><h2>{t(zh, "登录后按责任方推进。", "After login, work is assigned by owner.")}</h2></div>
        <div className={styles.list}>
          {tasks.map((task) => (
            <article className={styles.listRow} key={task.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{zh ? task.titleZh : task.titleEn}</h3>
                  <p className={styles.rowMeta}>{t(zh, "负责人：", "Owner: ")}{zh ? task.ownerZh : task.ownerEn} · {task.due}</p>
                </div>
                <span className={`${styles.statusChip} ${styles.statusOpen}`}>{task.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="panel">
        <div className="section-heading"><span>RiskGap</span><h2>{t(zh, "任务来自业务风险，不是随便提醒。", "Tasks come from business risk, not random reminders.")}</h2></div>
        <div className={styles.list}>
          {riskGaps.map((gap) => (
            <article className={styles.listRow} key={gap.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{zh ? gap.titleZh : gap.titleEn}</h3>
                  <p className={styles.rowMeta}>{zh ? gap.impactZh : gap.impactEn}</p>
                </div>
                <span className={severityClass(gap.severity)}>{gap.severity}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
