import Link from "next/link";
import {
  applicationArchitecture,
  architectureRoadmap,
  blmSections,
  dataArchitecture,
  scenarioFlow,
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

export function BusinessArchitectureView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "咨询方案级总览", "Consulting-grade blueprint")}</span>
          <h2>{t(zh, "BLM → 场景流程 → 应用架构 → 数据架构 → 技术架构。", "BLM → scenario flow → application architecture → data architecture → technical architecture.")}</h2>
          <p>{t(zh, "把 ChainTrace 从产品 demo 整理成客户、资金方和投资人都能理解的实施蓝图。", "Turn ChainTrace from a product demo into an implementation blueprint for customers, financiers, and investors.")}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <article style={{ border: "1px solid var(--border)", borderRadius: 26, padding: 20 }}>
            <span style={{ color: "#18794e", fontWeight: 900, fontSize: 13 }}>{t(zh, "战略定位", "Strategic position")}</span>
            <h3 className={styles.rowTitle}>{t(zh, "跨境贸易融资证据操作系统", "Trade-finance evidence OS")}</h3>
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
          <span>{t(zh, "2. 场景流程", "2. Scenario flow")}</span>
          <h2>{t(zh, scenarioFlow.summaryZh, scenarioFlow.summaryEn)}</h2>
        </div>
        <div className={styles.list}><SectionCard zh={zh} section={scenarioFlow} /></div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "3. 应用架构", "3. Application architecture")}</span>
          <h2>{t(zh, "按用户入口、贸易工作台、证据 Gate、融资评分和链上金融拆分应用域。", "Split application domains by portals, trade workspace, evidence gates, readiness, and on-chain finance.")}</h2>
        </div>
        <LayerGrid zh={zh} layers={applicationArchitecture} />
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "4. 数据架构", "4. Data architecture")}</span>
          <h2>{t(zh, "围绕 Trade Case 建主数据，把链下原文、链上状态和融资评分分层治理。", "Use Trade Case as master data and separate off-chain documents, on-chain states, and readiness decisions.")}</h2>
        </div>
        <LayerGrid zh={zh} layers={dataArchitecture} />
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "5. 技术架构", "5. Technical architecture")}</span>
          <h2>{t(zh, "Next.js 前端、API、Solidity 合约、未来数据库/对象存储、CI/CD 形成可扩展技术底座。", "Next.js frontend, API, Solidity contracts, future DB/object storage, and CI/CD form the scalable technical foundation.")}</h2>
        </div>
        <LayerGrid zh={zh} layers={technicalArchitecture} />
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "6. 实施路线图", "6. Roadmap")}</span>
          <h2>{t(zh, "从 demo 验证到 MVP、真实 pilot，再到受控融资。", "From demo validation to MVP, real pilot, and controlled financing.")}</h2>
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
