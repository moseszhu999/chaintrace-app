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

const statusSteps = [
  { titleZh: "证据接入", titleEn: "Evidence intake", stateZh: "已开始", stateEn: "Started", tone: "done" },
  { titleZh: "本地 hash / 候选", titleEn: "Local hash / candidate", stateZh: "已生成", stateEn: "Generated", tone: "done" },
  { titleZh: "Agent 抽取", titleEn: "Agent extraction", stateZh: "已准备", stateEn: "Prepared", tone: "done" },
  { titleZh: "Gate 评估", titleEn: "Gate evaluation", stateZh: "6/12", stateEn: "6/12", tone: "active" },
  { titleZh: "人工批示", titleEn: "Human approval", stateZh: "需要处理", stateEn: "Required", tone: "warning" },
  { titleZh: "专业审查", titleEn: "Professional review", stateZh: "待提交", stateEn: "Pending", tone: "warning" },
  { titleZh: "合约执行", titleEn: "Contract execution", stateZh: "阻断", stateEn: "Blocked", tone: "blocked" },
];

const operatingQueues = [
  {
    titleZh: "证据收件箱",
    titleEn: "Evidence inbox",
    statusZh: "6 份已核验，6 份待补齐或阻断",
    statusEn: "6 verified, 6 pending or blocked",
    ownerZh: "Operator + Agent",
    ownerEn: "Operator + Agent",
    nextZh: "补仓库回执、到港 QC、买家验收。",
    nextEn: "Complete warehouse receipt, arrival QC, and buyer acceptance.",
    href: "/evidence",
  },
  {
    titleZh: "Agent 抽取字段",
    titleEn: "Agent extracted fields",
    statusZh: "金额、PO、发票、柜号、VGM 已整理",
    statusEn: "Amount, PO, invoice, container, and VGM organized",
    ownerZh: "Agent",
    ownerEn: "Agent",
    nextZh: "等待人类确认商业真实性。",
    nextEn: "Waiting for human commercial verification.",
    href: "/business-ops",
  },
  {
    titleZh: "Gate 不匹配",
    titleEn: "Gate mismatches",
    statusZh: "2 个待核验，4 个阻断",
    statusEn: "2 pending, 4 blocked",
    ownerZh: "Agent + Contract",
    ownerEn: "Agent + Contract",
    nextZh: "检查 final B/L、进口许可和质检争议。",
    nextEn: "Check final B/L, import permit, and QC dispute.",
    href: "/business-loan",
  },
  {
    titleZh: "缺失文件",
    titleEn: "Missing documents",
    statusZh: "仓库、到港 QC、买家验收仍缺",
    statusEn: "Warehouse, arrival QC, and buyer acceptance still missing",
    ownerZh: "Operator",
    ownerEn: "Operator",
    nextZh: "向仓库、买家和 QC 方催办。",
    nextEn: "Chase warehouse, buyer, and QC counterparties.",
    href: "/tasks",
  },
  {
    titleZh: "待人工批准",
    titleEn: "Human approvals needed",
    statusZh: "对外催办、pre-review 提交、钱包签名",
    statusEn: "Outbound chasing, pre-review submit, wallet signature",
    ownerZh: "Human",
    ownerEn: "Human",
    nextZh: "批准 Agent 起草的催办和预审提交。",
    nextEn: "Approve Agent-drafted chasing and pre-review submission.",
    href: "/assistant",
  },
  {
    titleZh: "专业审查待处理",
    titleEn: "Professional review pending",
    statusZh: "underwriting、KYC、争议和法律结构",
    statusEn: "Underwriting, KYC, dispute, and legal structure",
    ownerZh: "Professional",
    ownerEn: "Professional",
    nextZh: "进入专业审查前不能转换。",
    nextEn: "No conversion before professional review.",
    href: "/business-professional-review",
  },
  {
    titleZh: "合约动作阻断",
    titleEn: "Contract actions blocked",
    statusZh: "LoanRequestRegistry 仅预审；放款和转换未开放",
    statusEn: "LoanRequestRegistry is pre-review only; disbursement and conversion locked",
    ownerZh: "Contract",
    ownerEn: "Contract",
    nextZh: "等待全部 gate 和专业 approval。",
    nextEn: "Wait for complete gates and professional approval.",
    href: "/business-contracts",
  },
];

