export default function NotFoundPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "32px", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", background: "#07111f", color: "#e5edf7" }}>
      <section style={{ width: "100%", maxWidth: "720px", border: "1px solid rgba(148, 163, 184, 0.28)", borderRadius: "24px", padding: "32px", background: "rgba(15, 23, 42, 0.78)" }}>
        <p style={{ color: "#8fb3d9", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.14em", fontSize: "12px" }}>404</p>
        <h1 style={{ fontSize: "32px", margin: "0 0 12px" }}>Workspace route not found.</h1>
        <p style={{ color: "#adc3da", lineHeight: 1.6 }}>
          The requested route does not exist in this pre-review workspace. The product boundary remains unchanged.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px" }}>
          <a href="/dashboard" style={{ borderRadius: "999px", padding: "12px 18px", background: "#e5edf7", color: "#07111f", textDecoration: "none", fontWeight: 700 }}>Open dashboard</a>
          <a href="/health" style={{ border: "1px solid rgba(148, 163, 184, 0.42)", borderRadius: "999px", padding: "12px 18px", color: "#e5edf7", textDecoration: "none", fontWeight: 700 }}>Health check</a>
        </div>
      </section>
    </main>
  );
}
