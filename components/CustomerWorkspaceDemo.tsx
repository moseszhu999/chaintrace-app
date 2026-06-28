"use client";

import { useMemo, useState } from "react";

type Status = "Missing" | "Present" | "Verified" | "Rejected";
type ScenarioKey = "food" | "receivable" | "coldchain";
type RoleKey = "supplier" | "trader" | "importer" | "buyer" | "financier";

type Slot = {
  id: string;
  zh: string;
  en: string;
  ownerZh: string;
  ownerEn: string;
  impactZh: string;
  impactEn: string;
  status: Status;
};

const scenarioTemplates: Record<ScenarioKey, {
  titleZh: string;
  titleEn: string;
  batchId: string;
  summaryZh: string;
  summaryEn: string;
  slots: Omit<Slot, "status">[];
}> = {
  food: {
    titleZh: "跨境食品进口",
    titleEn: "Cross-border food import",
    batchId: "UY-BEEF-CN-2026-0001",
    summaryZh: "乌拉圭冷冻牛肉进口中国，需要证明来源、检疫、冷链、清关、入库和验收。",
    summaryEn: "Uruguay frozen beef imported to China; prove origin, quarantine, cold chain, customs, warehouse entry, and acceptance.",
    slots: [
      { id: "origin", zh: "原产地证明", en: "Origin proof", ownerZh: "供应商", ownerEn: "Supplier", impactZh: "影响买家是否相信货源。", impactEn: "Affects whether the buyer trusts the source." },
      { id: "quarantine", zh: "检疫 / 卫生证明", en: "Quarantine / sanitary proof", ownerZh: "屠宰厂 / 出口商", ownerEn: "Plant / exporter", impactZh: "影响食品合规和清关。", impactEn: "Affects food compliance and customs clearance." },
      { id: "coldchain", zh: "冷链温度曲线", en: "Cold-chain temperature curve", ownerZh: "冷链物流商", ownerEn: "Cold-chain provider", impactZh: "影响食品安全、理赔和验收。", impactEn: "Affects food safety, claims, and acceptance." },
      { id: "customs", zh: "中国口岸放行", en: "China port release", ownerZh: "进口商 / 报关行", ownerEn: "Importer / broker", impactZh: "影响清关、分销和资金方审查。", impactEn: "Affects customs, distribution, and financier review." },
      { id: "warehouse", zh: "入库记录", en: "Warehouse entry", ownerZh: "中国仓库", ownerEn: "China warehouse", impactZh: "影响货物是否真实到达指定节点。", impactEn: "Affects whether goods reached the target node." },
      { id: "acceptance", zh: "买家验收", en: "Buyer acceptance", ownerZh: "买家", ownerEn: "Buyer", impactZh: "影响付款、融资和争议闭环。", impactEn: "Affects payment, financing, and dispute closure." },
    ],
  },
  receivable: {
    titleZh: "应收账款融资",
    titleEn: "Receivable financing",
    batchId: "AR-FACTORY-2026-0008",
    summaryZh: "小工厂交付后申请融资，需要证明真实订单、真实发货、真实交付和买家确认。",
    summaryEn: "A small factory applies for financing after delivery; prove real order, shipment, delivery, and buyer confirmation.",
    slots: [
      { id: "order", zh: "订单 / 合同", en: "Order / contract", ownerZh: "供应商", ownerEn: "Supplier", impactZh: "影响交易是否真实存在。", impactEn: "Affects whether the trade exists." },
      { id: "invoice", zh: "发票", en: "Invoice", ownerZh: "供应商 / 财务", ownerEn: "Supplier / finance", impactZh: "影响应收账款主张。", impactEn: "Affects the receivable claim." },
      { id: "shipment", zh: "发货证明", en: "Shipment proof", ownerZh: "供应商 / 物流", ownerEn: "Supplier / logistics", impactZh: "影响货物是否离开供应商。", impactEn: "Affects whether goods left the supplier." },
      { id: "delivery", zh: "交付证明", en: "Delivery proof", ownerZh: "买家 / 仓库", ownerEn: "Buyer / warehouse", impactZh: "影响是否形成可融资交付事实。", impactEn: "Affects whether a financeable delivery fact exists." },
      { id: "acceptance", zh: "买家验收确认", en: "Buyer acceptance", ownerZh: "买家", ownerEn: "Buyer", impactZh: "影响融资审核和回款。", impactEn: "Affects financing review and collection." },
    ],
  },
  coldchain: {
    titleZh: "冷链责任追踪",
    titleEn: "Cold-chain responsibility tracking",
    batchId: "COLD-CLAIM-2026-0012",
    summaryZh: "冷链运输出现异常，需要证明柜号、封条、温度、交接、异常责任和签收。",
    summaryEn: "A cold-chain anomaly occurred; prove container, seal, temperature, handover, incident responsibility, and receipt.",
    slots: [
      { id: "container", zh: "柜号 / 封条", en: "Container / seal", ownerZh: "物流商", ownerEn: "Logistics provider", impactZh: "影响运输对象是否一致。", impactEn: "Affects whether the transported goods match." },
      { id: "temperature", zh: "温度曲线", en: "Temperature curve", ownerZh: "冷链物流商", ownerEn: "Cold-chain provider", impactZh: "影响是否存在温控异常。", impactEn: "Affects whether a temperature anomaly exists." },
      { id: "handover", zh: "交接记录", en: "Handover records", ownerZh: "仓库 / 物流", ownerEn: "Warehouse / logistics", impactZh: "影响责任节点划分。", impactEn: "Affects responsibility boundaries." },
      { id: "incident", zh: "异常说明", en: "Incident note", ownerZh: "责任节点", ownerEn: "Responsible node", impactZh: "影响理赔和追责。", impactEn: "Affects claims and accountability." },
      { id: "receipt", zh: "签收 / 验收", en: "Receipt / acceptance", ownerZh: "买家", ownerEn: "Buyer", impactZh: "影响最终损失确认。", impactEn: "Affects final loss confirmation." },
    ],
  },
};