const workflowMap = [
  { titleZh: "PDF / 证据接入", titleEn: "PDF / evidence intake", ownerZh: "Human", ownerEn: "Human", stateZh: "done", stateEn: "done" },
  { titleZh: "浏览器本地 hash / 候选创建", titleEn: "browser-local hash / candidate creation", ownerZh: "Frontend", ownerEn: "Frontend", stateZh: "done", stateEn: "done" },
  { titleZh: "Agent 分类", titleEn: "Agent classification", ownerZh: "Agent", ownerEn: "Agent", stateZh: "done", stateEn: "done" },
  { titleZh: "Gate 评估", titleEn: "gate evaluation", ownerZh: "Agent", ownerEn: "Agent", stateZh: "active", stateEn: "active" },
  { titleZh: "缺口追踪", titleEn: "gap chasing", ownerZh: "Operator", ownerEn: "Operator", stateZh: "human approval required", stateEn: "human approval required" },
  { titleZh: "融资包", titleEn: "financing pack", ownerZh: "Agent", ownerEn: "Agent", stateZh: "prepared", stateEn: "prepared" },
  { titleZh: "人工 / 专业审查", titleEn: "human / professional review", ownerZh: "Human + Professional", ownerEn: "Human + Professional", stateZh: "required", stateEn: "required" },
  { titleZh: "LoanRequestRegistry 预审", titleEn: "LoanRequestRegistry pre-review", ownerZh: "Contract", ownerEn: "Contract", stateZh: "pre-review only", stateEn: "pre-review only" },
  { titleZh: "合约 gate 检查", titleEn: "contract gate check", ownerZh: "Contract", ownerEn: "Contract", stateZh: "blocked", stateEn: "blocked" },
  { titleZh: "受限应收 token / 贷款转换仅在 approval 后", titleEn: "restricted receivable token / loan conversion only after approval", ownerZh: "Contract + Professional", ownerEn: "Contract + Professional", stateZh: "locked", stateEn: "locked" },
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

const operatorIntakeMirror = {
  source: "public_converter",
  intakeStatus: "draft_preview",
  allowedAction: "PROFESSIONAL_REVIEW_INTAKE_ONLY",
  humanReviewRequired: true,
  professionalReviewRequired: true,
  agentDecisionAuthority: "none",
  queues: [
    {
      ownerZh: "银行预审",
      ownerEn: "Bank pre-review",
      titleZh: "垫款请求与 KYC 检查",
      titleEn: "Advance request and KYC check",
      statusZh: "只读镜像，等待人工决定是否接收入队",
      statusEn: "Read-only mirror; waiting for a human intake decision",
      nextZh: "核对 USDC 29,500 与 62/100 readiness。",
      nextEn: "Check USDC 29,500 against 62/100 readiness.",
    },
    {
      ownerZh: "法律例外",
      ownerEn: "Legal exception",
      titleZh: "买家验收与争议状态",
      titleEn: "Buyer acceptance and dispute status",
      statusZh: "需要补买家验收，不能形成法律意见。",
      statusEn: "Buyer acceptance is missing; no legal opinion is issued.",
      nextZh: "确认合同可执行性、验收和争议。",
      nextEn: "Check enforceability, acceptance, and dispute status.",
    },
    {
      ownerZh: "保理运营",
      ownerEn: "Factor operations",
      titleZh: "物流与仓库证据缺口",
      titleEn: "Logistics and warehouse evidence gaps",
      statusZh: "仓库、到港 QC、买家验收仍缺。",
      statusEn: "Warehouse, arrival QC, and buyer acceptance remain missing.",
      nextZh: "催办 B/L、仓库回执和 QC 报告。",
      nextEn: "Chase B/L, warehouse receipt, and QC report.",
    },
    {
      ownerZh: "Operator evidence desk",
      ownerEn: "Operator evidence desk",
      titleZh: "是否从公开预览转入工作台",
      titleEn: "Whether to move public preview into workspace",
      statusZh: "未提交、未保存、未分配 reviewer。",
      statusEn: "Not submitted, not persisted, and no reviewer assigned.",
      nextZh: "人工决定是否开始正式 intake。",
      nextEn: "Human decides whether to start formal intake.",
    },
  ],
};

const operatorDecisionChecklist = {
  decisionStatus: "not_started",
  allowedAction: "OPERATOR_DECISION_PREVIEW_ONLY",
  items: [
    {
      titleZh: "接收入队预审",
      titleEn: "accept intake for review",
      statusZh: "未开始",
      statusEn: "not_started",
      nextZh: "只能由人工 Operator 决定是否从 draft_preview 接收入队。",
      nextEn: "Only a human operator can decide whether to accept the draft_preview into review.",
    },
    {
      titleZh: "要求补充缺失证据",
      titleEn: "request missing evidence",
      statusZh: "需要处理",
      statusEn: "required",
      nextZh: "补 B/L、仓库回执、到港 QC 和买家验收。",
      nextEn: "Request B/L, warehouse receipt, arrival QC, and buyer acceptance.",
    },
    {
      titleZh: "升级专业审查",
      titleEn: "escalate to professional review",
      statusZh: "仅预览",
      statusEn: "preview_only",
      nextZh: "专业审查前仍不形成法律意见或信用审批。",
      nextEn: "Professional review still does not create a legal opinion or credit approval here.",
    },
    {
      titleZh: "保持阻断状态",
      titleEn: "keep case blocked",
      statusZh: "默认",
      statusEn: "default",
      nextZh: "gate 未通过时保持 GATES_NOT_PASSED 和 disbursementAllowed=false。",
      nextEn: "Keep GATES_NOT_PASSED and disbursementAllowed=false while gates fail.",
    },
  ],
};

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
  const statusFacts = [
    { labelZh: "贸易金额", labelEn: "Trade value", value: activeTrade.totalAmount },
    { labelZh: "阻断应收", labelEn: "Blocked receivable", value: receivableLoanContract.receivableAmount },
    { labelZh: "申请垫款", labelEn: "Requested advance", value: receivableLoanContract.advanceAmount },
    { labelZh: "Readiness", labelEn: "Readiness", value: readyScore },
    { labelZh: "Gates", labelEn: "Gates", value: gateStatus },
    { labelZh: "Blocker", labelEn: "Blocker", value: blockerCode },
    { labelZh: "放款", labelEn: "Disbursement", value: disbursementAllowedText },
  ];
  const intakeFacts = [
    { label: "source", value: operatorIntakeMirror.source },
    { label: "intakeStatus", value: operatorIntakeMirror.intakeStatus },
    { label: "allowedAction", value: operatorIntakeMirror.allowedAction },
    { label: "Readiness", value: readyScore },
    { label: "Gates", value: gateStatus },
    { label: "Blocker", value: blockerCode },
    { label: "Disbursement", value: disbursementAllowedText },
  ];
  const decisionFacts = [
    { label: "decisionStatus", value: operatorDecisionChecklist.decisionStatus },
    { label: "allowedAction", value: operatorDecisionChecklist.allowedAction },
    { label: "humanReviewRequired", value: "true" },
    { label: "professionalReviewRequired", value: "true" },
    { label: "agentDecisionAuthority", value: operatorIntakeMirror.agentDecisionAuthority },
    { label: "Blocker", value: blockerCode },
    { label: "Disbursement", value: disbursementAllowedText },
  ];

  return (
    <>
      <section className={styles.commandShell}>
        <div className="section-heading">
          <span>Operator OS</span>
          <h2>{t(zh, "先看阻断、责任人和下一步批示。", "Start with blocker, owner, and the next human decision.")}</h2>
          <p>
            {t(
              zh,
              "这不是卡片墙，而是交易操作台：顶部给状态，中间给流程，右侧给人类批示。队列和模块只放在下方辅助。",
              "This is not a wall of cards. It is a trade operations console: status on top, workflow in the center, and human decision rail on the right. Queues and modules support the lower section.",
            )}
          </p>
        </div>

        <div className={styles.statusStrip}>
          {statusFacts.map((fact) => (
            <div key={fact.labelEn} className={fact.value === blockerCode || fact.value === disbursementAllowedText ? styles.statusFactBlocked : styles.statusFact}>
              <span>{t(zh, fact.labelZh, fact.labelEn)}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>

        <div className={styles.commandGrid}>
          <main className={styles.workflowConsole}>
            <div className={styles.consoleHeader}>
              <div>
                <span className={styles.panelKicker}>{t(zh, "当前 trade", "Current trade")}</span>
                <h3>{t(zh, activeTrade.titleZh, activeTrade.titleEn)}</h3>
                <p>{t(zh, operatingSummary.activeDealZh, operatingSummary.activeDealEn)}</p>
              </div>
              <span className={`${styles.statusChip} ${styles.statusHigh}`}>Pre-review only</span>
            </div>

            <div className={styles.workflowLane}>
              {statusSteps.map((step, index) => (
                <article className={`${styles.workflowStep} ${styles[`step${step.tone}`]}`} key={step.titleEn}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{t(zh, step.titleZh, step.titleEn)}</strong>
                  <em>{t(zh, step.stateZh, step.stateEn)}</em>
                </article>
              ))}
            </div>

            <div className={styles.workflowMapList}>
              {workflowMap.map((step, index) => (
                <article className={styles.workflowMapRow} key={step.titleEn}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{t(zh, step.titleZh, step.titleEn)}</strong>
                    <p>{t(zh, step.ownerZh, step.ownerEn)} · {t(zh, step.stateZh, step.stateEn)}</p>
                  </div>
                </article>
              ))}
            </div>
          </main>

          <aside className={styles.decisionRail}>
            <span className={styles.panelKicker}>{readinessStatus}</span>
            <h3>{t(zh, "下一步人类批示", "Next human decision")}</h3>
            <p className={styles.decisionLead}>
              {t(
                zh,
                "Agent 已经整理证据缺口和融资包草稿；人类需要决定是否催办到港 QC / 仓库 / 买家验收，并是否提交 pre-review。",
                "The Agent prepared evidence gaps and a financing-pack draft; a human must decide whether to chase arrival QC / warehouse / buyer acceptance and whether to submit pre-review.",
              )}
            </p>
            <div className={styles.agentPreparedBox}>
              <span>{t(zh, "Agent prepared", "Agent prepared")}</span>
              <strong>{proofPack.title}</strong>
              <p>{proofPack.status} · {verified}/{evidenceSlots.length} {t(zh, "项文件已验证", "documents verified")} · {missing} {t(zh, "缺口", "gaps")}</p>
            </div>
            <div className={styles.contractBlockBox}>
              <span>{t(zh, "合约阻断", "Contract block")}</span>
              <strong>{blockerCode}</strong>
              <p>{disbursementAllowedText}</p>
            </div>
            <div className={styles.decisionActions}>
              <Link className="primary-button" href="/tasks">{t(zh, "批准催办", "Approve chasing")}</Link>
              <Link className="secondary-button" href="/business-readiness">{t(zh, "查看 readiness", "View readiness")}</Link>
              <Link className="secondary-button" href="/business-professional-review">{t(zh, "升级专业审查", "Escalate review")}</Link>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.osSection}>
        <div className="section-heading">
          <span>{t(zh, "Intake queue mirror", "Intake queue mirror")}</span>
          <h2>{t(zh, "公开页的 professionalReviewIntake 在这里变成只读队列镜像。", "The public professionalReviewIntake becomes a read-only queue mirror here.")}</h2>
          <p>
            {t(
              zh,
              "这是 draft_preview 的镜像：未提交、未保存、未分配 reviewer。Operator 仍需人工决定是否开始正式 intake。",
              "This mirrors draft_preview only: not submitted, not persisted, and no reviewer assigned. A human operator still decides whether to start formal intake.",
            )}
          </p>
        </div>
        <div className={styles.statusStrip}>
          {intakeFacts.map((fact) => (
            <div key={fact.label} className={fact.value === blockerCode || fact.value === disbursementAllowedText ? styles.statusFactBlocked : styles.statusFact}>
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>
        <div className={styles.queueTable}>
          {operatorIntakeMirror.queues.map((queue) => (
            <article className={styles.queueRow} key={queue.titleEn}>
              <span>{t(zh, queue.ownerZh, queue.ownerEn)}</span>
              <strong>{t(zh, queue.titleZh, queue.titleEn)}</strong>
              <p>{t(zh, queue.statusZh, queue.statusEn)}</p>
              <em>{t(zh, queue.nextZh, queue.nextEn)}</em>
            </article>
          ))}
        </div>
        <div className={styles.agentPreparedBox}>
          <span>{t(zh, "Read-only boundary", "Read-only boundary")}</span>
          <strong>agentDecisionAuthority=none · humanReviewRequired=true · professionalReviewRequired=true</strong>
          <p>Pre-review only · {blockerCode} · {disbursementAllowedText} · allowedAction={operatorIntakeMirror.allowedAction}</p>
        </div>
      </section>

      <section className={styles.osSection}>
        <div className="section-heading">
          <span>{t(zh, "Operator decision checklist", "Operator decision checklist")}</span>
          <h2>{t(zh, "人工只看预览清单，系统不替人做决定。", "The human sees a preview checklist; the system does not decide for them.")}</h2>
          <p>
            {t(
              zh,
              "decisionStatus=not_started。这里只展示下一步人工判断项，不提交、不保存、不分配、不通知、不签名、不发交易、不批准。",
              "decisionStatus=not_started. This only displays the human decision items; it does not submit, persist, assign, notify, sign, transact, or approve.",
            )}
          </p>
        </div>
        <div className={styles.statusStrip}>
          {decisionFacts.map((fact) => (
            <div key={fact.label} className={fact.value === blockerCode || fact.value === disbursementAllowedText ? styles.statusFactBlocked : styles.statusFact}>
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>
        <div className={styles.queueTable}>
          {operatorDecisionChecklist.items.map((item) => (
            <article className={styles.queueRow} key={item.titleEn}>
              <span>{t(zh, item.statusZh, item.statusEn)}</span>
              <strong>{t(zh, item.titleZh, item.titleEn)}</strong>
              <p>{t(zh, "只读 checklist preview", "Read-only checklist preview")}</p>
              <em>{t(zh, item.nextZh, item.nextEn)}</em>
            </article>
          ))}
        </div>
        <div className={styles.contractBlockBox}>
          <span>{t(zh, "Decision boundary", "Decision boundary")}</span>
          <strong>allowedAction={operatorDecisionChecklist.allowedAction}</strong>
          <p>Pre-review only · {blockerCode} · {disbursementAllowedText} · humanReviewRequired=true · professionalReviewRequired=true · agentDecisionAuthority=none</p>
        </div>
      </section>

      <section className={styles.osSection}>
        <div className="section-heading">
          <span>{t(zh, "Operational queues", "Operational queues")}</span>
          <h2>{t(zh, "队列用表格排优先级，不再铺成一墙卡片。", "Queues are prioritized as rows, not spread into a wall of cards.")}</h2>
        </div>
        <div className={styles.queueTable}>
          {operatingQueues.map((queue) => (
            <Link href={queue.href} className={styles.queueRow} key={queue.titleEn}>
              <span>{t(zh, queue.ownerZh, queue.ownerEn)}</span>
              <strong>{t(zh, queue.titleZh, queue.titleEn)}</strong>
              <p>{t(zh, queue.statusZh, queue.statusEn)}</p>
              <em>{t(zh, queue.nextZh, queue.nextEn)}</em>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.osSection}>
        <div className="section-heading">
          <span>{t(zh, "Responsibility split", "Responsibility split")}</span>
          <h2>{t(zh, "Agent、人、专业机构和合约各做各的事。", "Agent, human, professional institution, and contract each do their own job.")}</h2>
        </div>
        <div className={styles.responsibilityMatrix}>
          {responsibilitySplit.map((column) => (
            <article className={styles.responsibilityColumn} key={column.titleEn}>
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
        <div className={styles.moduleLinkGrid}>
          {businessModules.map((module) => (
            <Link href={module.entryHref} className={styles.moduleLink} key={module.id}>
              <span>{t(zh, module.titleZh, module.titleEn)}</span>
              <strong>{t(zh, module.statusZh, module.statusEn)}</strong>
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
                  <p className={styles.rowMeta}>{workingStages}/{businessStages.length} {t(zh, "个环节正在推进；当前卡点：", "stages need attention; blockers: ")}{blockerText}</p>
                </div>
                <span className={`${styles.statusChip} ${blockedStages > 0 ? styles.statusHigh : styles.statusLow}`}>{blockedStages > 0 ? t(zh, "有卡点", "Blocked") : t(zh, "正常", "Normal")}</span>
              </div>
              <div className={styles.rowActions}>
                <Link className="primary-button" href="/business-ops">{t(zh, "打开 Agent", "Open agent")}</Link>
                <Link className="secondary-button" href="/assistant">{t(zh, "问 Agent", "Ask agent")}</Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
