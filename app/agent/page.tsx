import Link from "next/link";
import { cookies } from "next/headers";
import { PublicHeader } from "@/components/PublicHeader";
import styles from "@/components/PublicGrowthSurface.module.css";
import { normalizeLocale } from "@/lib/i18n";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

const storyBeats = [
  {
    zh: "一船咖啡已经发出。",
    en: "A coffee shipment has moved.",
    textZh: "Vietnam Robusta coffee export to Singapore：USD 52,800 贸易金额，USD 36,960 尾款应收，USDC 29,500 申请垫款。",
    textEn: "Vietnam Robusta coffee export to Singapore: USD 52,800 trade value, USD 36,960 blocked receivable, and USDC 29,500 requested advance.",
  },
  {
    zh: "证据存在，但还不完整。",
    en: "Evidence exists, but it is incomplete.",
    textZh: "PO、发票、装箱和出运证据已整理；到港 QC、仓库回执和买家验收仍然阻断。",
    textEn: "PO, invoice, packing, and export evidence are organized; arrival QC, warehouse receipt, and buyer acceptance remain blocked.",
  },
  {
    zh: "Agent 先解释为什么还不能继续。",
    en: "The Agent first explains why the case cannot continue.",
    textZh: "当前是 Pre-review only：GATES_NOT_PASSED，disbursementAllowed=false。",
    textEn: "The current state is Pre-review only: GATES_NOT_PASSED, disbursementAllowed=false.",
  },
];

const workflow = [
  { zh: "证据接入", en: "Evidence intake", textZh: "读取贸易证据状态。", textEn: "Read trade evidence status." },
  { zh: "Gate 检查", en: "Gate check", textZh: "识别 6/12 passed 和剩余阻断。", textEn: "Identify 6/12 passed and remaining blockers." },
  { zh: "缺口追踪", en: "Gap chasing", textZh: "把缺口变成任务和责任人。", textEn: "Turn gaps into tasks and owners." },
  { zh: "预审资料包", en: "Pre-review pack", textZh: "输出资料包、风险提示和下一步。", textEn: "Output pack, risk flags, and next steps." },
];

const blockers = [
  { zh: "最终 on-board B/L 待核验", en: "Final on-board B/L pending" },
  { zh: "新加坡进口许可最终状态待确认", en: "Singapore import permit pending" },
  { zh: "仓库回执阻断", en: "Warehouse receipt blocked" },
  { zh: "到港 QC 水分争议阻断", en: "Arrival QC dispute blocked" },
  { zh: "买家验收决定阻断", en: "Buyer acceptance blocked" },
  { zh: "资金方 multisig 授权阻断", en: "Financier multisig blocked" },
];

export default async function AgentPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <>
      <PublicHeader zh={zh} />
      <main className="page-shell">
        <section className={styles.agentStoryHero}>
          <div className="landing-grid">
            <div className="hero-copy">
              <div className={styles.heroKicker}>Public Agent story · pre-login</div>
              <h1 className={styles.heroTitle}>{t(zh, "这笔咖啡贸易看起来接近可审，但 Agent 先告诉你哪里卡住。", "This coffee trade looks close to review, but the Agent first shows where it is blocked.")}</h1>
              <p className={styles.heroText}>{t(zh, "公开页只讲一个故事：证据、缺口、下一步和阻断状态。完整操作留在登录后工作台。", "The public page tells one story: evidence, gaps, next step, and blocker state. Full operations stay in the post-login workspace.")}</p>
              <div className="hero-actions">
                <Link href="/login" className="primary-button">{t(zh, "登录进入工作台", "Login to workspace")}</Link>
                <Link href="/api/financing-pack" className="secondary-button">{t(zh, "打开资料包 API", "Open pack API")}</Link>
                <Link href="/" className="secondary-button">{t(zh, "返回首页", "Back to homepage")}</Link>
              </div>
              <div className="hero-badges">
                <span className="badge-chip">Pre-review only</span>
                <span className="badge-chip">GATES_NOT_PASSED</span>
                <span className="badge-chip">disbursementAllowed=false</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className={styles.agentStoryScene}>
                <div className={styles.theaterHeader}>
                  <span>Active case</span>
                  <strong>Vietnam Robusta coffee export to Singapore</strong>
                </div>
                <div className={styles.caseStrip}>
                  <div className={styles.caseChip}><span>Trade value</span><strong>USD 52,800</strong></div>
                  <div className={styles.caseChip}><span>Blocked receivable</span><strong>USD 36,960</strong></div>
                  <div className={styles.caseChip}><span>Requested advance</span><strong>USDC 29,500</strong></div>
                  <div className={styles.caseChip}><span>Gates</span><strong>6/12</strong></div>
                </div>
                <div className={styles.storyRail}>
                  {storyBeats.map((beat, index) => (
                    <article key={beat.en}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{t(zh, beat.zh, beat.en)}</strong>
                      <p>{t(zh, beat.textZh, beat.textEn)}</p>
                    </article>
                  ))}
                </div>
                <div className={styles.blockerBand}>
                  <span>System diagnosis</span>
                  <strong>Pre-review only · GATES_NOT_PASSED</strong>
                  <p>disbursementAllowed=false</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel product-showcase agent-entry-section">
          <div className="section-heading">
            <span>Agent flow</span>
            <h2>{t(zh, "Agent 把散乱证据压缩成一条可审查路径。", "The Agent compresses fragmented evidence into one reviewable path.")}</h2>
          </div>
          <div className={styles.protocolPath}>
            {workflow.map((step, index) => (
              <article key={step.en} className={styles.protocolStep}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{t(zh, step.zh, step.en)}</strong>
                <p>{t(zh, step.textZh, step.textEn)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.agentNarrativeGrid}>
          <div className="panel">
            <div className="section-heading">
              <span>Current diagnosis</span>
              <h2>6/12 gates passed. 4 gates remain blocked.</h2>
            </div>
            <div className={styles.blockerStack}>
              {blockers.map((item) => (
                <div key={item.en} className={styles.blockerRow}>
                  <strong>{t(zh, item.zh, item.en)}</strong>
                  <span>blocked</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel proof-card public-proof-card agent-entry-cta">
            <div className="proof-card-header">
              <div>
                <span className="proof-type">Conversion boundary</span>
                <h3>{t(zh, "准备进入登录后的操作系统。", "Ready to enter the post-login operating system.")}</h3>
              </div>
              <div className="status-pill warning">GATES_NOT_PASSED</div>
            </div>
            <p className="proof-note">Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false</p>
            <div className="hero-actions agent-entry-final-actions">
              <Link href="/login" className="primary-button">{t(zh, "登录进入工作台", "Login to workspace")}</Link>
              <Link href="/" className="secondary-button">{t(zh, "返回首页", "Back to homepage")}</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
