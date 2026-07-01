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

function assertNotIncludes(source, unexpected, label) {
  assert(!source.includes(unexpected), `${label} must not include ${JSON.stringify(unexpected)}`);
}

function main() {
  const readme = read("README.md");
  const home = read("app/page.tsx");
  const publicHeader = read("components/PublicHeader.tsx");
  const agent = read("app/agent/page.tsx");
  const login = read("components/LoginPage.tsx");
  const businessOps = read("app/business-ops/page.tsx");
  const architectureFixture = read("lib/business-architecture-fixture.ts");
  const architectureView = read("components/workspace/BusinessArchitectureView.tsx");
  const receivableConverter = read("components/ClientReceivableConverter.tsx");
  const publicSources = [
    ["README", readme],
    ["homepage", home],
    ["public Agent page", agent],
    ["login page", login],
  ];
  const publicRouteSources = [
    ["homepage", home],
    ["public Agent page", agent],
    ["public header", publicHeader],
    ["client receivable converter", receivableConverter],
  ];
  const workspaceRouteHrefs = [
    'href="/business-ops"',
    'href="/business-contracts"',
    'href="/business-readiness"',
    'href="/business-architecture"',
    'href="/business-loan"',
    'href="/business-logistics"',
    'href="/business-signing"',
    'href="/business-wallet"',
    'href="/dashboard"',
  ];

  for (const [label, source] of publicSources) {
    assertNotIncludes(source, "turns cross-border trade PDFs and logistics evidence into finance-ready receivables", label);
    assertNotIncludes(source, "Turn cross-border trade PDFs into finance-ready receivables", label);
    assertNotIncludes(source, "finance-ready receivable", label);
    assertNotIncludes(source, "finance-ready receivables", label);
    assertNotIncludes(source, "把跨境贸易 PDF 变成可融资应收账款", label);
    assertNotIncludes(source, "变成可融资应收账款", label);
    assertNotIncludes(source, "turns the Vietnam coffee export to Singapore into a demo-ready financing evidence cockpit", label);
    assertNotIncludes(source, "把越南咖啡出口新加坡这笔交易做成一个可演示的融资证据驾驶舱", label);
  }

  for (const [label, source] of publicRouteSources) {
    for (const href of workspaceRouteHrefs) {
      assertNotIncludes(source, href, `${label} public route boundary`);
    }
  }

  assertIncludes(home, 'href="/agent"', "homepage Agent CTA");
  assertIncludes(home, 'href="/login"', "homepage login CTA");
  assertIncludes(publicHeader, 'href: "/agent"', "public header Agent nav");
  assertIncludes(publicHeader, 'href: "/login"', "public header login nav");
  assertIncludes(publicHeader, 'href: "/#pdf-to-receivable"', "public header create case nav");

  assertIncludes(agent, "PublicHeader", "public Agent page");
  assertNotIncludes(agent, "WorkspaceFrame", "public Agent page");
  assertNotIncludes(agent, "WorkspaceShell", "public Agent page");
  assertIncludes(agent, "Vietnam Robusta", "public Agent case story");
  assertIncludes(agent, "USD 52,800", "public Agent case metrics");
  assertIncludes(agent, "USD 36,960", "public Agent case metrics");
  assertIncludes(agent, "USDC 29,500", "public Agent case metrics");
  assertIncludes(agent, "Pre-review only", "public Agent guardrail");
  assertIncludes(agent, "GATES_NOT_PASSED", "public Agent guardrail");
  assertIncludes(agent, "disbursementAllowed=false", "public Agent guardrail");
  assertIncludes(agent, 'href="/login"', "public Agent login CTA");
  assertIncludes(agent, 'href="/api/financing-pack"', "public Agent financing pack API CTA");

  assertNotIncludes(login, 'href="/business-ops"', "login should not default to reference Agent route");
  assertIncludes(login, 'href="/dashboard"', "login dashboard entry");
  assertIncludes(login, 'href="/cases"', "login case list entry");

  assertIncludes(businessOps, "WorkspaceFrame", "operator workspace");
  assertIncludes(businessOps, "Operator workspace", "operator workspace copy");

  assertIncludes(home, "ClientReceivableConverter", "homepage PDF-to-receivable converter");
  assertIncludes(receivableConverter, "sha256File", "client-side PDF hashing");
  assertIncludes(receivableConverter, "ReceivableCandidate", "receivable candidate model");
  assertIncludes(receivableConverter, "TradeSigningRegistry", "on-chain signing registry intent");
  assertIncludes(receivableConverter, "LogisticsEvidenceRegistry", "on-chain logistics registry intent");
  assertIncludes(receivableConverter, "LoanRequestRegistry.submitPreReviewRequest", "on-chain pre-review request intent");
  assertIncludes(receivableConverter, "RestrictedReceivableToken", "controlled receivable token intent");
  assertIncludes(receivableConverter, "Create pre-review case", "public converter case creation CTA");
  assertIncludes(receivableConverter, 'fetch("/api/cases"', "public converter creates pre-review case");
  assertIncludes(receivableConverter, "router.push(`/cases/${caseId}`)", "public converter redirects to created case");
  assertIncludes(receivableConverter, "candidate preview remains visible", "public converter preserves candidate preview before creation");
  assertIncludes(receivableConverter, "metadata-and-hash-only", "public converter no raw PDF upload boundary");
  assertNotIncludes(receivableConverter, 'fetch("/api/evidence/upload"', "client converter must not upload raw evidence file");
  assertIncludes(receivableConverter, "AI-native", "AI-native evidence extraction preview");
  assertIncludes(receivableConverter, "agentExtractionReceipt", "AI-native extraction receipt model");
  assertIncludes(receivableConverter, "agentRunStatus: \"preview_only\"", "AI-native preview status");
  assertIncludes(receivableConverter, "modelExecutionMode: \"demo_fixture_no_llm_call\"", "AI-native no real LLM guardrail");
  assertIncludes(receivableConverter, "agentDecisionAuthority: \"none\"", "AI-native no autonomous approval guardrail");
  assertIncludes(receivableConverter, "humanReviewRequired: true", "AI-native human review guardrail");
  assertIncludes(receivableConverter, "professionalReviewRequired: true", "AI-native professional review guardrail");
  assertIncludes(receivableConverter, "extractedFields", "AI-native extracted fields");
  assertIncludes(receivableConverter, "gateReasoningTrace", "AI-native gate reasoning trace");
  assertIncludes(receivableConverter, "missingEvidenceSuggestions", "AI-native missing evidence suggestions");
  assertIncludes(receivableConverter, "draftNextActions", "AI-native draft next actions");
  assertIncludes(receivableConverter, "rawPdfPolicy: \"raw PDF stays browser-local / off-chain\"", "AI-native raw PDF boundary");
  assertIncludes(receivableConverter, "agentDecisionAuthority=none", "AI-native UI guardrail");
  assertIncludes(receivableConverter, "humanReviewRequired=true", "AI-native UI guardrail");
  assertIncludes(receivableConverter, "EIP-712 typed data preview", "wallet typed data preview");
  assertIncludes(receivableConverter, "typedDataPreview", "wallet typed data preview model");
  assertIncludes(receivableConverter, "primaryType: \"ReceivableCandidate\"", "wallet typed data preview primary type");
  assertIncludes(receivableConverter, "documentHash", "wallet typed data preview document hash");
  assertIncludes(receivableConverter, "candidateHash", "wallet typed data preview candidate hash");
  assertIncludes(receivableConverter, "verifyingContract", "wallet typed data preview domain");
  assertIncludes(receivableConverter, "walletSignatureStatus=not_requested", "wallet typed data guardrail");
  assertIncludes(receivableConverter, "professionalReviewRequired", "wallet typed data guardrail");
  assertIncludes(receivableConverter, "raw PDF stays browser-local / off-chain", "wallet typed data guardrail");
  assertIncludes(receivableConverter, "Signature receipt preview", "signature receipt preview");
  assertIncludes(receivableConverter, "signatureReceiptPreview", "signature receipt preview model");
  assertIncludes(receivableConverter, "signatureStatus: \"preview_only\"", "signature receipt preview status");
  assertIncludes(receivableConverter, "signerWallet", "signature receipt preview signer");
  assertIncludes(receivableConverter, "signedAt: null", "signature receipt preview timestamp");
  assertIncludes(receivableConverter, "registryHandoffPreview", "registry handoff preview model");
  assertIncludes(receivableConverter, "LoanRequestRegistry handoff preview", "registry handoff preview");
  assertIncludes(receivableConverter, "allowedAction: \"PRE_REVIEW_ONLY\"", "registry handoff guardrail");
  assertIncludes(receivableConverter, "contracts block formal disbursement while gates fail", "registry handoff guardrail");
  assertIncludes(receivableConverter, "Pre-review Trust Pack preview", "professional trust pack preview");
  assertIncludes(receivableConverter, "preReviewTrustPack", "professional trust pack model");
  assertIncludes(receivableConverter, "packVersion: \"pre-review-trust-pack.v0.1\"", "professional trust pack version");
  assertIncludes(receivableConverter, "professionalHandoffStatus: \"preview_only\"", "professional trust pack preview-only status");
  assertIncludes(receivableConverter, "professionalHandoffAudience", "professional trust pack audience");
  assertIncludes(receivableConverter, "typedDataSummary", "professional trust pack typed data summary");
  assertIncludes(receivableConverter, "readinessScore: 62", "professional trust pack readiness");
  assertIncludes(receivableConverter, "gatesPassed: \"6/12\"", "professional trust pack gates");
  assertIncludes(receivableConverter, "missingEvidence", "professional trust pack missing evidence");
  assertIncludes(receivableConverter, "recommendedNextActions", "professional trust pack next actions");
  assertIncludes(receivableConverter, "not a legal opinion", "professional trust pack legal boundary");
  assertIncludes(receivableConverter, "not a credit approval", "professional trust pack credit boundary");
  assertIncludes(receivableConverter, "professional review required before any formal financing action", "professional trust pack review boundary");
  assertIncludes(receivableConverter, "Professional Review Intake preview", "professional review intake preview");
  assertIncludes(receivableConverter, "professionalReviewIntake", "professional review intake model");
  assertIncludes(receivableConverter, "intakeVersion: \"professional-review-intake.v0.1\"", "professional review intake version");
  assertIncludes(receivableConverter, "intakeStatus: \"draft_preview\"", "professional review intake draft status");
  assertIncludes(receivableConverter, "source: \"public_converter\"", "professional review intake source");
  assertIncludes(receivableConverter, "reviewQueues", "professional review intake queues");
  assertIncludes(receivableConverter, "bankReviewRequired: true", "professional review intake bank queue");
  assertIncludes(receivableConverter, "legalReviewRequired: true", "professional review intake legal queue");
  assertIncludes(receivableConverter, "factorReviewRequired: true", "professional review intake factor queue");
  assertIncludes(receivableConverter, "operatorDecisionRequired: true", "professional review intake operator decision");
  assertIncludes(receivableConverter, "targetOperatorSurfaces", "professional review intake Operator OS link");
  assertIncludes(receivableConverter, "PROFESSIONAL_REVIEW_INTAKE_ONLY", "professional review intake allowed action");
  assertIncludes(receivableConverter, "intakeStatus=draft_preview", "professional review intake UI guardrail");
  assertIncludes(receivableConverter, "allowedAction=", "professional review intake UI guardrail");
  assertIncludes(receivableConverter, "has not been submitted", "professional review intake no submission boundary");
  assertIncludes(receivableConverter, "No backend persistence", "professional review intake no persistence boundary");
  assertIncludes(receivableConverter, "Open Operator OS after login", "professional review intake login CTA");
  assertIncludes(receivableConverter, "Professional Review Intake JSON", "professional review intake copyable JSON");
  assertNotIncludes(receivableConverter, "signTypedData", "wallet typed data no signing");
  assertNotIncludes(receivableConverter, "eth_signTypedData_v4", "signature receipt no real signing");
  assertNotIncludes(receivableConverter, "sendTransaction", "registry handoff no transaction");
  assertNotIncludes(receivableConverter, "JsonRpcProvider", "registry handoff no RPC provider");
  assertNotIncludes(receivableConverter, "window.ethereum", "wallet typed data no wallet popup");
  assertNotIncludes(receivableConverter, "privateKey", "wallet typed data no key handling");
  assertNotIncludes(receivableConverter, "process.env", "wallet typed data no secrets");
  assertNotIncludes(receivableConverter, "OPENAI_API_KEY", "AI-native preview no API key");
  assertNotIncludes(receivableConverter, "ANTHROPIC_API_KEY", "AI-native preview no API key");
  assertNotIncludes(receivableConverter, "loan approved", "professional trust pack no approval claim");
  assertNotIncludes(receivableConverter, "financing approved", "professional trust pack no approval claim");
  assertNotIncludes(receivableConverter, "disbursement approved", "professional trust pack no approval claim");
  assertNotIncludes(receivableConverter, "legal opinion issued", "professional trust pack no legal opinion claim");
  assertNotIncludes(receivableConverter, "credit approval granted", "professional trust pack no credit approval claim");
  assertNotIncludes(receivableConverter, "reviewerAssigned", "professional review intake no reviewer mutation");
  assertNotIncludes(receivableConverter, "sendEmail", "professional review intake no notification");
  assertNotIncludes(receivableConverter, "notifyReviewer", "professional review intake no notification");

  assertIncludes(architectureFixture, "Frontend + wallet layer", "frontend/blockchain technical architecture");
  assertIncludes(architectureFixture, "Smart contract protocol layer", "frontend/blockchain technical architecture");
  assertIncludes(architectureFixture, "Browser-created candidate JSON/hash", "client-side artifact model");
  assertIncludes(architectureView, "前端本地处理、钱包签名、链上合约、RPC 读链和静态部署", "technical architecture copy");
  assertNotIncludes(architectureFixture, "Next API Routes", "core technical architecture");
  assertNotIncludes(architectureFixture, "Future PostgreSQL / Object Storage / Vector Store / Indexer DB", "core technical architecture");
  assertNotIncludes(architectureView, "前端、API、Agent 服务、合约、数据库、对象存储和 CI/CD", "technical architecture copy");

  console.log("Public Agent entry validation passed: public CTA creates a case, login enters dashboard/cases, /agent remains public story.");
}

main();
