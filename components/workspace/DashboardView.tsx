import Link from "next/link";
import { getBlockerText, getMissingEvidenceSlots, getVerifiedEvidenceCount } from "@/lib/demo-workspace-data";
import { receivableLoanContract, loanGates } from "@/lib/loan-contract-fixture";
import { receivableReadinessReport } from "@/lib/receivable-readiness-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

const blockerCode = "GATES_NOT_PASSED";
const disbursementAllowedText = "disbursementAllowed=false";

const operatingQueues = [
  {
    titleZh: "证据收件箱",
    titleEn: "Evidence inbox",
    statusZh: "6 份已核验，6 份待补齐或阻断",
    statusEn: "6 verified, 6 pending or blocked",
    ownerZh: "Operator + Agent",
    ownerEn: "Operator + Agent",
    href: "/evidence",
  },
  {
    titleZh: "Agent 抽取字段",
    titleEn: "Agent extracted fields",
    statusZh: "金额、PO、发票、柜号、VGM 已整理",
    statusEn: "Amount, PO, invoice, container, and VGM organized",
    ownerZh: "Agent",
    ownerEn: "Agent",
    href: "/business-ops",
  },
  {
    titleZh: "Gate 不匹配",
    titleEn: "Gate mismatches",
    statusZh: "2 个待核验，4 个阻断",
    statusEn: "2 pending, 4 blocked",
    ownerZh: "Agent + Contract",
    ownerEn: "Agent + Contract",
    href: "/business-loan",
  },
  {
    titleZh: "缺失文件",
    titleEn: "Missing documents",
    statusZh: "仓库、到港 QC、买家验收仍缺",
    statusEn: "Warehouse, arrival QC, and buyer acceptance still missing",
    ownerZh: "Operator",
    ownerEn: "Operator",
    href: "/tasks",
  },
  {
    titleZh: "待人工批准",
    titleEn: "Human approvals needed",
    statusZh: "对外催办、pre-review 提交、钱包签名",
    statusEn: "Outbound chasing, pre-review submit, wallet signature",
    ownerZh: "Human",
    ownerEn: "Human",
    href: "/assistant",
  },
  {
    titleZh: "专业审查待处理",
    titleEn: "Professional review pending",
    statusZh: "underwriting、KYC、争议和法律结构",
    statusEn: "Underwriting, KYC, dispute, and legal structure",
    ownerZh: "Professional",
    ownerEn: "Professional",
    href: "/business-professional-review",
  },
  {
    titleZh: "合约动作阻断",
    titleEn: "Contract actions blocked",
    statusZh: "LoanRequestRegistry 仅预审；放款和转换未开放",
    statusEn: "LoanRequestRegistry is pre-review only; disbursement and conversion locked",
    ownerZh: "Contract",
    ownerEn: "Contract",
    href: "/business-contracts",
  },
];

const workflowMap = [
  { titleZh: "PDF / 证据接入", titleEn: "PDF / evidence intake", ownerZh: "Human", ownerEn: "Human" },
  { titleZh: "浏览器本地 hash / 候选创建", titleEn: "browser-local hash / candidate creation", ownerZh: "Frontend", ownerEn: "Frontend" },
  { titleZh: "Agent 分类", titleEn: "Agent classification", ownerZh: "Agent", ownerEn: "Agent" },
  { titleZh: "Gate 评估", titleEn: "gate evaluation", ownerZh: "Agent", ownerEn: "Agent" },
  { titleZh: "缺口追踪", titleEn: "gap chasing", ownerZh: "Operator", ownerEn: "Operator" },
  { titleZh: "融资包", titleEn: "financing pack", ownerZh: "Agent", ownerEn: "Agent" },
  { titleZh: "人工 / 专业审查", titleEn: "human / professional review", ownerZh: "Human + Professional", ownerEn: "Human + Professional" },
  { titleZh: "LoanRequestRegistry 预审", titleEn: "LoanRequestRegistry pre-review", ownerZh: "Contract", ownerEn: "Contract" },
  { titleZh: "合约 gate 检查", titleEn: "contract gate check", ownerZh: "Contract", ownerEn: "Contract" },
  { titleZh: "受限应收 token / 贷款转换仅在 approval 后", titleEn: "restricted receivable token / loan conversion only after approval", ownerZh: "Contract + Professional", ownerEn: "Contract + Professional" },
];

