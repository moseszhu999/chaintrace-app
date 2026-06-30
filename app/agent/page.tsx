import Link from "next/link";
import { cookies } from "next/headers";
import { PublicHeader } from "@/components/PublicHeader";
import { normalizeLocale } from "@/lib/i18n";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

const workflow = [
  {
    labelZh: "证据接入",
    labelEn: "Evidence intake",
    textZh: "读取 PDF 与元数据，识别 PO、发票、提单、仓库回执、质检报告和买家验收。",
    textEn: "Reads PDFs and metadata across PO, invoice, B/L, warehouse receipt, QC report, and buyer acceptance.",
  },
  {
    labelZh: "Gate 检查",
    labelEn: "Gate check",
    textZh: "把证据映射到 12 个融资 gate，区分已通过、待核验和阻断项。",
    textEn: "Maps evidence to 12 financing gates and separates passed, pending, and blocked items.",
  },
  {
    labelZh: "缺口追踪",
    labelEn: "Gap chasing",
    textZh: "生成缺失证据、责任方和下一步任务，让运营人员知道先催什么。",
    textEn: "Generates missing evidence, owner, and next-task context so operators know what to chase first.",
  },
  {
    labelZh: "融资包",
    labelEn: "Financing pack",
    textZh: "准备给资金方预审的证据包、risk flags、approval conditions 和 memo。",
    textEn: "Prepares the evidence pack, risk flags, approval conditions, and memo for financier pre-review.",
  },
];

const blockers = [
  { zh: "最终 on-board B/L 待核验", en: "Final on-board B/L pending" },
  { zh: "新加坡进口许可最终状态待确认", en: "Singapore import permit pending" },
  { zh: "仓库回执阻断", en: "Warehouse receipt blocked" },
  { zh: "到港 QC 水分争议阻断", en: "Arrival QC dispute blocked" },
  { zh: "买家验收决定阻断", en: "Buyer acceptance blocked" },
  { zh: "资金方 multisig 授权阻断", en: "Financier multisig blocked" },
];

const agentJobs = [
  { zh: "自动分类贸易文件", en: "Classify trade documents" },
  { zh: "抽取金额、单号、柜号、签章和付款条件", en: "Extract amounts, IDs, containers, seals, signatures, and payment terms" },
  { zh: "匹配融资 gate checklist", en: "Match the financing gate checklist" },
  { zh: "生成缺口任务和催办上下文", en: "Generate gap tasks and follow-up context" },
  { zh: "准备资金方 memo", en: "Prepare the financier memo" },
];

