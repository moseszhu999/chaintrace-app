"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StartBusinessScenarioMap } from "@/components/v2/StartBusinessScenarioMap";
import { StartEvidenceMiniForm } from "@/components/v2/StartEvidenceMiniForm";
import { StartOrganizationProofMiniForm } from "@/components/v2/StartOrganizationProofMiniForm";
import { StartProofPackMiniForm } from "@/components/v2/StartProofPackMiniForm";
import { StartSecondaryFunctionMap } from "@/components/v2/StartSecondaryFunctionMap";
import { StartTradeCaseMiniForm } from "@/components/v2/StartTradeCaseMiniForm";
import { StartVerifyShareMiniPanel } from "@/components/v2/StartVerifyShareMiniPanel";

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
          <span>{t(zh, "Business Entry", "Business Entry")}</span>
          <h2>{t(zh, "你是谁？你现在要完成什么业务结果？", "Who are you, and what business result do you need now?")}</h2>
          <p>{t(zh, "ChainTrace 的入口不应该先问用户要不要生成 Hash，而应该先问：你是出口商、质检员、银行职员，还是平台运营？你要融资、质检确认、放款判断，还是合约维护？", "ChainTrace should not first ask whether the user wants to generate hashes. It should first ask: are you an exporter, QC inspector, bank officer, or platform operator? Do you need financing, QC confirmation, funding decision, or contract maintenance?")}</p>
        </div>
        <div className="hero-actions">
          <a className="primary-button" href="#exporter-financing-flow">{t(zh, "我是出口商，我要融资", "I am an exporter, I need financing")}</a>
          <Link className="secondary-button" href="/business-readiness">{t(zh, "我是资金方，我要判断能不能放款", "I am a funder, I need a funding decision")}</Link>
        </div>
      </section>

      <StartBusinessScenarioMap zh={zh} />

      <section className="proof-flow-card" id="exporter-financing-flow">
        <div className="section-heading compact-heading">
          <span>{t(zh, "Exporter Financing Flow", "Exporter Financing Flow")}</span>
          <h2>{t(zh, "出口商融资准备：我缺钱，我要提交一个可验证融资案件", "Exporter financing prep: I need money and must submit a verifiable funding case")}</h2>
          <p>{t(zh, "下面的 Proof 动作只是为了支持这个业务目标：准备证据、提交案件、等待资金方判断、最终看到资金账户到账。", "The proof actions below only support this business goal: prepare evidence, submit a case, wait for the funder decision, and eventually see funds credited.")}</p>
        </div>
      </section>

      <div className="stats-grid">
        <article className="metric-card">
          <span>{t(zh, "组织 Proof", "Organization Proof")}</span>
          <strong>{status.hasOrganization ? "READY" : "TODO"}</strong>
          <small>{t(zh, "本地组织身份", "Local organization identity")}</small>
        </article>
        <article className="metric-card">
          <span>{t(zh, "融资案件", "Funding Cases")}</span>
          <strong>{status.caseCount}</strong>
          <small>{t(zh, "本地 caseRootHash", "Local caseRootHash")}</small>
        </article>
        <article className="metric-card">
          <span>{t(zh, "证据文件", "Evidence Files")}</span>
          <strong>{status.evidenceCount}</strong>
          <small>{t(zh, "本地 fileSha256", "Local fileSha256")}</small>
        </article>
        <article className="metric-card">
          <span>{t(zh, "可提交 Passport", "Submittable Passports")}</span>
          <strong>{status.proofPackCount}</strong>
          <small>{t(zh, "Trade Evidence Passport", "Trade Evidence Passport")}</small>
        </article>
      </div>

      <StartSecondaryFunctionMap zh={zh} />

      <StartOrganizationProofMiniForm zh={zh} onDone={() => setStatus(readStatus())} />

      <StartTradeCaseMiniForm zh={zh} onDone={() => setStatus(readStatus())} />

      <StartEvidenceMiniForm zh={zh} onDone={() => setStatus(readStatus())} />

      <StartProofPackMiniForm zh={zh} onDone={() => setStatus(readStatus())} />

      <StartVerifyShareMiniPanel zh={zh} />

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{t(zh, "Advanced Proof Builder", "Advanced Proof Builder")}</span>
          <h2>{t(zh, "技术证明链路", "Technical proof chain")}</h2>
          <p>{t(zh, "这部分不是用户目标，而是底层证明动作。以后可以折叠到高级模式。", "This is not the user goal; it is the underlying proof operation. Later it can be collapsed into an advanced mode.")}</p>
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
          <p>{t(zh, "业务入口在上面，Proof / Hash / Signature 是底层支撑，不是第一屏卖点。", "The business entry is above; Proof / Hash / Signature is the supporting layer, not the first-screen selling point.")}</p>
        </div>
        <div className="table-like-list">
          <div className="table-like-row"><div><strong>{t(zh, "业务角色", "Business Role")}</strong><span>Exporter / QC / Funder / Operator</span></div><div><strong>{t(zh, "业务结果", "Business Result")}</strong><span>Funding / QC Pass / Funding Decision / Maintenance</span></div></div>
          <div className="table-like-row"><div><strong>F-L2</strong><span>Scenario Capability</span></div><div><strong>{t(zh, "融资准备 / 质检确认 / 放款判断", "Financing prep / QC confirmation / funding decision")}</strong><span>role-based entry</span></div></div>
          <div className="table-like-row"><div><strong>D-L5</strong><span>Proof Layer</span></div><div><strong>Hash + Signature</strong><span>orgProfileHash / caseRootHash / fileSha256 / passportRootHash</span></div></div>
        </div>
      </section>
    </div>
  );
}
