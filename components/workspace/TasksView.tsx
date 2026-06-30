import type { TradeMilestoneStatus } from "@/lib/concrete-trade-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusClass(status: TradeMilestoneStatus) {
  const map: Record<TradeMilestoneStatus, string> = {
    done: styles.statusVerified,
    working: styles.statusOpen,
    blocked: styles.statusHigh,
    waiting: styles.statusMedium,
  };
  return `${styles.statusChip} ${map[status]}`;
}

const missingEvidenceRequestDraftPreview = {
  sourceDecisionReceipt: "operator-decision-receipt.v0.1",
  requestStatus: "draft_preview",
  approvalStatus: "not_requested",
  sendStatus: "not_sent",
  decisionStatus: "not_started",
  allowedAction: "MISSING_EVIDENCE_REQUEST_DRAFT_PREVIEW_ONLY",
  humanReviewRequired: true,
  professionalReviewRequired: true,
  agentDecisionAuthority: "none",
  blockerCode: "GATES_NOT_PASSED",
  disbursementAllowed: false,
  drafts: [
    {
      targetZh: "仓库 / 仓储方",
      targetEn: "Warehouse operator",
      documentZh: "仓库回执",
      documentEn: "warehouse receipt",
      reasonZh: "确认货物已入库并可用于买家验收与融资预审。",
      reasonEn: "Confirm goods are warehoused so buyer acceptance and financing pre-review can continue.",
      blockerImpactZh: "缺仓库回执会保持物流 gate 阻断。",
      blockerImpactEn: "Missing warehouse receipt keeps the logistics gate blocked.",
    },
    {
      targetZh: "QC / 检验方",
      targetEn: "QC provider",
      documentZh: "到港 QC",
      documentEn: "arrival QC",
      reasonZh: "确认到港质量状态，避免争议影响应收账款。",
      reasonEn: "Confirm arrival quality status so disputes do not impair the receivable.",
      blockerImpactZh: "缺到港 QC 会保留争议和质量例外。",
      blockerImpactEn: "Missing arrival QC keeps dispute and quality exceptions open.",
    },
    {
      targetZh: "买家",
      targetEn: "Buyer",
      documentZh: "买家验收",
      documentEn: "buyer acceptance",
      reasonZh: "确认买家接受货物和应收账款真实性。",
      reasonEn: "Confirm buyer acceptance and commercial reality of the receivable.",
      blockerImpactZh: "缺买家验收会阻断尾款、pre-review 和后续转换。",
      blockerImpactEn: "Missing buyer acceptance blocks balance collection, pre-review, and later conversion.",
    },
  ],
};

