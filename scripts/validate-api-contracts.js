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
  assertIncludes(gatesRoute, 'dynamic = "force-dynamic"', "agent gates route must not query durable evidence at build time");

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
  assertIncludes(preReviewRoute, "buildLoanRequestDraft(financingPack", "loan pre-review draft");
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
  const evidenceRoute = read("app/api/agents/evidence/route.ts");
  const evidenceSchema = read("docs/evidence-intake-schema.sql");

  [
    "export type TradeCaseRecord",
    "export type EvidenceRecord",
    "export type EvidenceStatus",
    "export type EvidenceDocumentType",
    "export type GateImpact",
    "export async function getCurrentTradeCase",
    "export async function listTradeCases",
    "export async function createPreReviewCase",
    "export async function listEvidenceRecords",
    "export async function addEvidenceRecord",
    "export async function findEvidenceById",
    "export function getEvidencePersistenceMode",
    "createEvidenceRepository",
    "createRuntimeEvidenceRepository",
    "createNeonEvidenceRepository",
    "@neondatabase/serverless",
    "DATABASE_URL",
    "neon_evidence_store",
    "runtime_evidence_store",
    "rawDocumentStorage",
    "caseAuditTrail",
    "initialSnapshot",
    "seededCaseEvidence",
    "jsonb",
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
  assertIncludes(evidenceRoute, 'dynamic = "force-dynamic"', "agent evidence route must not freeze evidence at build time");
  assertIncludes(evidenceRoute, "listEvidenceRecords", "agent evidence route must read durable evidence repository");
  assertIncludes(evidenceRoute, "getCurrentTradeCase", "agent evidence route must read current trade case");

  [
    "create table if not exists evidence_records",
    "evidence_payload jsonb not null",
    "raw_document_storage text not null default 'not_stored'",
    "evidence_records_trade_updated_idx",
    "evidence_records_hash_idx",
    "GATES_NOT_PASSED",
    "disbursement_allowed boolean not null default false",
  ].forEach((expected) => assertIncludes(evidenceSchema, expected, "durable evidence intake schema"));
}

function validatePublicConverterCaseCreation() {
  const casesRoute = read("app/api/cases/route.ts");
  const repository = read("lib/repositories/chaintrace-repository.ts");
  const safeRepository = read("lib/repositories/safe-chaintrace-repository.ts");
  const converter = read("components/ClientReceivableConverter.tsx");

  [
    "POST",
    "safeCreatePreReviewCase",
    "candidateHash",
    "documentHash",
    "rawDocumentStorage",
    "metadata-and-hash-only",
    "initialSnapshot",
    "auditTrail",
    "disbursementAllowed: false",
    'blockerCode: "GATES_NOT_PASSED"',
  ].forEach((expected) => assertIncludes(casesRoute, expected, "public converter case creation API"));

  [
    "CreatePreReviewCaseInput",
    "createPreReviewCase",
    "caseAuditTrail",
    "initialSnapshot",
    "rawDocumentStorage: \"not_stored\"",
    "evidenceRecordsByTradeId.set",
  ].forEach((expected) => assertIncludes(repository, expected, "pre-review case repository creation"));

  assertIncludes(safeRepository, "safeCreatePreReviewCase", "safe pre-review case creation");
  assertIncludes(converter, "Create pre-review case", "public converter create case UI");
  assertIncludes(converter, 'fetch("/api/cases"', "public converter create case API call");
  assertIncludes(converter, "router.push(`/cases/${caseId}`)", "public converter case redirect");
  assertIncludes(converter, "metadata-and-hash-only", "public converter metadata-only boundary");
  assert(!converter.includes("Apply loan"), "public converter must not claim loan application");
  assert(!converter.includes("Submit financing"), "public converter must not claim financing submission");
  assert(!converter.includes("Get approved"), "public converter must not claim approval");
  assert(!converter.includes("Disburse"), "public converter must not claim disbursement");
}

function validateEvidenceUploadPersistence() {
  const uploadRoute = read("app/api/evidence/upload/route.ts");

  assertIncludes(uploadRoute, "addEvidenceRecord", "evidence upload route");
  assertIncludes(uploadRoute, "getEvidencePersistenceMode", "evidence upload route");
  assertIncludes(uploadRoute, "persistenceMode", "evidence upload response");
  assertIncludes(uploadRoute, "runtime_evidence_store", "evidence upload fallback mode");
  assertIncludes(uploadRoute, "neon_evidence_store", "evidence upload durable mode");
  assertIncludes(uploadRoute, "evidenceId", "evidence upload response");
  assertIncludes(uploadRoute, "evidenceRecord", "evidence upload response");
  assertIncludes(uploadRoute, "NextResponse.json(", "evidence upload response");
  assertIncludes(uploadRoute, "{ status: 400 }", "evidence upload validation");
  assertIncludes(uploadRoute, "inferredEvidenceStatus", "evidence upload compatibility");
  assertIncludes(uploadRoute, "gateImpact", "evidence upload compatibility");
  assertIncludes(uploadRoute, "disbursementAllowed: false", "evidence upload guardrail");
  assertIncludes(uploadRoute, 'blockerCode: "GATES_NOT_PASSED"', "evidence upload guardrail");
}

