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

  assertIncludes(runRoute, "blockerCode: gateResult.summary.blockerCode", "agent pipeline gates");
  assertIncludes(runRoute, "disbursementAllowed: readiness.disbursementAllowed", "agent pipeline decision");
}

function validateGateDecision() {
  const sharedFixture = read("lib/loan-gate-fixture.ts");
  const gateEvaluator = read("lib/gate-evaluator.ts");
  const readinessEvaluator = read("lib/readiness-evaluator.ts");
  const runRoute = read("app/api/agents/run/route.ts");
  const gatesRoute = read("app/api/agents/gates/route.ts");

  assert(!runRoute.includes("const gateChecklist = ["), "agent pipeline route must use shared gate fixture");
  assert(!gatesRoute.includes("const gateChecklist = ["), "agent gates route must use shared gate fixture");
  assertIncludes(runRoute, "evaluateLoanGates", "agent pipeline route");
  assertIncludes(runRoute, "evaluateReadiness", "agent pipeline route");
  assertIncludes(gatesRoute, "evaluateLoanGates", "agent gates route");
  assertIncludes(gatesRoute, "evaluateReadiness", "agent gates route");

  assertIncludes(gateEvaluator, "export function evaluateLoanGates", "gate evaluator");
  assertIncludes(gateEvaluator, "evidenceRecords", "gate evaluator");
  assertIncludes(gateEvaluator, "getLoanGateChecklist", "gate evaluator");
  assertIncludes(gateEvaluator, "passed: checklist.filter", "computed gate summary");
  assertIncludes(gateEvaluator, "pending: checklist.filter", "computed gate summary");
  assertIncludes(gateEvaluator, "blocked: checklist.filter", "computed gate summary");
  assertIncludes(gateEvaluator, 'blockerCode: "GATES_NOT_PASSED"', "computed gate summary");
  assertIncludes(gateEvaluator, "disbursementAllowed: false", "computed gate summary");
  assertIncludes(readinessEvaluator, "export function evaluateReadiness", "readiness evaluator");
  assertIncludes(readinessEvaluator, "gateSummary", "readiness evaluator");

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

  assertIncludes(preReviewRoute, "buildFinancingPack", "loan pre-review draft");
  assertIncludes(preReviewRoute, "financingPack.evidencePackHash", "loan pre-review draft");
  assert(!preReviewRoute.includes("receivableReadinessReport"), "loan pre-review draft must not read static readiness fixture directly");
  assert(!preReviewRoute.includes("getWorkspaceSnapshot"), "loan pre-review draft must use generated financing pack case state");
  assertIncludes(readinessFixture, "score: 62", "readiness fixture");
  assertIncludes(readinessFixture, "maxScore: 100", "readiness fixture");
  assertIncludes(readinessFixture, 'statusEn: "Pre-review only"', "readiness fixture");
  assertIncludes(preReviewRoute, 'status: "PreReview"', "loan pre-review draft");
  assertIncludes(preReviewRoute, "blockerCode: financingPack.readiness.blockerCode", "loan pre-review draft");
  assertIncludes(preReviewRoute, "disbursementAllowed: financingPack.readiness.disbursementAllowed", "loan pre-review draft");
  assertIncludes(preReviewRoute, "preReviewAllowed: financingPack.readiness.preReviewAllowed", "loan pre-review draft");
  assertIncludes(preReviewRoute, "LoanRequestRegistry.submitPreReviewRequest", "loan pre-review draft");
}

function validateRepositoryLayer() {
  const repository = read("lib/repositories/chaintrace-repository.ts");

  [
    "export type TradeCaseRecord",
    "export type EvidenceRecord",
    "export type EvidenceStatus",
    "export type EvidenceDocumentType",
    "export type GateImpact",
    "export async function getCurrentTradeCase",
    "export async function listEvidenceRecords",
    "export async function addEvidenceRecord",
    "export async function findEvidenceById",
  ].forEach((expected) => assertIncludes(repository, expected, "chaintrace repository"));

  assertIncludes(repository, "doc_po", "default evidence records");
  assertIncludes(repository, "doc_invoice", "default evidence records");
  assertIncludes(repository, "doc_packing", "default evidence records");
  assertIncludes(repository, "doc_quality", "default evidence records");
  assertIncludes(repository, "doc_vgm", "default evidence records");
  assertIncludes(repository, "doc_export_customs", "default evidence records");
  assertIncludes(repository, "doc_bl", "default evidence records");
  assertIncludes(repository, "doc_sg_permit", "default evidence records");
  assertIncludes(repository, "doc_warehouse", "default evidence records");
  assertIncludes(repository, "doc_arrival_qc", "default evidence records");
  assertIncludes(repository, "doc_acceptance", "default evidence records");
  assertIncludes(repository, 'verified: "verified"', "default verified evidence");
  assertIncludes(repository, 'uploaded: "uploaded_pending_verification"', "default pending evidence");
  assertIncludes(repository, 'missing: "missing"', "default missing evidence");
}

function validateEvidenceUploadPersistence() {
  const uploadRoute = read("app/api/evidence/upload/route.ts");

  assertIncludes(uploadRoute, "addEvidenceRecord", "evidence upload route");
  assertIncludes(uploadRoute, "evidenceId", "evidence upload response");
  assertIncludes(uploadRoute, "evidenceRecord", "evidence upload response");
  assertIncludes(uploadRoute, "NextResponse.json(", "evidence upload response");
  assertIncludes(uploadRoute, "{ status: 400 }", "evidence upload validation");
  assertIncludes(uploadRoute, "inferredEvidenceStatus", "evidence upload compatibility");
  assertIncludes(uploadRoute, "gateImpact", "evidence upload compatibility");
  assertIncludes(uploadRoute, "disbursementAllowed: false", "evidence upload guardrail");
  assertIncludes(uploadRoute, 'blockerCode: "GATES_NOT_PASSED"', "evidence upload guardrail");
}

function validateFinancingPackGeneration() {
  const builder = read("lib/financing-pack-builder.ts");
  const financingPackRoute = read("app/api/financing-pack/route.ts");

  assertIncludes(builder, "export async function buildFinancingPack", "financing pack builder");
  assertIncludes(builder, "getCurrentTradeCase", "financing pack builder");
  assertIncludes(builder, "listEvidenceRecords", "financing pack builder");
  assertIncludes(builder, "evaluateLoanGates", "financing pack builder");
  assertIncludes(builder, "evaluateReadiness", "financing pack builder");
  assertIncludes(builder, "createHash", "financing pack hash");
  assertIncludes(builder, "evidencePackHash", "financing pack hash");
  assertIncludes(builder, "LoanRequestRegistry.submitPreReviewRequest", "financing pack contract target");
  assertIncludes(builder, "disbursementAllowed: readiness.disbursementAllowed", "financing pack guardrail");
  assertIncludes(builder, "blockerCode: readiness.blockerCode", "financing pack guardrail");
  assertIncludes(financingPackRoute, "buildFinancingPack", "financing pack route");
  assertIncludes(financingPackRoute, "evidencePackHash", "financing pack route");
}

function main() {
  validateAgentPipeline();
  validateGateDecision();
  validatePreReviewDraft();
  validateRepositoryLayer();
  validateEvidenceUploadPersistence();
  validateFinancingPackGeneration();
  console.log("API contract validation passed: ChainTrace remains pre-review only, 62/100, 6/12, GATES_NOT_PASSED.");
}

main();
