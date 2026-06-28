import Link from "next/link";
import { neon } from "@neondatabase/serverless";
import { getChainExplorerAddressUrl, getChainExplorerTxUrl, proofRegistryAddress } from "@/lib/chaintraceConfig";
import { shortHash } from "@/lib/hash";

type ProofRow = {
  id: string;
  proof_mode: string;
  proof_type: string;
  title: string;
  business_name: string;
  batch_id: string;
  file_name: string;
  file_hash: string;
  transaction_hash: string | null;
  demo_url: string | null;
  created_at: string;
};

async function loadProofs(): Promise<ProofRow[]> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) return [];

  const sql = neon(databaseUrl);
  const rows = await sql`
    select
      id,
      proof_mode,
      proof_type,
      title,
      business_name,
      batch_id,
      file_name,
      file_hash,
      transaction_hash,
      demo_url,
      created_at
    from proofs
    order by created_at desc
    limit 20;
  `;

  return rows as ProofRow[];
}

export default async function PassportPage() {
  const proofs = await loadProofs();
  const businessName = proofs[0]?.business_name ?? "Example Small Exporter";
  const demoCount = proofs.filter((item) => item.proof_mode === "demo").length;
  const onchainCount = proofs.filter((item) => item.proof_mode === "onchain").length;

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">ChainTrace Business Passport Lite</div>
        <h1>{businessName}</h1>
        <p>
          This passport is powered by the Proof Index. It collects product, shipment, invoice,
          inspection, delivery, and acceptance proofs into a lightweight trust profile for small businesses.
        </p>
        <div className="hero-actions">
          <Link href="/" className="primary-button">Create a proof</Link>
          <a
            href={getChainExplorerAddressUrl(proofRegistryAddress)}
            className="secondary-button"
            target="_blank"
            rel="noreferrer"
          >
            View registry
          </a>
        </div>
      </section>

      <section className="principles-grid">
        <article>
          <strong>{proofs.length}</strong>
          <span>Total indexed proofs</span>
        </article>
        <article>
          <strong>{demoCount}</strong>
          <span>Gas-free demo proofs</span>
        </article>
        <article>
          <strong>{onchainCount}</strong>
          <span>On-chain anchored proofs</span>
        </article>
      </section>

      <section className="workspace single-column">
        <article className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">passport lite</span>
              <h3>Proof history</h3>
            </div>
            <div className="status-pill">Proof Index</div>
          </div>

          {proofs.length === 0 ? (
            <p className="proof-note">
              No indexed proofs yet. Create a proof and click Demo proof no gas to save metadata into Neon.
            </p>
          ) : (
            <dl className="proof-details">
              {proofs.map((proof) => (
                <div key={proof.id}>
                  <dt>{proof.proof_type}</dt>
                  <dd>
                    <strong>{proof.title}</strong>
                    <br />
                    {proof.business_name} · {proof.batch_id} · {new Date(proof.created_at).toLocaleString()}
                    <br />
                    <span className="hash-value">{shortHash(proof.file_hash)}</span>
                    <br />
                    <Link href={`/proof-index/${proof.id}`} className="inline-link">Open indexed proof</Link>
                    {proof.demo_url && (
                      <>
                        <br />
                        <Link href={proof.demo_url} className="inline-link">Open legacy demo link</Link>
                      </>
                    )}
                    {proof.transaction_hash && (
                      <>
                        <br />
                        <a
                          href={getChainExplorerTxUrl(proof.transaction_hash)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-link"
                        >
                          View transaction
                        </a>
                      </>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <p className="proof-note">
            This is still a Lite passport. The next version should add public business slugs,
            filtering by wallet address, and AI-generated trust summaries.
          </p>
        </article>
      </section>
    </main>
  );
}