const roles: { key: RoleKey; zh: string; en: string; painZh: string; painEn: string }[] = [
  { key: "supplier", zh: "供应商", en: "Supplier", painZh: "想更快证明履约、减少扯皮。", painEn: "Prove fulfillment faster and reduce disputes." },
  { key: "trader", zh: "贸易商", en: "Trader", painZh: "想把一票货整理成可分享事实链。", painEn: "Turn one shipment into a shareable fact chain." },
  { key: "importer", zh: "进口商", en: "Importer", painZh: "想知道清关、入库、验收卡在哪里。", painEn: "Know where customs, warehouse, or acceptance is blocked." },
  { key: "buyer", zh: "买家", en: "Buyer", painZh: "想快速判断能不能验收和付款。", painEn: "Decide quickly whether to accept and pay." },
  { key: "financier", zh: "资金方", en: "Financier", painZh: "想在融资前先看真实交易证据。", painEn: "Check real-trade evidence before financing." },
];

const statusRank: Record<Status, number> = { Missing: 0, Rejected: 0, Present: 1, Verified: 2 };

function newSlots(scenario: ScenarioKey): Slot[] {
  return scenarioTemplates[scenario].slots.map((slot, index) => ({
    ...slot,
    status: index < 2 ? "Verified" : index === 2 ? "Present" : "Missing",
  }));
}

function statusLabel(status: Status, zh: boolean) {
  if (!zh) return status;
  return { Missing: "缺失", Present: "已上传", Verified: "已验证", Rejected: "已拒绝" }[status];
}

