import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const agentRoles = [
  {
    roleZh: "ChainTrace 自有 Agent",
    roleEn: "ChainTrace first-party agent",
    painZh: "用户不知道下一步该补什么证据，也不知道应该催谁。",
    painEn: "Users do not know what evidence to add next or whom to chase.",
    jobZh: "读取 RiskGap、Task、EvidenceSlot，自动生成下一步动作和提醒。",
    jobEn: "Read RiskGap, Task, and EvidenceSlot to generate next actions and reminders.",
    resultZh: "把缺证从静态状态变成可执行任务。",
    resultEn: "Turn missing evidence from static status into executable tasks.",
  },
  {
    roleZh: "供应商 Agent",
    roleEn: "Supplier agent",
    painZh: "供应商经常漏交质检、发货、交付证据，导致收款慢。",
    painEn: "Suppliers often miss inspection, shipment, and delivery evidence, slowing collection.",
    jobZh: "自动检查自己负责的证据槽，提醒上传或从系统拉取证据。",
    jobEn: "Check owned evidence slots and remind uploads or pull evidence from systems.",
    resultZh: "更快补齐履约证明。",
    resultEn: "Faster fulfillment proof completion.",
  },
  {
    roleZh: "买家 Agent",
    roleEn: "Buyer agent",
    painZh: "买家要反复问供应商材料齐没齐，很浪费采购时间。",
    painEn: "Buyers repeatedly ask suppliers whether materials are complete, wasting procurement time.",
    jobZh: "读取公开验证页和批次事实状态，判断能否进入验收或付款。",
    jobEn: "Read public verification and batch fact status to decide acceptance or payment readiness.",
    resultZh: "采购判断更快，少追问。",
    resultEn: "Faster procurement decisions and fewer follow-ups.",
  },
  {
    roleZh: "资金方 Agent",
    roleEn: "Financier agent",
    painZh: "资金方不敢只看发票，需要快速识别假贸易和缺证风险。",
    painEn: "Financiers cannot rely on invoices alone; they need fast fake-trade and gap screening.",
    jobZh: "读取 ProofPack、Evidence、RiskGap、Business Passport，形成融资前事实检查。",
    jobEn: "Read ProofPack, Evidence, RiskGap, and Business Passport for pre-financing fact checks.",
    resultZh: "降低假贸易风险，提高低风险交易审核速度。",
    resultEn: "Reduce fake-trade risk and speed up low-risk deal review.",
  },
  {
    roleZh: "审计 / 合规 Agent",
    roleEn: "Audit / compliance agent",
    painZh: "审计要追证据来源、时间、责任人、版本，人工抽查成本高。",
    painEn: "Audits need source, time, owner, and version; manual sampling is costly.",
    jobZh: "读取 Evidence Library 和 VerificationLog，生成抽查清单和异常提示。",
    jobEn: "Read Evidence Library and VerificationLog to generate sampling lists and anomaly hints.",
    resultZh: "审计更快，抽查更有针对性。",
    resultEn: "Faster audits and more targeted sampling.",
  },
];

const agentWorkflow = [
  { step: "01", zh: "观察事实状态", en: "Observe fact status", detailZh: "读取证明包、证据槽、风险缺口、任务状态。", detailEn: "Read proof packs, evidence slots, risk gaps, and task status." },
  { step: "02", zh: "判断阻塞原因", en: "Identify blockers", detailZh: "判断是缺证、责任方未响应、证据不完整还是外部验证未通过。", detailEn: "Identify missing evidence, unresponsive owners, incomplete evidence, or failed external verification." },
  { step: "03", zh: "生成下一步动作", en: "Generate next action", detailZh: "告诉用户补什么、找谁补、补完影响哪个业务结果。", detailEn: "Tell users what to add, whom to ask, and which business result improves." },
  { step: "04", zh: "触发协作", en: "Trigger collaboration", detailZh: "发任务、提醒、Webhook 或 Agent-to-Agent 请求。", detailEn: "Send tasks, reminders, webhooks, or agent-to-agent requests." },
  { step: "05", zh: "更新事实状态", en: "Update fact status", detailZh: "证据补齐后更新 ProofPack、RiskGap、Task 和公开验证页。", detailEn: "After evidence is added, update ProofPack, RiskGap, Task, and public verification." },
  { step: "06", zh: "进入人工确认", en: "Escalate to human confirmation", detailZh: "付款、融资、验收、理赔等关键动作必须由人确认。", detailEn: "Payment, financing, acceptance, and claims still require human confirmation." },
];

