"use client";

import { useState } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { demoRoleCookieName, demoRoleLabels, demoRoles, type DemoRole } from "@/lib/demo-roles";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

const caseStats = [
  { zh: "贸易金额", en: "Trade value", value: "USD 52,800" },
  { zh: "尾款应收", en: "Balance receivable", value: "USD 36,960" },
  { zh: "申请垫款", en: "Requested advance", value: "USDC 29,500" },
  { zh: "贷款 Gate", en: "Loan gates", value: "6/12" },
];

const workspacePreview = [
  { zh: "证据收件箱", en: "Evidence inbox", value: "18" },
  { zh: "阻断缺口", en: "Blocking gaps", value: "4" },
  { zh: "待办任务", en: "Open tasks", value: "7" },
];

export function LoginPage({ zh }: { zh: boolean }) {
  const [email, setEmail] = useState("maya@example-exporter.com");
  const [org, setOrg] = useState("Example Small Exporter");
  const [role, setRole] = useState<DemoRole>("operator");

  function setDemoRoleCookie() {
    document.cookie = `${demoRoleCookieName}=${encodeURIComponent(role)}; path=/; max-age=31536000`;
  }

  return (
    <>
      <PublicHeader zh={zh} />
      <main className="page-shell">
        <section className="login-conversion">
          <div className="login-story">
            <div className="eyebrow">{t(zh, "登录前看到价值，登录后处理业务", "See value before login, work after login")}</div>
            <h1>{t(zh, "进入预审级证据工作台。", "Enter the pre-review evidence workspace.")}</h1>
            <p>
              {t(
                zh,
                "访客先创建预审 Case；登录后进入真实工作台主路径，处理证据、任务、专业审查和 handoff。",
                "Visitors first create a pre-review case; after login, users enter the working-site path for evidence, tasks, review, and handoff.",
              )}
            </p>

            <div className="login-case-strip">
              {caseStats.map((item) => (
                <article key={item.en}>
                  <span>{t(zh, item.zh, item.en)}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>

            <div className="login-diagnosis">
              <span>{t(zh, "当前判断", "Current diagnosis")}</span>
              <strong>Pre-review only · GATES_NOT_PASSED</strong>
              <p>disbursementAllowed=false</p>
            </div>
          </div>

          <div className="login-stack">
            <div className="panel form-panel login-card">
              <div className="section-heading">
                <span>{t(zh, "登录 ChainTrace", "Login to ChainTrace")}</span>
                <h2>{t(zh, "打开工作台主路径。", "Open the working-site path.")}</h2>
                <p>{t(zh, "当前版本使用 demo role cookie；真实版本再接认证、组织、角色、权限和审计日志。", "This version uses a demo role cookie; the real version will connect auth, organization, roles, permissions, and audit logs.")}</p>
              </div>

              <label>
                {t(zh, "邮箱", "Email")}
                <input value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label>
                {t(zh, "组织", "Organization")}
                <input value={org} onChange={(event) => setOrg(event.target.value)} />
              </label>
              <label>
                {t(zh, "角色", "Role")}
                <select value={role} onChange={(event) => setRole(event.target.value as DemoRole)}>
                  {demoRoles.map((item) => (
                    <option key={item} value={item}>{zh ? demoRoleLabels[item].zh : demoRoleLabels[item].en}</option>
                  ))}
                </select>
              </label>

              <div className="hero-actions">
                <a className="primary-button" href="/dashboard" onClick={setDemoRoleCookie}>{t(zh, "登录并打开操作台", "Login and open dashboard")}</a>
                <a className="secondary-button" href="/cases" onClick={setDemoRoleCookie}>{t(zh, "查看 Case", "View cases")}</a>
              </div>
            </div>

            <div className="panel preview-panel login-preview">
              <div className="login-preview-header">
                <span>{t(zh, "登录后预览", "Post-login preview")}</span>
                <strong>{org}</strong>
              </div>
              <div className="login-preview-grid">
                {workspacePreview.map((item) => (
                  <article key={item.en}>
                    <span>{t(zh, item.zh, item.en)}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>
              <dl className="proof-details compact-details">
                <div><dt>{t(zh, "当前用户", "Current user")}</dt><dd>{email}</dd></div>
                <div><dt>{t(zh, "角色", "Role")}</dt><dd>{zh ? demoRoleLabels[role].zh : demoRoleLabels[role].en}</dd></div>
                <div><dt>{t(zh, "权限边界", "Permission boundary")}</dt><dd>{t(zh, "关键商业动作仍需人工确认。", "Key commercial actions still require human confirmation.")}</dd></div>
              </dl>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
