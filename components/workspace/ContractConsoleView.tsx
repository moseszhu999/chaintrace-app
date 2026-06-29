import Link from "next/link";
import { contractLayers, deploymentModes, type ContractLayerStatus } from "@/lib/contract-suite-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusClass(status: ContractLayerStatus) {
  const map: Record<ContractLayerStatus, string> = {
    implemented: styles.statusOpen,
    tested: styles.statusVerified,
    "dev-deployed": styles.statusVerified,
    "testnet-pending": styles.statusMissing,
  };
  return `${styles.statusChip} ${map[status]}`;
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

export function ContractConsoleView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;
  const tested = contractLayers.filter((layer) => layer.status === "tested").length;

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "智能合约控制台", "Smart contract console")}</span>
          <h2>{t(zh, "把供应链事实、签章 gate、银行资金池、贷款融资和 RWA token 接成一条链上金融状态机。", "Connect supply-chain facts, signing gates, bank vault, receivable loan, and RWA token into one on-chain financial state machine.")}</h2>
          <p>{t(zh, activeTrade.titleZh, activeTrade.titleEn)} · {activeTrade.poNo} · {activeTrade.invoiceNo}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <MetricCard label={t(zh, "合约数量", "Contracts")} value={`${contractLayers.length}`} note={t(zh, "签章、银行、贷款、RWA token", "Signing, bank, loan, RWA token")} />
          <MetricCard label={t(zh, "测试覆盖", "Test coverage")} value={`${tested}/${contractLayers.length}`} note={t(zh, "核心金融逻辑已进入 Hardhat 测试", "Core financial logic is covered by Hardhat tests")} />
          <MetricCard label={t(zh, "Dev 链", "Dev chain")} value={t(zh, "自动", "Auto")} note={t(zh, "CI 自动部署到 Hardhat 临时链", "CI auto-deploys to an ephemeral Hardhat chain")} />
          <MetricCard label={t(zh, "Base Sepolia", "Base Sepolia")} value={t(zh, "手动", "Manual")} note={t(zh, "需要测试 ETH 和手动触发", "Requires test ETH and manual trigger")} />
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "合约层", "Contract layers")}</span>
          <h2>{t(zh, "ChainTrace 的链上部分不是一个 token，而是一组互相约束的合约。", "ChainTrace's on-chain layer is not one token; it is a set of mutually constrained contracts.")}</h2>
        </div>
        <div className={styles.list}>
          {contractLayers.map((layer) => (
            <article className={styles.listRow} key={layer.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, layer.nameZh, layer.nameEn)}</h3>
                  <p className={styles.rowMeta}>{layer.filePath}</p>
                  <p className={styles.rowMeta}>{t(zh, layer.roleZh, layer.roleEn)}</p>
                  <p className={styles.rowMeta}>{t(zh, "解锁：", "Unlocks: ")}{t(zh, layer.unlocksZh, layer.unlocksEn)}</p>
                </div>
                <span className={statusClass(layer.status)}>{layer.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "部署模式", "Deployment modes")}</span>
          <h2>{t(zh, "先用 dev 链验证，再进入 Base Sepolia；不要直接自动主网部署。", "Validate on dev chain first, then Base Sepolia; do not auto-deploy mainnet.")}</h2>
        </div>
        <div className={styles.list}>
          {deploymentModes.map((mode) => (
            <article className={styles.listRow} key={mode.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, mode.nameZh, mode.nameEn)}</h3>
                  <p className={styles.rowMeta}><code>{mode.command}</code></p>
                  <p className={styles.rowMeta}>{t(zh, "需要：", "Requires: ")}{t(zh, mode.requiresZh, mode.requiresEn)}</p>
                  <p className={styles.rowMeta}>{t(zh, "输出：", "Output: ")}{mode.output}</p>
                  <p className={styles.rowMeta}>{t(zh, mode.noteZh, mode.noteEn)}</p>
                </div>
                <span className={`${styles.statusChip} ${mode.id === "base_sepolia" ? styles.statusMissing : styles.statusVerified}`}>{mode.id === "base_sepolia" ? "manual" : "auto"}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "下一步动作", "Next actions")}</span>
          <h2>{t(zh, "现在先看 CI 的 compile / test / deploy-dev 是否全部通过。", "First check whether CI compile / test / deploy-dev all pass.")}</h2>
        </div>
        <div className={styles.list}>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "如果 dev 链通过", "If dev chain passes")}</h3>
            <p className={styles.rowMeta}>{t(zh, "下载 hardhat-dev-deployment artifact，确认 TradeSigningRegistry 和 BankVault 地址已生成。", "Download the hardhat-dev-deployment artifact and confirm TradeSigningRegistry and BankVault addresses are generated.")}</p>
          </article>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "如果测试失败", "If tests fail")}</h3>
            <p className={styles.rowMeta}>{t(zh, "先修测试，不上测试网。金融合约必须先用本地链把 gate、放款、还款、token 转让跑通。", "Fix tests first and do not deploy to testnet. Financial contracts must pass gates, disbursement, repayment, and token-transfer checks locally first.")}</p>
          </article>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "Base Sepolia", "Base Sepolia")}</h3>
            <p className={styles.rowMeta}>{t(zh, "部署钱包有测试 ETH 后，再手动触发 deploy_base_sepolia。", "After the deployer wallet has test ETH, manually trigger deploy_base_sepolia.")}</p>
          </article>
          <div className={styles.rowActions}>
            <Link className="primary-button" href="/business-signing">{t(zh, "签章合约", "Signing contract")}</Link>
            <Link className="secondary-button" href="/business-loan">{t(zh, "贷款合约", "Loan contract")}</Link>
            <Link className="secondary-button" href="/business-wallet">{t(zh, "钱包", "Wallet")}</Link>
            <Link className="secondary-button" href="/business-financing">{t(zh, "RWA 代币化", "RWA tokenization")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
