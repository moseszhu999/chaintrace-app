"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { OrganizationContext } from "@/lib/v2/organization-types";
import type { TradeCaseRecordV2 } from "@/lib/v2/trade-case-types";

type TradeCasesClientProps = {
  zh: boolean;
  context: OrganizationContext;
  initialCases: TradeCaseRecordV2[];
};

type LocalTradeCasePrivateData = {
  caseName: string;
  buyerName: string | null;
  amount: string | null;
  currency: string;
  goodsDescription: string | null;
  originCountry: string | null;
  destinationCountry: string | null;
  paymentTerm: string | null;
  expectedShipmentDate: string | null;
  expectedDueDate: string | null;
  sellerOrgId: string;
  sellerOrgProfileHash: string | null;
  createdAt: string;
};

type LocalTradeCaseBundle = {
  version: "chaintrace-local-trade-case-v1";
  case: TradeCaseRecordV2;
  privateData: LocalTradeCasePrivateData;
  proof: {
    proofType: "CASE_ROOT_HASH";
    algorithm: "SHA-256";
    caseRootHash: string;
    sellerOrgProfileHash: string | null;
    chainCommitStatus: "NOT_COMMITTED" | "COMMITTED";
    rawCaseStored: "BROWSER_LOCAL_ONLY";
  };
};

type LocalOrganizationBundle = {
  organization?: OrganizationContext["organization"];
  membership?: OrganizationContext["membership"];
};

const currentOrgStorageKey = "chaintrace_v2_current_org";
const localTradeCasesKey = "chaintrace_v2_trade_cases";

function label(zh: boolean, cn: string, en: string) {
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

function cleanOrNull(value: string) {
  const cleaned = value.trim();
  return cleaned ? cleaned : null;
}

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "trade-case";
}

function readLocalCases(): LocalTradeCaseBundle[] {
  const raw = window.localStorage.getItem(localTradeCasesKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as LocalTradeCaseBundle[];
    return Array.isArray(parsed) ? parsed.filter((item) => item.case?.id && item.proof?.caseRootHash) : [];
  } catch {
    window.localStorage.removeItem(localTradeCasesKey);
    return [];
  }
}

function writeLocalCases(bundles: LocalTradeCaseBundle[]) {
  window.localStorage.setItem(localTradeCasesKey, JSON.stringify(bundles));
}

