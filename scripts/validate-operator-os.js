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
  const dashboard = read("components/workspace/DashboardOperatingSnapshotView.tsx");
  const evidenceView = read("components/workspace/EvidenceView.tsx");
  const evidenceRoute = read("app/evidence/page.tsx");
  const tasksView = read("components/workspace/TasksView.tsx");
  const tasksRoute = read("app/tasks/page.tsx");
  const professionalReviewPage = read("app/business-professional-review/page.tsx");
  const professionalReviewView = read("components/workspace/ProfessionalReviewView.tsx");
  const legacyProfessionalReviewRoute = read("app/api/professional-review/route.ts");
  const handoffRoute = read("app/api/cases/[caseId]/handoff/route.ts");
  const reviewSummaryRoute = read("app/api/cases/[caseId]/review-summary/route.ts");
  const handoffBuilder = read("lib/case-review-handoff.ts");
  const styles = read("components/workspace/WorkspaceViews.module.css");
  const dashboardRoute = read("app/dashboard/page.tsx");
  const workspaceNav = read("lib/workspace-navigation.ts");
  const factSources = [
    dashboard,
    read("lib/concrete-trade-fixture.ts"),
    read("lib/loan-contract-fixture.ts"),
    read("lib/receivable-readiness-fixture.ts"),
  ].join("\n");

  assertIncludes(dashboardRoute, "DashboardOperatingSnapshotView", "dashboard route");
  assertIncludes(dashboardRoute, "getCaseOperatingSnapshot", "dashboard route");
  assertIncludes(tasksRoute, "TasksView", "task center route");
  assertIncludes(workspaceNav, 'href: "/dashboard"', "workspace navigation dashboard entry");
  assertIncludes(dashboard, "snapshot.case", "dashboard operating snapshot active case");
  assertIncludes(dashboard, "snapshot.evidenceSummary", "dashboard operating snapshot evidence summary");
  assertIncludes(dashboard, "snapshot.gates.summary", "dashboard operating snapshot gate summary");
  assertIncludes(dashboard, "snapshot.readiness", "dashboard operating snapshot readiness");
  assertIncludes(dashboard, "snapshot.tasks", "dashboard operating snapshot evidence-linked tasks");
  assertIncludes(dashboard, "snapshot.reviewReceipts", "dashboard operating snapshot review receipts");
  assertIncludes(dashboard, "snapshot.nextHumanAction", "dashboard operating snapshot next human action");
  assertIncludes(dashboard, "snapshot.boundary.mode", "dashboard operating snapshot boundary");

  for (const expected of [
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
    "Active case command center",
    "Next human action",
    "Blocked gates",
    "Open tasks",
    "Latest receipts",
    "Open evidence",
    "View tasks",
    "Handoff",
  ]) {
    assertIncludes(dashboard, expected, "dashboard operating snapshot surface");
  }

  for (const expected of [
    "OperatorTaskWorkflowClient",
    "Task queue workflow",
    "Evidence actions now generate tasks",
    "Run agent workflow",
    "evidenceTasks",
    "/api/agent-runs",
    "/api/operator-tasks",
    "/api/tasks/",
    "humanActionRequired",
    "agentDecisionAuthority=none",
    "sourceReviewReceipt",
    "GATES_NOT_PASSED",
    "disbursementAllowed=false",
  ]) {
    assertIncludes(tasksView + read("components/workspace/OperatorTaskWorkflowClient.tsx"), expected, "tasks real agent workflow");
  }

  for (const expected of [
    "initialEvidenceRecords",
    "reviewEvidence",
    "/api/evidence/",
    "/review",
    "Verify evidence",
    "Reject evidence",
    "Request more evidence",
    "reviewReceipt",
    "evidencePackHash",
    "GATES_NOT_PASSED",
    "disbursementAllowed=false",
  ]) {
    assertIncludes(evidenceView, expected, "evidence page real review transition");
  }

  for (const expected of [
    "listEvidenceRecords",
    "getCurrentTradeCase",
    "initialEvidenceRecords",
  ]) {
    assertIncludes(evidenceRoute, expected, "evidence route durable records");
  }

  for (const expected of [
    "getCaseReviewHandoffPack",
    "handoffPack",
  ]) {
    assertIncludes(professionalReviewPage, expected, "professional review page handoff pack");
  }

  for (const expected of [
    "handoffPack.caseSummary",
    "handoffPack.evidenceSummary",
    "handoffPack.reviewReceiptTimeline",
    "handoffPack.gateStatus",
    "handoffPack.blockedReasons",
    "handoffPack.missingEvidence",
    "handoffPack.openExceptions",
    "handoffPack.recommendedNextActions",
    "handoffPack.boundary",
    "Open JSON",
    "not a legal opinion",
    "not a credit approval",
    "disbursementAllowed=false",
  ]) {
    assertIncludes(professionalReviewView, expected, "professional review handoff UI");
  }
  assert(!professionalReviewView.includes("professional-review-fixture"), "professional review page must not read fixture queue");
  assertIncludes(handoffRoute, "getCaseReviewHandoffPack", "case handoff API route");
  assertIncludes(legacyProfessionalReviewRoute, "getCaseReviewHandoffPack", "legacy professional review API route");
  assert(!legacyProfessionalReviewRoute.includes("professional-review-fixture"), "legacy professional review API route must not read fixture queue");
  assertIncludes(reviewSummaryRoute, "getCaseReviewSummary", "case review summary API route");
  assertIncludes(handoffBuilder, "reviewReceiptTimeline", "case review handoff pack");
  assertIncludes(styles, "list", "workspace list styles");

  console.log("Operator OS validation passed: dashboard reads operating snapshot, evidence/tasks mutate shared state, and professional review reads the handoff pack boundary.");
}

main();