export default async function AgentPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <>
      <PublicHeader zh={zh} />
      <main className="page-shell">
        <section className="hero landing-hero agent-entry-hero">
          <div className="landing-grid">
            <div className="hero-copy">
              <div className="eyebrow">{t(zh, "公开 Agent 体验 · 登录前", "Public Agent experience · pre-login")}</div>
              <h1>
                {t(
                  zh,
                  "看 AI Agent 如何解释一笔咖啡贸易为什么只能预审。",
                  "See how an AI agent explains why a coffee trade is pre-review only.",
                )}
              </h1>
              <p>
                {t(
                  zh,
                  "公开层只展示当前原型真实做到的事：读取结构化证据状态、指出缺口、准备预审材料，并明确告诉资金方正式放款仍被阻断。",
                  "The public layer shows what the current prototype actually does: read structured evidence status, surface gaps, prepare pre-review materials, and tell financiers that formal disbursement is still blocked.",
                )}
              </p>
              <div className="hero-actions">
                <Link href="/login" className="primary-button">{t(zh, "登录进入工作台", "Login to workspace")}</Link>
                <Link href="/api/financing-pack" className="secondary-button">{t(zh, "打开融资包 API", "Open financing pack API")}</Link>
                <Link href="/" className="secondary-button">{t(zh, "返回首页", "Back to homepage")}</Link>
              </div>
              <div className="hero-badges">
                <span className="badge-chip">Pre-review only</span>
                <span className="badge-chip">GATES_NOT_PASSED</span>
                <span className="badge-chip">disbursementAllowed=false</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="signal-board agent-case-board">
                <div className="signal-board-header">
                  <span>{t(zh, "Active case", "Active case")}</span>
                  <strong>{t(zh, "越南 Robusta 咖啡出口新加坡", "Vietnam Robusta coffee export to Singapore")}</strong>
                </div>
                <div className="signal-card-grid">
                  <div className="mini-proof-card present"><span>{t(zh, "贸易金额", "Trade value")}</span><strong>USD 52,800</strong></div>
                  <div className="mini-proof-card present"><span>{t(zh, "尾款应收", "Blocked receivable")}</span><strong>USD 36,960</strong></div>
                  <div className="mini-proof-card pending"><span>{t(zh, "申请垫款", "Requested advance")}</span><strong>USDC 29,500</strong></div>
                  <div className="mini-proof-card pending"><span>{t(zh, "Gate", "Gates")}</span><strong>6/12</strong></div>
                </div>
                <div className="signal-status-box">
                  <span>{t(zh, "系统判断", "System diagnosis")}</span>
                  <strong>{t(zh, "Pre-review only · GATES_NOT_PASSED", "Pre-review only · GATES_NOT_PASSED")}</strong>
                  <p>
                    {t(
                      zh,
                      "正式放款仍被阻断；专业审查、完整证据和合约 gate 必须先通过。",
                      "Formal disbursement remains blocked; professional review, complete evidence, and contract gates must pass first.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel product-showcase agent-entry-section">
          <div className="section-heading">
            <span>{t(zh, "Agent flow", "Agent flow")}</span>
            <h2>{t(zh, "从散乱证据到资金方可预审的融资包。", "From fragmented evidence to a financier-ready pre-review pack.")}</h2>
            <p>
              {t(
                zh,
                "公开页只展示一条清晰路径；完整证据管理、review、contracts、wallet 和 approvals 留在工作台。",
                "The public page shows one focused path; full evidence management, review, contracts, wallet, and approvals stay in the workspace.",
              )}
            </p>
          </div>
          <div className="pack-step-grid agent-workflow-grid">
            {workflow.map((step, index) => (
              <article key={step.labelEn} className="pack-step-card">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{t(zh, step.labelZh, step.labelEn)}</strong>
                <p>{t(zh, step.textZh, step.textEn)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="workspace agent-entry-diagnosis">
          <div className="panel">
            <div className="section-heading">
              <span>{t(zh, "Current diagnosis", "Current diagnosis")}</span>
              <h2>{t(zh, "6/12 gates passed. 4 gates remain blocked.", "6/12 gates passed. 4 gates remain blocked.")}</h2>
              <p>
                {t(
                  zh,
                  "Agent 先定位缺口，再把缺口变成可执行任务；它不会把未完成证据包装成已批准贷款。",
                  "The Agent finds gaps first, then turns them into executable tasks; it does not turn incomplete evidence into an approved loan.",
                )}
              </p>
            </div>
            <div className="agent-blocker-list">
              {blockers.map((item) => (
                <div key={item.en} className="proof-flow-card">
                  <strong>{t(zh, item.zh, item.en)}</strong>
                  <span>{t(zh, "formal disbursement blocked", "formal disbursement blocked")}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="section-heading">
              <span>{t(zh, "Agent value", "Agent value")}</span>
              <h2>{t(zh, "让银行、保理商和律所少翻材料，多审例外。", "Help banks, factors, and law firms review exceptions instead of hunting documents.")}</h2>
              <p>
                {t(
                  zh,
                  "ChainTrace 不替代专业机构。它把重复的证据整理和缺口追踪前移，让专业审查集中在授信、合规、法律结构和重大例外。",
                  "ChainTrace does not replace professional institutions. It moves repetitive evidence operations and gap chasing forward so professional review can focus on underwriting, compliance, legal structure, and material exceptions.",
                )}
              </p>
            </div>
            <dl className="proof-details agent-job-list">
              {agentJobs.map((item, index) => (
                <div key={item.en}>
                  <dt>{String(index + 1).padStart(2, "0")}</dt>
                  <dd>{t(zh, item.zh, item.en)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="panel proof-card public-proof-card agent-entry-cta">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">{t(zh, "Conversion boundary", "Conversion boundary")}</span>
              <h3>{t(zh, "准备进入登录后的操作系统。", "Ready to enter the post-login operating system.")}</h3>
            </div>
            <div className="status-pill warning">GATES_NOT_PASSED</div>
          </div>
          <p className="proof-note">
            {t(
              zh,
              "下一步从 /login 进入工作台。那里才显示完整左侧栏、证据管理、融资评分、专业审查、合约控制台、wallet 和 approvals。",
              "Next step: enter the workspace from /login. That is where the full sidebar, evidence management, readiness, professional review, contract console, wallet, and approvals belong.",
            )}
          </p>
          <div className="hero-actions agent-entry-final-actions">
            <Link href="/login" className="primary-button">{t(zh, "登录进入工作台", "Login to workspace")}</Link>
            <Link href="/" className="secondary-button">{t(zh, "返回首页", "Back to homepage")}</Link>
          </div>
        </section>
      </main>
    </>
  );
}
