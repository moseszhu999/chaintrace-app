"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StartEvidenceMiniForm } from "@/components/v2/StartEvidenceMiniForm";
import { StartOrganizationProofMiniForm } from "@/components/v2/StartOrganizationProofMiniForm";
import { StartSecondaryFunctionMap } from "@/components/v2/StartSecondaryFunctionMap";
import { StartTradeCaseMiniForm } from "@/components/v2/StartTradeCaseMiniForm";

type StartProofPackFlowSkeletonProps = {
  zh: boolean;
};

type FlowStep = {
  id: string;
  order: number;
  href: string;
  titleZh: string;
  titleEn: string;
  subtitleZh: string;
  subtitleEn: string;
  outputZh: string;
  outputEn: string;
  storageKey?: string;
  primary?: boolean;
};

type LocalStatus = {
  hasOrganization: boolean;
  caseCount: number;
  evidenceCount: number;
  proofPackCount: number;
};

const steps: FlowStep[] = [
  {
    id: "organization",
    order: 1,
    href: "/organization-network",
    titleZh: "创建组织 Proof",
    titleEn: "Create Organization Proof",
    subtitleZh: "生成本地组织身份、orgProfileHash，并可用钱包签名。",
    subtitleEn: "Generate local organization identity, orgProfileHash, and optional wallet signature.",
    outputZh: "Organization Recovery Kit",
    outputEn: "Organization Recovery Kit",
    storageKey: "chaintrace_v2_current_org",
    primary: true,
  },
  {
    id: "case",
    order: 2,
    href: "/trade-cases",
    titleZh: "创建 Trade Case",
    titleEn: "Create Trade Case",
    subtitleZh: "录入贸易基本信息，生成 caseRootHash 和 Case Kit。",
    subtitleEn: "Enter trade basics and generate caseRootHash plus Case Kit.",
    outputZh: "Case Root Hash / Case Kit",
    outputEn: "Case Root Hash / Case Kit",
    storageKey: "chaintrace_v2_trade_cases",
  },
  {
    id: "evidence",
    order: 3,
    href: "/evidence",
    titleZh: "添加 Evidence Hash",
    titleEn: "Attach Evidence Hash",
    subtitleZh: "选择本地文件，浏览器本地计算 SHA-256，生成 Evidence Kit。",
    subtitleEn: "Select local files, compute SHA-256 in browser, and generate Evidence Kit.",
    outputZh: "File SHA-256 / Evidence Kit",
    outputEn: "File SHA-256 / Evidence Kit",
    storageKey: "chaintrace_v2_evidence_bundles",
  },
  {
    id: "proof-pack",
    order: 4,
    href: "/proof-packs",
    titleZh: "生成 Proof Pack",
    titleEn: "Generate Proof Pack",
    subtitleZh: "把组织、Case、Evidence proof 合成 Trade Evidence Passport，并签名 passportRootHash。",
    subtitleEn: "Bundle organization, case, and evidence proofs into a Trade Evidence Passport and sign passportRootHash.",
    outputZh: "Signed Proof Pack / Passport Root",
    outputEn: "Signed Proof Pack / Passport Root",
    storageKey: "chaintrace_v2_proof_packs",
  },
  {
    id: "verify",
    order: 5,
    href: "/verify/local",
    titleZh: "验证 / 分享",
    titleEn: "Verify / Share",
    subtitleZh: "粘贴 Proof Pack，可选上传原文件，外部方本地验证 hash、签名和 fileSha256。",
    subtitleEn: "Paste a Proof Pack and optionally attach raw files so external parties can verify hashes, signature, and fileSha256 locally.",
    outputZh: "Proof-safe Verification Result",
    outputEn: "Proof-safe Verification Result",
  },
];

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function safeArrayCount(raw: string | null) {
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.length : parsed ? 1 : 0;
  } catch {
    return 0;
  }
}

function readStatus(): LocalStatus {
  if (typeof window === "undefined") {
    return { hasOrganization: false, caseCount: 0, evidenceCount: 0, proofPackCount: 0 };
  }
  return {
    hasOrganization: Boolean(window.localStorage.getItem("chaintrace_v2_current_org")),
    caseCount: safeArrayCount(window.localStorage.getItem("chaintrace_v2_trade_cases")),
    evidenceCount: safeArrayCount(window.localStorage.getItem("chaintrace_v2_evidence_bundles")),
    proofPackCount: safeArrayCount(window.localStorage.getItem("chaintrace_v2_proof_packs")),
  };
}

function stepStatus(stepId: string, status: LocalStatus) {
  if (stepId === "organization") return status.hasOrganization ? "READY" : "TODO";
  if (stepId === "case") return status.caseCount > 0 ? "READY" : "TODO";
  if (stepId === "evidence") return status.evidenceCount > 0 ? "READY" : "TODO";
  if (stepId === "proof-pack") return status.proofPackCount > 0 ? "READY" : "TODO";
  if (stepId === "verify") return status.proofPackCount > 0 ? "READY" : "WAITING";
  return "TODO";
}

