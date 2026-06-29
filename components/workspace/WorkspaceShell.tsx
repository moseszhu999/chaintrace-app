import Link from "next/link";
import type { ReactNode } from "react";
import { workspaceNavItems, type WorkspaceNavKey } from "@/lib/workspace-navigation";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";

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

  return (
    <main className="page-shell">
      <section className="panel workspace-panel">
        <div className="workspace-layout">
          <aside className="workspace-sidebar">
            <Link href="/" className="workspace-brand">
              <span className="workspace-brand-mark">CT</span>
              ChainTrace
            </Link>
            <nav className="workspace-nav" aria-label="Workspace navigation">
              {workspaceNavItems.map((item) => (
                <Link key={item.key} href={item.href} className={`${active === item.key ? "primary-button" : "secondary-button"} workspace-nav-link`}>
                  {zh ? item.zh : item.en}
                </Link>
              ))}
            </nav>
            <div className="proof-flow-card workspace-org-card">
              <strong>{t(zh, "当前组织", "Current org")}</strong>
              <span>{organization.name}</span>
            </div>
            <Link className="secondary-button workspace-exit-link" href="/login">{t(zh, "退出模拟登录", "Exit mock login")}</Link>
          </aside>

          <section className="workspace-main">
            <div className="workspace-topbar">
              <div>
                <div className="eyebrow">{t(zh, "登录后工作台", "Logged-in workspace")}</div>
                <h1 className="workspace-title">{t(zh, "今天先处理当前卡住的这票货。", "Start with the blocked shipment today.")}</h1>
                <p className="workspace-subtitle">{organization.name} · {businessContext.batchNo}</p>
              </div>
              <div className="hero-actions workspace-action">
                {actionSlot ?? <Link className="secondary-button" href="/assistant">{t(zh, "问助手", "Ask assistant")}</Link>}
              </div>
            </div>
            {children}
          </section>
        </div>
      </section>
    </main>
  );
}
