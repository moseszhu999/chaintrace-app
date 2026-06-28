import Link from "next/link";
import { neon } from "@neondatabase/serverless";
import { ProofVerifier } from "@/components/ProofVerifier";
import { SharePanel } from "@/components/SharePanel";
import { getChainExplorerTxUrl } from "@/lib/chaintraceConfig";
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
  note: string | null;
  wallet_address: string | null;
  chain_id: number | null;
  contract_address: string | null;
  transaction_hash: string | null;
  onchain_proof_id: string | null;
  demo_url: string | null;
  created_at: string;
};

async function loadIndexedProof(id: string): Promise<ProofRow | null> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

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
      note,
      wallet_address,
      chain_id,
      contract_address,
      transaction_hash,
      onchain_proof_id,
      demo_url,
      created_at
    from proofs
    where id = ${id}
    limit 1;
  `;

  return (rows[0] as ProofRow | undefined) ?? null;
}

export default async function IndexedProofPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proof = await loadIndexedProof(id);

  if (!proof) {
    return (
      <main className="page-shell">
        <section className="hero">
          <div className="eyebrow">ChainTrace Indexed Proof</div>
          <h1>Indexed proof not found.</h1>
          <p>This proof record was not found in the Proof Index database.</p>
          <div className="hero-actions">
            <Link href="/" className="primary-button">Create a proof</Link>
            <Link href="/passport" className="secondary-button">Business passport</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">ChainTrace Indexed Proof</div>
        <h1>{proof.title}</h1>
        <p>
          This proof page is powered by the ChainTrace Proof Index. It provides a stable share URL
          for proof metadata and keeps the same browser-side SHA-256 verification flow.
        </p>
        <div className="hero-actions">
          <Link href="/" className="primary-button">Create your own proof</Link>
          <Link href="/passport" className="secondary-button">Business passport</Link>
        </div>
      </section>

      <section className="workspace single-column">
        <article className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">{proof.proof_type}</span>
              <h3>{proof.proof_mode === "onchain" ? "Indexed on-chain proof" : "Indexed demo proof"}</h3>
            </div>
            <div className="status-pill">Proof Index</div>
          </div>

          <dl className="proof-details">
            <div>
              <dt>Index ID</dt>
              <dd className="hash-value">{proof.id}</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>{proof.proof_mode}</dd>
            </div>
            <div>
              <dt>Business</dt>
              <dd>{proof.business_name}</dd>
            </div>
            <div>
              <dt>Batch / order ID</dt>
              <dd>{proof.batch_id}</dd>
            </div>
            <div>
              <dt>File</dt>
              <dd>{proof.file_name}</dd>
            </div>
            <div>
              <dt>File hash</dt>
              <dd className="hash-value" title={proof.file_hash}>{proof.file_hash}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{new Date(proof.created_at).toLocaleString()}</dd>
            </div>
            {proof.wallet_address && (
              <div>
                <dt>Wallet</dt>
                <dd className="hash-value">{shortHash(proof.wallet_address)}</dd>
              </div>
            )}
            {proof.transaction_hash && (
              <div>
                <dt>Transaction</dt>
                <dd>
                  <a href={getChainExplorerTxUrl(proof.transaction_hash)} target="_blank" rel="noreferrer" className="inline-link">
                    {shortHash(proof.transaction_hash)}
                  </a>
                </dd>
              </div>
            )}
          </dl>

          <p className="proof-note">
            {proof.note || "ChainTrace stores hashes and public metadata, not private business files."}
          </p>

          <div className="proof-tools">
            <SharePanel path={`/proof-index/${proof.id}`} />
            <ProofVerifier expectedHash={proof.file_hash as `0x${string}`} />
          </div>
        </article>
      </section>
    </main>
  );
}
