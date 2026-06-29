import Link from "next/link";
import { signingSlots, tradeSigningContract, type SigningFlow, type SigningSlotStatus } from "@/lib/signature-contract-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusClass(status: SigningSlotStatus) {
  const map: Record<SigningSlotStatus, string> = {
    signed: styles.statusVerified,
    pending: styles.statusOpen,
    blocked: styles.statusRejected,
    expired: styles.statusMissing,
  };
  return `${styles.statusChip} ${map[status]}`;
}

function flowLabel(flow: SigningFlow, zh: boolean) {
  const map: Record<SigningFlow, { zh: string; en: string }> = {
    commercial: { zh: "商流", en: "Commercial flow" },
    logistics: { zh: "物流", en: "Logistics flow" },
    funds: { zh: "资金流", en: "Funds flow" },
    information: { zh: "信息流", en: "Information flow" },
  };
  return zh ? map[flow].zh : map[flow].en;
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article style={{ border: "1px solid var(--border)", borderRadius: 28, padding: 22, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
      <span style={{ color: "#18794e", fontWeight: 900, fontSize: 14 }}>{label}</span>
      <strong style={{ fontSize: "clamp(26px, 3vw, 38px)", lineHeight: 1.05, letterSpacing: "-0.04em", wordBreak: "break-word" }}>{value}</strong>
      <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.45, wordBreak: "break-word" }}>{note}</p>
    </article>
  );
}

export function SigningContractView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;
  const signedCount = signingSlots.filter((slot) => slot.status === "signed").length;
  const blockedCount = signingSlots.filter((slot) => slot.status === "blocked").length;
  const pendingCount = signingSlots.filter((slot) => slot.status === "pending").length;

  function partyName(id: string) {
    return activeTrade.parties.find((party) => party.id === id)?.name ?? id;
  }

  function docLabel(id: string) {
    const doc = activeTrade.documents.find((item) => item.id === id);
    return doc ? `${zh ? doc.typeZh : doc.typeEn} · ${doc.documentNo}` : id;
  }

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "业务签章合约", "Business signing contract")}</span>
          <h2>{t(zh, "四流里需要签字、盖章、oracle 输入的责任点，都进入链上智能合约状态机。", "Signature, seal, and oracle accountability points across the four flows enter an on-chain smart-contract state machine.")}</h2>
          <p>{t(zh, activeTrade.titleZh, activeTrade.titleEn)} · {tradeSigningContract.network} · {tradeSigningContract.address}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <MetricCard label={t(zh, "合约", "Contract")} value={tradeSigningContract.address} note={t(zh, tradeSigningContract.nameZh, tradeSigningContract.nameEn)} />
          <MetricCard label={t(zh, "已签章", "Signed / sealed")} value={`${signedCount}/${signingSlots.length}`} note={t(zh, "可用于解锁下一步业务状态", "Can unlock the next business state")} />
          <MetricCard label={t(zh, "待核验", "Pending")} value={`${pendingCount}`} note={t(zh, "提单与新加坡进口许可仍在等待核验", "B/L and Singapore import permit are waiting for verification")} />
          <MetricCard label={t(zh, "阻塞", "Blocked")} value={`${blockedCount}`} note={t(zh, "仓库、到港质检、买方验收、RWA 发行多签被卡", "Warehouse, arrival QC, buyer acceptance, and RWA issuance multisig are blocked")} />
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "签章状态机", "Signing state machine")}</span>
          <h2>{t(zh, "合约只记录 hash、角色、状态、时间戳和触发条件，不公开原始文件。", "The contract records hashes, roles, status, timestamps, and trigger conditions, not raw files.")}</h2>
        </div>
        <div className={styles.list}>
          {signingSlots.map((slot) => (
            <article className={styles.listRow} key={slot.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{flowLabel(slot.flow, zh)} · {t(zh, slot.titleZh, slot.titleEn)}</h3>
                  <p className={styles.rowMeta}>{t(zh, "签章方：", "Signer: ")}{partyName(slot.requiredSignerPartyId)} · {t(zh, "类型：", "Kind: ")}{slot.kind} · {t(zh, "期限：", "Due: ")}{slot.dueDate}</p>
                  <p className={styles.rowMeta}>{t(zh, "文件：", "Document: ")}{docLabel(slot.linkedDocumentId)} · Hash: {slot.documentHash ?? "pending"}</p>
                  <p className={styles.rowMeta}>{t(zh, "解锁：", "Unlocks: ")}{t(zh, slot.unlocksZh, slot.unlocksEn)}</p>
                  <p className={styles.rowMeta}>{t(zh, slot.noteZh, slot.noteEn)}</p>
                  {slot.txHash && <p className={styles.rowMeta}>Tx: {slot.txHash} · {slot.signedAt}</p>}
                </div>
                <span className={statusClass(slot.status)}>{slot.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "合约边界", "Contract boundary")}</span>
          <h2>{t(zh, "智能合约处理签章状态和触发条件，但不替代链下法律文件、海关系统、港口系统或仓库系统。", "The smart contract manages signing status and triggers, but does not replace off-chain legal documents, customs, port, or warehouse systems.")}</h2>
        </div>
        <div className={styles.list}>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "合约可以做", "Contract can do")}</h3>
            <p className={styles.rowMeta}>{t(zh, "记录文件 hash、签章方、签章状态、时间戳、版本号；在所有必要签章完成后解锁付款、贷款放款或 RWA tokenization。", "Record file hashes, signers, signing status, timestamps, and versions; unlock payment, loan disbursement, or RWA tokenization when all required signatures/seals are complete.")}</p>
          </article>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "合约不能做", "Contract cannot do")}</h3>
            <p className={styles.rowMeta}>{t(zh, "不能伪造公章，不能替人签名，不能确认链下货物真实到仓；这些必须由授权签章方、oracle、仓库、货代或人工验真输入。", "It cannot forge seals, sign for people, or confirm off-chain goods arrived; those inputs must come from authorized signers, oracle, warehouse, forwarder, or human verification.")}</p>
          </article>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "当前 Agent 判断", "Current agent judgement")}</h3>
            <p className={styles.rowMeta}>{t(zh, "PO、发票、装箱单、装运前质检、VGM、出口放行已经闭合；提单和进口许可待核验；入库、到港质检、买家验收、贷款放款多签被阻塞。下一步先补物流证据，再推进贷款和 RWA。", "PO, invoice, packing list, pre-shipment QC, VGM, and export release are closed; B/L and import permit are pending; warehouse entry, arrival QC, buyer acceptance, and disbursement multisig are blocked. Complete logistics evidence before loan and RWA.")}</p>
          </article>
          <div className={styles.rowActions}>
            <Link className="primary-button" href="/business-logistics">{t(zh, "处理物流证据", "Handle logistics evidence")}</Link>
            <Link className="secondary-button" href="/business-loan">{t(zh, "贷款合约", "Loan contract")}</Link>
            <Link className="secondary-button" href="/business-flows">{t(zh, "回到四流合一", "Back to four flows")}</Link>
            <Link className="secondary-button" href="/business-financing">{t(zh, "RWA 代币化", "RWA tokenization")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
