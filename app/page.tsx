"use client";

import { useEffect, useState } from "react";
import { ClientReceivableConverter } from "@/components/ClientReceivableConverter";
import { PublicHeader } from "@/components/PublicHeader";
import styles from "@/components/PublicGrowthSurface.module.css";
import { type Locale, normalizeLocale } from "@/lib/i18n";

function getCookieLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )chaintrace_locale=([^;]+)/);
  return normalizeLocale(match ? decodeURIComponent(match[1]) : undefined);
}

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

const protocolSteps = [
  {
    zh: "PDF 留在用户侧",
    en: "PDF stays user-side",
    textZh: "浏览器读取贸易 PDF 并计算 SHA-256；原文不需要先进入中心化后端。",
    textEn: "The browser reads the trade PDF and calculates SHA-256; the raw document does not need a centralized backend first.",
  },
  {
    zh: "候选 JSON 可签名",
    en: "Candidate JSON is signable",
    textZh: "文件哈希、贸易 ID、尾款应收和申请垫款被打包成 ReceivableCandidate。",
    textEn: "File hash, trade ID, receivable balance, and requested advance are packed into a ReceivableCandidate.",
  },
  {
    zh: "钱包签事实节点",
    en: "Wallet signs fact nodes",
    textZh: "出口商、物流、仓库、质检、买家和资金方只签自己负责的事实。",
    textEn: "Exporter, logistics, warehouse, QC, buyer, and financier sign only the facts they own.",
  },
  {
    zh: "合约阻断风险",
    en: "Contracts block risk",
    textZh: "gate 未齐时保持 Pre-review only，LoanRequestRegistry 只记录预审意图。",
    textEn: "While gates are incomplete, the case remains Pre-review only and LoanRequestRegistry records pre-review intent only.",
  },
];

const launchMetrics = [
  { labelZh: "贸易金额", labelEn: "Trade value", value: "USD 52,800" },
  { labelZh: "尾款应收", labelEn: "Blocked receivable", value: "USD 36,960" },
  { labelZh: "申请垫款", labelEn: "Requested advance", value: "USDC 29,500" },
  { labelZh: "当前状态", labelEn: "Current state", value: "Pre-review only" },
];

const tradeFlow = [
  {
    zh: "浏览器本地哈希",
    en: "Browser-local hashing",
    descZh: "用户选择 PDF，ChainTrace 在浏览器中计算 SHA-256，形成证据指纹。",
    descEn: "The user selects a PDF and ChainTrace calculates SHA-256 in the browser to create an evidence fingerprint.",
  },
  {
    zh: "应收候选生成",
    en: "Receivable candidate",
    descZh: "贸易 ID、文件哈希、尾款应收、申请垫款和 blocker code 形成候选对象。",
    descEn: "Trade ID, file hash, receivable balance, requested advance, and blocker code form a candidate object.",
  },
  {
    zh: "钱包签名意图",
    en: "Wallet signature intent",
    descZh: "每个参与方只为自己负责的事实节点签名，减少重复核验。",
    descEn: "Each participant signs only the fact node they own, reducing repetitive verification.",
  },
  {
    zh: "链上预审请求",
    en: "On-chain pre-review",
    descZh: "LoanRequestRegistry.submitPreReviewRequest 记录 evidence pack hash 和预审状态。",
    descEn: "LoanRequestRegistry.submitPreReviewRequest records the evidence-pack hash and pre-review state.",
  },
  {
    zh: "专业审查与 gate",
    en: "Professional review and gates",
    descZh: "银行、律所、保理商处理授信、合规、法律结构和重大例外。",
    descEn: "Banks, law firms, and factors handle underwriting, compliance, legal structure, and material exceptions.",
  },
  {
    zh: "正式转换仍被阻断",
    en: "Formal conversion remains blocked",
    descZh: "当前 gate 未齐，disbursementAllowed=false，不能声称自动放款。",
    descEn: "Gates are incomplete, disbursementAllowed=false, and the product does not claim automatic disbursement.",
  },
];

