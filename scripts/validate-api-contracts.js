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

function countMatches(source, pattern) {
  const matches = source.match(pattern);
  return matches ? matches.length : 0;
}

function validateAgentPipeline() {
  const runRoute = read("app/api/agents/run/route.ts");

  [
    "tradeId",
    "pipeline",
    "evidence",
    "gates",
    "riskMemo",
    "professionalReview",
    "machineDecision",
  ].forEach((key) => assertIncludes(runRoute, key, "agent pipeline response"));

  assertIncludes(runRoute, "blockerCode: gateSummary.blockerCode", "agent pipeline gates");
  assertIncludes(runRoute, "disbursementAllowed: gateSummary.disbursementAllowed", "agent pipeline decision");
}

function validateGateDecision() {
  const sharedFixture = read("lib/loan-gate-fixture.ts");
  const runRoute = read("app/api/agents/run/route.ts");
  const gatesRoute = read("app/api/agents/gates/route.ts");

  assert(!runRoute.includes("const gateChecklist = ["), "agent pipeline route must use shared gate fixture");
  assert(!gatesRoute.includes("const gateChecklist = ["), "agent gates route must use shared gate fixture");
  assertIncludes(runRoute, "getLoanGateChecklist", "agent pipeline route");
  assertIncludes(runRoute, "getLoanGateSummary", "agent pipeline route");
  assertIncludes(gatesRoute, "getLoanGateChecklist", "agent gates route");
  assertIncludes(gatesRoute, "getLoanGateSummary", "agent gates route");

  assert(countMatches(sharedFixture, /status: "passed"/g) === 6, "shared gate fixture must keep exactly 6 passed gates");
  assert(countMatches(sharedFixture, /status: "pending"/g) === 2, "shared gate fixture must keep exactly 2 pending gates");
  assert(countMatches(sharedFixture, /status: "blocked"/g) === 4, "shared gate fixture must keep exactly 4 blocked gates");
  assertIncludes(sharedFixture, 'blockerCode: "GATES_NOT_PASSED"', "shared gate summary");
  assertIncludes(sharedFixture, "disbursementAllowed: false", "shared gate summary");
  assertIncludes(sharedFixture, "preReviewAllowed: true", "shared gate summary");
}

function validatePreReviewDraft() {
  const preReviewRoute = read("app/api/loan-requests/pre-review/route.ts");
  const readinessFixture = read("lib/receivable-readiness-fixture.ts");

  assertIncludes(readinessFixture, "score: 62", "readiness fixture");
  assertIncludes(readinessFixture, "maxScore: 100", "readiness fixture");
  assertIncludes(readinessFixture, 'statusEn: "Pre-review only"', "readiness fixture");
  assertIncludes(preReviewRoute, 'status: "PreReview"', "loan pre-review draft");
  assertIncludes(preReviewRoute, 'blockerCode: "GATES_NOT_PASSED"', "loan pre-review draft");
  assertIncludes(preReviewRoute, "disbursementAllowed: false", "loan pre-review draft");
  assertIncludes(preReviewRoute, "preReviewAllowed: true", "loan pre-review draft");
  assertIncludes(preReviewRoute, "LoanRequestRegistry.submitPreReviewRequest", "loan pre-review draft");
}

function main() {
  validateAgentPipeline();
  validateGateDecision();
  validatePreReviewDraft();
  console.log("API contract validation passed: ChainTrace remains pre-review only, 62/100, 6/12, GATES_NOT_PASSED.");
}

main();
