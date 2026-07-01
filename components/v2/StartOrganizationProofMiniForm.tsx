"use client";

import { useState } from "react";
import { organizationTypes, type OrganizationType } from "@/lib/v2/organization-types";

type Props = {
  zh: boolean;
  onDone?: () => void;
};

const currentOrgStorageKey = "chaintrace_v2_current_org";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
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

function localUserId(email: string) {
  return `local-user-${email.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "owner"}`;
}

export function StartOrganizationProofMiniForm({ zh, onDone }: Props) {
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState<OrganizationType>("EXPORTER");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!orgName.trim() || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const createdAt = new Date().toISOString();
      const email = ownerEmail.trim() || "local-owner@chaintrace.local";
      const userId = localUserId(email);
      const privateProfile = {
        name: orgName.trim(),
        orgType,
        country: country.trim() || null,
        website: website.trim() || null,
        localOwnerEmail: email,
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
        createdBy: userId,
        createdAt,
        updatedAt: createdAt,
        orgRegistryHash: orgProfileHash,
        orgDid: `did:chaintrace:local:${orgProfileHash.slice(0, 32)}`,
      };
      const membership = {
        id: `local-member-${orgProfileHash.slice(0, 16)}`,
        organizationId: organization.id,
        userId,
        role: "ADMIN",
        status: "ACTIVE",
        invitedBy: userId,
        joinedAt: createdAt,
        user: { id: userId, email, name: email, avatarUrl: null, createdAt, updatedAt: createdAt },
      };
      const bundle = {
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
      window.localStorage.setItem(currentOrgStorageKey, JSON.stringify(bundle));
      setMessage(t(zh, "组织 Proof 已生成并保存在浏览器本地。", "Organization Proof generated and saved locally in the browser."));
      onDone?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create organization proof.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="proof-flow-card">
      <div className="section-heading compact-heading">
        <span>{t(zh, "Step 1", "Step 1")}</span>
        <h2>{t(zh, "快速创建组织 Proof", "Quick-create Organization Proof")}</h2>
        <p>{t(zh, "组织详情只保存在浏览器本地；对外使用 orgProfileHash。", "Organization details stay in the browser; external sharing uses orgProfileHash.")}</p>
      </div>
      <form className="workspace-form" onSubmit={submit}>
        <label>{t(zh, "组织名称", "Organization name")}
          <input value={orgName} onChange={(event) => setOrgName(event.target.value)} placeholder="ABC Export Co." />
        </label>
        <label>{t(zh, "组织类型", "Organization type")}
          <select value={orgType} onChange={(event) => setOrgType(event.target.value as OrganizationType)}>
            {organizationTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label>{t(zh, "国家 / 地区", "Country / region")}
          <input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Vietnam" />
        </label>
        <label>{t(zh, "网站，可选", "Website, optional")}
          <input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://example.com" />
        </label>
        <label>{t(zh, "本地 Owner Email", "Local owner email")}
          <input value={ownerEmail} onChange={(event) => setOwnerEmail(event.target.value)} placeholder="owner@example.com" />
        </label>
        <button className="primary-button" type="submit" disabled={!orgName.trim() || busy}>
          {busy ? t(zh, "生成中…", "Generating…") : t(zh, "生成 Organization Proof", "Generate Organization Proof")}
        </button>
        {message ? <p className="form-note">{message}</p> : null}
      </form>
    </section>
  );
}
