"use client";

import { useEffect, useMemo, useState } from "react";
import type { AgentRunReceipt, HumanAction, OperatorTask } from "@/lib/agent-workflow-store";
import styles from "./WorkspaceViews.module.css";

type AgentRunsResponse = {
  latestAgentRunReceipt: AgentRunReceipt | null;
  receipts: AgentRunReceipt[];
};

type OperatorTasksResponse = {
  latestAgentRunReceipt: AgentRunReceipt | null;
  tasks: OperatorTask[];
};

const actionLabels: Record<HumanAction, string> = {
  approve_draft: "Approve draft",
  request_changes: "Request changes",
  keep_blocked: "Keep blocked",
  escalate_professional_review: "Escalate review",
};

function statusClass(status: string) {
  if (status.includes("approved") || status.includes("escalated")) return `${styles.statusChip} ${styles.statusVerified}`;
  if (status.includes("changes")) return `${styles.statusChip} ${styles.statusMedium}`;
  if (status.includes("blocked")) return `${styles.statusChip} ${styles.statusHigh}`;
  return `${styles.statusChip} ${styles.statusOpen}`;
}

export function OperatorTaskWorkflowClient({ zh }: { zh: boolean }) {
  const [receipt, setReceipt] = useState<AgentRunReceipt | null>(null);
  const [receipts, setReceipts] = useState<AgentRunReceipt[]>([]);
  const [tasks, setTasks] = useState<OperatorTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");

  const summary = useMemo(() => {
    const open = tasks.filter((task) => task.taskStatus === "open").length;
    const transitioned = tasks.length - open;
    return { open, transitioned };
  }, [tasks]);

  async function loadWorkflow() {
    setError("");
    const [runsResponse, tasksResponse] = await Promise.all([
      fetch("/api/agent-runs", { cache: "no-store" }),
      fetch("/api/operator-tasks", { cache: "no-store" }),
    ]);
    if (!runsResponse.ok || !tasksResponse.ok) {
      throw new Error("Could not load AgentRunReceipt workflow state.");
    }
    const runsJson = (await runsResponse.json()) as AgentRunsResponse;
    const tasksJson = (await tasksResponse.json()) as OperatorTasksResponse;
    setReceipts(runsJson.receipts);
    setReceipt(tasksJson.latestAgentRunReceipt ?? runsJson.latestAgentRunReceipt);
    setTasks(tasksJson.tasks);
  }

  useEffect(() => {
    loadWorkflow()
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load workflow."))
      .finally(() => setIsLoading(false));
  }, []);

  async function runAgentWorkflow() {
    setIsRunning(true);
    setError("");
    try {
      const response = await fetch("/api/agent-runs", { method: "POST" });
      if (!response.ok) throw new Error("Could not create AgentRunReceipt.");
      await loadWorkflow();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not run agent workflow.");
    } finally {
      setIsRunning(false);
    }
  }

  async function transitionTask(taskId: string, action: HumanAction) {
    setError("");
    try {
      const response = await fetch(`/api/operator-tasks/${encodeURIComponent(taskId)}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error("Operator task transition was rejected.");
      await loadWorkflow();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not transition operator task.");
    }
  }

  return (
    <div className="panel">
      <div className="section-heading">
        <span>AgentRunReceipt workflow</span>
        <h2>{zh ? "运行 Agent 后保存 receipt，并把缺口变成可处理任务。" : "Run the agent, save a receipt, and turn gaps into actionable tasks."}</h2>
        <p>
          {zh
            ? "这不是 preview：/tasks 会读取同一份 workflow state。人工动作只改变任务状态，不发送消息、不签名、不放款。"
            : "This is not a preview: /tasks reads the same workflow state. Human actions only change task status; they do not send messages, sign, or disburse."}
        </p>
      </div>

      <div className="converter-actions">
        <button className="primary-button" type="button" data-testid="run-agent-workflow" onClick={runAgentWorkflow} disabled={isRunning}>
          {isRunning ? "Running..." : "Run agent workflow"}
        </button>
        <button className="secondary-button" type="button" onClick={() => loadWorkflow()} disabled={isLoading || isRunning}>
          Refresh workflow
        </button>
      </div>

      <div className="typed-data-status ai-boundary-status" style={{ marginTop: 16 }}>
        <strong>agentDecisionAuthority=none</strong>
        <span>modelExecutionMode=deterministic_no_llm_call</span>
        <span>Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false</span>
      </div>

      {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}
      {isLoading && <div className="notice" style={{ marginTop: 16 }}>Loading AgentRunReceipt workflow...</div>}

      <div className={styles.list} style={{ marginTop: 18 }}>
        <article className={styles.listRow}>
          <div className={styles.rowHeader}>
            <div className={styles.rowMain}>
              <h3 className={styles.rowTitle}>AgentRunReceipt</h3>
              <p className={styles.rowMeta}>{receipt ? receipt.id : "No receipt yet. Run agent workflow to create one."}</p>
              <p className={styles.rowMeta}>receipts={receipts.length} · openTasks={summary.open} · transitionedTasks={summary.transitioned}</p>
              {receipt && <p className={styles.rowMeta}>readiness={receipt.readinessScore}/{receipt.maxScore} · gates={receipt.gatesPassed}/{receipt.totalGates} · humanActionRequired=true</p>}
            </div>
            <span className={`${styles.statusChip} ${styles.statusOpen}`}>{receipt?.receiptStatus ?? "not_started"}</span>
          </div>
        </article>

        {tasks.map((task) => (
          <article className={styles.listRow} key={task.id}>
            <div className={styles.rowHeader}>
              <div className={styles.rowMain}>
                <h3 className={styles.rowTitle}>{task.title}</h3>
                <p className={styles.rowMeta}>{task.taskKind} · owner={task.ownerRole} · humanActionRequired={String(task.humanActionRequired)}</p>
                <p className={styles.rowMeta}>GATES_NOT_PASSED · disbursementAllowed=false · agentDecisionAuthority=none</p>
                {task.details.slice(0, 3).map((detail) => <p className={styles.rowMeta} key={detail}>{detail}</p>)}
                <div className="converter-actions" style={{ marginTop: 10 }}>
                  {task.allowedHumanActions.map((action) => (
                    <button
                      className="secondary-button"
                      type="button"
                      data-testid={`operator-task-action-${task.taskKind}-${action}`}
                      key={action}
                      onClick={() => transitionTask(task.id, action)}
                    >
                      {actionLabels[action]}
                    </button>
                  ))}
                </div>
              </div>
              <span className={statusClass(task.taskStatus)}>{task.taskStatus}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
