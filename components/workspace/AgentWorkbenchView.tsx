import { agentRuns, agentWorkbenchMetrics, type AgentRunStatus } from "@/lib/agent-workbench-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import { DecisionPanel, MetricCard, MetricGrid, StatusList, WorkspaceHero } from "./WorkspacePrimitives";
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
      <WorkspaceHero
        eyebrow={t(zh, "Agent-first MVP", "Agent-first MVP")}
        title={t(zh, "AI Agent 替代人工证据运营，智能合约减少放款流程摩擦。", "AI agents replace manual evidence operations, while smart contracts reduce disbursement-process friction.")}
        subtitle={`${t(zh, activeTrade.titleZh, activeTrade.titleEn)} · ${activeTrade.poNo} · ${activeTrade.invoiceNo}`}
      >
        <MetricGrid>
          {agentWorkbenchMetrics.map((metric) => (
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
        eyebrow={t(zh, "Agent 替代人工链路", "Agent replacement workflow")}
        title={t(zh, "目标不是多一个聊天框，而是把银行、律所、保理商过去大量重复核验和文书环节压缩成 Agent + 合约工作流。", "The goal is not another chat box, but compressing repetitive verification and paperwork done by banks, law firms, and factors into an agent + contract workflow.")}
      >
        <StatusList
          items={agentRuns.map((run) => ({
            id: run.id,
            title: t(zh, run.agentZh, run.agentEn),
            meta: [
              `${t(zh, "替代人工：", "Replaces manual work: ")}${t(zh, run.replacedManualWorkZh, run.replacedManualWorkEn)}`,
              `${t(zh, "输入：", "Input: ")}${t(zh, run.inputZh, run.inputEn)}`,
              `${t(zh, "输出：", "Output: ")}${t(zh, run.outputZh, run.outputEn)}`,
              `${t(zh, "减少摩擦：", "Friction reduced: ")}${(zh ? run.frictionReducedZh : run.frictionReducedEn).join(" / ")}`,
            ],
            status: run.status,
            statusClassName: statusClass(run.status),
          }))}
        />
      </DecisionPanel>

      <DecisionPanel
        eyebrow={t(zh, "下一步产品化", "Next productization step")}
        title={t(zh, "把这些 fixture 变成真实 Agent API：上传文件后自动生成 evidence metadata、gate status、gap report、memo 和 follow-up tasks。", "Turn these fixtures into real Agent APIs: after upload, generate evidence metadata, gate status, gap report, memo, and follow-up tasks automatically.")}
        actions={[
          { href: "/business-readiness", label: t(zh, "查看融资评分", "View readiness score"), primary: true },
          { href: "/business-architecture", label: t(zh, "查看业务架构", "View business architecture") },
          { href: "/api/financing-pack", label: t(zh, "打开融资包 API", "Open financing-pack API"), external: true },
        ]}
      />
    </section>
  );
}
