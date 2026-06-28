import type { WorkspaceSnapshot } from "@/lib/workspace-repository";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export function TasksView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { riskGaps, tasks } = workspace;

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading"><span>{t(zh, "任务中心", "Task center")}</span><h2>{t(zh, "登录后按责任方推进。", "After login, work is assigned by owner.")}</h2></div>
        <dl className="proof-details">
          {tasks.map((task) => (
            <div key={task.id}>
              <dt>{task.status}</dt>
              <dd><strong>{zh ? task.titleZh : task.titleEn}</strong><br />{t(zh, "负责人：", "Owner: ")}{zh ? task.ownerZh : task.ownerEn} · {task.due}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="panel">
        <div className="section-heading"><span>RiskGap</span><h2>{t(zh, "任务来自业务风险，不是随便提醒。", "Tasks come from business risk, not random reminders.")}</h2></div>
        <dl className="proof-details">
          {riskGaps.map((gap) => (
            <div key={gap.id}><dt>{gap.severity}</dt><dd><strong>{zh ? gap.titleZh : gap.titleEn}</strong><br />{zh ? gap.impactZh : gap.impactEn}</dd></div>
          ))}
        </dl>
      </div>
    </section>
  );
}
