import { demoWorkspace, getReadyScore } from "@/lib/demo-workspace-data";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export function ProofPacksView({ zh }: { zh: boolean }) {
  const { businessContext, evidenceSlots, proofPack, user } = demoWorkspace;
  const readyScore = getReadyScore(evidenceSlots);

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>ProofPack</span>
          <h2>{t(zh, "一票货一个证明包。", "One shipment, one proof pack.")}</h2>
          <p>{t(zh, "这是登录后的列表页：搜索、筛选、状态、负责人、公开链接。", "This is the logged-in list page: search, filters, status, owner, public link.")}</p>
        </div>
        <dl className="proof-details">
          <div><dt>{proofPack.status}</dt><dd><strong>{proofPack.title}</strong><br />{businessContext.name} · Ready {readyScore}%</dd></div>
          <div><dt>{t(zh, "负责人", "Owner")}</dt><dd>{user.name} · {zh ? user.titleZh : user.titleEn}</dd></div>
          <div><dt>{t(zh, "公开链接", "Public link")}</dt><dd><a className="inline-link" href="/verify/uy-beef-cn-2026-0001">/verify/uy-beef-cn-2026-0001</a></dd></div>
        </dl>
      </div>
      <div className="panel form-panel">
        <div className="section-heading"><span>{t(zh, "新建证明包", "New proof pack")}</span><h2>{t(zh, "正常 SaaS 要有表单。", "A normal SaaS needs forms.")}</h2></div>
        <label>{t(zh, "业务名称", "Business name")}<input defaultValue="Uruguay Beef to China" /></label>
        <label>{t(zh, "批次号", "Batch number")}<input defaultValue="UY-BEEF-CN-2026-0002" /></label>
        <label>{t(zh, "场景", "Scenario")}<select defaultValue="food"><option value="food">Cross-border food</option><option value="finance">Receivable financing</option><option value="coldchain">Cold chain</option></select></label>
        <button type="button" className="primary-button">{t(zh, "创建证明包", "Create proof pack")}</button>
      </div>
    </section>
  );
}
