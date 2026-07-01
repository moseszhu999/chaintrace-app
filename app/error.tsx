"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-shell">
      <section className="hero single-column">
        <span className="eyebrow">Error boundary</span>
        <h1>ChainTrace hit a recoverable page error.</h1>
        <p>
          The working site keeps the pre-review boundary visible instead of showing a blank screen.
        </p>
        <div className="hero-actions">
          <button className="primary-button button-reset" type="button" onClick={reset}>Try again</button>
          <a className="secondary-button" href="/health">Open health check</a>
          <a className="secondary-button" href="/dashboard">Return to dashboard</a>
        </div>
      </section>
      <section className="workspace single-column">
        <div className="panel">
          <div className="section-heading">
            <span>Pre-review only</span>
            <h2>GATES_NOT_PASSED · disbursementAllowed=false</h2>
            <p>{error.message || "Unknown page error."}</p>
          </div>
          {error.digest && <p className="proof-note">digest={error.digest}</p>}
        </div>
      </section>
    </main>
  );
}
