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

  assertIncludes(home, 'href="/agent"', "homepage Agent CTA");
  assertIncludes(home, 'href="/login"', "homepage login CTA");
  assertNotIncludes(home, 'href="/business-ops"', "homepage pre-login routes");
  assertNotIncludes(home, 'href="/dashboard"', "homepage pre-login routes");
  assertNotIncludes(home, 'href="/business-readiness"', "homepage pre-login routes");
  assertIncludes(publicHeader, 'href: "/agent"', "public header Agent nav");
  assertIncludes(publicHeader, 'href: "/login"', "public header login nav");
  assertNotIncludes(publicHeader, 'href: "/business-ops"', "public header pre-login nav");
  assertNotIncludes(publicHeader, 'href: "/dashboard"', "public header pre-login nav");
  assertNotIncludes(publicHeader, 'href: "/business-readiness"', "public header pre-login nav");
  assertNotIncludes(publicHeader, 'href: "/business-architecture"', "public header pre-login nav");
  assertNotIncludes(publicHeader, 'href: "/business-contracts"', "public header pre-login nav");

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
  assertNotIncludes(agent, 'href="/business-ops"', "public Agent pre-login routes");
  assertNotIncludes(agent, 'href="/dashboard"', "public Agent pre-login routes");
  assertNotIncludes(agent, 'href="/business-readiness"', "public Agent pre-login routes");

  assertIncludes(login, 'href="/business-ops"', "login simulated workspace entry");
  assertIncludes(login, 'href="/dashboard"', "login simulated dashboard entry");

  assertIncludes(businessOps, "WorkspaceFrame", "operator workspace");
  assertIncludes(businessOps, "Operator workspace", "operator workspace copy");

  assertIncludes(home, "ClientReceivableConverter", "homepage PDF-to-receivable converter");
  assertIncludes(receivableConverter, "sha256File", "client-side PDF hashing");
  assertIncludes(receivableConverter, "ReceivableCandidate", "receivable candidate model");
  assertIncludes(receivableConverter, "TradeSigningRegistry", "on-chain signing registry intent");
  assertIncludes(receivableConverter, "LogisticsEvidenceRegistry", "on-chain logistics registry intent");
  assertIncludes(receivableConverter, "LoanRequestRegistry.submitPreReviewRequest", "on-chain pre-review request intent");
  assertIncludes(receivableConverter, "RestrictedReceivableToken", "controlled receivable token intent");
  assertNotIncludes(receivableConverter, 'fetch("/api', "client converter core architecture");

  assertIncludes(architectureFixture, "Frontend + wallet layer", "frontend/blockchain technical architecture");
  assertIncludes(architectureFixture, "Smart contract protocol layer", "frontend/blockchain technical architecture");
  assertIncludes(architectureFixture, "Browser-created candidate JSON/hash", "client-side artifact model");
  assertIncludes(architectureView, "前端本地处理、钱包签名、链上合约、RPC 读链和静态部署", "technical architecture copy");
  assertNotIncludes(architectureFixture, "Next API Routes", "core technical architecture");
  assertNotIncludes(architectureFixture, "Future PostgreSQL / Object Storage / Vector Store / Indexer DB", "core technical architecture");
  assertNotIncludes(architectureView, "前端、API、Agent 服务、合约、数据库、对象存储和 CI/CD", "technical architecture copy");

  console.log("Public Agent entry validation passed: /agent is public, /business-ops remains operator workspace.");
}

main();
