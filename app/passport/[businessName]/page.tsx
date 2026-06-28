import Link from "next/link";
import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";
import { SharePanel } from "@/components/SharePanel";
import { getChainExplorerAddressUrl, getChainExplorerTxUrl, proofRegistryAddress } from "@/lib/chaintraceConfig";
import { dictionary, normalizeLocale, type Locale } from "@/lib/i18n";
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

type ReceivableProofType = (typeof receivableProofPackKeys)[number];

type ReceivableProofPack = {
  batchId: string;
  proofs: ProofRow[];
  proofTypeCounts: Partial<Record<ReceivableProofType, number>>;
  missingTypes: ReceivableProofType[];
  isReady: boolean;
  latestCreatedAt: string;
};

async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
}

const proofTypeKeys = ["order", "product", "shipment", "invoice", "inspection", "delivery", "acceptance"] as const;
const receivableProofPackKeys = ["order", "invoice", "shipment", "inspection", "delivery", "acceptance"] as const;

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

function countByProofType(proofs: ProofRow[]): Record<string, number> {
  return proofs.reduce<Record<string, number>>((accumulator, proof) => {
    accumulator[proof.proof_type] = (accumulator[proof.proof_type] ?? 0) + 1;
    return accumulator;
  }, {});
}

function isReceivableProofType(value: string): value is ReceivableProofType {
  return receivableProofPackKeys.some((key) => key === value);
}

function buildReceivableProofPacks(proofs: ProofRow[]): ReceivableProofPack[] {
  const groups = new Map<string, ProofRow[]>();

  proofs.forEach((proof) => {
    if (!isReceivableProofType(proof.proof_type)) return;

    const existing = groups.get(proof.batch_id) ?? [];
    existing.push(proof);
    groups.set(proof.batch_id, existing);
  });

  return Array.from(groups.entries())
    .map(([batchId, group]) => {
      const proofTypeCounts = receivableProofPackKeys.reduce<Partial<Record<ReceivableProofType, number>>>((accumulator, key) => {
        accumulator[key] = group.filter((proof) => proof.proof_type === key).length;
        return accumulator;
      }, {});
      const missingTypes = receivableProofPackKeys.filter((key) => (proofTypeCounts[key] ?? 0) === 0);
      const latestCreatedAt = group.reduce((latest, proof) => {
        return new Date(proof.created_at).getTime() > new Date(latest).getTime() ? proof.created_at : latest;
      }, group[0]?.created_at ?? new Date(0).toISOString());

      return {
        batchId,
        proofs: group,
        proofTypeCounts,
        missingTypes,
        isReady: missingTypes.length === 0,
        latestCreatedAt,
      };
    })
    .sort((a, b) => new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime());
}

function buildTrustSummary(args: {
  locale: Locale;
  businessName: string;
  proofCount: number;
  demoCount: number;
  onchainCount: number;
  proofTypes: string;
}): string {
  if (args.locale === "zh-CN") {
    if (args.proofCount === 0) {
      return `${args.businessName} 尚未索引任何公开 ChainTrace 证明记录。`;
    }
    return `${args.businessName} 已索引 ${args.proofCount} 条公开 ChainTrace 证明记录，其中包括 ${args.demoCount} 条无 Gas Demo 证明和 ${args.onchainCount} 条链上锚定证明。当前证明类型：${args.proofTypes}。`;
  }

  if (args.proofCount === 0) {
    return `${args.businessName} has not indexed any public ChainTrace proof records yet.`;
  }

  return `${args.businessName} has indexed ${args.proofCount} public ChainTrace proof record${args.proofCount === 1 ? "" : "s"}, including ${args.demoCount} gas-free demo proof${args.demoCount === 1 ? "" : "s"} and ${args.onchainCount} on-chain anchored proof${args.onchainCount === 1 ? "" : "s"}. Current proof types: ${args.proofTypes}.`;
}

