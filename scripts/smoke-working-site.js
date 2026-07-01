const fs = require("fs");
const path = require("path");

const root = process.cwd();
const requestedMode = process.argv[2] || "all";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertFile(relativePath) {
  assert(fs.existsSync(path.join(root, relativePath)), `${relativePath} must exist`);
  return read(relativePath);
}

function assertIncludes(source, expected, label) {
  assert(source.includes(expected), `${label} is missing ${JSON.stringify(expected)}`);
}

function validateUnifiedApiContract() {
  const apiResponse = assertFile("lib/api-response.ts");
  assertIncludes(apiResponse, "chaintraceApiBoundary", "API boundary helper");
  assertIncludes(apiResponse, "mode: \"pre_review_only\"", "API boundary helper");
  assertIncludes(apiResponse, "blockerCode: \"GATES_NOT_PASSED\"", "API boundary helper");
  assertIncludes(apiResponse, "disbursementAllowed: false", "API boundary helper");
  assertIncludes(apiResponse, "chaintraceApiOk", "API success helper");
  assertIncludes(apiResponse, "chaintraceApiError", "API error helper");
  assertIncludes(apiResponse, "ok: true", "API success helper");
  assertIncludes(apiResponse, "ok: false", "API error helper");
  assertIncludes(apiResponse, "boundary: chaintraceApiBoundary", "API boundary helper");
}

function validateEvidenceSmoke() {
  validateUnifiedApiContract();

  const evidencePage = assertFile("app/evidence/page.tsx");
  const uploadRoute = assertFile("app/api/evidence/upload/route.ts");
  const reviewRoute = assertFile("app/api/evidence/[evidenceId]/review/route.ts");

  assertIncludes(evidencePage, "try", "evidence page fallback");
  assertIncludes(evidencePage, "getFallbackEvidenceRecords", "evidence page fallback");
  assertIncludes(evidencePage, "Falling back to seeded evidence records", "evidence page fallback");

  [uploadRoute, reviewRoute].forEach((route, index) => {
    const label = index === 0 ? "evidence upload route" : "evidence review route";
    assertIncludes(route, "chaintraceApiOk", label);
    assertIncludes(route, "chaintraceApiError", label);
    assertIncludes(route, "chaintraceGuardrails", label);
    assertIncludes(route, "accepted", label);
    assertIncludes(route, "disbursementAllowed", label);
  });

  assertIncludes(uploadRoute, "metadata-and-hash-only", "evidence upload storage boundary");
  assertIncludes(reviewRoute, "reviewReceipt", "evidence review receipt");
  assertIncludes(reviewRoute, "EVIDENCE_NOT_FOUND", "evidence review structured error");
}

function validateCaseSmoke() {
  const repository = assertFile("lib/repositories/chaintrace-repository.ts");
  const workspaceContext = assertFile("lib/workspace-route-context.ts");

  assertIncludes(repository, "export type TradeCaseRecord", "case repository");
  assertIncludes(repository, "export type EvidenceRecord", "case repository");
  assertIncludes(repository, "export async function getCurrentTradeCase", "case repository");
  assertIncludes(repository, "export async function getTradeCaseById", "case repository");
  assertIncludes(repository, "export async function listEvidenceRecords", "case repository");
  assertIncludes(repository, "gateBlockerCode: \"GATES_NOT_PASSED\"", "case guardrail");
  assertIncludes(repository, "disbursementAllowed: false", "case guardrail");
  assertIncludes(workspaceContext, "getWorkspaceRouteContext", "workspace route context");
}

function validateHandoffSmoke() {
  const professionalPage = assertFile("app/business-professional-review/page.tsx");
  const professionalView = assertFile("components/workspace/ProfessionalReviewView.tsx");

  assertIncludes(professionalPage, "getProfessionalReviewEvidenceRecords", "professional review fallback loader");
  assertIncludes(professionalPage, "getFallbackEvidenceRecords", "professional review fallback loader");
  assertIncludes(professionalPage, "Falling back to seeded evidence records", "professional review fallback loader");
  assertIncludes(professionalView, "evidenceRecords", "professional review handoff input");
  assertIncludes(professionalView, "reviewReceipt", "professional review receipt history");
  assertIncludes(professionalView, "disbursementAllowed=false", "professional review boundary");
}

function validateProductionFallbackSmoke() {
  validateUnifiedApiContract();

  const healthApi = assertFile("app/api/health/route.ts");
  const healthPage = assertFile("app/health/page.tsx");
  const errorPage = assertFile("app/error.tsx");
  const notFoundPage = assertFile("app/not-found.tsx");
  const loadingPage = assertFile("app/loading.tsx");
  const packageJson = assertFile("package.json");

  assertIncludes(healthApi, "chaintraceApiOk", "health API");
  assertIncludes(healthApi, "getEvidencePersistenceMode", "health API DB mode check");
  assertIncludes(healthApi, "getFallbackEvidenceRecords", "health API fallback check");
  assertIncludes(healthApi, "overallStatus", "health API status");
  assertIncludes(healthPage, "working-site health check", "health page");
  assertIncludes(healthPage, "DB connection and fallback readiness", "health page");
  assertIncludes(errorPage, "Error boundary", "global error page");
  assertIncludes(notFoundPage, "Not found", "not-found page");
  assertIncludes(loadingPage, "Loading", "loading page");
  assertIncludes(packageJson, "smoke:evidence", "package scripts");
  assertIncludes(packageJson, "smoke:production-fallback", "package scripts");
}

const modes = {
  evidence: validateEvidenceSmoke,
  case: validateCaseSmoke,
  handoff: validateHandoffSmoke,
  "production-fallback": validateProductionFallbackSmoke,
};

function main() {
  if (requestedMode === "all") {
    Object.entries(modes).forEach(([name, validate]) => {
      validate();
      console.log(`smoke:${name} passed`);
    });
    return;
  }

  const validate = modes[requestedMode];
  assert(validate, `Unknown smoke mode: ${requestedMode}`);
  validate();
  console.log(`smoke:${requestedMode} passed`);
}

main();
