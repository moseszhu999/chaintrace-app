"use client";

import { useState } from "react";
import type { TradeDocumentStatus } from "@/lib/concrete-trade-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

type DocumentStatus = TradeDocumentStatus;

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusLabel(status: DocumentStatus, zh: boolean) {
  const map: Record<DocumentStatus, { zh: string; en: string }> = {
    verified: { zh: "已验证", en: "Verified" },
    uploaded: { zh: "已上传", en: "Uploaded" },
    missing: { zh: "缺失", en: "Missing" },
    rejected: { zh: "已拒绝", en: "Rejected" },
  };
  return zh ? map[status].zh : map[status].en;
}

function statusClass(status: DocumentStatus) {
  const map: Record<DocumentStatus, string> = {
    verified: styles.statusVerified,
    uploaded: styles.statusOpen,
    missing: styles.statusMissing,
    rejected: styles.statusRejected,
  };
  return `${styles.statusChip} ${map[status]}`;
}

export function EvidenceView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;
  const [documents, setDocuments] = useState(activeTrade.documents);

  function setDocumentStatus(id: string, status: DocumentStatus) {
    setDocuments((items) => items.map((doc) => (doc.id === id ? { ...doc, status } : doc)));
  }

  const missingDocs = documents.filter((doc) => doc.status === "missing" || doc.status === "rejected");
  const verifiedDocs = documents.filter((doc) => doc.status === "verified");

  function partyName(id: string) {
    return activeTrade.parties.find((party) => party.id === id)?.name ?? id;
  }

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "交易文件", "Trade documents")}</span>
          <h2>{t(zh, activeTrade.titleZh, activeTrade.titleEn)}</h2>
          <p>{activeTrade.poNo} · {activeTrade.invoiceNo} · {activeTrade.containerNo} · {verifiedDocs.length}/{documents.length} {t(zh, "项已验证", "verified")}</p>
        </div>
        <div className={styles.list}>
          {documents.map((doc) => (
            <article className={styles.listRow} key={doc.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, doc.typeZh, doc.typeEn)} · {doc.documentNo}</h3>
                  <p className={styles.rowMeta}>{doc.fileName} · {t(zh, "签发方：", "Issuer: ")}{partyName(doc.issuerPartyId)} · {doc.issuedAt}</p>
                  <p className={styles.rowMeta}>{doc.amount ? `${doc.amount} · ` : ""}{t(zh, doc.noteZh, doc.noteEn)}</p>
                  {doc.hash && <p className={styles.rowMeta}>Hash: {doc.hash}</p>}
                </div>
                <span className={statusClass(doc.status)}>{statusLabel(doc.status, zh)}</span>
              </div>
              <div className={styles.rowActions}>
                <button type="button" className="secondary-button" onClick={() => setDocumentStatus(doc.id, "missing")}>{t(zh, "标记缺失", "Mark missing")}</button>
                <button type="button" className="secondary-button" onClick={() => setDocumentStatus(doc.id, "uploaded")}>{t(zh, "标记已上传", "Mark uploaded")}</button>
                <button type="button" className="primary-button" onClick={() => setDocumentStatus(doc.id, "verified")}>{t(zh, "验证通过", "Verify")}</button>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="panel">
        <div className="section-heading"><span>{t(zh, "缺口任务", "Gap tasks")}</span><h2>{t(zh, "这里测试 Agent 能不能基于具体文件缺口生成动作。", "This tests whether the agent can generate actions from concrete document gaps.")}</h2></div>
        <div className={styles.list}>
          {missingDocs.map((doc) => (
            <article className={styles.listRow} key={doc.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, "待补文件", "Missing document")}</h3>
                  <p className={styles.rowMeta}>{t(zh, `请 ${partyName(doc.issuerPartyId)} 补齐：${doc.typeZh}（${doc.documentNo}）`, `Ask ${partyName(doc.issuerPartyId)} to complete: ${doc.typeEn} (${doc.documentNo})`)}</p>
                </div>
                <span className={`${styles.statusChip} ${styles.statusOpen}`}>{t(zh, "待处理", "Open")}</span>
              </div>
            </article>
          ))}
          {missingDocs.length === 0 && <div className={styles.emptyRow}>{t(zh, "这笔交易文件已经齐备，可以进入验收、收款和融资准备。", "Documents are complete; this trade can move to acceptance, collection, and financing readiness.")}</div>}
        </div>
      </div>
    </section>
  );
}