export function TasksView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;
  const actionMilestones = activeTrade.milestones.filter((item) => item.status !== "done");
  const missingDocs = activeTrade.documents.filter((doc) => doc.status === "missing" || doc.status === "rejected");
  const requestFacts = [
    { label: "requestStatus", value: missingEvidenceRequestDraftPreview.requestStatus },
    { label: "approvalStatus", value: missingEvidenceRequestDraftPreview.approvalStatus },
    { label: "sendStatus", value: missingEvidenceRequestDraftPreview.sendStatus },
    { label: "allowedAction", value: missingEvidenceRequestDraftPreview.allowedAction },
    { label: "decisionStatus", value: missingEvidenceRequestDraftPreview.decisionStatus },
    { label: "blockerCode", value: missingEvidenceRequestDraftPreview.blockerCode },
    { label: "disbursementAllowed", value: String(missingEvidenceRequestDraftPreview.disbursementAllowed) },
  ];

  function partyName(id: string) {
    return activeTrade.parties.find((party) => party.id === id)?.name ?? id;
  }

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading"><span>{t(zh, "交易任务", "Trade tasks")}</span><h2>{t(zh, "任务来自这笔咖啡豆交易的真实卡点。", "Tasks come from real blockers in this coffee-bean trade.")}</h2></div>
        <div className={styles.list}>
          {actionMilestones.map((task) => (
            <article className={styles.listRow} key={task.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, task.titleZh, task.titleEn)}</h3>
                  <p className={styles.rowMeta}>{t(zh, "负责人：", "Owner: ")}{partyName(task.ownerPartyId)} · {t(zh, "期限：", "Due: ")}{task.dueDate}</p>
                  {task.blockerZh && <p className={styles.rowMeta}>{t(zh, task.blockerZh, task.blockerEn ?? task.blockerZh)}</p>}
                  <p className={styles.rowMeta}>{t(zh, "Agent 下一步：", "Agent next step: ")}{t(zh, task.nextActionZh, task.nextActionEn)}</p>
                </div>
                <span className={statusClass(task.status)}>{task.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="panel">
        <div className="section-heading"><span>{t(zh, "风险与收款影响", "Risk & collection impact")}</span><h2>{t(zh, "缺口不是提醒事项，而是尾款和融资条件。", "Gaps are not reminders; they are payment and financing conditions.")}</h2></div>
        <div className={styles.list}>
          {missingDocs.map((doc) => (
            <article className={styles.listRow} key={doc.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, doc.typeZh, doc.typeEn)} · {doc.documentNo}</h3>
                  <p className={styles.rowMeta}>{t(zh, doc.noteZh, doc.noteEn)}</p>
                  <p className={styles.rowMeta}>{t(zh, "责任方：", "Owner: ")}{partyName(doc.issuerPartyId)}</p>
                </div>
                <span className={`${styles.statusChip} ${styles.statusHigh}`}>{doc.status}</span>
              </div>
            </article>
          ))}
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "当前业务后果", "Current business consequence")}</h3>
            <p className={styles.rowMeta}>{t(zh, "70% 尾款 USD 36,960 被买家验收卡住；资金方只能预审，不能正式提交融资。", "The 70% balance of USD 36,960 is blocked by buyer acceptance; the financier can only pre-review, not formally process financing.")}</p>
          </article>
        </div>
      </div>
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "Missing evidence request draft preview", "Missing evidence request draft preview")}</span>
          <h2>{t(zh, "从 operator receipt 生成催办草稿，但不发送。", "Draft missing-evidence requests from the operator receipt without sending them.")}</h2>
          <p>
            {t(
              zh,
              "messages are not sent。这里只把仓库、QC、买家要补什么和为什么仍然阻断写清楚；人工批准前不通知、不保存、不分配任务。",
              "messages are not sent. This only states what warehouse, QC, and buyer should provide and why the case remains blocked; before human approval it does not notify, persist, or assign tasks.",
            )}
          </p>
        </div>
        <div className={styles.list}>
          <article className={styles.listRow}>
            <div className={styles.rowHeader}>
              <div className={styles.rowMain}>
                <h3 className={styles.rowTitle}>{missingEvidenceRequestDraftPreview.sourceDecisionReceipt}</h3>
                <p className={styles.rowMeta}>humanReviewRequired=true · professionalReviewRequired=true · agentDecisionAuthority=none</p>
                <p className={styles.rowMeta}>Pre-review only · {missingEvidenceRequestDraftPreview.blockerCode} · disbursementAllowed=false</p>
              </div>
              <span className={`${styles.statusChip} ${styles.statusHigh}`}>{missingEvidenceRequestDraftPreview.requestStatus}</span>
            </div>
          </article>
          {requestFacts.map((fact) => (
            <article className={styles.listRow} key={fact.label}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{fact.label}</h3>
                  <p className={styles.rowMeta}>{fact.value}</p>
                </div>
              </div>
            </article>
          ))}
          {missingEvidenceRequestDraftPreview.drafts.map((draft) => (
            <article className={styles.listRow} key={draft.documentEn}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, draft.documentZh, draft.documentEn)}</h3>
                  <p className={styles.rowMeta}>{t(zh, "收件方：", "Target: ")}{t(zh, draft.targetZh, draft.targetEn)}</p>
                  <p className={styles.rowMeta}>{t(zh, draft.reasonZh, draft.reasonEn)}</p>
                  <p className={styles.rowMeta}>{t(zh, draft.blockerImpactZh, draft.blockerImpactEn)}</p>
                </div>
                <span className={`${styles.statusChip} ${styles.statusMedium}`}>draft</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