export function CustomerWorkspaceDemo({ zh }: { zh: boolean }) {
  const [role, setRole] = useState<RoleKey>("trader");
  const [scenario, setScenario] = useState<ScenarioKey>("food");
  const [businessName, setBusinessName] = useState("Uruguay Beef Import Demo");
  const [batchId, setBatchId] = useState(scenarioTemplates.food.batchId);
  const [slots, setSlots] = useState<Slot[]>(newSlots("food"));
  const [activity, setActivity] = useState<string[]>([
    zh ? "系统已根据场景生成证据槽。" : "System generated evidence slots from scenario.",
  ]);

  const verifiedCount = slots.filter((slot) => slot.status === "Verified").length;
  const presentOrVerifiedCount = slots.filter((slot) => statusRank[slot.status] > 0).length;
  const progress = Math.round((verifiedCount / slots.length) * 100);
  const ready = verifiedCount === slots.length;
  const selectedTemplate = scenarioTemplates[scenario];

  const openTasks = useMemo(() => {
    return slots
      .filter((slot) => slot.status !== "Verified")
      .map((slot) => ({
        id: slot.id,
        title: zh ? `请${slot.ownerZh}补齐或确认：${slot.zh}` : `Ask ${slot.ownerEn} to complete or verify: ${slot.en}`,
        impact: zh ? slot.impactZh : slot.impactEn,
        status: slot.status,
      }));
  }, [slots, zh]);

  const publicLink = `/verify/${batchId.toLowerCase()}`;

  function appendActivity(messageZh: string, messageEn: string) {
    setActivity((items) => [zh ? messageZh : messageEn, ...items].slice(0, 6));
  }

  function switchScenario(nextScenario: ScenarioKey) {
    setScenario(nextScenario);
    setBatchId(scenarioTemplates[nextScenario].batchId);
    setBusinessName(scenarioTemplates[nextScenario].titleEn);
    setSlots(newSlots(nextScenario));
    appendActivity("已切换场景并重新生成证据槽。", "Scenario switched and evidence slots regenerated.");
  }

  function updateSlot(id: string, status: Status) {
    setSlots((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
    const slot = slots.find((item) => item.id === id);
    appendActivity(
      `${slot?.zh ?? "证据"} 状态更新为 ${statusLabel(status, true)}。`,
      `${slot?.en ?? "Evidence"} changed to ${status}.`,
    );
  }

  return (
    <div className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "客户登录后工作台 · 可点击原型" : "Customer workspace · Clickable prototype"}</div>
            <h1>{zh ? "客户登录后，不应该看 PPT，而应该马上处理一票货。" : "After login, customers should handle a shipment, not read slides."}</h1>
            <p>
              {zh
                ? "这个页面模拟真实登录后的互动：选择角色、选择场景、创建批次、补证据、验证状态、自动生成任务和公开链接。当前是前端原型，状态会在页面内即时变化。"
                : "This page simulates the real post-login interaction: choose role, choose scenario, create batch, add evidence, verify status, auto-generate tasks, and share a public link. It is a frontend prototype with instant in-page state changes."}
            </p>
            <div className="hero-actions">
              <a href="#workspace" className="primary-button">{zh ? "进入工作台" : "Open workspace"}</a>
              <a href={publicLink} className="secondary-button">{zh ? "查看公开验证链接" : "View public link"}</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "当前批次" : "Current batch"}</span><strong>{batchId}</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>{zh ? "已验证" : "Verified"}</span><strong>{verifiedCount}/{slots.length}</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "已上传" : "Present"}</span><strong>{presentOrVerifiedCount}/{slots.length}</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "待办" : "Tasks"}</span><strong>{openTasks.length}</strong></div>
                <div className={ready ? "mini-proof-card present" : "mini-proof-card pending"}><span>{zh ? "状态" : "Status"}</span><strong>{ready ? "Ready" : "Missing"}</strong></div>
              </div>
              <div className="signal-status-box"><span>{zh ? "完整度" : "Completeness"}</span><strong>{progress}%</strong><p>{ready ? (zh ? "证据已齐，可以进入外部验证。" : "Evidence is complete and ready for external verification.") : (zh ? "还有证据未验证，不能 Ready。" : "Some evidence is not verified yet, so it is not Ready.")}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="workspace" className="workspace">
        <div className="panel form-panel">
          <div className="section-heading"><span>{zh ? "1. 登录身份" : "1. Login role"}</span><h2>{zh ? "不同角色看到不同任务。" : "Different roles see different tasks."}</h2><p>{zh ? "先模拟客户登录后的身份选择。" : "Simulate the customer role after login."}</p></div>
          <div className="story-grid">
            {roles.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setRole(item.key)}
                className="story-card"
                style={{ textAlign: "left", cursor: "pointer", border: role === item.key ? "2px solid #111827" : undefined }}
              >
                <strong>{zh ? item.zh : item.en}</strong>
                <p>{zh ? item.painZh : item.painEn}</p>
              </button>
            ))}
          </div>

          <div className="section-heading" style={{ marginTop: 28 }}><span>{zh ? "2. 场景与批次" : "2. Scenario and batch"}</span><h2>{zh ? "按场景创建，不从空白表单开始。" : "Create by scenario, not from a blank form."}</h2></div>
          <label>{zh ? "业务场景" : "Business scenario"}
            <select value={scenario} onChange={(event) => switchScenario(event.target.value as ScenarioKey)}>
              <option value="food">{zh ? scenarioTemplates.food.titleZh : scenarioTemplates.food.titleEn}</option>
              <option value="receivable">{zh ? scenarioTemplates.receivable.titleZh : scenarioTemplates.receivable.titleEn}</option>
              <option value="coldchain">{zh ? scenarioTemplates.coldchain.titleZh : scenarioTemplates.coldchain.titleEn}</option>
            </select>
          </label>
          <label>{zh ? "业务名称" : "Business name"}<input value={businessName} onChange={(event) => setBusinessName(event.target.value)} /></label>
          <label>{zh ? "批次 / 订单号" : "Batch / Order ID"}<input value={batchId} onChange={(event) => setBatchId(event.target.value)} /></label>
          <div className="proof-flow-card"><strong>{zh ? selectedTemplate.titleZh : selectedTemplate.titleEn}</strong><span>{zh ? selectedTemplate.summaryZh : selectedTemplate.summaryEn}</span></div>
        </div>

        <div className="panel preview-panel">
          <div className="section-heading"><span>{zh ? "3. 证据槽互动" : "3. Evidence slot interaction"}</span><h2>{zh ? "点击按钮，状态会变化。" : "Click buttons and status changes."}</h2><p>{zh ? "这才是客户登录后该看到的核心操作。" : "This is the core operation customers should see after login."}</p></div>
          <dl className="proof-details">
            {slots.map((slot) => (
              <div key={slot.id}>
                <dt>{statusLabel(slot.status, zh)}</dt>
                <dd>
                  <strong>{zh ? slot.zh : slot.en}</strong>
                  <br />
                  {zh ? "责任方：" : "Owner: "}{zh ? slot.ownerZh : slot.ownerEn}
                  <br />
                  <span>{zh ? slot.impactZh : slot.impactEn}</span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    <button type="button" className="secondary-button" onClick={() => updateSlot(slot.id, "Present")}>{zh ? "模拟上传" : "Add evidence"}</button>
                    <button type="button" className="primary-button" onClick={() => updateSlot(slot.id, "Verified")}>{zh ? "验证通过" : "Verify"}</button>
                    <button type="button" className="secondary-button" onClick={() => updateSlot(slot.id, "Rejected")}>{zh ? "拒绝" : "Reject"}</button>
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{zh ? "4. 自动任务" : "4. Auto tasks"}</span><h2>{zh ? "缺口自动变成待办。" : "Gaps become tasks automatically."}</h2><p>{zh ? "状态变化后，这里会自动减少或更新。" : "When status changes, this list updates automatically."}</p></div>
          <dl className="proof-details">
            {openTasks.length === 0 ? (
              <div><dt>Ready</dt><dd>{zh ? "没有待办，证明包已 Ready。" : "No open tasks; proof pack is Ready."}</dd></div>
            ) : openTasks.map((task) => (
              <div key={task.id}>
                <dt>{statusLabel(task.status, zh)}</dt>
                <dd><strong>{task.title}</strong><br /><span>{task.impact}</span></dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="panel">
          <div className="section-heading"><span>{zh ? "5. 分享与活动" : "5. Share and activity"}</span><h2>{zh ? "补证后生成外部可读结果。" : "After evidence completion, generate external results."}</h2></div>
          <div className="proof-flow-card"><strong>{zh ? "公开验证链接" : "Public verification link"}</strong><span>{publicLink}</span></div>
          <div className="proof-flow-card"><strong>{zh ? "当前登录角色" : "Current role"}</strong><span>{zh ? roles.find((item) => item.key === role)?.zh : roles.find((item) => item.key === role)?.en}</span></div>
          <dl className="proof-details">
            {activity.map((item, index) => (
              <div key={`${item}-${index}`}><dt>{String(index + 1).padStart(2, "0")}</dt><dd>{item}</dd></div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
