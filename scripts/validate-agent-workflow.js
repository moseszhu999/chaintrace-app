const fs = require("fs");
const path = require("path");

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIncludes(source, expected, label) {
  assert(source.includes(expected), `${label} is missing ${JSON.stringify(expected)}`);
}

function main() {
  const store = read("lib/agent-workflow-store.ts");
  const agentRunsRoute = read("app/api/agent-runs/route.ts");
  const operatorTasksRoute = read("app/api/operator-tasks/route.ts");
  const transitionRoute = read("app/api/operator-tasks/[taskId]/transition/route.ts");
  const agentPipelineRoute = read("app/api/agents/run/route.ts");
  const workflowClient = read("components/workspace/OperatorTaskWorkflowClient.tsx");
  const tasksView = read("components/workspace/TasksView.tsx");
  const operatorValidation = read("scripts/validate-operator-os.js");

  for (const expected of [
    "AgentRunReceipt",
    "OperatorTask",
    "createAgentRunReceipt",
    "listAgentRunReceipts",
    "listOperatorTasks",
    "transitionOperatorTask",
    "allowedHumanActions",
    "agentRunReceiptStore",
    "deterministic_no_llm_call",
    "agentDecisionAuthority: \"none\"",
    "humanReviewRequired: true",
    "professionalReviewRequired: true",
    "GATES_NOT_PASSED",
    "disbursementAllowed: false",
    "receiptStatus: \"created\"",
    "taskStatus: \"open\"",
    "MISSING_EVIDENCE_REQUEST",
    "PROFESSIONAL_REVIEW_INTAKE",
    "OPERATOR_DECISION_REQUIRED",
    "BLOCKED_CONTRACT_ACTION",
    "approve_draft",
    "request_changes",
    "keep_blocked",
    "escalate_professional_review",
  ]) {
    assertIncludes(store, expected, "agent workflow store");
  }

  for (const expected of [
    "POST",
    "createAgentRunReceipt",
    "listAgentRunReceipts",
    "persistenceMode",
    "runtime_workflow_store",
  ]) {
    assertIncludes(agentRunsRoute, expected, "agent run receipt API");
  }

  for (const expected of [
    "GET",
    "listOperatorTasks",
    "AgentRunReceipt",
  ]) {
    assertIncludes(operatorTasksRoute, expected, "operator tasks API");
  }

  for (const expected of [
    "POST",
    "transitionOperatorTask",
    "allowedHumanActions",
    "humanActionRequired",
  ]) {
    assertIncludes(transitionRoute, expected, "operator task transition API");
  }

  for (const expected of [
    "latestAgentRunReceipt",
    "listAgentRunReceipts",
    "listOperatorTasks",
  ]) {
    assertIncludes(agentPipelineRoute, expected, "agent pipeline route workflow state");
  }

  for (const expected of [
    "\"use client\"",
    "OperatorTaskWorkflowClient",
    "/api/agent-runs",
    "/api/operator-tasks",
    "Run agent workflow",
    "AgentRunReceipt",
    "approve_draft",
    "request_changes",
    "keep_blocked",
    "escalate_professional_review",
    "humanActionRequired",
    "agentDecisionAuthority=none",
    "modelExecutionMode=deterministic_no_llm_call",
    "Pre-review only",
    "GATES_NOT_PASSED",
    "disbursementAllowed=false",
  ]) {
    assertIncludes(workflowClient, expected, "operator task workflow client");
  }

  assertIncludes(tasksView, "OperatorTaskWorkflowClient", "tasks page workflow mount");
  assertIncludes(operatorValidation, "OperatorTaskWorkflowClient", "operator OS validation workflow coverage");

  console.log("Agent workflow validation passed: receipts, operator tasks, human transitions, APIs, and guardrails are wired.");
}

main();
