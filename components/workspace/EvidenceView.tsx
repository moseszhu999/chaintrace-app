"use client";

import { useState } from "react";
import { getMissingEvidenceSlots } from "@/lib/demo-workspace-data";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

type SlotStatus = "verified" | "missing" | "rejected";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusLabel(status: SlotStatus, zh: boolean) {
  const map: Record<SlotStatus, { zh: string; en: string }> = {
    verified: { zh: "已验证", en: "Verified" },
    missing: { zh: "缺失", en: "Missing" },
    rejected: { zh: "已拒绝", en: "Rejected" },
  };
  return zh ? map[status].zh : map[status].en;
}

function statusClass(status: SlotStatus) {
  const map: Record<SlotStatus, string> = {
    verified: styles.statusVerified,
    missing: styles.statusMissing,
    rejected: styles.statusRejected,
  };
  return `${styles.statusChip} ${map[status]}`;
}

export function EvidenceView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const [slots, setSlots] = useState(workspace.evidenceSlots);
  const { proofPack } = workspace;

  function setSlotStatus(id: string, status: SlotStatus) {
    setSlots((items) => items.map((slot) => (slot.id === id ? { ...slot, status } : slot)));
  }

  const missingSlots = getMissingEvidenceSlots(slots);
  const isReady = missingSlots.length === 0;

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "证据槽", "Evidence slots")}</span>
          <h2>{proofPack.title}</h2>
          <p>{t(zh, "每个证据槽都有责任方、业务影响和验证状态。", "Every evidence slot has an owner, business impact, and verification status.")}</p>
        </div>
        <div className={styles.list}>
          {slots.map((slot) => (
            <article className={styles.listRow} key={slot.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{zh ? slot.nameZh : slot.nameEn}</h3>
                  <p className={styles.rowMeta}>{t(zh, "责任方：", "Owner: ")}{zh ? slot.ownerZh : slot.ownerEn} · {t(zh, "影响：", "Affects: ")}{zh ? slot.requiredForZh : slot.requiredForEn}</p>
                </div>
                <span className={statusClass(slot.status)}>{statusLabel(slot.status, zh)}</span>
              </div>
              <div className={styles.rowActions}>
                <button type="button" className="secondary-button" onClick={() => setSlotStatus(slot.id, "missing")}>{t(zh, "标记缺失", "Mark missing")}</button>
                <button type="button" className="secondary-button" onClick={() => setSlotStatus(slot.id, "rejected")}>{t(zh, "拒绝", "Reject")}</button>
                <button type="button" className="primary-button" onClick={() => setSlotStatus(slot.id, "verified")}>{t(zh, "验证通过", "Verify")}</button>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="panel">
        <div className="section-heading"><span>{t(zh, "自动生成", "Auto-generated")}</span><h2>{t(zh, "缺口会自动变成任务和风险。", "Gaps become tasks and risks automatically.")}</h2></div>
        <div className={styles.list}>
          {missingSlots.map((slot) => (
            <article className={styles.listRow} key={slot.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, "待办", "Task")}</h3>
                  <p className={styles.rowMeta}>{t(zh, `请${slot.ownerZh}补齐：${slot.nameZh}`, `Ask ${slot.ownerEn} to complete: ${slot.nameEn}`)}</p>
                </div>
                <span className={`${styles.statusChip} ${styles.statusOpen}`}>{t(zh, "待处理", "Open")}</span>
              </div>
            </article>
          ))}
          {isReady && <div className={styles.emptyRow}>{t(zh, "可以进入公开验证和外部分享。", "Can move to public verification and external sharing.")}</div>}
        </div>
      </div>
    </section>
  );
}
