const scenario = process.argv[2] || "case";
const baseUrl = process.env.CHAINTRACE_SMOKE_BASE_URL;
const defaultCaseId = "trade_vn_coffee_sg_2026_0007";

const scenarios = {
  evidence: ["/evidence", "/api/cases", `/api/cases/${defaultCaseId}/evidence`, "/api/health"],
  case: ["/", "/dashboard", "/tasks", "/health", "/api/cases", `/api/cases/${defaultCaseId}`, `/api/cases/${defaultCaseId}/agent-runs`, "/api/health"],
  handoff: [
    "/business-professional-review",
    `/api/cases/${defaultCaseId}/handoff`,
    `/api/cases/${defaultCaseId}/review-summary`,
    "/api/health",
  ],
  "production-fallback": ["/health", "/api/health", "/__chaintrace_smoke_missing_route__"],
};

const steps = scenarios[scenario];
if (!steps) {
  console.error(`Unknown scenario: ${scenario}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function urlFor(path) {
  if (!baseUrl) return path;
  return new URL(path, baseUrl).toString();
}

function assertBoundary(json, label) {
  assert(json && typeof json === "object", `${label}: response must be an object`);
  assert(json.boundary && typeof json.boundary === "object", `${label}: missing boundary`);
  assert(json.boundary.mode === "pre_review_only", `${label}: boundary.mode must be pre_review_only`);
  assert(json.boundary.disbursementAllowed === false, `${label}: boundary.disbursementAllowed must remain false`);
}

function assertNoDisbursementAllowedTrue(value, label) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (key === "disbursementAllowed") {
      assert(child !== true, `${label}: no disbursementAllowed=true`);
    }
    assertNoDisbursementAllowedTrue(child, `${label}.${key}`);
  }
}

function assertApiContract(json, label) {
  assert(typeof json.ok === "boolean", `${label}: missing ok boolean`);
  assertBoundary(json, label);
  assertNoDisbursementAllowedTrue(json, label);
  if (json.ok) {
    assert(json.data && typeof json.data === "object", `${label}: success response must include data object`);
  } else {
    assert(typeof json.error === "string" && json.error.length > 0, `${label}: error response must include error`);
    assert(typeof json.message === "string" && json.message.length > 0, `${label}: error response must include message`);
  }
}

async function fetchPage(path, expectedStatus = 200) {
  const response = await fetch(urlFor(path));
  assert(response.status === expectedStatus, `${path}: expected HTTP ${expectedStatus}, got ${response.status}`);
  const text = await response.text();
  assert(text.length > 0, `${path}: page response must not be blank`);
  assert(response.status < 500, `${path}: page must not white-screen with a server error`);
  console.log(`smoke page: ${path} status=${response.status}`);
  return text;
}

async function fetchApi(path, { method = "GET", body, role, expectedStatus } = {}) {
  const response = await fetch(urlFor(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(role ? { "x-chaintrace-role": role } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (expectedStatus !== undefined) {
    assert(response.status === expectedStatus, `${method} ${path}: expected HTTP ${expectedStatus}, got ${response.status}`);
  } else {
    assert(response.status < 500, `${method} ${path}: API must not return server error ${response.status}`);
  }
  const json = await response.json();
  assertApiContract(json, `${method} ${path}`);
  console.log(`smoke api: ${method} ${path} status=${response.status} ok=${json.ok}`);
  return json;
}

async function getActiveCaseId() {
  const cases = await fetchApi("/api/cases");
  return cases.data.activeCaseId || defaultCaseId;
}

async function runEvidenceSmoke() {
  await fetchPage("/evidence");
  const caseId = await getActiveCaseId();
  const evidence = await fetchApi(`/api/cases/${caseId}/evidence`);
  const reviewTarget = evidence.data.evidenceRecords.find((record) => record.id === "doc_bl")
    ?? evidence.data.evidenceRecords.find((record) => record.status !== "verified");
  assert(reviewTarget, "review evidence -> receipt persisted: needs at least one review target");

  const review = await fetchApi(`/api/evidence/${encodeURIComponent(reviewTarget.id)}/review`, {
    method: "POST",
    role: "operator",
    body: {
      action: "request_more_evidence",
      reviewerRole: "professional",
      reason: "smoke: review evidence -> receipt persisted",
    },
  });
  assert(review.data.reviewReceipt, "review evidence -> receipt persisted");
  assert(review.data.readiness, "gates/readiness recompute");

  const tasks = await fetchApi(`/api/cases/${caseId}/tasks`);
  assert(
    tasks.data.evidenceTasks.some((task) => task.evidenceId && task.gateId),
    "task queue links to evidence/gates",
  );
}

async function runCaseSmoke() {
  await fetchPage("/");
  await fetchPage("/dashboard");
  await fetchPage("/tasks");
  await fetchPage("/health");
  const caseId = await getActiveCaseId();
  await fetchApi(`/api/cases/${caseId}`);
  await fetchApi(`/api/cases/${caseId}/agent-runs`);
  const agentRun = await fetchApi(`/api/cases/${caseId}/agent-runs`, {
    method: "POST",
    role: "operator",
  });
  assert(agentRun.data.agentRunReceipt?.tradeId === caseId, "case agent run should be scoped to caseId");
}

async function runHandoffSmoke() {
  await fetchPage("/business-professional-review");
  const caseId = await getActiveCaseId();
  const handoff = await fetchApi(`/api/cases/${caseId}/handoff`);
  assert(handoff.data.handoffPack, "handoff JSON opens");
  assertBoundary({ boundary: handoff.data.handoffPack.boundary }, "handoff JSON opens");
  await fetchApi(`/api/cases/${caseId}/review-summary`);
}

async function runProductionFallbackSmoke() {
  await fetchPage("/health");
  const health = await fetchApi("/api/health");
  assert(health.data.evidenceStore, "DB down uses fallback path");
  await fetchPage("/__chaintrace_smoke_missing_route__", 404);
}

async function runHttpSmoke() {
  if (scenario === "evidence") await runEvidenceSmoke();
  if (scenario === "case") await runCaseSmoke();
  if (scenario === "handoff") await runHandoffSmoke();
  if (scenario === "production-fallback") await runProductionFallbackSmoke();
  console.log(`Working-site HTTP smoke passed for ${scenario}; no disbursementAllowed=true observed.`);
}

if (!baseUrl) {
  for (const path of steps) {
    console.log(`smoke route: ${path}`);
  }
  console.log("Smoke route manifest check passed. Set CHAINTRACE_SMOKE_BASE_URL to run HTTP workflow smoke.");
} else {
  runHttpSmoke().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