export function StartProofPackFlowSkeleton({ zh }: StartProofPackFlowSkeletonProps) {
  const [status, setStatus] = useState<LocalStatus>({ hasOrganization: false, caseCount: 0, evidenceCount: 0, proofPackCount: 0 });

  useEffect(() => {
    setStatus(readStatus());
  }, []);

  return (
    <div className="workspace-stack">
      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{t(zh, "Small Entry", "Small Entry")}</span>
          <h2>{t(zh, "一键生成可验证贸易证据护照", "Generate a verifiable Trade Evidence Passport")}</h2>
          <p>{t(zh, "这个页面先作为总入口：先铺出二级功能点，再一点点把表单、上传、签名动作填进去。", "This page is the entry: lay out secondary functions first, then gradually embed forms, upload, and signature actions.")}</p>
        </div>
        <div className="hero-actions">
          <Link className="primary-button" href="/organization-network">{t(zh, "完整组织工作台", "Full Organization Workspace")}</Link>
          <Link className="secondary-button" href="/verify/local">{t(zh, "我已有 Proof Pack，去验证", "I have a Proof Pack, verify it")}</Link>
        </div>
      </section>

      <div className="stats-grid">
        <article className="metric-card">
          <span>{t(zh, "组织 Proof", "Organization Proof")}</span>
          <strong>{status.hasOrganization ? "READY" : "TODO"}</strong>
          <small>{t(zh, "本地组织身份", "Local organization identity")}</small>
        </article>
        <article className="metric-card">
          <span>{t(zh, "Trade Cases", "Trade Cases")}</span>
          <strong>{status.caseCount}</strong>
          <small>{t(zh, "本地 caseRootHash", "Local caseRootHash")}</small>
        </article>
        <article className="metric-card">
          <span>{t(zh, "Evidence", "Evidence")}</span>
          <strong>{status.evidenceCount}</strong>
          <small>{t(zh, "本地 fileSha256", "Local fileSha256")}</small>
        </article>
        <article className="metric-card">
          <span>{t(zh, "Proof Packs", "Proof Packs")}</span>
          <strong>{status.proofPackCount}</strong>
          <small>{t(zh, "Trade Evidence Passport", "Trade Evidence Passport")}</small>
        </article>
      </div>

      <StartSecondaryFunctionMap zh={zh} />

      <StartOrganizationProofMiniForm zh={zh} onDone={() => setStatus(readStatus())} />

      <StartTradeCaseMiniForm zh={zh} onDone={() => setStatus(readStatus())} />

      <StartEvidenceMiniForm zh={zh} onDone={() => setStatus(readStatus())} />

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{t(zh, "One-click Flow Skeleton", "One-click Flow Skeleton")}</span>
          <h2>{t(zh, "5 步路径", "Five-step path")}</h2>
        </div>
        <div className="proof-flow-grid">
          {steps.map((step) => {
            const currentStatus = stepStatus(step.id, status);
            return (
              <article className="proof-flow-card" key={step.id}>
                <span>{t(zh, `第 ${step.order} 步`, `Step ${step.order}`)}</span>
                <strong>{t(zh, step.titleZh, step.titleEn)}</strong>
                <p>{t(zh, step.subtitleZh, step.subtitleEn)}</p>
                <div className="proof-details">
                  <div><dt>{t(zh, "输出", "Output")}</dt><dd>{t(zh, step.outputZh, step.outputEn)}</dd></div>
                  <div><dt>{t(zh, "状态", "Status")}</dt><dd>{currentStatus}</dd></div>
                </div>
                <Link className={step.primary ? "primary-button" : "secondary-button"} href={step.href}>
                  {t(zh, "进入", "Open")}
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{t(zh, "Big Product Mapping", "Big Product Mapping")}</span>
          <h2>{t(zh, "页面骨架对应 5 层功能 / 5 层数据", "Skeleton mapped to five-layer function / data architecture")}</h2>
          <p>{t(zh, "这个入口只暴露一个简单路径，但背后连接 Organization Domain、Trade Case Domain、Evidence Domain、Passport Domain 和 Proof / Signature 层。", "This entry exposes a simple path, but underneath it connects Organization Domain, Trade Case Domain, Evidence Domain, Passport Domain, and the Proof / Signature layer.")}</p>
        </div>
        <div className="table-like-list">
          <div className="table-like-row"><div><strong>F-L1</strong><span>Product Domain</span></div><div><strong>Start Flow</strong><span>/start</span></div></div>
          <div className="table-like-row"><div><strong>F-L2</strong><span>Business Capability</span></div><div><strong>Proof Pack Generation</strong><span>Organization / Case / Evidence / Passport</span></div></div>
          <div className="table-like-row"><div><strong>F-L3</strong><span>Workspace Page</span></div><div><strong>Existing Pages</strong><span>/organization-network, /trade-cases, /evidence, /proof-packs, /verify/local</span></div></div>
          <div className="table-like-row"><div><strong>D-L5</strong><span>Proof Layer</span></div><div><strong>Hash + Signature</strong><span>orgProfileHash / caseRootHash / fileSha256 / passportRootHash</span></div></div>
        </div>
      </section>
    </div>
  );
}
