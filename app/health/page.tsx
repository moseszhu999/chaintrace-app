import { preReviewBoundary } from "@/lib/api-response";
import { safeGetCurrentTradeCase, safeListEvidenceRecords } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

async function getHealthSnapshot() {
  try {
    const trade = await safeGetCurrentTradeCase();
    const evidence = await safeListEvidenceRecords(trade.id);
    return {
      ok: true as const,
      status: evidence.store.fallbackActive ? "degraded" : "ok",
      checkedAt: new Date().toISOString(),
      caseId: trade.id,
      evidenceCount: evidence.records.length,
      evidenceStore: evidence.store,
    };
  } catch (error) {
    return {
      ok: false as const,
      status: "error",
      checkedAt: new Date().toISOString(),
      message: error instanceof Error ? error.message : "Unknown health check error.",
    };
  }
}

export default async function HealthPage() {
  const snapshot = await getHealthSnapshot();

  return (
    <main style={{ minHeight: "100vh", padding: "48px", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", background: "#07111f", color: "#e5edf7" }}>
      <section style={{ maxWidth: "960px", margin: "0 auto" }}>
        <p style={{ color: "#8fb3d9", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.14em", fontSize: "12px" }}>Production health check</p>
        <h1 style={{ fontSize: "40px", margin: "0 0 12px" }}>ChainTrace runtime status</h1>
        <p style={{ color: "#adc3da", maxWidth: "720px", lineHeight: 1.6 }}>
          This page is intentionally boring: it verifies that the app can render even when evidence storage is degraded. ChainTrace remains a pre-review workspace only.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "32px" }}>
          <div style={{ border: "1px solid rgba(148, 163, 184, 0.28)", borderRadius: "18px", padding: "20px", background: "rgba(15, 23, 42, 0.72)" }}>
            <p style={{ margin: 0, color: "#8fb3d9", fontSize: "13px" }}>App status</p>
            <strong style={{ display: "block", marginTop: "8px", fontSize: "24px" }}>{snapshot.status}</strong>
          </div>
          <div style={{ border: "1px solid rgba(148, 163, 184, 0.28)", borderRadius: "18px", padding: "20px", background: "rgba(15, 23, 42, 0.72)" }}>
            <p style={{ margin: 0, color: "#8fb3d9", fontSize: "13px" }}>Checked at</p>
            <strong style={{ display: "block", marginTop: "8px", fontSize: "16px" }}>{snapshot.checkedAt}</strong>
          </div>
          <div style={{ border: "1px solid rgba(148, 163, 184, 0.28)", borderRadius: "18px", padding: "20px", background: "rgba(15, 23, 42, 0.72)" }}>
            <p style={{ margin: 0, color: "#8fb3d9", fontSize: "13px" }}>Boundary</p>
            <strong style={{ display: "block", marginTop: "8px", fontSize: "16px" }}>{preReviewBoundary.mode}</strong>
            <span style={{ color: "#adc3da", fontSize: "13px" }}>disbursementAllowed=false</span>
          </div>
        </div>

        <pre style={{ marginTop: "28px", padding: "20px", borderRadius: "18px", overflowX: "auto", background: "rgba(2, 6, 23, 0.82)", border: "1px solid rgba(148, 163, 184, 0.24)", color: "#dbeafe" }}>
          {JSON.stringify(snapshot, null, 2)}
        </pre>
      </section>
    </main>
  );
}