export function TradeCasesClient({ zh, context, initialCases }: TradeCasesClientProps) {
  const [clientContext, setClientContext] = useState(context);
  const [caseBundles, setCaseBundles] = useState<LocalTradeCaseBundle[]>([]);
  const [cases, setCases] = useState<TradeCaseRecordV2[]>(initialCases);
  const [caseName, setCaseName] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [goodsDescription, setGoodsDescription] = useState("");
  const [originCountry, setOriginCountry] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [paymentTerm, setPaymentTerm] = useState("");
  const [expectedShipmentDate, setExpectedShipmentDate] = useState("");
  const [expectedDueDate, setExpectedDueDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const rawOrg = window.localStorage.getItem(currentOrgStorageKey);
    if (rawOrg && !clientContext.organization) {
      try {
        const parsed = JSON.parse(rawOrg) as LocalOrganizationBundle;
        if (parsed.organization?.id && parsed.membership?.id) {
          setClientContext((previous) => ({
            ...previous,
            organization: parsed.organization ?? null,
            membership: parsed.membership ?? null,
            organizations: parsed.organization && parsed.membership ? [{ organization: parsed.organization, membership: parsed.membership }] : [],
          }));
        }
      } catch {
        window.localStorage.removeItem(currentOrgStorageKey);
      }
    }

    const localBundles = readLocalCases();
    setCaseBundles(localBundles);
    setCases(localBundles.map((item) => item.case));
  }, [clientContext.organization]);

  const organization = clientContext.organization;
  const canCreate = Boolean(organization && caseName.trim().length > 0);

  function resetForm() {
    setCaseName("");
    setBuyerName("");
    setAmount("");
    setCurrency("USD");
    setGoodsDescription("");
    setOriginCountry("");
    setDestinationCountry("");
    setPaymentTerm("");
    setExpectedShipmentDate("");
    setExpectedDueDate("");
  }

  async function createCase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreate || busy || !organization) return;
    setBusy(true);
    setMessage(null);
    try {
      const createdAt = new Date().toISOString();
      const sellerOrgProfileHash = organization.orgRegistryHash ?? null;
      const privateData: LocalTradeCasePrivateData = {
        caseName: caseName.trim(),
        buyerName: cleanOrNull(buyerName),
        amount: cleanOrNull(amount),
        currency: currency.trim() || "USD",
        goodsDescription: cleanOrNull(goodsDescription),
        originCountry: cleanOrNull(originCountry),
        destinationCountry: cleanOrNull(destinationCountry),
        paymentTerm: cleanOrNull(paymentTerm),
        expectedShipmentDate: cleanOrNull(expectedShipmentDate),
        expectedDueDate: cleanOrNull(expectedDueDate),
        sellerOrgId: organization.id,
        sellerOrgProfileHash,
        createdAt,
      };
      const caseRootHash = await sha256Hex(stableStringify(privateData));
      const tradeCase: TradeCaseRecordV2 = {
        id: `local-case-${caseRootHash.slice(0, 16)}`,
        caseNo: `LOCAL-${caseRootHash.slice(0, 10).toUpperCase()}`,
        caseName: privateData.caseName,
        sellerOrgId: organization.id,
        buyerOrgId: null,
        buyerName: privateData.buyerName,
        amount: privateData.amount,
        currency: privateData.currency,
        goodsDescription: privateData.goodsDescription,
        originCountry: privateData.originCountry,
        destinationCountry: privateData.destinationCountry,
        paymentTerm: privateData.paymentTerm,
        expectedShipmentDate: privateData.expectedShipmentDate,
        expectedDueDate: privateData.expectedDueDate,
        status: "DRAFT",
        currentStage: "S1_CONTRACT",
        createdBy: clientContext.user.id,
        createdAt,
        updatedAt: createdAt,
        caseRootHash,
      };
      const nextBundle: LocalTradeCaseBundle = {
        version: "chaintrace-local-trade-case-v1",
        case: tradeCase,
        privateData,
        proof: {
          proofType: "CASE_ROOT_HASH",
          algorithm: "SHA-256",
          caseRootHash,
          sellerOrgProfileHash,
          chainCommitStatus: "NOT_COMMITTED",
          rawCaseStored: "BROWSER_LOCAL_ONLY",
        },
      };
      const nextBundles = [nextBundle, ...caseBundles.filter((item) => item.case.id !== tradeCase.id)];
      writeLocalCases(nextBundles);
      setCaseBundles(nextBundles);
      setCases(nextBundles.map((item) => item.case));
      resetForm();
      setMessage(label(zh, "Local Trade Case 已创建，并已生成 case root hash。", "Local Trade Case created with case root hash."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create local trade case.");
    } finally {
      setBusy(false);
    }
  }

  function downloadCaseKit(bundle: LocalTradeCaseBundle) {
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chaintrace-case-${safeFileName(bundle.case.caseName)}-${bundle.proof.caseRootHash.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage(label(zh, "Case Recovery Kit 已下载。", "Case Recovery Kit downloaded."));
  }

  async function copyCaseRootHash(hash: string) {
    await navigator.clipboard.writeText(hash);
    setMessage(label(zh, "Case root hash 已复制。", "Case root hash copied."));
  }

  async function importCaseKit(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      const text = await file.text();
      const imported = JSON.parse(text) as LocalTradeCaseBundle;
      if (imported.version !== "chaintrace-local-trade-case-v1") throw new Error("Unsupported Case Recovery Kit version.");
      if (!imported.privateData || !imported.case?.id || !imported.proof?.caseRootHash) throw new Error("Invalid Case Recovery Kit.");
      const recalculated = await sha256Hex(stableStringify(imported.privateData));
      if (recalculated !== imported.proof.caseRootHash) throw new Error("Case Recovery Kit hash verification failed.");
      const repaired: LocalTradeCaseBundle = {
        ...imported,
        case: {
          ...imported.case,
          caseRootHash: recalculated,
        },
        proof: {
          ...imported.proof,
          proofType: "CASE_ROOT_HASH",
          algorithm: "SHA-256",
          caseRootHash: recalculated,
          rawCaseStored: "BROWSER_LOCAL_ONLY",
        },
      };
      const nextBundles = [repaired, ...caseBundles.filter((item) => item.case.id !== repaired.case.id)];
      writeLocalCases(nextBundles);
      setCaseBundles(nextBundles);
      setCases(nextBundles.map((item) => item.case));
      setMessage(label(zh, "Case Recovery Kit 已导入并通过 hash 校验。", "Case Recovery Kit imported and hash-verified."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to import Case Recovery Kit.");
    } finally {
      setBusy(false);
    }
  }

  if (!organization) {
    return (
      <div className="empty-state-card">
        <strong>{label(zh, "先创建本地组织 proof", "Create local organization proof first")}</strong>
        <p>{label(zh, "Trade Case 必须挂在本地组织 proof 下面。请先进入 Organization Network 生成组织 proof。", "A Trade Case must belong to a local organization proof. Go to Organization Network first.")}</p>
        <Link className="primary-button" href="/organization-network">{label(zh, "去生成组织 Proof", "Create Organization Proof")}</Link>
      </div>
    );
  }

  return (
    <div className="workspace-stack">
      <div className="stats-grid">
        <article className="metric-card">
          <span>{label(zh, "当前组织", "Current organization")}</span>
          <strong>{organization.name}</strong>
          <small>{organization.orgRegistryHash ? organization.orgRegistryHash.slice(0, 24) + "…" : organization.orgType}</small>
        </article>
        <article className="metric-card">
          <span>{label(zh, "Local Trade Cases", "Local Trade Cases")}</span>
          <strong>{cases.length}</strong>
          <small>{label(zh, "只保存在当前浏览器，不写数据库。", "Stored only in this browser, not in a database.")}</small>
        </article>
        <article className="metric-card">
          <span>{label(zh, "下一步", "Next")}</span>
          <strong>{label(zh, "Evidence Hash", "Evidence Hash")}</strong>
          <small>{label(zh, "Evidence 将挂到 case root hash。", "Evidence will attach to the case root hash.")}</small>
        </article>
      </div>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{label(zh, "Create Local Case", "Create Local Case")}</span>
          <h2>{label(zh, "创建本地 Trade Case Proof Bundle", "Create a local Trade Case Proof Bundle")}</h2>
          <p>{label(zh, "Case 明文只留在浏览器；对外只需要 case root hash，未来可签名并上链提交。", "Case plaintext stays in the browser; only the case root hash needs to be shared or committed later.")}</p>
        </div>
        <form className="workspace-form" onSubmit={createCase}>
          <label>{label(zh, "Case 名称", "Case name")}<input value={caseName} onChange={(e) => setCaseName(e.target.value)} placeholder="Vietnam coffee export to Singapore" /></label>
          <label>{label(zh, "买方名称", "Buyer name")}<input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Singapore Buyer Pte Ltd" /></label>
          <label>{label(zh, "金额", "Amount")}<input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="52800" /></label>
          <label>{label(zh, "币种", "Currency")}<input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" /></label>
          <label>{label(zh, "货物描述", "Goods description")}<textarea value={goodsDescription} onChange={(e) => setGoodsDescription(e.target.value)} placeholder="Arabica coffee beans, 20ft container" rows={3} /></label>
          <label>{label(zh, "起运国家", "Origin country")}<input value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} placeholder="Vietnam" /></label>
          <label>{label(zh, "目的国家", "Destination country")}<input value={destinationCountry} onChange={(e) => setDestinationCountry(e.target.value)} placeholder="Singapore" /></label>
          <label>{label(zh, "付款条款", "Payment term")}<input value={paymentTerm} onChange={(e) => setPaymentTerm(e.target.value)} placeholder="Net 60 after buyer acceptance" /></label>
          <label>{label(zh, "预计出货日", "Expected shipment date")}<input type="date" value={expectedShipmentDate} onChange={(e) => setExpectedShipmentDate(e.target.value)} /></label>
          <label>{label(zh, "预计到期日", "Expected due date")}<input type="date" value={expectedDueDate} onChange={(e) => setExpectedDueDate(e.target.value)} /></label>
          <button className="primary-button" disabled={!canCreate || busy}>{busy ? label(zh, "生成中…", "Generating…") : label(zh, "生成 Case Root Hash", "Generate Case Root Hash")}</button>
          {message ? <p className="form-note">{message}</p> : null}
        </form>
      </section>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{label(zh, "Recovery", "Recovery")}</span>
          <h2>{label(zh, "导入 Case Recovery Kit", "Import Case Recovery Kit")}</h2>
        </div>
        <label className="secondary-button">
          {label(zh, "导入 Case Recovery Kit", "Import Case Recovery Kit")}
          <input type="file" accept="application/json,.json" onChange={importCaseKit} style={{ display: "none" }} />
        </label>
      </section>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{label(zh, "Case List", "Case List")}</span>
          <h2>{label(zh, "本地 Case Proof Bundles", "Local Case Proof Bundles")}</h2>
        </div>
        <div className="proof-flow-grid">
          {caseBundles.length ? caseBundles.map((bundle) => (
            <article className="proof-flow-card" key={bundle.case.id}>
              <strong>{bundle.case.caseName}</strong>
              <span>{bundle.case.caseNo}</span>
              <span>{bundle.case.status} · {bundle.case.currentStage}</span>
              <span>{bundle.case.currency ?? ""} {bundle.case.amount ?? ""}</span>
              <span>{bundle.case.buyerName || label(zh, "买方待补充", "Buyer pending")}</span>
              <span>{bundle.proof.caseRootHash.slice(0, 24)}…</span>
              <button className="secondary-button" type="button" onClick={() => copyCaseRootHash(bundle.proof.caseRootHash)}>{label(zh, "复制 Case Hash", "Copy Case Hash")}</button>
              <button className="secondary-button" type="button" onClick={() => downloadCaseKit(bundle)}>{label(zh, "下载 Case Kit", "Download Case Kit")}</button>
            </article>
          )) : (
            <div className="empty-state-card">{label(zh, "还没有本地 Trade Case。先创建第一笔真实贸易 proof。", "No local Trade Case yet. Create the first real trade proof.")}</div>
          )}
        </div>
      </section>
    </div>
  );
}
