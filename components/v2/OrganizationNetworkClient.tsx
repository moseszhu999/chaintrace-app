"use client";

import { useMemo, useState } from "react";
import type { OrganizationContext, OrganizationType } from "@/lib/v2/organization-types";
import { organizationTypes } from "@/lib/v2/organization-types";

type OrganizationNetworkClientProps = {
  zh: boolean;
  initialContext: OrganizationContext;
};

function label(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function orgTypeLabel(type: string) {
  return type.replaceAll("_", " ");
}

export function OrganizationNetworkClient({ zh, initialContext }: OrganizationNetworkClientProps) {
  const [context, setContext] = useState(initialContext);
  const [name, setName] = useState("");
  const [orgType, setOrgType] = useState<OrganizationType>("EXPORTER");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const currentOrg = context.organization;
  const currentMembership = context.membership;
  const canCreate = useMemo(() => name.trim().length > 1, [name]);

  async function refreshContext() {
    const res = await fetch("/api/organizations/current", {
      headers: { "x-chaintrace-user-email": context.user.email },
      cache: "no-store",
    });
    const json = await res.json();
    if (json.ok && json.data?.context) setContext(json.data.context);
  }

  async function createOrganization(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreate || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-chaintrace-user-email": context.user.email,
        },
        body: JSON.stringify({ name, orgType, country, website }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Failed to create organization.");

      const createdOrganization = json.data?.organization;
      const createdMembership = json.data?.membership;
      if (createdOrganization && createdMembership) {
        setContext((previous) => ({
          ...previous,
          organization: createdOrganization,
          membership: createdMembership,
          organizations: [
            { organization: createdOrganization, membership: createdMembership },
            ...previous.organizations.filter((item) => item.organization.id !== createdOrganization.id),
          ],
        }));
      } else {
        await refreshContext();
      }

      setMessage(label(zh, "组织已创建，并已绑定当前用户为 ADMIN。", "Organization created and current user is bound as ADMIN."));
      setName("");
      setCountry("");
      setWebsite("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create organization.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="workspace-stack">
      <div className="stats-grid">
        <article className="metric-card">
          <span>{label(zh, "当前用户", "Current user")}</span>
          <strong>{context.user.email}</strong>
          <small>{label(zh, "身份来源：v2 request identity bridge，后续替换为真实 Auth。", "Identity source: v2 request identity bridge; real Auth replaces this later.")}</small>
        </article>
        <article className="metric-card">
          <span>{label(zh, "当前组织", "Current organization")}</span>
          <strong>{currentOrg ? currentOrg.name : label(zh, "未创建", "Not created")}</strong>
          <small>{currentOrg ? `${currentOrg.orgType} · ${currentOrg.verificationLevel}` : label(zh, "先创建真实组织，再进入 Case / Evidence。", "Create a real organization before Case / Evidence.")}</small>
        </article>
        <article className="metric-card">
          <span>{label(zh, "当前角色", "Current role")}</span>
          <strong>{currentMembership?.role ?? "—"}</strong>
          <small>{label(zh, "v2 用 organization_members.role，不再以 demo role cookie 为产品依据。", "v2 uses organization_members.role; demo role cookie is no longer the product basis.")}</small>
        </article>
      </div>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{label(zh, "Organization Network", "Organization Network")}</span>
          <h2>{label(zh, "创建真实业务组织", "Create a real business organization")}</h2>
          <p>{label(zh, "这是 v2.1 的第一块真实底座。Case、Evidence、Passport、Invite 都必须挂在组织下面。", "This is the first real v2.1 foundation. Case, Evidence, Passport, and Invite must all be scoped by organization.")}</p>
        </div>

        <form className="workspace-form" onSubmit={createOrganization}>
          <label>
            {label(zh, "组织名称", "Organization name")}
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Vietnam Coffee Exporter Ltd." />
          </label>
          <label>
            {label(zh, "组织类型", "Organization type")}
            <select value={orgType} onChange={(event) => setOrgType(event.target.value as OrganizationType)}>
              {organizationTypes.map((type) => <option key={type} value={type}>{orgTypeLabel(type)}</option>)}
            </select>
          </label>
          <label>
            {label(zh, "国家 / 地区", "Country / region")}
            <input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Vietnam" />
          </label>
          <label>
            {label(zh, "网站", "Website")}
            <input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://example.com" />
          </label>
          <button className="primary-button" type="submit" disabled={!canCreate || busy}>
            {busy ? label(zh, "创建中…", "Creating…") : label(zh, "创建组织", "Create organization")}
          </button>
          {message ? <p className="form-note">{message}</p> : null}
        </form>
      </section>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{label(zh, "Organizations", "Organizations")}</span>
          <h2>{label(zh, "当前用户所属组织", "Organizations for current user")}</h2>
        </div>
        <div className="table-like-list">
          {context.organizations.length ? context.organizations.map((item) => (
            <div className="table-like-row" key={item.organization.id}>
              <div>
                <strong>{item.organization.name}</strong>
                <span>{item.organization.orgType} · {item.organization.country || "—"}</span>
              </div>
              <div>
                <strong>{item.membership.role}</strong>
                <span>{item.membership.status}</span>
              </div>
            </div>
          )) : (
            <div className="empty-state-card">
              {label(zh, "还没有组织。请先创建 Exporter / Buyer / Logistics / Warehouse / QC / Funder 等真实组织。", "No organization yet. Create a real Exporter / Buyer / Logistics / Warehouse / QC / Funder organization first.")}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
