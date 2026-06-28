"use client";

import { useState } from "react";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export function LoginPage({ zh }: { zh: boolean }) {
  const [email, setEmail] = useState("maya@example-exporter.com");
  const [org, setOrg] = useState("Example Small Exporter");
  const [role, setRole] = useState("Operations lead");

  return (
    <main className="page-shell">
      <section className="workspace">
        <div className="panel form-panel">
          <div className="section-heading">
            <span>{t(zh, "登录 ChainTrace", "Login to ChainTrace")}</span>
            <h2>{t(zh, "进入你的供应链事实工作台。", "Enter your supply-chain fact workspace.")}</h2>
            <p>{t(zh, "这里先用前端模拟登录。真实版本会接认证、组织、角色、权限和审计日志。", "This is a frontend login simulation. The real version will connect auth, organization, roles, permissions, and audit logs.")}</p>
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
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option>Operations lead</option>
              <option>Finance manager</option>
              <option>Supplier</option>
              <option>Buyer</option>
              <option>Auditor</option>
            </select>
          </label>

          <div className="hero-actions">
            <a className="primary-button" href="/dashboard">{t(zh, "登录并进入工作台", "Login and open workspace")}</a>
            <a className="secondary-button" href="/verify/uy-beef-cn-2026-0001">{t(zh, "不用登录：查看公开验证页", "No login: view public verification")}</a>
          </div>
        </div>

        <div className="panel preview-panel">
          <div className="section-heading">
            <span>{t(zh, "登录后看到什么", "What appears after login")}</span>
            <h2>{t(zh, "不是说明页，而是业务首页。", "Not an explanation page, but an operating homepage.")}</h2>
            <p>{t(zh, "客户登录后直接看到证明包、缺证任务、风险、助手建议、草稿审批和公开链接。", "After login, the customer sees proof packs, missing-evidence tasks, risks, assistant suggestions, draft approvals, and public links.")}</p>
          </div>
          <dl className="proof-details">
            <div><dt>{t(zh, "当前用户", "Current user")}</dt><dd>{email}</dd></div>
            <div><dt>{t(zh, "组织", "Organization")}</dt><dd>{org}</dd></div>
            <div><dt>{t(zh, "默认首页", "Default home")}</dt><dd>{t(zh, "工作台仪表盘 /dashboard", "Workspace dashboard /dashboard")}</dd></div>
            <div><dt>{t(zh, "权限边界", "Permission boundary")}</dt><dd>{t(zh, "助手只能读取授权上下文，关键商业动作仍需确认。", "Assistant only reads authorized context; key commercial actions still require confirmation.")}</dd></div>
          </dl>
        </div>
      </section>
    </main>
  );
}
