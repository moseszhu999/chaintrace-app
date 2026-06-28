"use client";

import { useMemo, useState } from "react";

type Role = "supplier" | "trader" | "importer" | "buyer" | "financier";
type View = "login" | "dashboard" | "create" | "evidence" | "share";
type Status = "Missing" | "Present" | "Verified";

type EvidenceSlot = {
  id: string;
  zh: string;
  en: string;
  ownerZh: string;
  ownerEn: string;
  status: Status;
};

type Pack = {
  id: string;
  scenarioZh: string;
  scenarioEn: string;
  name: string;
  customer: string;
  amount: string;
  slots: EvidenceSlot[];
};

const roleOptions: { key: Role; zh: string; en: string; promiseZh: string; promiseEn: string }[] = [
  { key: "supplier", zh: "供应商", en: "Supplier", promiseZh: "补齐履约证据，更快收款。", promiseEn: "Complete fulfillment proof and collect faster." },
  { key: "trader", zh: "贸易商", en: "Trader", promiseZh: "把一票货整理成可分享事实链。", promiseEn: "Turn a shipment into a shareable fact chain." },
  { key: "importer", zh: "进口商", en: "Importer", promiseZh: "快速判断清关、入库、分销是否卡住。", promiseEn: "See whether customs, warehouse, or distribution is blocked." },
  { key: "buyer", zh: "买家", en: "Buyer", promiseZh: "减少追问，快速验收。", promiseEn: "Ask less and accept faster." },
  { key: "financier", zh: "资金方", en: "Financier", promiseZh: "融资前先看真实交易证据。", promiseEn: "Check real-trade evidence before financing." },
];

const baseSlots: EvidenceSlot[] = [
  { id: "order", zh: "订单 / 合同", en: "Order / contract", ownerZh: "贸易商", ownerEn: "Trader", status: "Verified" },
  { id: "invoice", zh: "发票", en: "Invoice", ownerZh: "供应商", ownerEn: "Supplier", status: "Verified" },
  { id: "shipment", zh: "发货 / 装柜", en: "Shipment / loading", ownerZh: "物流商", ownerEn: "Logistics", status: "Present" },
  { id: "inspection", zh: "质检 / 检疫", en: "Inspection / quarantine", ownerZh: "质检方", ownerEn: "Inspector", status: "Present" },
  { id: "delivery", zh: "交付 / 入库", en: "Delivery / warehouse", ownerZh: "进口商 / 仓库", ownerEn: "Importer / warehouse", status: "Missing" },
  { id: "acceptance", zh: "买家验收", en: "Buyer acceptance", ownerZh: "买家", ownerEn: "Buyer", status: "Missing" },
];

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusText(status: Status, zh: boolean) {
  if (!zh) return status;
  return { Missing: "缺失", Present: "已上传", Verified: "已验证" }[status];
}

