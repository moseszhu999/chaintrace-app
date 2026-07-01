"use client";

import { useEffect, useMemo, useState } from "react";
import type { OrganizationContext, OrganizationMemberRecord, OrganizationRecord, OrganizationType } from "@/lib/v2/organization-types";
import { organizationTypes } from "@/lib/v2/organization-types";

type OrganizationNetworkClientProps = {
  zh: boolean;
  initialContext: OrganizationContext;
};

type LocalOrganizationProfile = {
  name: string;
  orgType: OrganizationType;
  country: string | null;
  website: string | null;
  localOwnerEmail: string;
  createdAt: string;
};

type LocalOrganizationProofBundle = {
  version: "chaintrace-local-org-proof-v1";
  organization: OrganizationRecord;
  membership: OrganizationMemberRecord;
  privateProfile: LocalOrganizationProfile;
  proof: {
    proofType: "ORG_PROFILE_HASH";
    algorithm: "SHA-256";
    orgProfileHash: string;
    chainCommitStatus: "NOT_COMMITTED" | "COMMITTED";
    rawProfileStored: "BROWSER_LOCAL_ONLY";
  };
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

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "organization";
}

function readLocalBundle(): LocalOrganizationProofBundle | null {
  const raw = window.localStorage.getItem(currentOrgStorageKey);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LocalOrganizationProofBundle;
    if (!parsed.organization?.id || !parsed.membership?.id || !parsed.privateProfile || !parsed.proof?.orgProfileHash) return null;
    return parsed;
  } catch {
    window.localStorage.removeItem(currentOrgStorageKey);
    return null;
  }
}

export function OrganizationNetworkClient({ zh, initialContext }: OrganizationNetworkClientProps) {
  const [context, setContext] = useState(initialContext);
  const [bundle, setBundle] = useState<LocalOrganizationProofBundle | null>(null);
  const [name, setName] = useState("");
  const [orgType, setOrgType] = useState<OrganizationType>("EXPORTER");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const currentOrg = context.organization;
  const currentMembership = context.membership;
  const canCreate = useMemo(() => name.trim().length > 0, [name]);

  function applyBundle(nextBundle: LocalOrganizationProofBundle) {
    window.localStorage.setItem(currentOrgStorageKey, JSON.stringify(nextBundle));
    setBundle(nextBundle);
    setContext((previous) => ({
      ...previous,
      organization: nextBundle.organization,
      membership: nextBundle.membership,
      organizations: [
        { organization: nextBundle.organization, membership: nextBundle.membership },
        ...previous.organizations.filter((item) => item.organization.id !== nextBundle.organization.id),
      ],
    }));
  }

  useEffect(() => {
    const restored = readLocalBundle();
    if (restored) {
      setBundle(restored);
      setContext((previous) => ({
        ...previous,
        organization: restored.organization,
        membership: restored.membership,
        organizations: [{ organization: restored.organization, membership: restored.membership }],
      }));
    }
  }, []);

  async function createOrganization(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreate || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const createdAt = new Date().toISOString();
      const privateProfile: LocalOrganizationProfile = {
        name: name.trim(),
        orgType,
        country: country.trim() || null,
        website: website.trim() || null,
        localOwnerEmail: context.user.email,
        createdAt,
      };
      const orgProfileHash = await sha256Hex(stableStringify(privateProfile));
      const organization: OrganizationRecord = {
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
      const membership: OrganizationMemberRecord = {
        id: `local-member-${orgProfileHash.slice(0, 16)}`,
        organizationId: organization.id,
        userId: context.user.id,
        role: "ADMIN",
        status: "ACTIVE",
        invitedBy: context.user.id,
        joinedAt: createdAt,
        user: context.user,
      };
      const nextBundle: LocalOrganizationProofBundle = {
        version: "chaintrace-local-org-proof-v1",
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
      applyBundle(nextBundle);
      setMessage(label(zh, "组织详情已保存在本地。请立即下载 Recovery Kit。", "Organization details are local-only. Download the Recovery Kit now."));
      setName("");
      setCountry("");
      setWebsite("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create local organization proof.");
    } finally {
      setBusy(false);
    }
  }

  function downloadRecoveryKit() {
    if (!bundle) {
      setMessage(label(zh, "还没有可下载的 Recovery Kit。", "No Recovery Kit is available yet."));
      return;
    }
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chaintrace-recovery-${safeFileName(bundle.organization.name)}-${bundle.proof.orgProfileHash.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage(label(zh, "Recovery Kit 已下载。请保存到安全位置。", "Recovery Kit downloaded. Store it somewhere safe."));
  }

  async function copyProfileHash() {
    const hash = currentOrg?.orgRegistryHash;
    if (!hash) {
      setMessage(label(zh, "还没有 org profile hash。", "No org profile hash yet."));
      return;
    }
    await navigator.clipboard.writeText(hash);
    setMessage(label(zh, "Org profile hash 已复制。", "Org profile hash copied."));
  }

  async function importRecoveryKit(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      const text = await file.text();
      const imported = JSON.parse(text) as LocalOrganizationProofBundle;
      if (imported.version !== "chaintrace-local-org-proof-v1") throw new Error("Unsupported Recovery Kit version.");
      if (!imported.privateProfile || !imported.organization?.id || !imported.membership?.id) throw new Error("Invalid Recovery Kit.");
      const recalculated = await sha256Hex(stableStringify(imported.privateProfile));
      const expected = imported.proof?.orgProfileHash || imported.organization.orgRegistryHash;
      if (recalculated !== expected) throw new Error("Recovery Kit hash verification failed.");
      const repairedBundle: LocalOrganizationProofBundle = {
        ...imported,
        organization: {
          ...imported.organization,
          orgRegistryHash: recalculated,
        },
        proof: {
          ...imported.proof,
          proofType: "ORG_PROFILE_HASH",
          algorithm: "SHA-256",
          orgProfileHash: recalculated,
          rawProfileStored: "BROWSER_LOCAL_ONLY",
        },
      };
      applyBundle(repairedBundle);
      setMessage(label(zh, "Recovery Kit 已导入并通过 hash 校验。", "Recovery Kit imported and hash-verified."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to import Recovery Kit.");
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
          <span>{label(zh, "Recovery", "Recovery")}</span>
          <h2>{label(zh, "恢复与备份", "Recovery and backup")}</h2>
          <p>{label(zh, "ChainTrace 不保存组织明文。Recovery Kit 是恢复本地组织详情的唯一安全路径之一。", "ChainTrace does not store plaintext organization details. The Recovery Kit is one safe path to restore them.")}</p>
        </div>
        <div className="proof-flow-grid">
          <button className="secondary-button" type="button" onClick={downloadRecoveryKit} disabled={!bundle}>
            {label(zh, "下载 Recovery Kit", "Download Recovery Kit")}
          </button>
          <button className="secondary-button" type="button" onClick={copyProfileHash} disabled={!currentOrg?.orgRegistryHash}>
            {label(zh, "复制 Org Profile Hash", "Copy Org Profile Hash")}
          </button>
          <label className="secondary-button">
            {label(zh, "导入 Recovery Kit", "Import Recovery Kit")}
            <input type="file" accept="application/json,.json" onChange={importRecoveryKit} style={{ display: "none" }} />
          </label>
        </div>
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
