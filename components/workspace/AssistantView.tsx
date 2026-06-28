import { demoWorkspace, getContextLabel } from "@/lib/demo-workspace-data";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export function AssistantView({ zh }: { zh: boolean }) {
  const { memories, suggestions } = demoWorkspace;
  const suggestion = suggestions[1];

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "客户上下文助手", "Customer-context assistant")}</span>
          <h2>{t(zh, suggestion.titleZh, suggestion.titleEn)}</h2>
          <p>{t(zh, suggestion.reasonZh, suggestion.reasonEn)}</p>
        </div>
        <dl className="proof-details">
          <div><dt>{t(zh, "建议动作", "Suggested action")}</dt><dd>{t(zh, suggestion.proposedActionZh, suggestion.proposedActionEn)}</dd></div>
          <div><dt>{t(zh, "业务影响", "Business impact")}</dt><dd>{t(zh, suggestion.businessImpactZh, suggestion.businessImpactEn)}</dd></div>
          <div><dt>{t(zh, "引用上下文", "Cited context")}</dt><dd>{suggestion.contextRefs.map((ref) => getContextLabel(ref, zh)).join(" / ")}</dd></div>
        </dl>
        <a className="primary-button" href="/assistant/approvals">{t(zh, "生成草稿并提交审批", "Create draft and submit approval")}</a>
      </div>
      <div className="panel">
        <div className="section-heading"><span>{t(zh, "记忆来源", "Memory source")}</span><h2>{t(zh, "必须让用户看得见、关得掉。", "Users must be able to see and disable memory.")}</h2></div>
        <dl className="proof-details">
          {memories.slice(0, 4).map((memory) => (
            <div key={memory.id}><dt>{memory.enabled ? "on" : "off"}</dt><dd><strong>{zh ? memory.titleZh : memory.titleEn}</strong><br />{zh ? memory.valueZh : memory.valueEn}</dd></div>
          ))}
        </dl>
      </div>
    </section>
  );
}