const agentObjects = [
  { key: "ProofPack", zh: "Agent 判断一票货是否 Ready 的主对象。", en: "Main object agents use to judge whether a shipment is Ready." },
  { key: "EvidenceSlot", zh: "Agent 判断每类证据是否缺失、部分、已验证。", en: "Lets agents judge whether each evidence type is Missing, Partial, or Verified." },
  { key: "RiskGap", zh: "Agent 判断业务卡点和风险影响。", en: "Lets agents understand business blockers and risk impact." },
  { key: "Task", zh: "Agent 分配、催办、跟进补证动作。", en: "Lets agents assign, remind, and follow evidence-completion actions." },
  { key: "FactEvent", zh: "Agent 订阅状态变化，例如 evidence.added、proof_pack.ready。", en: "Lets agents subscribe to state changes such as evidence.added and proof_pack.ready." },
  { key: "BusinessPassport", zh: "Agent 读取企业长期事实和声誉信号。", en: "Lets agents read long-term business facts and reputation signals." },
];

const boundaries = [
  {
    zh: "Agent 不替用户做付款、融资、验收决定。",
    en: "Agents do not make payment, financing, or acceptance decisions for users.",
    descZh: "Agent 可以建议、提醒、整理证据，但关键商业动作必须人工确认。",
    descEn: "Agents can suggest, remind, and organize evidence, but key business actions require human confirmation.",
  },
  {
    zh: "Agent 不直接读取商业机密原文件，除非授权。",
    en: "Agents do not read confidential raw files unless authorized.",
    descZh: "默认读取结构化元数据、哈希、状态和可公开摘要。",
    descEn: "By default, agents read structured metadata, hashes, status, and public summaries.",
  },
  {
    zh: "Agent 不替代 ERP / WMS / TMS。",
    en: "Agents do not replace ERP / WMS / TMS.",
    descZh: "ChainTrace Agent 是事实协作层，不是业务系统本身。",
    descEn: "ChainTrace Agent is the fact-collaboration layer, not the business system itself.",
  },
  {
    zh: "Agent 必须可追溯。",
    en: "Agent actions must be traceable.",
    descZh: "每个自动提醒、任务生成、状态变更都要留下 FactEvent。",
    descEn: "Every reminder, task creation, and state change should leave a FactEvent.",
  },
];