export default async function BusinessPassportPage({
  params,
}: {
  params: Promise<{ businessName: string }>;
}) {
  const locale = await getLocale();
  const t = dictionary[locale];
  const { businessName: encodedBusinessName } = await params;
  const businessName = decodeURIComponent(encodedBusinessName);
  const proofs = await loadBusinessProofs(businessName);
  const demoCount = proofs.filter((item) => item.proof_mode === "demo").length;
  const onchainCount = proofs.filter((item) => item.proof_mode === "onchain").length;
  const proofTypeCounts = countByProofType(proofs);
  const receivableProofPacks = buildReceivableProofPacks(proofs);
  const readyPackCount = receivableProofPacks.filter((pack) => pack.isReady).length;
  const allReceivablePacksReady = receivableProofPacks.length > 0 && readyPackCount === receivableProofPacks.length;
  const receivableRequiredEvidence = receivableProofPackKeys.map((key) => t.proofTypes[key]).join(" · ");
  const proofTypes = Array.from(new Set(proofs.map((item) => t.proofTypes[item.proof_type as keyof typeof t.proofTypes] ?? item.proof_type))).join(", ") || (locale === "zh-CN" ? "暂无证明" : "No proofs yet");
  const passportPath = `/passport/${encodeURIComponent(businessName)}`;
  const trustSummary = buildTrustSummary({
    locale,
    businessName,
    proofCount: proofs.length,
    demoCount,
    onchainCount,
    proofTypes,
  });

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">{t.passport.eyebrow}</div>
        <h1>{businessName}</h1>
        <p>{t.passport.subtitle}</p>
        <div className="hero-actions">
          <Link href="/" className="primary-button">{t.app.createProof}</Link>
          <Link href="/passport" className="secondary-button">{t.app.allPassports}</Link>
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
          <strong>{demoCount} / {onchainCount}</strong>
          <span>{t.passport.demoOnchain}</span>
        </article>
        <article>
          <strong>{proofTypes}</strong>
          <span>{t.passport.proofTypes}</span>
        </article>
      </section>

      <section className="workspace single-column">
        <article className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">{locale === "zh-CN" ? "企业档案" : "business passport"}</span>
              <h3>{t.passport.trustSummary}</h3>
            </div>
            <div className="status-pill">{t.app.shareable}</div>
          </div>

          <p className="proof-note">{trustSummary}</p>

          <div className="proof-tools">
            <SharePanel path={passportPath} />
          </div>
        </article>

        <article className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">{t.passport.receivableProofPack}</span>
              <h3>{t.passport.receivableProofPackLite}</h3>
            </div>
            <div className={`status-pill ${allReceivablePacksReady ? "" : "warning"}`}>
              {allReceivablePacksReady ? t.passport.ready : t.passport.missingEvidence}
            </div>
          </div>

          <dl className="proof-details">
            <div>
              <dt>{t.passport.readyPacks}</dt>
              <dd>
                <strong>{readyPackCount} / {receivableProofPacks.length}</strong>
                <br />
                {t.passport.receivableProofPackSummary}
              </dd>
            </div>
            <div>
              <dt>{t.passport.requiredEvidence}</dt>
              <dd>{receivableRequiredEvidence}</dd>
            </div>
          </dl>

          {receivableProofPacks.length === 0 ? (
            <p className="proof-note">{t.passport.noReceivablePacks}</p>
          ) : (
            <dl className="proof-details">
              {receivableProofPacks.map((pack) => (
                <div key={pack.batchId}>
                  <dt>{pack.batchId}</dt>
                  <dd>
                    <strong>{pack.isReady ? t.passport.ready : t.passport.missingEvidence}</strong>
                    <br />
                    {receivableProofPackKeys.map((key) => {
                      const count = pack.proofTypeCounts[key] ?? 0;
                      return `${t.proofTypes[key]} ${count > 0 ? `✓ ${count}` : "—"}`;
                    }).join(" · ")}
                    {!pack.isReady && (
                      <>
                        <br />
                        <span>{t.passport.missing}: {pack.missingTypes.map((key) => t.proofTypes[key]).join(", ")}</span>
                      </>
                    )}
                    <br />
                    <span>{t.passport.latestEvidence}: {new Date(pack.latestCreatedAt).toLocaleString()}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <p className="proof-note">{t.passport.completePackNote}</p>
        </article>

        <article className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">{t.passport.supplyChainDashboard}</span>
              <h3>{t.passport.proofTypeDashboard}</h3>
            </div>
            <div className="status-pill">{t.app.composition}</div>
          </div>

          <dl className="proof-details">
            {proofTypeKeys.map((key) => {
              const count = proofTypeCounts[key] ?? 0;
              const label = t.proofTypes[key];
              const description = t.proofTypes[`${key}Description` as keyof typeof t.proofTypes];
              return (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>
                    <strong>{count} {count === 1 ? t.passport.proof : t.passport.proofs}</strong>
                    <br />
                    {description}
                    <br />
                    <span>{count > 0 ? t.passport.evidencePresent : t.passport.noEvidenceYet}</span>
                  </dd>
                </div>
              );
            })}
          </dl>

          <p className="proof-note">{t.passport.dashboardNote}</p>
        </article>

        <article className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">{locale === "zh-CN" ? "企业档案" : "business passport"}</span>
              <h3>{t.passport.proofHistoryFor} {businessName}</h3>
            </div>
            <div className="status-pill">{t.app.proofIndex}</div>
          </div>

          {proofs.length === 0 ? (
            <p className="proof-note">{t.passport.noProofs}</p>
          ) : (
            <dl className="proof-details">
              {proofs.map((proof) => (
                <div key={proof.id}>
                  <dt>{t.proofTypes[proof.proof_type as keyof typeof t.proofTypes] ?? proof.proof_type}</dt>
                  <dd>
                    <strong>{proof.title}</strong>
                    <br />
                    {proof.batch_id} · {new Date(proof.created_at).toLocaleString()}
                    <br />
                    <span className="hash-value">{shortHash(proof.file_hash)}</span>
                    <br />
                    <Link href={`/proof-index/${proof.id}`} className="inline-link">{t.passport.openIndexedProof}</Link>
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

          <p className="proof-note">{t.passport.passportNote}</p>
        </article>
      </section>
    </main>
  );
}
