"use client";

import { useState } from "react";
import { PublicHeader } from "@/components/PublicHeader";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export function LoginPage({ zh }: { zh: boolean }) {
  const [email, setEmail] = useState("maya@example-exporter.com");
  const [org, setOrg] = useState("Example Small Exporter");
  const [role, setRole] = useState("Operations lead");

  return (
    <>
      <PublicHeader zh={zh} />
      <main className="page-shell">
        <section className="workspace">
          <div className="panel form-panel">
            <div className="section-heading">
              <span>{t(zh, "登录 ChainTrace", "Login to ChainTrace")}</span>
              <h2>{t(zh, "进入小微企业交易 Agent。", "Enter the SME trade agent.")}</h2>
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
              <a className="primary-button" href="/business-ops">{t(zh, "登录并打开交易 Agent", "Login and open trade agent")}</a>
              <a className="secondary-button" href="/dashboard">{t(zh, "查看交易总览", "View trade overview")}</a>
            </div>
          </div>

          <div className="panel preview-panel">
            <div className="section-heading">
              <span>{t(zh, "登录后看到什么", "What appears after login")}</span>
              <h2>{t(zh, "不是说明页，而是交易 Agent。", "Not an explanation page, but a trade agent.")}</h2>
              <p>{t(zh, "客户登录后直接处理客户、订单、文件、物流、收款、融资、风险、草稿审批和选择性证明。", "After login, the customer works on customers, orders, documents, logistics, collection, financing, risks, draft approvals, and selective proof.")}</p>
            </div>
            <dl className="proof-details">
              <div><dt>{t(zh, "当前用户", "Current user")}</dt><dd>{email}</dd></div>
              <div><dt>{t(zh, "组织", "Organization")}</dt><dd>{org}</dd></div>
              <div><dt>{t(zh, "默认入口", "Default entry")}</dt><dd>{t(zh, "交易 Agent /business-ops", "Trade agent /business-ops")}</dd></div>
              <div><dt>{t(zh, "权限边界", "Permission boundary")}</dt><dd>{t(zh, "Agent 只能读取授权上下文，关键商业动作仍需确认。", "Agents only read authorized context; key commercial actions still require confirmation.")}</dd></div>
            </dl>
          </div>
        </section>
      </main>
    </>
  );
}
