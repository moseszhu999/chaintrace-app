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

async function loadBusinessProofs(businessName: string): Promise<ProofRow[]> {
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
    where lower(business_name) = lower(${businessName})
    order by created_at desc
    limit 50;
  `;

  return rows as ProofRow[];
}

export default async function BusinessPassportPage({
  params,
}: {
  params: Promise<{ businessName: string }>;
}) {
  const { businessName: encodedBusinessName } = await params;
  const businessName = decodeURIComponent(encodedBusinessName);
  const proofs = await loadBusinessProofs(businessName);
  const demoCount = proofs.filter((item) => item.proof_mode === "demo").length;
  const onchainCount = proofs.filter((item) => item.proof_mode === "onchain").length;
  const proofTypes = Array.from(new Set(proofs.map((item) => item.proof_type))).join(", ") || "No proofs yet";

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">ChainTrace Business Passport</div>
        <h1>{businessName}</h1>
        <p>
          A public proof history for this business. Buyers, logistics partners, auditors, and financiers
          can review indexed evidence records without receiving private business files.
        </p>
        <div className="hero-actions">
          <Link href="/" className="primary-button">Create a proof</Link>
          <Link href="/passport" className="secondary-button">All passports</Link>
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
          <strong>{demoCount} / {onchainCount}</strong>
          <span>Demo proofs / on-chain proofs</span>
        </article>
        <article>
          <strong>{proofTypes}</strong>
          <span>Proof types</span>
        </article>
      </section>

      <section className="workspace single-column">
        <article className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">business passport</span>
              <h3>Proof history for {businessName}</h3>
            </div>
            <div className="status-pill">Proof Index</div>
          </div>

          {proofs.length === 0 ? (
            <p className="proof-note">
              No indexed proofs found for this business name yet. Create a proof using exactly this business name to populate this passport.
            </p>
          ) : (
            <dl className="proof-details">
              {proofs.map((proof) => (
                <div key={proof.id}>
                  <dt>{proof.proof_type}</dt>
                  <dd>
                    <strong>{proof.title}</strong>
                    <br />
                    {proof.batch_id} · {new Date(proof.created_at).toLocaleString()}
                    <br />
                    <span className="hash-value">{shortHash(proof.file_hash)}</span>
                    <br />
                    <Link href={`/proof-index/${proof.id}`} className="inline-link">Open indexed proof</Link>
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
            Business Passport is the trust profile layer on top of proof pages. It does not expose private files;
            it indexes public metadata, hashes, and optional on-chain anchors.
          </p>
        </article>
      </section>
    </main>
  );
}
