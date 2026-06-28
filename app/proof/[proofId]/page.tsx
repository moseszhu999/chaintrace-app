import Link from "next/link";
import { getBaseSepoliaExplorerAddressUrl, proofRegistryAddress } from "@/lib/chaintraceConfig";
import { shortHash } from "@/lib/hash";
import { getProofById } from "@/lib/publicChain";

function formatTimestamp(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default async function PublicProofPage({
  params,
}: {
  params: Promise<{ proofId: string }>;
}) {
  const { proofId } = await params;
  const proofIdBigInt = BigInt(proofId);
  const proof = await getProofById(proofIdBigInt);

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">ChainTrace Public Proof</div>
        <h1>Proof #{proofId}</h1>
        <p>
          This page reads directly from the ChainTrace ProofRegistry contract on Base Sepolia.
          It verifies that an evidence hash was anchored on-chain by a wallet address.
        </p>
        <div className="hero-actions">
          <Link href="/" className="primary-button">Create your own proof</Link>
          <a
            href={getBaseSepoliaExplorerAddressUrl(proofRegistryAddress)}
            className="secondary-button"
            target="_blank"
            rel="noreferrer"
          >
            View contract
          </a>
        </div>
      </section>

      <section className="workspace single-column">
        <article className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">{proof.proofType}</span>
              <h3>On-chain proof record</h3>
            </div>
            <div className="status-pill">Verified on-chain</div>
          </div>

          <dl className="proof-details">
            <div>
              <dt>Proof ID</dt>
              <dd>#{proofId}</dd>
            </div>
            <div>
              <dt>Proof type</dt>
              <dd>{proof.proofType}</dd>
            </div>
            <div>
              <dt>Submitter</dt>
              <dd>
                <a
                  href={getBaseSepoliaExplorerAddressUrl(proof.submitter)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-link"
                  title={proof.submitter}
                >
                  {shortHash(proof.submitter)}
                </a>
              </dd>
            </div>
            <div>
              <dt>File hash</dt>
              <dd className="hash-value" title={proof.fileHash}>{proof.fileHash}</dd>
            </div>
            <div>
              <dt>URI / CID</dt>
              <dd>{proof.uri || "Not provided in this MVP transaction"}</dd>
            </div>
            <div>
              <dt>Metadata hash</dt>
              <dd className="hash-value">{proof.metadataHash}</dd>
            </div>
            <div>
              <dt>Timestamp</dt>
              <dd>{formatTimestamp(proof.timestamp)}</dd>
            </div>
            <div>
              <dt>Registry</dt>
              <dd>
                <a
                  href={getBaseSepoliaExplorerAddressUrl(proofRegistryAddress)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-link"
                  title={proofRegistryAddress}
                >
                  {shortHash(proofRegistryAddress)}
                </a>
              </dd>
            </div>
          </dl>

          <p className="proof-note">
            ChainTrace stores hashes and references, not sensitive business files. To verify a document,
            recalculate its SHA-256 hash and compare it with the file hash shown on this page.
          </p>
        </article>
      </section>
    </main>
  );
}
