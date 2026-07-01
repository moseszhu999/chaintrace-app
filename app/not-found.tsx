export default function NotFoundPage() {
  return (
    <main className="page-shell">
      <section className="hero single-column">
        <span className="eyebrow">Not found</span>
        <h1>This ChainTrace workspace route does not exist.</h1>
        <p>
          The site stays inside the pre-review boundary and offers safe recovery paths.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="/dashboard">Open dashboard</a>
          <a className="secondary-button" href="/evidence">Open evidence</a>
          <a className="secondary-button" href="/health">Open health check</a>
        </div>
        <div className="hero-badges">
          <span className="badge-chip">Pre-review only</span>
          <span className="badge-chip">GATES_NOT_PASSED</span>
          <span className="badge-chip">disbursementAllowed=false</span>
        </div>
      </section>
    </main>
  );
}
