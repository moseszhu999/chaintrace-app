"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("ChainTrace route error boundary caught an error", error);
  }, [error]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "32px", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", background: "#07111f", color: "#e5edf7" }}>
      <section style={{ width: "100%", maxWidth: "720px", border: "1px solid rgba(148, 163, 184, 0.28)", borderRadius: "24px", padding: "32px", background: "rgba(15, 23, 42, 0.78)" }}>
        <p style={{ color: "#fca5a5", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.14em", fontSize: "12px" }}>Runtime fallback</p>
        <h1 style={{ fontSize: "32px", margin: "0 0 12px" }}>This workspace hit a recoverable error.</h1>
        <p style={{ color: "#adc3da", lineHeight: 1.6 }}>
          ChainTrace did not complete this render, but the product boundary remains unchanged: pre-review only, gates not passed, and disbursementAllowed=false.
        </p>
        {error.digest ? <p style={{ color: "#8fb3d9", fontSize: "13px" }}>Digest: {error.digest}</p> : null}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px" }}>
          <button onClick={reset} style={{ border: 0, borderRadius: "999px", padding: "12px 18px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
          <a href="/health" style={{ border: "1px solid rgba(148, 163, 184, 0.42)", borderRadius: "999px", padding: "12px 18px", color: "#e5edf7", textDecoration: "none", fontWeight: 700 }}>Open health check</a>
        </div>
      </section>
    </main>
  );
}