const proofBlocks = [
  {
    titleZh: "一眼看懂",
    titleEn: "Understand in 10 seconds",
    textZh: "PDF → hash → case → evidence → task → review。公开页把用户送入真实工作台主路径。",
    textEn: "PDF → hash → case → evidence → task → review. The public layer sends users into the working-site path.",
  },
  {
    titleZh: "一键可试",
    titleEn: "Try it immediately",
    textZh: "转换器是页面中心：选 PDF、看本地 hash、创建 pre-review case。",
    textEn: "The converter is central: choose a PDF, see local hash, and create a pre-review case.",
  },
  {
    titleZh: "诚实阻断",
    titleEn: "Honest blockers",
    textZh: "展示 Pre-review only、GATES_NOT_PASSED、disbursementAllowed=false，可信比夸大更重要。",
    textEn: "It shows Pre-review only, GATES_NOT_PASSED, and disbursementAllowed=false because credibility beats hype.",
  },
];

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const zh = locale === "zh-CN";

  useEffect(() => {
    setLocale(getCookieLocale());
  }, []);

  return (
    <>
      <PublicHeader zh={zh} />
      <main className="page-shell">
        <section className={styles.growthHero}>
          <div className="landing-grid">
            <div className="hero-copy">
              <div className={styles.heroKicker}>{t(zh, "ChainTrace · Crypto-native trade evidence", "ChainTrace · Crypto-native trade evidence")}</div>
              <h1 className={styles.heroTitle}>{t(zh, "把跨境贸易 PDF 变成链上应收融资候选。", "Turn trade PDFs into on-chain receivable financing candidates.")}</h1>
              <p className={styles.heroText}>
                {t(
                  zh,
                  "浏览器本地哈希，钱包签名，链上 registry 承接事实状态。资金方看到的是可验证候选和 blocker，而不是一堆散乱附件。",
                  "Browser-local hashing, wallet signatures, and on-chain registries turn scattered trade evidence into a verifiable candidate with explicit blockers.",
                )}
              </p>
              <div className="hero-actions">
                <a href="#pdf-to-receivable" className="primary-button">{t(zh, "创建预审 Case", "Create pre-review case")}</a>
                <a href="/login" className="secondary-button">{t(zh, "登录进入工作台", "Login to workspace")}</a>
                <a href="/agent" className="secondary-button">{t(zh, "看 Agent 故事", "See Agent story")}</a>
              </div>
              <div className="hero-badges">
                <span className="badge-chip">Browser SHA-256</span>
                <span className="badge-chip">Wallet signature</span>
                <span className="badge-chip">LoanRequestRegistry</span>
                <span className="badge-chip">GATES_NOT_PASSED</span>
              </div>
              <div className={styles.launchMetrics}>
                {launchMetrics.map((metric) => (
                  <div className={styles.launchMetric} key={metric.labelEn}>
                    <span>{t(zh, metric.labelZh, metric.labelEn)}</span>
                    <strong>{metric.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-visual">
              <div className={styles.premiumHeroFrame}>
                <div className={styles.pdfCard}>
                  <span>01 · PDF</span>
                  <strong>Vietnam coffee invoice.pdf</strong>
                  <div className={styles.hashLine}>local SHA-256 · 0x7f5c…1a63</div>
                </div>
                <div className={styles.visualArrow}>↓</div>
                <div className={styles.candidateCard}>
                  <span>02 · ReceivableCandidate</span>
                  <strong>USD 36,960 receivable · USDC 29,500 requested</strong>
                  <div className={styles.hashLine}>candidateHash · 0x91f3…1a04</div>
                </div>
                <div className={styles.visualArrow}>↓</div>
                <div className={styles.signatureCard}>
                  <span>03 · Wallet intent</span>
                  <strong>Exporter / logistics / QC / buyer attest only their own facts.</strong>
                </div>
                <div className={styles.chainCard}>
                  <span>04 · Contract guardrail</span>
                  <strong>Pre-review only · GATES_NOT_PASSED</strong>
                  <div className={styles.hashLine}>disbursementAllowed=false</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel product-showcase">
          <div className="section-heading">
            <span>{t(zh, "Protocol path", "Protocol path")}</span>
            <h2>{t(zh, "公开页只讲一条强路径：PDF 到链上候选。", "The public surface tells one strong path: PDF to on-chain candidate.")}</h2>
            <p>{t(zh, "这不是后端 SaaS 上传中心，而是用户侧证明生成 + 钱包授权 + 合约 gate 的入口。", "This is not a backend SaaS upload center; it is a user-side proof creation, wallet authorization, and contract-gate entry point.")}</p>
          </div>
          <div className={styles.protocolPath}>
            {protocolSteps.map((step, index) => (
              <article className={styles.protocolStep} key={step.en}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{t(zh, step.zh, step.en)}</strong>
                <p>{t(zh, step.textZh, step.textEn)}</p>
              </article>
            ))}
          </div>
        </section>

        <div className={styles.converterStage}>
          <ClientReceivableConverter zh={zh} />
        </div>

        <section id="workflow" className="panel product-showcase">
          <div className="section-heading">
            <span>{t(zh, "Product journey", "Product journey")}</span>
            <h2>{t(zh, "从本地证据指纹到预审融资候选。", "From local evidence fingerprint to pre-review financing candidate.")}</h2>
            <p>{t(zh, "ChainTrace 让重复证据整理自动化，把最终授信、合规、法律结构和争议留给专业机构。", "ChainTrace automates repetitive evidence operations while final underwriting, compliance, legal structure, and disputes stay with professionals.")}</p>
          </div>
          <div className="pack-step-grid">
            {tradeFlow.map((step, index) => (
              <article key={step.en} className="pack-step-card">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{t(zh, step.zh, step.en)}</strong>
                <p>{t(zh, step.descZh, step.descEn)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.publicProofStrip}>
          {proofBlocks.map((block) => (
            <article key={block.titleEn}>
              <span>{t(zh, block.titleZh, block.titleEn)}</span>
              <strong>{t(zh, block.textZh, block.textEn)}</strong>
            </article>
          ))}
        </section>

        <section id="security" className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">AI trade-finance evidence OS</span>
              <h3>{t(zh, "公开页负责创建预审 Case，工作台负责处理业务。", "The public layer creates a pre-review case; the workspace handles the work.")}</h3>
            </div>
            <div className="status-pill warning">GATES_NOT_PASSED</div>
          </div>
          <dl className="proof-details">
            <div><dt>{t(zh, "创建 Case", "Create case")}</dt><dd><a href="#pdf-to-receivable" className="inline-link">#pdf-to-receivable</a></dd></div>
            <div><dt>{t(zh, "登录入口", "Login entry")}</dt><dd><a href="/login" className="inline-link">/login</a></dd></div>
            <div><dt>{t(zh, "Case API", "Case API")}</dt><dd><a href="/api/cases" className="inline-link">/api/cases</a></dd></div>
          </dl>
          <p className="proof-note">Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false</p>
        </section>
      </main>
    </>
  );
}
