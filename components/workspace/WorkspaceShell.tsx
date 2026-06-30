import Link from "next/link";
import type { ReactNode } from "react";
import { workspaceNavGroups, type WorkspaceNavKey } from "@/lib/workspace-navigation";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export type WorkspaceHeaderCopy = {
  eyebrowZh?: string;
  eyebrowEn?: string;
  titleZh?: string;
  titleEn?: string;
  subtitleZh?: string;
  subtitleEn?: string;
};

export function WorkspaceShell({
  zh,
  active,
  workspace,
  children,
  actionSlot,
  header,
}: {
  zh: boolean;
  active: WorkspaceNavKey;
  workspace: WorkspaceSnapshot;
  children: ReactNode;
  actionSlot?: ReactNode;
  header?: WorkspaceHeaderCopy;
}) {
  const { businessContext, operatingSummary, organization } = workspace;
  const eyebrow = t(zh, header?.eyebrowZh ?? "交易 Agent", header?.eyebrowEn ?? "Trade agent");
  const title = t(zh, header?.titleZh ?? operatingSummary.headlineZh, header?.titleEn ?? operatingSummary.headlineEn);
  const subtitle = t(zh, header?.subtitleZh ?? `${organization.name} · ${businessContext.batchNo}`, header?.subtitleEn ?? `${organization.name} · ${businessContext.batchNo}`);

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
              {workspaceNavGroups.map((group) => (
                <div key={group.id} className="workspace-nav-group">
                  <span className="workspace-nav-heading">
                    {zh ? group.zh : group.en}
                  </span>
                  <div className="workspace-nav-items">
                    {group.items.map((item) => (
                      <Link key={item.key} href={item.href} className={`${active === item.key ? "primary-button" : "secondary-button"} workspace-nav-link`}>
                        {zh ? item.zh : item.en}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
            <div className="proof-flow-card workspace-org-card">
              <strong>{t(zh, "当前企业", "Current business")}</strong>
              <span>{organization.name}</span>
            </div>
            <Link className="secondary-button workspace-exit-link" href="/login">{t(zh, "退出", "Exit")}</Link>
          </aside>

          <section className="workspace-main">
            <div className="workspace-topbar">
              <div>
                <div className="eyebrow">{eyebrow}</div>
                <h1 className="workspace-title">{title}</h1>
                <p className="workspace-subtitle">{subtitle}</p>
              </div>
              <div className="hero-actions workspace-action">
                {actionSlot ?? <Link className="secondary-button" href="/assistant">{t(zh, "问 Agent", "Ask agent")}</Link>}
              </div>
            </div>
            {children}
          </section>
        </div>
      </section>
    </main>
  );
}
