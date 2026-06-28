import type { ReactNode } from "react";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";

export type WorkspaceNavKey = "dashboard" | "proofPacks" | "evidence" | "tasks" | "assistant" | "approvals";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export function WorkspaceShell({
  zh,
  active,
  workspace,
  children,
  actionSlot,
}: {
  zh: boolean;
  active: WorkspaceNavKey;
  workspace: WorkspaceSnapshot;
  children: ReactNode;
  actionSlot?: ReactNode;
}) {
  const { businessContext, organization } = workspace;
  const navItems: { key: WorkspaceNavKey; href: string; zh: string; en: string }[] = [
    { key: "dashboard", href: "/dashboard", zh: "首页", en: "Home" },
    { key: "proofPacks", href: "/proof-packs", zh: "证明包", en: "Proof packs" },
    { key: "evidence", href: "/evidence", zh: "证据", en: "Evidence" },
    { key: "tasks", href: "/tasks", zh: "任务", en: "Tasks" },
    { key: "assistant", href: "/assistant", zh: "助手", en: "Assistant" },
    { key: "approvals", href: "/assistant/approvals", zh: "审批", en: "Approvals" },
  ];

  return (
    <main className="page-shell">
      <section className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "230px minmax(0, 1fr)", minHeight: 760 }}>
          <aside style={{ borderRight: "1px solid var(--border)", padding: 22, background: "rgba(255,250,240,.72)" }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 950, marginBottom: 24 }}>
              <span style={{ display: "inline-grid", placeItems: "center", width: 34, height: 34, borderRadius: 999, background: "#111827", color: "#fff" }}>CT</span>
              ChainTrace
            </a>
            <nav style={{ display: "grid", gap: 8 }} aria-label="Workspace navigation">
              {navItems.map((item) => (
                <a key={item.key} href={item.href} className={active === item.key ? "primary-button" : "secondary-button"} style={{ justifyContent: "flex-start", width: "100%" }}>
                  {zh ? item.zh : item.en}
                </a>
              ))}
            </nav>
            <div className="proof-flow-card" style={{ marginTop: 24 }}>
              <strong>{t(zh, "当前组织", "Current org")}</strong>
              <span>{organization.name}</span>
            </div>
            <a className="secondary-button" href="/login" style={{ width: "100%" }}>{t(zh, "退出模拟登录", "Exit mock login")}</a>
          </aside>

          <section style={{ padding: 26, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
              <div>
                <div className="eyebrow">{t(zh, "登录后工作台", "Logged-in workspace")}</div>
                <h1 style={{ margin: "14px 0 4px", fontSize: 34, letterSpacing: "-0.04em" }}>{t(zh, "今天先处理当前卡住的这票货。", "Start with the blocked shipment today.")}</h1>
                <p style={{ color: "var(--muted)", margin: 0 }}>{organization.name} · {businessContext.batchNo}</p>
              </div>
              <div className="hero-actions" style={{ marginTop: 0 }}>
                {actionSlot ?? <a className="secondary-button" href="/assistant">{t(zh, "问助手", "Ask assistant")}</a>}
              </div>
            </div>
            {children}
          </section>
        </div>
      </section>
    </main>
  );
}