const responsibilitySplit = [
  {
    titleZh: "Agent 做",
    titleEn: "Agent does",
    itemsZh: ["分类文件", "抽字段", "计算 candidate metadata", "匹配 gate", "识别缺口", "起草催办消息", "起草 financier memo", "建议下一步", "组装 financing pack"],
    itemsEn: ["Classifies files", "Extracts fields", "Computes candidate metadata", "Matches gates", "Detects gaps", "Drafts follow-ups", "Drafts financier memo", "Suggests next steps", "Assembles financing pack"],
  },
  {
    titleZh: "Operator 做",
    titleEn: "Operator does",
    itemsZh: ["上传 / 选择真实文件", "核实商业真实性", "批准对外消息", "确认买家 / 仓库 / QC claims", "决定争议是否可接受", "是否提交 pre-review", "钱包签名", "升级到专业审查"],
    itemsEn: ["Uploads or selects real files", "Checks commercial reality", "Approves external messages", "Confirms buyer / warehouse / QC claims", "Decides dispute acceptability", "Chooses pre-review submission", "Signs with wallet", "Escalates to professional review"],
  },
  {
    titleZh: "专业机构做",
    titleEn: "Professional institution does",
    itemsZh: ["underwriting", "compliance / KYC", "legal structure", "dispute assessment", "material exception handling", "final approval / rejection / blocked decision"],
    itemsEn: ["Underwriting", "Compliance / KYC", "Legal structure", "Dispute assessment", "Material exception handling", "Final approval / rejection / blocked decision"],
  },
  {
    titleZh: "合约做",
    titleEn: "Contract does",
    itemsZh: ["记录 hash / attestations", "执行 gate", "gate 不通过就阻断放款", "暴露 pre-review state", "approval + gates complete 后才允许转换"],
    itemsEn: ["Records hash / attestations", "Executes gates", "Blocks disbursement when gates fail", "Exposes pre-review state", "Allows conversion only after approval + complete gates"],
  },
];