function validateEvidenceReviewTransition() {
  const repository = read("lib/repositories/chaintrace-repository.ts");
  const reviewRoute = read("app/api/evidence/[evidenceId]/review/route.ts");

  [
    "export type EvidenceReviewAction",
    "export type EvidenceReviewReceipt",
    "export async function reviewEvidenceRecord",
    "reviewReceipts",
    "beforeStatus",
    "afterStatus",
    "reviewerRole",
    "supports_passed_gate",
    "GATES_NOT_PASSED",
    "disbursementAllowed: false",
  ].forEach((expected) => assertIncludes(repository, expected, "evidence review repository transition"));

  [
    'dynamic = "force-dynamic"',
    "safeReviewEvidenceRecord",
    "buildFinancingPack",
    "linkedTask",
    "reviewReceipt",
    "evidenceRecord",
    "gateSummary",
    "readiness",
    "evidencePackHash",
    "verify",
    "reject",
    "request_more_evidence",
    "operator",
    "professional",
    "readiness: financingPack.readiness",
  ].forEach((expected) => assertIncludes(reviewRoute, expected, "evidence review route"));
}

function validateFinancingPackGeneration() {
  const builder = read("lib/financing-pack-builder.ts");
  const financingPackRoute = read("app/api/financing-pack/route.ts");

  assertIncludes(builder, "export async function buildFinancingPack", "financing pack builder");
  assertIncludes(builder, "getCurrentTradeCase", "financing pack builder");
  assertIncludes(builder, "listEvidenceRecords", "financing pack builder");
  assertIncludes(builder, "evaluateLoanGates", "financing pack builder");
  assertIncludes(builder, "evaluateReadiness", "financing pack builder");
  assertIncludes(builder, "createHash", "financing pack builder");
  assertIncludes(builder, "evidencePackHash", "financing pack builder");
  assertIncludes(builder, "LoanRequestRegistry.submitPreReviewRequest", "financing pack builder");
  assertIncludes(builder, "raw commercial documents stay off-chain", "financing pack storage boundary");
  assertIncludes(builder, "disbursementAllowed: readiness.disbursementAllowed", "financing pack guardrail");
  assertIncludes(builder, "preReviewAllowed: readiness.preReviewAllowed", "financing pack guardrail");

  assertIncludes(financingPackRoute, "buildFinancingPack", "financing pack route");
  assertIncludes(financingPackRoute, "evidencePackHash", "financing pack route");
  assertIncludes(financingPackRoute, "contractAnchor", "financing pack route");
  assertIncludes(financingPackRoute, "blockerCode: financingPack.readiness.blockerCode", "financing pack route");
  assertIncludes(financingPackRoute, "disbursementAllowed: financingPack.readiness.disbursementAllowed", "financing pack route");
}

function validateProfessionalReviewHandoffPack() {
  const handoffBuilder = read("lib/case-review-handoff.ts");
  const handoffRoute = read("app/api/cases/[caseId]/handoff/route.ts");
  const reviewSummaryRoute = read("app/api/cases/[caseId]/review-summary/route.ts");
  const reviewPage = read("app/business-professional-review/page.tsx");
  const reviewView = read("components/workspace/ProfessionalReviewView.tsx");
  const legacyReviewRoute = read("app/api/professional-review/route.ts");
  const caseHandoffPage = read("app/cases/[caseId]/handoff/page.tsx");
  const caseReviewPage = read("app/cases/[caseId]/review/page.tsx");

  [
    "export async function getCaseReviewHandoffPack",
    "export async function getCaseReviewSummary",
    "getCaseOperatingSnapshot",
    "caseSummary",
    "evidenceSummary",
    "reviewReceiptTimeline",
    "gateStatus",
    "blockedReasons",
    "missingEvidence",
    "openExceptions",
    "recommendedNextActions",
    "boundary",
    'mode: "pre_review_only"',
    "disbursementAllowed: false",
  ].forEach((expected) => assertIncludes(handoffBuilder, expected, "professional review handoff builder"));

  assertIncludes(handoffRoute, "getCaseReviewHandoffPack", "case handoff API");
  assertIncludes(handoffRoute, "handoffPack", "case handoff API");
  assertIncludes(reviewSummaryRoute, "getCaseReviewSummary", "case review summary API");
  assertIncludes(reviewSummaryRoute, "reviewSummary", "case review summary API");
  assertIncludes(reviewPage, "getCaseReviewHandoffPack", "business professional review page");
  assertIncludes(reviewPage, "handoffPack", "business professional review page");
  assertIncludes(reviewView, "handoffPack", "professional review view");
  assertIncludes(reviewView, "handoffPack.openExceptions", "professional review view");
  assertIncludes(reviewView, "/api/cases/", "professional review open JSON action");
  assert(!reviewView.includes("professional-review-fixture"), "professional review view must not import fixture queue");
  assertIncludes(legacyReviewRoute, "getCaseReviewHandoffPack", "legacy professional review API");
  assert(!legacyReviewRoute.includes("professional-review-fixture"), "legacy professional review API must not import fixture queue");
  assertIncludes(caseHandoffPage, "getCaseReviewHandoffPack", "case handoff page");
  assertIncludes(caseReviewPage, "getCaseReviewSummary", "case review page");
}

function main() {
  validateAgentPipeline();
  validateGateDecision();
  validatePreReviewDraft();
  validateRepositoryLayer();
  validatePublicConverterCaseCreation();
  validateEvidenceUploadPersistence();
  validateEvidenceReviewTransition();
  validateFinancingPackGeneration();
  validateProfessionalReviewHandoffPack();
  console.log("API contract validation passed: ChainTrace remains pre-review only, 62/100, 6/12, GATES_NOT_PASSED.");
}

main();
