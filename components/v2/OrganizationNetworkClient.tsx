"use client";

import { useMemo, useState } from "react";
import type { OrganizationContext, OrganizationType } from "@/lib/v2/organization-types";
import { organizationTypes } from "@/lib/v2/organization-types";

type OrganizationNetworkClientProps = {
  zh: boolean;
  initialContext: OrganizationContext;
};

const currentOrgStorageKey = "chaintrace_v2_current_org";

function label(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function orgTypeLabel(type: string) {
  return type.replaceAll("_", " ");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

async function sha256Hex(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
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
  const canCreate = useMemo(() => name.trim().length > 0, [name]);

  async function createOrganization(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreate || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const createdAt = new Date().toISOString();
      const privateProfile = {
        name: name.trim(),
        orgType,
        country: country.trim() || null,
        website: website.trim() || null,
        localOwnerEmail: context.user.email,
        createdAt,
      };
      const orgProfileHash = await sha256Hex(stableStringify(privateProfile));
      const organization = {
        id: `local-org-${orgProfileHash.slice(0, 16)}`,
        name: privateProfile.name,
        orgType,
        country: privateProfile.country,
        website: privateProfile.website,
        verificationLevel: "LOCAL_ONLY",
        status: "ACTIVE",
        createdBy: context.user.id,
        createdAt,
        updatedAt: createdAt,
        orgRegistryHash: orgProfileHash,
        orgDid: `did:chaintrace:local:${orgProfileHash.slice(0, 32)}`,
      };
      const membership = {
        id: `local-member-${orgProfileHash.slice(0, 16)}`,
        organizationId: organization.id,
        userId: context.user.id,
        role: "ADMIN" as const,
        status: "ACTIVE" as const,
        invitedBy: context.user.id,
        joinedAt: createdAt,
        user: context.user,
      };
      const localBundle = {
        organization,
        membership,
        privateProfile,
        proof: {
          proofType: "ORG_PROFILE_HASH",
          algorithm: "SHA-256",
          orgProfileHash,
          chainCommitStatus: "NOT_COMMITTED",
          rawProfileStored: "BROWSER_LOCAL_ONLY",
        },
      };
      window.localStorage.setItem(currentOrgStorageKey, JSON.stringify(localBundle));
      setContext((previous) => ({
        ...previous,
        organization,
        membership,
        organizations: [
          { organization, membership },
          ...previous.organizations.filter((item) => item.organization.id !== organization.id),
        ],
      }));
      setMessage(label(zh, "组织详情已保存在本地；链上只需要提交 org profile hash。", "Organization details are local-only; only org profile hash should be committed on-chain."));
      setName("");
      setCountry("");
      setWebsite("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create local organization proof.");
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
          <small>{label(zh, "当前身份只作为本地 proof bundle 的 owner hint。", "Current identity is only an owner hint for the local proof bundle.")}</small>
        </article>
        <article className="metric-card">
          <span>{label(zh, "当前组织", "Current organization")}</span>
          <strong>{currentOrg ? currentOrg.name : label(zh, "未创建", "Not created")}</strong>
          <small>{currentOrg ? `${currentOrg.orgType} · ${currentOrg.verificationLevel}` : label(zh, "组织详情不会上传数据库。", "Organization details are not uploaded to a database.")}</small>
        </article>
        <article className="metric-card">
          <span>{label(zh, "Proof", "Proof")}</span>
          <strong>{currentOrg?.orgRegistryHash ? "SHA-256" : "—"}</strong>
          <small>{currentOrg?.orgRegistryHash ? currentOrg.orgRegistryHash.slice(0, 24) + "…" : label(zh, "创建后生成 org profile hash。", "Create to generate org profile hash.")}</small>
        </article>
      </div>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{label(zh, "Local-first Organization", "Local-first Organization")}</span>
          <h2>{label(zh, "本地保存组织详情，只生成链上 proof", "Keep organization details local, generate proof only")}</h2>
          <p>{label(zh, "组织名称、国家、网站等详细信息只保存在浏览器本地；对外只暴露 org profile hash、DID hint 和未来链上 commitment。", "Organization details stay in the browser; only org profile hash, DID hint, and future chain commitment are exposed.")}</p>
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
            {busy ? label(zh, "生成中…", "Generating…") : label(zh, "生成本地组织 Proof", "Generate Local Org Proof")}
          </button>
          {message ? <p className="form-note">{message}</p> : null}
        </form>
      </section>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{label(zh, "Local Organizations", "Local Organizations")}</span>
          <h2>{label(zh, "当前浏览器本地组织", "Local organization in this browser")}</h2>
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
                <span>{item.organization.orgRegistryHash?.slice(0, 18) ?? "NO_HASH"}…</span>
              </div>
            </div>
          )) : (
            <div className="empty-state-card">
              {label(zh, "还没有本地组织 proof。创建后详情只保存在当前浏览器。", "No local organization proof yet. Details stay only in this browser after creation.")}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