export function DashboardView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade, businessContext, businessModules, businessStages, evidenceSlots, operatingSummary, proofPack } = workspace;
  const verified = getVerifiedEvidenceCount(evidenceSlots);
  const missing = getMissingEvidenceSlots(evidenceSlots).length;
  const readyScore = `${receivableReadinessReport.score}/${receivableReadinessReport.maxScore}`;
  const blockerText = getBlockerText(zh, evidenceSlots);
  const blockedStages = businessStages.filter((stage) => stage.status === "blocked").length;
  const workingStages = businessStages.filter((stage) => stage.status === "working" || stage.status === "blocked").length;
  const passedGates = loanGates.filter((gate) => gate.status === "passed").length;
  const gateStatus = `${passedGates}/${loanGates.length}`;
  const readinessStatus = t(zh, receivableReadinessReport.statusZh, receivableReadinessReport.statusEn);

  return (
    <>
      <section className={styles.osHero}>
        <div className="section-heading">
          <span>Operator OS</span>
          <h2>{t(zh, "进入后第一眼看到当前 trade、阻断状态和下一步责任人。", "The first screen shows the current trade, blocker state, and the responsible next owner.")}</h2>
          <p>
            {t(
              zh,
              "这不是产品介绍页，而是操作系统首页：把交易金额、融资候选、gate、队列、流程和职责边界放在同一个决策面板里。",
              "This is not product copy. It is an operating homepage that puts trade value, financing candidate, gates, queues, workflow, and responsibility boundaries on one decision surface.",
            )}
          </p>
        </div>
        <div className={styles.osHeroGrid}>
          <article className={styles.tradeSnapshot}>
            <div className={styles.rowHeader}>
              <div className={styles.rowMain}>
                <h3 className={styles.rowTitle}>{t(zh, "当前 trade", "Current trade")}</h3>
                <p className={styles.rowMeta}>{t(zh, activeTrade.titleZh, activeTrade.titleEn)}</p>
              </div>
              <span className={`${styles.statusChip} ${styles.statusHigh}`}>{blockerCode}</span>
            </div>
            <dl className={styles.metricGrid}>
              <div>
                <dt>{t(zh, "贸易金额", "Trade value")}</dt>
                <dd>{activeTrade.totalAmount}</dd>
              </div>
              <div>
                <dt>{t(zh, "阻断应收账款", "Blocked receivable")}</dt>
                <dd>{receivableLoanContract.receivableAmount}</dd>
              </div>
              <div>
                <dt>{t(zh, "申请垫款", "Requested advance")}</dt>
                <dd>{receivableLoanContract.advanceAmount}</dd>
              </div>
              <div>
                <dt>{t(zh, "Readiness", "Readiness")}</dt>
                <dd>{readyScore}</dd>
              </div>
              <div>
                <dt>{t(zh, "Gates", "Gates")}</dt>
                <dd>{gateStatus}</dd>
              </div>
              <div>
                <dt>{t(zh, "放款", "Disbursement")}</dt>
                <dd>{disbursementAllowedText}</dd>
              </div>
            </dl>
          </article>
          <article className={styles.blockerPanel}>
            <span className={styles.panelKicker}>{readinessStatus}</span>
            <strong>Pre-review only · {blockerCode}</strong>
            <p>{t(zh, receivableReadinessReport.recommendationZh, receivableReadinessReport.recommendationEn)}</p>
            <div className={styles.blockerActions}>
              <Link className="primary-button" href="/business-readiness">{t(zh, "打开 readiness", "Open readiness")}</Link>
              <Link className="secondary-button" href="/business-contracts">{t(zh, "看合约阻断", "View contract blocks")}</Link>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.osSection}>
        <div className="section-heading">
          <span>{t(zh, "Operational queues", "Operational queues")}</span>
          <h2>{t(zh, "运营队列按责任分工排队，而不是把所有事情扔给一个 Agent。", "Operational queues are split by responsibility instead of throwing everything into one agent.")}</h2>
        </div>
        <div className={styles.queueGrid}>
          {operatingQueues.map((queue) => (
            <Link href={queue.href} className={styles.queueCard} key={queue.titleEn}>
              <span>{t(zh, queue.ownerZh, queue.ownerEn)}</span>
              <strong>{t(zh, queue.titleZh, queue.titleEn)}</strong>
              <p>{t(zh, queue.statusZh, queue.statusEn)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.osSection}>
        <div className="section-heading">
          <span>{t(zh, "Workflow map", "Workflow map")}</span>
          <h2>{t(zh, "从 PDF 接入到受限转换，所有步骤都必须经过 gate。", "From PDF intake to restricted conversion, every step runs through gates.")}</h2>
        </div>
        <div className={styles.workflowRail}>
          {workflowMap.map((step, index) => (
            <article className={styles.workflowNode} key={step.titleEn}>
              <span>{String(index + 1).padStart(2, "0")} · {t(zh, step.ownerZh, step.ownerEn)}</span>
              <strong>{t(zh, step.titleZh, step.titleEn)}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.osSection}>
        <div className="section-heading">
          <span>{t(zh, "Responsibility split", "Responsibility split")}</span>
          <h2>{t(zh, "Agent、人、专业机构和合约各做各的事。", "Agent, human, professional institution, and contract each do their own job.")}</h2>
        </div>
        <div className={styles.responsibilityGrid}>
          {responsibilitySplit.map((column) => (
            <article className={styles.responsibilityCard} key={column.titleEn}>
              <strong>{t(zh, column.titleZh, column.titleEn)}</strong>
              <ul>
                {(zh ? column.itemsZh : column.itemsEn).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.osSection}>
        <div className="section-heading">
          <span>{t(zh, "Workspace modules", "Workspace modules")}</span>
          <h2>{t(zh, operatingSummary.headlineZh, operatingSummary.headlineEn)}</h2>
          <p>{t(zh, operatingSummary.promiseZh, operatingSummary.promiseEn)}</p>
        </div>
        <div className="pack-step-grid">
          {businessModules.map((module) => (
            <Link href={module.entryHref} className="pack-step-card" key={module.id}>
              <span>{t(zh, module.titleZh, module.titleEn)}</span>
              <strong>{t(zh, module.statusZh, module.statusEn)}</strong>
              <p>{t(zh, module.descriptionZh, module.descriptionEn)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="workspace">
        <div className={styles.osSection}>
          <div className="section-heading"><span>{t(zh, "当前业务", "Current business")}</span><h2>{t(zh, "先让小微企业把这单生意做完。", "Help the SME finish this deal first.")}</h2></div>
          <div className={styles.list}>
            <article className={styles.listRow}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{businessContext.name}</h3>
                  <p className={styles.rowMeta}>{t(zh, operatingSummary.activeDealZh, operatingSummary.activeDealEn)}</p>
                </div>
                <span className={`${styles.statusChip} ${blockedStages > 0 ? styles.statusHigh : styles.statusLow}`}>{blockedStages > 0 ? t(zh, "有卡点", "Blocked") : t(zh, "正常", "Normal")}</span>
              </div>
            </article>
            <article className={styles.listRow}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, "交易 Agent 总览", "Trade agent overview")}</h3>
                  <p className={styles.rowMeta}>{workingStages}/{businessStages.length} {t(zh, "个环节正在推进；当前卡点：", "stages need attention; blockers: ")}{blockerText}</p>
                </div>
                <Link className="primary-button" href="/business-ops">{t(zh, "打开 Agent", "Open agent")}</Link>
              </div>
            </article>
          </div>
        </div>
        <div className={styles.osSection}>
          <div className="section-heading"><span>{t(zh, "证明只是能力之一", "Proof is one capability")}</span><h2>{t(zh, "用事实链服务收款、融资、验收和纠纷，而不是只做溯源页面。", "Use the fact trail for collection, financing, acceptance, and disputes — not just traceability pages.")}</h2></div>
          <div className={styles.list}>
            <article className={styles.listRow}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{proofPack.title}</h3>
                  <p className={styles.rowMeta}>{proofPack.status} · Ready {readyScore} · {verified}/{evidenceSlots.length} {t(zh, "项文件已验证", "documents verified")}</p>
                </div>
                <span className={`${styles.statusChip} ${missing > 0 ? styles.statusMissing : styles.statusVerified}`}>{missing} {t(zh, "缺口", "gaps")}</span>
              </div>
              <div className={styles.rowActions}>
                <Link className="secondary-button" href="/evidence">{t(zh, "补文件", "Complete docs")}</Link>
                <Link className="secondary-button" href="/tasks">{t(zh, "看任务", "View tasks")}</Link>
                <Link className="secondary-button" href="/assistant">{t(zh, "问 Agent", "Ask agent")}</Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
