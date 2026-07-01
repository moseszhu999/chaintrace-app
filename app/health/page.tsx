import { getFallbackEvidenceRecords } from "@/lib/evidence-fallback";
import {
  getCurrentTradeCase,
  getEvidencePersistenceMode,
  listEvidenceRecords,
} from "@/lib/repositories/chaintrace-repository";

export const dynamic = "force-dynamic";

type HealthCheck = {
  label: string;
  status: "pass" | "degraded";
  message: string;
};

async function getHealthSnapshot() {
  const checks: HealthCheck[] = [];
  const persistenceMode = getEvidencePersistenceMode();
  let evidenceCount = 0;
  let fallbackEvidenceCount = 0;

  try {
    const trade = await getCurrentTradeCase();
    checks.push({
      label: "Trade case",
      status: "pass",
      message: `${trade.id} · ${trade.gateBlockerCode} · disbursementAllowed=${trade.disbursementAllowed}`,
    });

    try {
      const evidence = await listEvidenceRecords(trade.id);
      evidenceCount = evidence.length;
      checks.push({
        label: "Evidence store",
        status: "pass",
        message: `${persistenceMode} · ${evidence.length} evidence records readable`,
      });
    } catch (error) {
      const fallback = getFallbackEvidenceRecords();
      fallbackEvidenceCount = fallback.length;
      checks.push({
        label: "Evidence store",
        status: "degraded",
        message: `${persistenceMode} failed, seeded fallback available (${fallback.length}). ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  } catch (error) {
    const fallback = getFallbackEvidenceRecords();
    fallbackEvidenceCount = fallback.length;
    checks.push({
      label: "Trade case",
      status: "degraded",
      message: `Trade case read failed, seeded fallback available (${fallback.length}). ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }

  return {
    checkedAt: new Date().toISOString(),
    persistenceMode,
    evidenceCount,
    fallbackEvidenceCount,
    overallStatus: checks.some((check) => check.status === "degraded") ? "degraded" : "pass",
    checks,
  };
}

export default async function HealthPage() {
  const snapshot = await getHealthSnapshot();

  return (
    <main className="page-shell">
      <section className="hero single-column">
        <span className="eyebrow">Production health</span>
        <h1>ChainTrace working-site health check</h1>
        <p>
          Stability gate for #74 and #82. This page must render even when the durable evidence store is degraded.
        </p>
        <div className="hero-badges">
          <span className="badge-chip">overallStatus={snapshot.overallStatus}</span>
          <span className="badge-chip">persistenceMode={snapshot.persistenceMode}</span>
          <span className="badge-chip">Pre-review only</span>
          <span className="badge-chip">disbursementAllowed=false</span>
        </div>
      </section>

      <section className="workspace single-column">
        <div className="panel">
          <div className="section-heading">
            <span>Runtime checks</span>
            <h2>DB connection and fallback readiness</h2>
            <p>checkedAt={snapshot.checkedAt}</p>
          </div>
          <div className="clarity-strip">
            {snapshot.checks.map((check) => (
              <article key={check.label}>
                <span>{check.status}</span>
                <strong>{check.label}</strong>
                <p>{check.message}</p>
              </article>
            ))}
          </div>
          <p className="notice">
            Protected routes: /, /dashboard, /evidence, /tasks, /business-professional-review, /api/*.
          </p>
          <p className="proof-note">
            Boundary: no raw PDF storage by default · no lending approval · no legal opinion · no credit approval · GATES_NOT_PASSED until gates pass.
          </p>
        </div>
      </section>
    </main>
  );
}