function nextId() {
  return `PP-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function AppDemo({ zh }: { zh: boolean }) {
  const [view, setView] = useState<View>("login");
  const [role, setRole] = useState<Role>("trader");
  const [orgName, setOrgName] = useState("Example Small Exporter");
  const [packName, setPackName] = useState("Uruguay Beef Import to China");
  const [customer, setCustomer] = useState("Shanghai Buyer Co.");
  const [amount, setAmount] = useState("USD 84,000");
  const [packs, setPacks] = useState<Pack[]>([
    {
      id: "UY-BEEF-CN-2026-0001",
      scenarioZh: "跨境食品进口",
      scenarioEn: "Cross-border food import",
      name: "Uruguay Beef Import to China",
      customer: "Shanghai Buyer Co.",
      amount: "USD 84,000",
      slots: baseSlots,
    },
  ]);
  const [selectedPackId, setSelectedPackId] = useState("UY-BEEF-CN-2026-0001");
  const [activity, setActivity] = useState<string[]>([
    t(zh, "系统已创建示例证明包。", "System created a sample proof pack."),
  ]);

  const selectedPack = packs.find((pack) => pack.id === selectedPackId) ?? packs[0];
  const selectedRole = roleOptions.find((item) => item.key === role) ?? roleOptions[1];

  const stats = useMemo(() => {
    const allSlots = packs.flatMap((pack) => pack.slots);
    const verified = allSlots.filter((slot) => slot.status === "Verified").length;
    const missing = allSlots.filter((slot) => slot.status === "Missing").length;
    const tasks = allSlots.filter((slot) => slot.status !== "Verified").length;
    return { verified, missing, tasks, packs: packs.length };
  }, [packs]);

  const selectedVerified = selectedPack.slots.filter((slot) => slot.status === "Verified").length;
  const selectedReady = selectedVerified === selectedPack.slots.length;
  const selectedProgress = Math.round((selectedVerified / selectedPack.slots.length) * 100);
  const publicLink = `/verify/${selectedPack.id.toLowerCase()}`;

  function pushActivity(cn: string, en: string) {
    setActivity((items) => [t(zh, cn, en), ...items].slice(0, 8));
  }

  function login() {
    setView("dashboard");
    pushActivity("用户已登录工作台。", "User logged into workspace.");
  }

  function createPack() {
    const id = nextId();
    const newPack: Pack = {
      id,
      scenarioZh: "应收账款融资",
      scenarioEn: "Receivable financing",
      name: packName,
      customer,
      amount,
      slots: baseSlots.map((slot, index) => ({ ...slot, status: index < 2 ? "Verified" : "Missing" })),
    };
    setPacks((items) => [newPack, ...items]);
    setSelectedPackId(id);
    setView("evidence");
    pushActivity("已创建新的证明包，并生成证据槽。", "Created a new proof pack and generated evidence slots.");
  }

  function updateSlot(slotId: string, status: Status) {
    setPacks((items) => items.map((pack) => {
      if (pack.id !== selectedPack.id) return pack;
      return { ...pack, slots: pack.slots.map((slot) => (slot.id === slotId ? { ...slot, status } : slot)) };
    }));
    const slot = selectedPack.slots.find((item) => item.id === slotId);
    pushActivity(
      `${slot?.zh ?? "证据"} 状态更新为 ${statusText(status, true)}。`,
      `${slot?.en ?? "Evidence"} changed to ${status}.`,
    );
  }

  function verifyAll() {
    setPacks((items) => items.map((pack) => {
      if (pack.id !== selectedPack.id) return pack;
      return { ...pack, slots: pack.slots.map((slot) => ({ ...slot, status: "Verified" })) };
    }));
    setView("share");
    pushActivity("所有证据已验证，证明包达到 Ready。", "All evidence verified; proof pack reached Ready.");
  }

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{t(zh, "登录后 SaaS App Demo", "Post-login SaaS App Demo")}</div>
            <h1>{t(zh, "把 ChainTrace 从说明页变成客户可操作的工作流。", "Turn ChainTrace from pages into an operable customer workflow.")}</h1>
            <p>
              {t(
                zh,
                "这个 Demo 串起登录、组织、角色、仪表盘、创建证明包、补证据、任务、Ready 状态和公开链接。它仍是前端原型，但已经能表达真实 SaaS 的互动。",
                "This demo connects login, organization, role, dashboard, proof pack creation, evidence completion, tasks, Ready status, and public link. It is still a frontend prototype, but it shows real SaaS interaction.",
              )}
            </p>
            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={() => setView("login")}>{t(zh, "从登录开始", "Start from login")}</button>
              <button type="button" className="secondary-button" onClick={() => setView("dashboard")}>{t(zh, "进入仪表盘", "Open dashboard")}</button>
              <button type="button" className="secondary-button" onClick={() => setView("create")}>{t(zh, "创建证明包", "Create proof pack")}</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{t(zh, "当前组织", "Current org")}</span><strong>{orgName}</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>{t(zh, "证明包", "Packs")}</span><strong>{stats.packs}</strong></div>
                <div className="mini-proof-card present"><span>{t(zh, "已验证", "Verified")}</span><strong>{stats.verified}</strong></div>
                <div className="mini-proof-card pending"><span>{t(zh, "缺失", "Missing")}</span><strong>{stats.missing}</strong></div>
                <div className="mini-proof-card pending"><span>{t(zh, "任务", "Tasks")}</span><strong>{stats.tasks}</strong></div>
              </div>
              <div className="signal-status-box"><span>{t(zh, "当前批次", "Current batch")}</span><strong>{selectedPack.id}</strong><p>{selectedReady ? t(zh, "Ready，可以分享给外部用户。", "Ready; shareable with external users.") : t(zh, "Missing evidence，还不能 Ready。", "Missing evidence; not Ready yet.")}</p></div>
            </div>
          </div>
        </div>
      </section>

      {view === "login" && (
        <section className="workspace">
          <div className="panel form-panel">
            <div className="section-heading"><span>{t(zh, "1. 登录", "1. Login")}</span><h2>{t(zh, "客户先选择组织和角色。", "Customer chooses organization and role first.")}</h2><p>{t(zh, "不同角色进入后看到不同任务和价值。", "Different roles see different tasks and value after login.")}</p></div>
            <label>{t(zh, "组织名称", "Organization name")}<input value={orgName} onChange={(event) => setOrgName(event.target.value)} /></label>
            <div className="story-grid">
              {roleOptions.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className="story-card"
                  onClick={() => setRole(item.key)}
                  style={{ textAlign: "left", cursor: "pointer", border: role === item.key ? "2px solid #111827" : undefined }}
                >
                  <strong>{t(zh, item.zh, item.en)}</strong>
                  <p>{t(zh, item.promiseZh, item.promiseEn)}</p>
                </button>
              ))}
            </div>
            <button type="button" className="primary-button" onClick={login}>{t(zh, "登录进入工作台", "Login to workspace")}</button>
          </div>
          <div className="panel preview-panel">
            <div className="section-heading"><span>{t(zh, "登录后价值", "Post-login value")}</span><h2>{t(zh, selectedRole.zh, selectedRole.en)}</h2><p>{t(zh, selectedRole.promiseZh, selectedRole.promiseEn)}</p></div>
            <dl className="proof-details">
              <div><dt>{t(zh, "默认首页", "Default home")}</dt><dd>{t(zh, "仪表盘：证明包、缺证任务、风险和公开链接。", "Dashboard: proof packs, missing-evidence tasks, risks, and public links.")}</dd></div>
              <div><dt>{t(zh, "下一步", "Next step")}</dt><dd>{t(zh, "创建一票货 / 一个订单的证明包。", "Create a proof pack for one shipment or order.")}</dd></div>
            </dl>
          </div>
        </section>
      )}

      {view === "dashboard" && (
        <section className="workspace">
          <div className="panel">
            <div className="section-heading"><span>{t(zh, "2. 仪表盘", "2. Dashboard")}</span><h2>{t(zh, "客户登录后先看业务卡点。", "After login, customers first see business blockers.")}</h2><p>{t(zh, "不是看介绍，而是看哪些证明包还没 Ready。", "Not product copy, but which proof packs are not Ready.")}</p></div>
            <div className="pack-step-grid">
              {packs.map((pack) => {
                const verified = pack.slots.filter((slot) => slot.status === "Verified").length;
                const isReady = verified === pack.slots.length;
                return (
                  <article key={pack.id} className="pack-step-card" onClick={() => { setSelectedPackId(pack.id); setView("evidence"); }} style={{ cursor: "pointer", border: pack.id === selectedPack.id ? "2px solid #111827" : undefined }}>
                    <span>{t(zh, pack.scenarioZh, pack.scenarioEn)}</span>
                    <strong>{pack.id}</strong>
                    <p>{pack.name}</p>
                    <p>{isReady ? "Ready" : `Missing · ${verified}/${pack.slots.length}`}</p>
                  </article>
                );
              })}
            </div>
            <button type="button" className="primary-button" onClick={() => setView("create")}>{t(zh, "新建证明包", "New proof pack")}</button>
          </div>
          <div className="panel">
            <div className="section-heading"><span>{t(zh, "最近活动", "Recent activity")}</span><h2>{t(zh, "每个动作都留下记录。", "Every action leaves a record.")}</h2></div>
            <dl className="proof-details">
              {activity.map((item, index) => (<div key={`${item}-${index}`}><dt>{String(index + 1).padStart(2, "0")}</dt><dd>{item}</dd></div>))}
            </dl>
          </div>
        </section>
      )}

      {view === "create" && (
        <section className="workspace">
          <div className="panel form-panel">
            <div className="section-heading"><span>{t(zh, "3. 创建证明包", "3. Create proof pack")}</span><h2>{t(zh, "围绕一票货创建业务锚点。", "Create a business anchor around one shipment.")}</h2></div>
            <label>{t(zh, "业务名称", "Business name")}<input value={packName} onChange={(event) => setPackName(event.target.value)} /></label>
            <label>{t(zh, "客户 / 买家", "Customer / buyer")}<input value={customer} onChange={(event) => setCustomer(event.target.value)} /></label>
            <label>{t(zh, "金额", "Amount")}<input value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
            <button type="button" className="primary-button" onClick={createPack}>{t(zh, "创建并生成证据槽", "Create and generate slots")}</button>
          </div>
          <div className="panel preview-panel">
            <div className="section-heading"><span>{t(zh, "系统会自动生成", "System will generate")}</span><h2>Order · Invoice · Shipment · Inspection · Delivery · Acceptance</h2><p>{t(zh, "这些槽位会驱动任务、风险和公开验证页。", "These slots drive tasks, risks, and public verification.")}</p></div>
          </div>
        </section>
      )}

      {view === "evidence" && (
        <section className="workspace">
          <div className="panel">
            <div className="section-heading"><span>{t(zh, "4. 补证据", "4. Complete evidence")}</span><h2>{selectedPack.id}</h2><p>{selectedPack.name} · {selectedPack.customer} · {selectedPack.amount}</p></div>
            <dl className="proof-details">
              {selectedPack.slots.map((slot) => (
                <div key={slot.id}>
                  <dt>{statusText(slot.status, zh)}</dt>
                  <dd>
                    <strong>{t(zh, slot.zh, slot.en)}</strong>
                    <br />
                    {t(zh, "责任方：", "Owner: ")}{t(zh, slot.ownerZh, slot.ownerEn)}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      <button type="button" className="secondary-button" onClick={() => updateSlot(slot.id, "Present")}>{t(zh, "上传证据", "Upload")}</button>
                      <button type="button" className="primary-button" onClick={() => updateSlot(slot.id, "Verified")}>{t(zh, "验证通过", "Verify")}</button>
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
            <button type="button" className="primary-button" onClick={verifyAll}>{t(zh, "一键模拟全部验证通过", "Simulate all verified")}</button>
          </div>
          <div className="panel">
            <div className="section-heading"><span>{t(zh, "自动状态", "Auto status")}</span><h2>{selectedReady ? "Ready" : "Missing evidence"}</h2><p>{t(zh, "完整度：", "Completeness: ")}{selectedProgress}%</p></div>
            <dl className="proof-details">
              {selectedPack.slots.filter((slot) => slot.status !== "Verified").map((slot) => (
                <div key={slot.id}><dt>{t(zh, "待办", "Task")}</dt><dd>{t(zh, `请${slot.ownerZh}补齐或确认：${slot.zh}`, `Ask ${slot.ownerEn} to complete or confirm: ${slot.en}`)}</dd></div>
              ))}
              {selectedReady && <div><dt>Ready</dt><dd>{t(zh, "可以生成公开验证链接。", "Public verification link can be generated.")}</dd></div>}
            </dl>
            <button type="button" className="secondary-button" onClick={() => setView("share")}>{t(zh, "进入分享页", "Go to share")}</button>
          </div>
        </section>
      )}

      {view === "share" && (
        <section className="workspace">
          <div className="panel">
            <div className="section-heading"><span>{t(zh, "5. 公开验证", "5. Public verification")}</span><h2>{t(zh, "给外部人一个链接。", "Give outsiders one link.")}</h2><p>{t(zh, "外部买家、资金方、审计方不用登录，也能看状态。", "External buyers, financiers, and auditors can see status without login.")}</p></div>
            <div className="proof-flow-card"><strong>{t(zh, "公开链接", "Public link")}</strong><span>{publicLink}</span></div>
            <div className="proof-flow-card"><strong>{t(zh, "公开状态", "Public status")}</strong><span>{selectedReady ? "Ready" : "Missing evidence"}</span></div>
            <a className="primary-button" href={publicLink}>{t(zh, "打开公开验证页", "Open public verify page")}</a>
          </div>
          <div className="panel">
            <div className="section-heading"><span>{t(zh, "下一步", "Next step")}</span><h2>{t(zh, "真实开发要把这些状态保存到后端。", "Real development should persist these states to the backend.")}</h2></div>
            <dl className="proof-details">
              <div><dt>Auth</dt><dd>{t(zh, "用户、组织、角色、权限。", "User, organization, role, permissions.")}</dd></div>
              <div><dt>Database</dt><dd>{t(zh, "ProofPack、Evidence、Task、ShareLink。", "ProofPack, Evidence, Task, ShareLink.")}</dd></div>
              <div><dt>Storage</dt><dd>{t(zh, "文件上传、哈希计算、私有文件权限。", "File upload, hash calculation, private-file permissions.")}</dd></div>
            </dl>
          </div>
        </section>
      )}
    </main>
  );
}
