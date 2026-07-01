const scenario = process.argv[2] || "case";

const scenarios = {
  evidence: ["/evidence", "/api/health"],
  case: ["/", "/dashboard", "/tasks", "/health", "/api/health"],
  handoff: ["/business-professional-review", "/api/health"],
  "production-fallback": ["/health", "/api/health", "/__chaintrace_smoke_missing_route__"],
};

const steps = scenarios[scenario];
if (!steps) {
  console.error(`Unknown scenario: ${scenario}`);
  process.exit(1);
}

for (const path of steps) {
  console.log(`smoke route: ${path}`);
}

console.log("Smoke route manifest check passed.");
