"use client";

import { useEffect, useMemo, useState } from "react";
import type { AgentRunReceipt, HumanAction, OperatorTask } from "@/lib/agent-workflow-store";
import type { EvidenceLinkedTask, EvidenceTaskAction } from "@/lib/evidence-task-store";
import styles from "./WorkspaceViews.module.css";

type AgentRunsResponse = {
  latestAgentRunReceipt: AgentRunReceipt | null;
  receipts: AgentRunReceipt[];
};

type OperatorTasksResponse = {
  latestAgentRunReceipt: AgentRunReceipt | null;
  tasks: OperatorTask[];
  evidenceTasks?: EvidenceLinkedTask[];
};

const actionLabels: Record<HumanAction, string> = {
  approve_draft: "Approve draft",
  request_changes: "Request changes",
  keep_blocked: "Keep blocked",
  escalate_professional_review: "Escalate review",
};

const evidenceActionLabels: Record<EvidenceTaskAction, string> = {
  assign_to_operator: "Assign",
  request_changes: "Request changes",
  keep_blocked: "Keep blocked",
  mark_resolved: "Mark resolved",
  escalate_review: "Escalate review",
};

function statusClass(status: string) {
  if (status.includes("approved") || status.includes("resolved") || status.includes("escalated")) return `${styles.statusChip} ${styles.statusVerified}`;
  if (status.includes("changes") || status.includes("waiting") || status.includes("progress")) return `${styles.statusChip} ${styles.statusMedium}`;
  if (status.includes("blocked") || status.includes("rejected")) return `${styles.statusChip} ${styles.statusHigh}`;
  return `${styles.statusChip} ${styles.statusOpen}`;
}

export function OperatorTaskWorkflowClient({ zh }: { zh: boolean }) {
  const [receipt, setReceipt] = useState<AgentRunReceipt | null>(null);
  const [receipts, setReceipts] = useState<AgentRunReceipt[]>([]);
  const [tasks, setTasks] = useState<OperatorTask[]>([]);
  const [evidenceTasks, setEvidenceTasks] = useState<EvidenceLinkedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");

  const summary = useMemo(() => {
    const open = tasks.filter((task) => task.taskStatus === "open").length + evidenceTasks.filter((task) => task.taskStatus === "open").length;
    const transitioned = tasks.length + evidenceTasks.length - open;
    return { open, transitioned };
  }, [tasks, evidenceTasks]);

  async function loadWorkflow() {
    setError("");
    const [runsResponse, tasksResponse] = await Promise.all([
      fetch("/api/agent-runs", { cache: "no-store" }),
      fetch("/api/operator-tasks", { cache: "no-store" }),
    ]);
    if (!runsResponse.ok || !tasksResponse.ok) throw new Error("Could not load workflow state.");
    const runsJson = (await runsResponse.json()) as AgentRunsResponse;
    const tasksJson = (await tasksResponse.json()) as OperatorTasksResponse;
    setReceipts(runsJson.receipts);
    setReceipt(tasksJson.latestAgentRunReceipt ?? runsJson.latestAgentRunReceipt);
    setTasks(tasksJson.tasks ?? []);
    setEvidenceTasks(tasksJson.evidenceTasks ?? []);
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
      setError(caught instanceof Error ? caught.message : "Could not run workflow.");
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
      if (!response.ok) throw new Error("Task transition was rejected.");
      await loadWorkflow();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not transition task.");
    }
  }

  async function transitionEvidenceTask(taskId: string, action: EvidenceTaskAction) {
    setError("");
    try {
      const response = await fetch(`/api/tasks/${encodeURIComponent(taskId)}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error("Evidence task transition was rejected.");
      await loadWorkflow();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not transition evidence task.");
    }
  }

  return (
    <div className="panel">
      <div className="section-heading">
        <span>Task queue workflow</span>
        <h2>{zh ? "证据动作会生成任务。" : "Evidence actions now generate tasks."}</h2>
        <p>{zh ? "人工动作只改变任务状态，不执行外部动作。" : "Human actions only change task state; they do not perform external actions."}</p>
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
        <span>Pre-review only · GATES_NOT_PASSED</span>
      </div>

      {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}
      {isLoading && <div className="notice" style={{ marginTop: 16 }}>Loading task workflow...</div>}

      <div className={styles.list} style={{ marginTop: 18 }}>
        <article className={styles.listRow}>
          <div className={styles.rowHeader}>
            <div className={styles.rowMain}>
              <h3 className={styles.rowTitle}>Task queue state</h3>
              <p className={styles.rowMeta}>{receipt ? receipt.id : "No agent receipt yet. Evidence review tasks can still appear."}</p>
              <p className={styles.rowMeta}>receipts={receipts.length} · agentTasks={tasks.length} · evidenceTasks={evidenceTasks.length} · openTasks={summary.open} · transitionedTasks={summary.transitioned}</p>
            </div>
            <span className={`${styles.statusChip} ${styles.statusOpen}`}>{receipt?.receiptStatus ?? "task_queue"}</span>
          </div>
        </article>

        {evidenceTasks.map((task) => (
          <article className={styles.listRow} key={task.id}>
            <div className={styles.rowHeader}>
              <div className={styles.rowMain}>
                <h3 className={styles.rowTitle}>{task.title}</h3>
                <p className={styles.rowMeta}>evidenceId={task.evidenceId} · documentNo={task.documentNo} · gate={task.gateId ?? "unmapped"}</p>
                <p className={styles.rowMeta}>reason={task.reason}</p>
                <p className={styles.rowMeta}>GATES_NOT_PASSED · sourceReviewReceipt={task.sourceReviewReceiptId ?? "seeded"}</p>
                <div className="converter-actions" style={{ marginTop: 10 }}>
                  {task.allowedActions.map((action) => (
                    <button className="secondary-button" type="button" data-testid={`evidence-task-action-${action}`} key={action} onClick={() => transitionEvidenceTask(task.id, action)}>
                      {evidenceActionLabels[action]}
                    </button>
                  ))}
                </div>
              </div>
              <span className={statusClass(task.taskStatus)}>{task.taskStatus}</span>
            </div>
          </article>
        ))}

        {tasks.map((task) => (
          <article className={styles.listRow} key={task.id}>
            <div className={styles.rowHeader}>
              <div className={styles.rowMain}>
                <h3 className={styles.rowTitle}>{task.title}</h3>
                <p className={styles.rowMeta}>{task.taskKind} · owner={task.ownerRole} · humanActionRequired={String(task.humanActionRequired)}</p>
                {task.details.slice(0, 3).map((detail) => <p className={styles.rowMeta} key={detail}>{detail}</p>)}
                <div className="converter-actions" style={{ marginTop: 10 }}>
                  {task.allowedHumanActions.map((action) => (
                    <button className="secondary-button" type="button" data-testid={`operator-task-action-${task.taskKind}-${action}`} key={action} onClick={() => transitionTask(task.id, action)}>
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
