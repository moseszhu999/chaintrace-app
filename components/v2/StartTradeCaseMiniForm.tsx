"use client";

import { useEffect, useState } from "react";

type Props = {
  zh: boolean;
  onDone?: () => void;
};

type LocalOrganizationBundle = {
  organization?: {
    id: string;
    name: string;
    orgRegistryHash?: string | null;
  } | null;
  membership?: {
    user?: { id: string; email: string } | null;
    userId?: string | null;
  } | null;
};

type LocalTradeCaseBundle = {
  version: "chaintrace-local-trade-case-v1";
  case: Record<string, unknown>;
  privateData: Record<string, unknown>;
  proof: {
    proofType: "CASE_ROOT_HASH";
    algorithm: "SHA-256";
    caseRootHash: string;
    sellerOrgProfileHash: string | null;
    chainCommitStatus: "NOT_COMMITTED" | "COMMITTED";
    rawCaseStored: "BROWSER_LOCAL_ONLY";
  };
};

const currentOrgStorageKey = "chaintrace_v2_current_org";
const localTradeCasesKey = "chaintrace_v2_trade_cases";

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

function cleanOrNull(value: string) {
  const cleaned = value.trim();
  return cleaned ? cleaned : null;
}

function readOrganization() {
  const raw = window.localStorage.getItem(currentOrgStorageKey);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LocalOrganizationBundle;
    return parsed.organization?.id ? parsed : null;
  } catch {
    window.localStorage.removeItem(currentOrgStorageKey);
    return null;
  }
}

function readLocalCases(): LocalTradeCaseBundle[] {
  const raw = window.localStorage.getItem(localTradeCasesKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item === "object") as LocalTradeCaseBundle[] : [];
  } catch {
    window.localStorage.removeItem(localTradeCasesKey);
    return [];
  }
}

export function StartTradeCaseMiniForm({ zh, onDone }: Props) {
  const [hasOrg, setHasOrg] = useState(false);
  const [caseName, setCaseName] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [goodsDescription, setGoodsDescription] = useState("");
  const [originCountry, setOriginCountry] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [paymentTerm, setPaymentTerm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setHasOrg(Boolean(readOrganization()));
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!caseName.trim() || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const orgBundle = readOrganization();
      const organization = orgBundle?.organization;
      if (!organization?.id) throw new Error("Create Organization Proof first.");

      const createdAt = new Date().toISOString();
      const sellerOrgProfileHash = organization.orgRegistryHash ?? null;
      const privateData = {
        caseName: caseName.trim(),
        buyerName: cleanOrNull(buyerName),
        amount: cleanOrNull(amount),
        currency: currency.trim() || "USD",
        goodsDescription: cleanOrNull(goodsDescription),
        originCountry: cleanOrNull(originCountry),
        destinationCountry: cleanOrNull(destinationCountry),
        paymentTerm: cleanOrNull(paymentTerm),
        expectedShipmentDate: null,
        expectedDueDate: null,
        sellerOrgId: organization.id,
        sellerOrgProfileHash,
        createdAt,
      };
      const caseRootHash = await sha256Hex(stableStringify(privateData));
      const tradeCase = {
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
        expectedShipmentDate: null,
        expectedDueDate: null,
        status: "DRAFT",
        currentStage: "S1_CONTRACT",
        createdBy: orgBundle?.membership?.user?.id ?? orgBundle?.membership?.userId ?? "local-user",
        createdAt,
        updatedAt: createdAt,
        caseRootHash,
        receivableCandidateStatus: "NOT_READY",
        fundingReadinessScore: null,
        rwaClaimStatus: "NOT_CREATED",
        oracleEventCount: 0,
        proofCommitStatus: "LOCAL_ONLY",
      };
      const bundle: LocalTradeCaseBundle = {
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
      const nextCases = [bundle, ...readLocalCases().filter((item) => item.case?.id !== tradeCase.id)];
      window.localStorage.setItem(localTradeCasesKey, JSON.stringify(nextCases));
      setCaseName("");
      setBuyerName("");
      setAmount("");
      setCurrency("USD");
      setGoodsDescription("");
      setOriginCountry("");
      setDestinationCountry("");
      setPaymentTerm("");
      setMessage(t(zh, "Trade Case 已生成，并保存到浏览器本地。", "Trade Case generated and saved locally in the browser."));
      onDone?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create Trade Case.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="proof-flow-card">
      <div className="section-heading compact-heading">
        <span>{t(zh, "Step 2", "Step 2")}</span>
        <h2>{t(zh, "快速创建 Trade Case", "Quick-create Trade Case")}</h2>
        <p>{t(zh, "基于本地 Organization Proof 创建 caseRootHash。没有组织 Proof 时先完成 Step 1。", "Create a caseRootHash from the local Organization Proof. Complete Step 1 first if no organization exists.")}</p>
      </div>
      <form className="workspace-form" onSubmit={submit}>
        <label>{t(zh, "Case 名称", "Case name")}
          <input value={caseName} onChange={(event) => setCaseName(event.target.value)} placeholder="Vietnam textile shipment #001" />
        </label>
        <label>{t(zh, "买方名称", "Buyer name")}
          <input value={buyerName} onChange={(event) => setBuyerName(event.target.value)} placeholder="Buyer Ltd." />
        </label>
        <label>{t(zh, "金额", "Amount")}
          <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="50000" />
        </label>
        <label>{t(zh, "币种", "Currency")}
          <input value={currency} onChange={(event) => setCurrency(event.target.value)} placeholder="USD" />
        </label>
        <label>{t(zh, "货物描述", "Goods description")}
          <input value={goodsDescription} onChange={(event) => setGoodsDescription(event.target.value)} placeholder="Textile goods" />
        </label>
        <label>{t(zh, "起运地", "Origin")}
          <input value={originCountry} onChange={(event) => setOriginCountry(event.target.value)} placeholder="Vietnam" />
        </label>
        <label>{t(zh, "目的地", "Destination")}
          <input value={destinationCountry} onChange={(event) => setDestinationCountry(event.target.value)} placeholder="Germany" />
        </label>
        <label>{t(zh, "付款条件", "Payment term")}
          <input value={paymentTerm} onChange={(event) => setPaymentTerm(event.target.value)} placeholder="Net 60" />
        </label>
        <button className="primary-button" type="submit" disabled={!hasOrg || !caseName.trim() || busy}>
          {busy ? t(zh, "生成中…", "Generating…") : t(zh, "生成 Trade Case", "Generate Trade Case")}
        </button>
        {!hasOrg ? <p className="form-note">{t(zh, "请先完成 Step 1 Organization Proof。", "Complete Step 1 Organization Proof first.")}</p> : null}
        {message ? <p className="form-note">{message}</p> : null}
      </form>
    </section>
  );
}
