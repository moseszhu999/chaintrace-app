import Link from "next/link";
import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";
import { getChainExplorerAddressUrl, getChainExplorerTxUrl, proofRegistryAddress } from "@/lib/chaintraceConfig";
import { dictionary, normalizeLocale } from "@/lib/i18n";
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
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const t = dictionary[locale];
  const proofs = await loadProofs();
  const businessName = proofs[0]?.business_name ?? "Example Small Exporter";
  const demoCount = proofs.filter((item) => item.proof_mode === "demo").length;
  const onchainCount = proofs.filter((item) => item.proof_mode === "onchain").length;
  const businessPassportPath = `/passport/${encodeURIComponent(businessName)}`;

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">{locale === "zh-CN" ? "ChainTrace 企业可信档案总览" : "ChainTrace Business Passport Lite"}</div>
        <h1>{businessName}</h1>
        <p>
          {locale === "zh-CN"
            ? "这个页面从 Proof Index 读取证明记录，把产品、物流、发票、质检、交付和验收证明聚合成小企业可信档案。"
            : "This passport is powered by the Proof Index. It collects product, shipment, invoice, inspection, delivery, and acceptance proofs into a lightweight trust profile for small businesses."}
        </p>
        <div className="hero-actions">
          <Link href="/" className="primary-button">{t.app.createProof}</Link>
          <Link href={businessPassportPath} className="secondary-button">{locale === "zh-CN" ? "打开企业档案" : "Open business passport"}</Link>
          <a
            href={getChainExplorerAddressUrl(proofRegistryAddress)}
            className="secondary-button"
            target="_blank"
            rel="noreferrer"
          >
            {t.app.viewRegistry}
          </a>
        </div>
      </section>

      <section className="principles-grid">
        <article>
          <strong>{proofs.length}</strong>
          <span>{t.passport.totalIndexedProofs}</span>
        </article>
        <article>
          <strong>{demoCount}</strong>
          <span>{locale === "zh-CN" ? "无 Gas Demo 证明" : "Gas-free demo proofs"}</span>
        </article>
        <article>
          <strong>{onchainCount}</strong>
          <span>{locale === "zh-CN" ? "链上锚定证明" : "On-chain anchored proofs"}</span>
        </article>
      </section>

      <section className="workspace single-column">
        <article className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">{locale === "zh-CN" ? "档案总览" : "passport lite"}</span>
              <h3>{locale === "zh-CN" ? "证明历史" : "Proof history"}</h3>
            </div>
            <div className="status-pill">{t.app.proofIndex}</div>
          </div>

          {proofs.length === 0 ? (
            <p className="proof-note">
              {locale === "zh-CN" ? "还没有已索引证明。请创建证明并点击无 Gas Demo Proof，将元数据保存到 Neon。" : "No indexed proofs yet. Create a proof and click Demo proof no gas to save metadata into Neon."}
            </p>
          ) : (
            <dl className="proof-details">
              {proofs.map((proof) => (
                <div key={proof.id}>
                  <dt>{t.proofTypes[proof.proof_type as keyof typeof t.proofTypes] ?? proof.proof_type}</dt>
                  <dd>
                    <strong>{proof.title}</strong>
                    <br />
                    <Link href={`/passport/${encodeURIComponent(proof.business_name)}`} className="inline-link">
                      {proof.business_name}
                    </Link>
                    {" · "}{proof.batch_id} · {new Date(proof.created_at).toLocaleString()}
                    <br />
                    <span className="hash-value">{shortHash(proof.file_hash)}</span>
                    <br />
                    <Link href={`/proof-index/${proof.id}`} className="inline-link">{t.passport.openIndexedProof}</Link>
                    {proof.demo_url && (
                      <>
                        <br />
                        <Link href={proof.demo_url} className="inline-link">{locale === "zh-CN" ? "打开旧版 Demo 链接" : "Open legacy demo link"}</Link>
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
                          {t.passport.viewTransaction}
                        </a>
                      </>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <p className="proof-note">
            {locale === "zh-CN"
              ? "这是 Lite 版企业可信档案。下一版应加入公开 slug、钱包地址过滤和 AI 可信摘要。"
              : "This is still a Lite passport. The next version should add public business slugs, filtering by wallet address, and AI-generated trust summaries."}
          </p>
        </article>
      </section>
    </main>
  );
}
