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
  const home = read("app/page.tsx");
  const publicHeader = read("components/PublicHeader.tsx");
  const agent = read("app/agent/page.tsx");
  const businessOps = read("app/business-ops/page.tsx");

  assertIncludes(home, 'href="/agent"', "homepage Agent CTA");
  assertNotIncludes(home, 'href="/business-ops" className="primary-button"', "homepage primary CTA");
  assertIncludes(publicHeader, 'href: "/agent"', "public header Agent nav");
  assertNotIncludes(publicHeader, 'href: "/business-ops"', "public header pre-login nav");

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
  assertIncludes(agent, 'href="/business-ops"', "public Agent workspace CTA");
  assertIncludes(agent, 'href="/business-readiness"', "public Agent readiness CTA");
  assertIncludes(agent, 'href="/api/financing-pack"', "public Agent financing pack CTA");

  assertIncludes(businessOps, "WorkspaceFrame", "operator workspace");
  assertIncludes(businessOps, "Operator workspace", "operator workspace copy");

  console.log("Public Agent entry validation passed: /agent is public, /business-ops remains operator workspace.");
}

main();
