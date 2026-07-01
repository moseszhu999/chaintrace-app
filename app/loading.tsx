export default function LoadingPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "32px", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", background: "#07111f", color: "#e5edf7" }}>
      <section style={{ width: "100%", maxWidth: "680px", border: "1px solid rgba(148, 163, 184, 0.24)", borderRadius: "24px", padding: "32px", background: "rgba(15, 23, 42, 0.72)" }}>
        <p style={{ color: "#8fb3d9", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.14em", fontSize: "12px" }}>Loading workspace</p>
        <h1 style={{ fontSize: "28px", margin: "0 0 12px" }}>Preparing ChainTrace state…</h1>
        <p style={{ color: "#adc3da", lineHeight: 1.6 }}>
          Loading case, evidence, tasks, and review state. This fallback prevents a blank screen during slow server reads.
        </p>
      </section>
    </main>
  );
}
