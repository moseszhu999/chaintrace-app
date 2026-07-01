export default function LoadingPage() {
  return (
    <main className="page-shell">
      <section className="hero single-column">
        <span className="eyebrow">Loading</span>
        <h1>Preparing the ChainTrace working site.</h1>
        <p>Loading case, evidence, tasks, and review state without leaving the pre-review boundary.</p>
        <div className="hero-badges">
          <span className="badge-chip">Pre-review only</span>
          <span className="badge-chip">GATES_NOT_PASSED</span>
          <span className="badge-chip">disbursementAllowed=false</span>
        </div>
      </section>
    </main>
  );
}
