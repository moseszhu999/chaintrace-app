import Link from "next/link";
import { agentReplacementMap, businessArchitectureSections, type AgentReplacementStep } from "@/lib/ai-agent-architecture-fixture";
import {
  applicationArchitecture,
  architectureRoadmap,
  blmSections,
  dataArchitecture,
  technicalArchitecture,
  type ArchitectureLayer,
  type ArchitectureRoadmap,
  type ArchitectureSection,
} from "@/lib/business-architecture-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function SectionCard({ zh, section }: { zh: boolean; section: ArchitectureSection }) {
  return (
    <article className={styles.listRow}>
      <div className={styles.rowHeader}>
        <div className={styles.rowMain}>
          <h3 className={styles.rowTitle}>{t(zh, section.titleZh, section.titleEn)}</h3>
          <p className={styles.rowMeta}>{t(zh, section.summaryZh, section.summaryEn)}</p>
          <ul style={{ margin: "12px 0 0", paddingLeft: 18, color: "var(--muted)", lineHeight: 1.65 }}>
            {(zh ? section.pointsZh : section.pointsEn).map((point) => <li key={point}>{point}</li>)}
          </ul>
        </div>
      </div>
    </article>
  );
}

function LayerGrid({ zh, layers }: { zh: boolean; layers: ArchitectureLayer[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
      {layers.map((layer) => (
        <article key={layer.id} style={{ border: "1px solid var(--border)", borderRadius: 26, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ color: "#18794e", fontWeight: 900, fontSize: 13 }}>{t(zh, layer.ownerZh, layer.ownerEn)}</span>
          <h3 className={styles.rowTitle}>{t(zh, layer.titleZh, layer.titleEn)}</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--muted)", lineHeight: 1.65 }}>
            {(zh ? layer.capabilitiesZh : layer.capabilitiesEn).map((capability) => <li key={capability}>{capability}</li>)}
          </ul>
        </article>
      ))}
    </div>
  );
}

function RoadmapCard({ zh, item }: { zh: boolean; item: ArchitectureRoadmap }) {
  return (
    <article className={styles.listRow}>
      <div className={styles.rowHeader}>
        <div className={styles.rowMain}>
          <h3 className={styles.rowTitle}>{item.phase} · {t(zh, item.titleZh, item.titleEn)}</h3>
          <p className={styles.rowMeta}>{t(zh, item.goalZh, item.goalEn)}</p>
          <p className={styles.rowMeta}>{t(zh, "交付物：", "Deliverables: ")}{(zh ? item.deliverablesZh : item.deliverablesEn).join(" / ")}</p>
        </div>
      </div>
    </article>
  );
}

function AgentReplacementCard({ zh, step }: { zh: boolean; step: AgentReplacementStep }) {
  return (
    <article className={styles.listRow}>
      <div className={styles.rowHeader}>
        <div className={styles.rowMain}>
          <h3 className={styles.rowTitle}>{t(zh, step.agentZh, step.agentEn)} · {t(zh, step.outputZh, step.outputEn)}</h3>
          <p className={styles.rowMeta}>{t(zh, "原人工环节：", "Manual step: ")}{t(zh, step.manualStepZh, step.manualStepEn)}</p>
          <p className={styles.rowMeta}>{t(zh, "Agent 替代：", "Agent replacement: ")}{t(zh, step.replacementZh, step.replacementEn)}</p>
        </div>
      </div>
    </article>
  );
}

