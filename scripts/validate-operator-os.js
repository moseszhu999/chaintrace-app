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
  const dashboard = read("components/workspace/DashboardView.tsx");
  const tasksView = read("components/workspace/TasksView.tsx");
  const tasksRoute = read("app/tasks/page.tsx");
  const styles = read("components/workspace/WorkspaceViews.module.css");
  const dashboardRoute = read("app/dashboard/page.tsx");
  const workspaceNav = read("lib/workspace-navigation.ts");
  const factSources = [
    dashboard,
    read("lib/concrete-trade-fixture.ts"),
    read("lib/loan-contract-fixture.ts"),
    read("lib/receivable-readiness-fixture.ts"),
  ].join("\n");

  assertIncludes(dashboardRoute, "DashboardView", "dashboard route");
  assertIncludes(tasksRoute, "TasksView", "task center route");
  assertIncludes(workspaceNav, 'href: "/dashboard"', "workspace navigation dashboard entry");
  assertIncludes(dashboard, "activeTrade.totalAmount", "dashboard first-screen trade value binding");
  assertIncludes(dashboard, "receivableLoanContract.receivableAmount", "dashboard first-screen blocked receivable binding");
  assertIncludes(dashboard, "receivableLoanContract.advanceAmount", "dashboard first-screen requested advance binding");
  assertIncludes(dashboard, "receivableReadinessReport.score", "dashboard first-screen readiness binding");
  assertIncludes(dashboard, "loanGates.filter", "dashboard first-screen gate binding");

  for (const expected of [
    "Operator OS",
    "USD 52,800",
    "USD 36,960",
    "USDC 29,500",
    "62/100",
    "6/12",
    "GATES_NOT_PASSED",
    "disbursementAllowed=false",
  ]) {
    assertIncludes(factSources, expected, "dashboard first-screen operating facts");
  }

  for (const expected of [
    "statusStrip",
    "commandGrid",
    "workflowConsole",
    "decisionRail",
    "queueTable",
    "responsibilityMatrix",
  ]) {
    assertIncludes(dashboard, expected, "dashboard command-console structure");
    assertIncludes(styles, expected, "dashboard command-console styles");
  }

  for (const expected of [
    "Next human decision",
    "Agent prepared",
    "Approve chasing",
    "View readiness",
    "Escalate review",
  ]) {
    assertIncludes(dashboard, expected, "dashboard decision rail");
  }

  for (const expected of [
    "Evidence inbox",
    "Agent extracted fields",
    "Gate mismatches",
    "Missing documents",
    "Human approvals needed",
    "Professional review pending",
    "Contract actions blocked",
  ]) {
    assertIncludes(dashboard, expected, "dashboard operational queues");
  }

  for (const expected of [
    "PDF / evidence intake",
    "browser-local hash / candidate creation",
    "Agent classification",
    "gate evaluation",
    "gap chasing",
    "financing pack",
    "human / professional review",
    "LoanRequestRegistry pre-review",
    "contract gate check",
    "restricted receivable token / loan conversion only after approval",
  ]) {
    assertIncludes(dashboard, expected, "dashboard workflow map");
  }

  for (const expected of ["Agent does", "Operator does", "Professional institution does", "Contract does"]) {
    assertIncludes(dashboard, expected, "dashboard responsibility split");
  }

  for (const expected of [
    "operatorIntakeMirror",
    "Intake queue mirror",
    "source",
    "public_converter",
    "intakeStatus",
    "draft_preview",
    "allowedAction",
    "PROFESSIONAL_REVIEW_INTAKE_ONLY",
    "Bank pre-review",
    "Legal exception",
    "Factor operations",
    "Operator evidence desk",
    "humanReviewRequired=true",
    "professionalReviewRequired=true",
    "agentDecisionAuthority=none",
  ]) {
    assertIncludes(dashboard, expected, "dashboard intake queue mirror");
  }

  for (const expected of [
    "operatorDecisionReceiptPreview",
    "Operator decision receipt preview",
    "receiptVersion",
    "operator-decision-receipt.v0.1",
    "sourceIntakeStatus",
    "selectedDecision",
    "selectedDecision=null",
    "allowedAction",
    "OPERATOR_DECISION_RECEIPT_PREVIEW_ONLY",
    "availableDecisionOptions",
    "recommendedPreviewPath",
    "escalationHandoffTarget",
    "Professional escalation handoff preview",
    "not submitted, not persisted, not assigned, not notified",
    "decisionStatus=not_started",
  ]) {
    assertIncludes(dashboard, expected, "dashboard operator decision receipt preview");
  }

  for (const expected of [
    "OperatorTaskWorkflowClient",
    "AgentRunReceipt workflow",
    "Run agent workflow",
    "/api/agent-runs",
    "/api/operator-tasks",
    "humanActionRequired=true",
    "agentDecisionAuthority=none",
    "modelExecutionMode=deterministic_no_llm_call",
    "GATES_NOT_PASSED",
    "disbursementAllowed=false",
  ]) {
    assertIncludes(tasksView + read("components/workspace/OperatorTaskWorkflowClient.tsx"), expected, "tasks real agent workflow");
  }

  console.log("Operator OS validation passed: dashboard exposes status strip, workflow console, decision rail, queues, intake mirror, decision receipt preview, real agent workflow tasks, and responsibility boundaries.");
}

main();
