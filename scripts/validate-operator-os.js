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
  const dashboardRoute = read("app/dashboard/page.tsx");
  const workspaceNav = read("lib/workspace-navigation.ts");
  const factSources = [
    dashboard,
    read("lib/concrete-trade-fixture.ts"),
    read("lib/loan-contract-fixture.ts"),
    read("lib/receivable-readiness-fixture.ts"),
  ].join("\n");

  assertIncludes(dashboardRoute, "DashboardView", "dashboard route");
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

  console.log("Operator OS validation passed: dashboard exposes metrics, queues, workflow, and responsibility boundaries.");
}

main();