export function BusinessArchitectureView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "咨询方案级总览", "Consulting-grade blueprint")}</span>
          <h2>{t(zh, "BLM → 业务架构 → 应用架构 → 数据架构 → 技术架构。", "BLM → business architecture → application architecture → data architecture → technical architecture.")}</h2>
          <p>{t(zh, "出圈点：AI Agent 替代人工证据整理、缺口追踪、催办和预审 memo，而不是单纯做一个区块链 demo。", "Breakout point: AI agents replace manual evidence operations, gap tracking, follow-up, and pre-review memo creation—not just another blockchain demo.")}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <article style={{ border: "1px solid var(--border)", borderRadius: 26, padding: 20 }}>
            <span style={{ color: "#18794e", fontWeight: 900, fontSize: 13 }}>{t(zh, "战略定位", "Strategic position")}</span>
            <h3 className={styles.rowTitle}>{t(zh, "AI Agent 驱动的跨境贸易融资证据操作系统", "AI-agent-driven trade-finance evidence OS")}</h3>
          </article>
          <article style={{ border: "1px solid var(--border)", borderRadius: 26, padding: 20 }}>
            <span style={{ color: "#18794e", fontWeight: 900, fontSize: 13 }}>{t(zh, "当前案例", "Current case")}</span>
            <h3 className={styles.rowTitle}>{t(zh, activeTrade.titleZh, activeTrade.titleEn)}</h3>
          </article>
          <article style={{ border: "1px solid var(--border)", borderRadius: 26, padding: 20 }}>
            <span style={{ color: "#18794e", fontWeight: 900, fontSize: 13 }}>{t(zh, "融资判断", "Financing decision")}</span>
            <h3 className={styles.rowTitle}>{t(zh, "62/100，仅可预审", "62/100, pre-review only")}</h3>
          </article>
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "1. BLM", "1. BLM")}</span>
          <h2>{t(zh, "先确定业务领导力模型：市场洞察、战略意图、创新焦点、业务设计。", "Start with the Business Leadership Model: insight, intent, innovation focus, and business design.")}</h2>
        </div>
        <div className={styles.list}>{blmSections.map((section) => <SectionCard zh={zh} section={section} key={section.id} />)}</div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "2. 业务架构", "2. Business architecture")}</span>
          <h2>{t(zh, "业务架构包括能力地图、端到端流程和 AI Agent 替代人工的运营模式。", "Business architecture includes the capability map, end-to-end flow, and the agent-first operating model that replaces manual work.")}</h2>
        </div>
        <div className={styles.list}>{businessArchitectureSections.map((section) => <SectionCard zh={zh} section={section} key={section.id} />)}</div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "2.1 AI Agent 替代人工环节", "2.1 AI agent replacement map")}</span>
          <h2>{t(zh, "这是 ChainTrace 出圈的核心：把人工证据运营变成 Agent 工作流。", "This is ChainTrace's breakout core: turning manual evidence operations into agent workflows.")}</h2>
        </div>
        <div className={styles.list}>{agentReplacementMap.map((step) => <AgentReplacementCard zh={zh} step={step} key={step.id} />)}</div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "3. 应用架构", "3. Application architecture")}</span>
          <h2>{t(zh, "应用架构承接业务能力：门户、贸易工作台、证据 Gate、融资评分、AI Agent 和链上金融。", "Application architecture implements business capabilities: portals, trade workspace, evidence gates, readiness, AI agents, and on-chain finance.")}</h2>
        </div>
        <LayerGrid zh={zh} layers={applicationArchitecture} />
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "4. 数据架构", "4. Data architecture")}</span>
          <h2>{t(zh, "围绕 Trade Case 建主数据，把链下原文、链上状态、Agent 输出和融资评分分层治理。", "Use Trade Case as master data and govern off-chain documents, on-chain states, agent outputs, and readiness decisions separately.")}</h2>
        </div>
        <LayerGrid zh={zh} layers={dataArchitecture} />
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "5. 技术架构", "5. Technical architecture")}</span>
          <h2>{t(zh, "技术架构最后落地：前端、API、Agent 服务、合约、数据库、对象存储和 CI/CD。", "Technical architecture comes last: frontend, API, agent services, contracts, database, object storage, and CI/CD.")}</h2>
        </div>
        <LayerGrid zh={zh} layers={technicalArchitecture} />
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "6. 实施路线图", "6. Roadmap")}</span>
          <h2>{t(zh, "从 demo 验证到 Agent-first MVP、真实 pilot，再到受控融资。", "From demo validation to agent-first MVP, real pilot, and controlled financing.")}</h2>
        </div>
        <div className={styles.list}>{architectureRoadmap.map((item) => <RoadmapCard zh={zh} item={item} key={item.phase} />)}</div>
        <div className={styles.rowActions} style={{ marginTop: 18 }}>
          <Link className="primary-button" href="/business-readiness">{t(zh, "查看融资评分", "View readiness score")}</Link>
          <Link className="secondary-button" href="/api/financing-pack" target="_blank">{t(zh, "打开融资包 API", "Open financing-pack API")}</Link>
          <Link className="secondary-button" href="/business-contracts">{t(zh, "查看合约控制台", "View contract console")}</Link>
        </div>
      </div>
    </section>
  );
}
