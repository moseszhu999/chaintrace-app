import Link from "next/link";
import { getChainExplorerAddressUrl, proofRegistryAddress } from "@/lib/chaintraceConfig";
import { shortHash } from "@/lib/hash";

export default function PassportPage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">ChainTrace Business Passport Lite</div>
        <h1>A verifiable business profile starts from proof pages.</h1>
        <p>
          Business Passport is the next layer after individual proof pages. It will collect product,
          shipment, invoice, inspection, delivery, and acceptance proofs into a shareable trust profile
          for small exporters, suppliers, logistics providers, and buyers.
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
          <strong>Proof count</strong>
          <span>How many proofs this business has created.</span>
        </article>
        <article>
          <strong>Evidence history</strong>
          <span>Product, shipment, invoice, inspection, delivery, and acceptance records.</span>
        </article>
        <article>
          <strong>Trust summary</strong>
          <span>A simple profile that buyers and financiers can review quickly.</span>
        </article>
      </section>

      <section className="workspace single-column">
        <article className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">passport lite</span>
              <h3>Business Passport roadmap</h3>
            </div>
            <div className="status-pill">MVP planning</div>
          </div>

          <dl className="proof-details">
            <div>
              <dt>Current layer</dt>
              <dd>Gas-free demo proofs and optional Ethereum Sepolia anchoring</dd>
            </div>
            <div>
              <dt>Next data source</dt>
              <dd>Proof indexer or small database for public proof history</dd>
            </div>
            <div>
              <dt>Registry</dt>
              <dd>
                <a
                  href={getChainExplorerAddressUrl(proofRegistryAddress)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-link"
                  title={proofRegistryAddress}
                >
                  {shortHash(proofRegistryAddress)}
                </a>
              </dd>
            </div>
            <div>
              <dt>Future URL</dt>
              <dd className="hash-value">/passport/0xBusinessWallet</dd>
            </div>
            <div>
              <dt>Use case</dt>
              <dd>Small business shares one profile link instead of sending scattered files.</dd>
            </div>
          </dl>

          <p className="proof-note">
            This page defines the product direction without pretending to have persistent business history yet.
            The correct next engineering step is to add a small proof index so that every proof page can become
            part of a business-level passport.
          </p>
        </article>
      </section>
    </main>
  );
}