export default async function AIAgentPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "AI Agent 事实协作层" : "AI Agent Fact Collaboration Layer"}</div>
            <h1>{zh ? "AI Agent 不猜 PDF，它读取可验证事实状态。" : "AI agents should not guess PDFs; they should read verifiable fact status."}</h1>
            <p>
              {zh
                ? "在 ChainTrace 里，AI Agent 不是炫技功能，而是解决供应链协作痛点：谁缺证、谁负责、下一步做什么、什么时候能 Ready。Agent 读取 ProofPack、Evidence、RiskGap、Task 和 FactEvent，而不是在散乱文件里乱猜。"
                : "In ChainTrace, AI Agent is not a gimmick. It solves supply-chain collaboration pain: what is missing, who owns it, what to do next, and when the shipment can become Ready. Agents read ProofPack, Evidence, RiskGap, Task, and FactEvent instead of guessing from scattered files."}
            </p>
            <div className="hero-actions">
              <Link href="/tasks" className="primary-button">{zh ? "查看任务中心" : "View task center"}</Link>
              <Link href="/risk-dashboard" className="secondary-button">{zh ? "查看风险缺口" : "View risk gaps"}</Link>
              <Link href="/integrations" className="secondary-button">{zh ? "查看接入层" : "View integrations"}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "Agent 输入" : "Agent inputs"}</span><strong>Facts → Tasks → Actions</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>ProofPack</span><strong>Read</strong></div>
                <div className="mini-proof-card present"><span>RiskGap</span><strong>Read</strong></div>
                <div className="mini-proof-card pending"><span>Task</span><strong>Assign</strong></div>
                <div className="mini-proof-card present"><span>FactEvent</span><strong>Trace</strong></div>
              </div>
              <div className="signal-status-box"><span>{zh ? "核心价值" : "Core value"}</span><strong>{zh ? "Agent 把缺口变成动作。" : "Agents turn gaps into actions."}</strong><p>{zh ? "不是替人拍板，而是让人更快知道该做什么。" : "They do not decide for humans; they help humans know what to do faster."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "Agent 用户与痛点" : "Agent users and pains"}</span><h2>{zh ? "不同 Agent 服务不同角色。" : "Different agents serve different roles."}</h2><p>{zh ? "AI Agent 也必须从用户痛点出发，而不是为了 AI 而 AI。" : "AI agents must also start from user pain, not from AI for AI's sake."}</p></div>
        <dl className="proof-details">
          {agentRoles.map((role) => (
            <div key={role.roleEn}>
              <dt>{zh ? role.roleZh : role.roleEn}</dt>
              <dd>
                <strong>{zh ? "痛点：" : "Pain: "}</strong>{zh ? role.painZh : role.painEn}
                <br />
                <strong>{zh ? "Agent 做什么：" : "Agent job: "}</strong>{zh ? role.jobZh : role.jobEn}
                <br />
                <span><strong>{zh ? "结果：" : "Outcome: "}</strong>{zh ? role.resultZh : role.resultEn}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{zh ? "Agent 工作流" : "Agent workflow"}</span><h2>{zh ? "从观察事实到触发协作。" : "From observing facts to triggering collaboration."}</h2><p>{zh ? "Agent 的核心不是聊天，而是读事实、发现缺口、推动补证。" : "The core is not chatting; it is reading facts, finding gaps, and driving evidence completion."}</p></div>
          <dl className="proof-details">
            {agentWorkflow.map((item) => (
              <div key={item.step}>
                <dt>{item.step}</dt>
                <dd><strong>{zh ? item.zh : item.en}</strong><br />{zh ? item.detailZh : item.detailEn}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="panel">
          <div className="section-heading"><span>{zh ? "Agent 读取对象" : "Agent-readable objects"}</span><h2>{zh ? "给 Agent 读结构化对象，不给它乱猜。" : "Give agents structured objects, not guesses."}</h2><p>{zh ? "这是 ChainTrace 未来 Agent 生态的基础。" : "This is the base of the future ChainTrace agent ecosystem."}</p></div>
          <dl className="proof-details">
            {agentObjects.map((item) => (
              <div key={item.key}>
                <dt>{item.key}</dt>
                <dd>{zh ? item.zh : item.en}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "Agent 边界" : "Agent boundaries"}</span><h2>{zh ? "Agent 要强，但不能越权。" : "Agents should be powerful, but not over-authorized."}</h2><p>{zh ? "供应链里涉及付款、融资、验收和责任判断，必须有清晰权限边界。" : "Supply chains involve payment, financing, acceptance, and accountability, so permission boundaries must be clear."}</p></div>
        <div className="story-grid">
          {boundaries.map((item) => (
            <article key={item.en} className="story-card">
              <strong>{zh ? item.zh : item.en}</strong>
              <p>{zh ? item.descZh : item.descEn}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
