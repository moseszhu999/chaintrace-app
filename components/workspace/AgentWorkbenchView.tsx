import { agentApiEndpoints } from "@/lib/agent-api-fixture";
import { agentRuns, agentWorkbenchMetrics, type AgentRunStatus } from "@/lib/agent-workbench-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import { ActionRow, DecisionPanel, MetricCard, MetricGrid, StatusList, WorkspaceHero } from "./WorkspacePrimitives";
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
        eyebrow={t(zh, "Agent API 操作入口", "Agent API operating entry")}
        title={t(zh, "现在不只是静态工作台：Agent 链路已经有可访问 API，可直接输出融资证据操作结果。", "This is no longer only a static workbench: the agent pipeline now has accessible APIs that output trade-finance evidence operations.")}
        subtitle={t(zh, "先用 mock 固定输入输出契约，下一步再把上传文件、OCR/解析、gate 计算和 memo 生成接到这些接口后面。", "Use mocks first to freeze the input/output contract, then connect upload, OCR/parsing, gate calculation, and memo generation behind these APIs.")}
      >
        <StatusList
          items={agentApiEndpoints.map((endpoint) => ({
            id: endpoint.id,
            title: `${endpoint.method} ${endpoint.path}`,
            meta: [
              `${t(zh, "阶段：", "Stage: ")}${t(zh, endpoint.stageZh, endpoint.stageEn)}`,
              `${t(zh, "输出：", "Output: ")}${t(zh, endpoint.outputZh, endpoint.outputEn)}`,
              `${t(zh, "替代人工：", "Replaces manual work: ")}${t(zh, endpoint.replacesZh, endpoint.replacesEn)}`,
            ],
            status: endpoint.id === "agent_run" ? "pipeline" : "api",
            statusClassName: `${styles.statusChip} ${endpoint.id === "agent_run" ? styles.statusVerified : styles.statusOpen}`,
          }))}
        />
        <div style={{ marginTop: 18 }}>
          <ActionRow
            actions={agentApiEndpoints.slice(0, 4).map((endpoint, index) => ({
              href: endpoint.path,
              label: index === 0 ? t(zh, "运行 Agent Pipeline", "Run Agent pipeline") : endpoint.nameEn,
              primary: index === 0,
              external: true,
            }))}
          />
        </div>
      </DecisionPanel>

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
        title={t(zh, "把这些 API 从 mock 变成上传文件后的自动生成流程：evidence metadata、gate status、gap report、memo 和 follow-up tasks。", "Turn these APIs from mocks into the post-upload generation flow: evidence metadata, gate status, gap report, memo, and follow-up tasks.")}
        actions={[
          { href: "/business-readiness", label: t(zh, "查看融资评分", "View readiness score"), primary: true },
          { href: "/business-architecture", label: t(zh, "查看业务架构", "View business architecture") },
          { href: "/api/financing-pack", label: t(zh, "打开融资包 API", "Open financing-pack API"), external: true },
        ]}
      />
    </section>
  );
}
