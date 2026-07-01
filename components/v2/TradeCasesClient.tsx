"use client";

import Link from "next/link";
import { useState } from "react";
import type { OrganizationContext } from "@/lib/v2/organization-types";
import type { TradeCaseRecordV2 } from "@/lib/v2/trade-case-types";

type TradeCasesClientProps = {
  zh: boolean;
  context: OrganizationContext;
  initialCases: TradeCaseRecordV2[];
};

function label(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export function TradeCasesClient({ zh, context, initialCases }: TradeCasesClientProps) {
  const [cases, setCases] = useState(initialCases);
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

  const organization = context.organization;
  const canCreate = Boolean(organization && caseName.trim().length > 1);

  async function refreshCases() {
    const res = await fetch("/api/trade-cases", {
      headers: { "x-chaintrace-user-email": context.user.email },
      cache: "no-store",
    });
    const json = await res.json();
    if (json.ok && json.data?.cases) setCases(json.data.cases);
  }

  async function createCase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreate || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/trade-cases", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-chaintrace-user-email": context.user.email,
        },
        body: JSON.stringify({
          caseName,
          buyerName,
          amount,
          currency,
          goodsDescription,
          originCountry,
          destinationCountry,
          paymentTerm,
          expectedShipmentDate,
          expectedDueDate,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Failed to create trade case.");
      setMessage(label(zh, "Trade Case 已创建。", "Trade Case created."));
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
      await refreshCases();
      if (json.data?.nextPath) window.location.href = json.data.nextPath;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create trade case.");
    } finally {
      setBusy(false);
    }
  }

  if (!organization) {
    return (
      <div className="empty-state-card">
        <strong>{label(zh, "先创建组织", "Create organization first")}</strong>
        <p>{label(zh, "Trade Case 必须挂在真实组织下面。请先进入 Organization Network 创建 Exporter 组织。", "A Trade Case must belong to a real organization. Go to Organization Network and create an Exporter organization first.")}</p>
        <Link className="primary-button" href="/organization-network">{label(zh, "去创建组织", "Create organization")}</Link>
      </div>
    );
  }

  return (
    <div className="workspace-stack">
      <div className="stats-grid">
        <article className="metric-card">
          <span>{label(zh, "当前组织", "Current organization")}</span>
          <strong>{organization.name}</strong>
          <small>{organization.orgType}</small>
        </article>
        <article className="metric-card">
          <span>{label(zh, "Trade Cases", "Trade Cases")}</span>
          <strong>{cases.length}</strong>
          <small>{label(zh, "真实 Case 数量，不是 demo card。", "Real cases, not demo cards.")}</small>
        </article>
        <article className="metric-card">
          <span>{label(zh, "下一步", "Next")}</span>
          <strong>{label(zh, "Evidence", "Evidence")}</strong>
          <small>{label(zh, "Case 建好后再上传证据。", "Upload evidence after a case exists.")}</small>
        </article>
      </div>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{label(zh, "Create Case", "Create Case")}</span>
          <h2>{label(zh, "创建真实 Trade Case", "Create a real Trade Case")}</h2>
          <p>{label(zh, "这一步只建业务容器和阶段，不上传文件。Evidence 会在 #99 挂到 Case 阶段上。", "This step creates the business container and stages only. Evidence will attach to case stages in #99.")}</p>
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
          <button className="primary-button" disabled={!canCreate || busy}>{busy ? label(zh, "创建中…", "Creating…") : label(zh, "创建 Trade Case", "Create Trade Case")}</button>
          {message ? <p className="form-note">{message}</p> : null}
        </form>
      </section>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{label(zh, "Case List", "Case List")}</span>
          <h2>{label(zh, "真实 Case 列表", "Real Case List")}</h2>
        </div>
        <div className="proof-flow-grid">
          {cases.length ? cases.map((tradeCase) => (
            <article className="proof-flow-card" key={tradeCase.id}>
              <strong>{tradeCase.caseName}</strong>
              <span>{tradeCase.caseNo}</span>
              <span>{tradeCase.status} · {tradeCase.currentStage}</span>
              <span>{tradeCase.currency ?? ""} {tradeCase.amount ?? ""}</span>
              <span>{tradeCase.buyerName || label(zh, "买方待补充", "Buyer pending")}</span>
              <Link className="secondary-button" href={`/trade-cases/${tradeCase.id}`}>{label(zh, "进入 Case", "Open case")}</Link>
            </article>
          )) : (
            <div className="empty-state-card">{label(zh, "还没有 Trade Case。先创建第一笔真实贸易。", "No Trade Case yet. Create the first real trade case.")}</div>
          )}
        </div>
      </section>
    </div>
  );
}
