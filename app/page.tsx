import Link from "next/link";

export default function HomePage() {
  return (
    <main className="entry">
      <section className="entry-hero">
        <div className="brand-row">
          <span className="brand-mark">CT</span>
          <span>ChainTrace P1</span>
        </div>
        <h1>Role-locked trade proof workspace</h1>
        <p>
          A usable MVP shell for creating financing candidates, recording local proof
          hashes, explaining gate blockers, and keeping funding execution disabled.
        </p>
        <div className="actions">
          <Link className="button primary" href="/login">
            Enter mock wallet
          </Link>
          <Link className="button" href="/register-role">
            Register role
          </Link>
        </div>
      </section>
    </main>
  );
}
