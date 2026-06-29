export type AgentApiEndpoint = {
  id: string;
  nameZh: string;
  nameEn: string;
  path: string;
  method: "GET" | "POST";
  stageZh: string;
  stageEn: string;
  outputZh: string;
  outputEn: string;
  replacesZh: string;
  replacesEn: string;
};

export const agentApiEndpoints: AgentApiEndpoint[] = [
  {
    id: "agent_run",
    nameZh: "Agent Pipeline Run",
    nameEn: "Agent Pipeline Run",
    path: "/api/agents/run",
    method: "GET",
    stageZh: "一键执行链路",
    stageEn: "One-shot pipeline",
    outputZh: "汇总 evidence、gates、gaps、risk memo 和 professional review 的机器可读结果。",
    outputEn: "Aggregates machine-readable evidence, gates, gaps, risk memo, and professional review outputs.",
    replacesZh: "人工把多个工作台结果复制到一个融资包。",
    replacesEn: "Manually copying multiple workbench outputs into one financing pack.",
  },
  {
    id: "evidence",
    nameZh: "Evidence Agent API",
    nameEn: "Evidence Agent API",
    path: "/api/agents/evidence",
    method: "GET",
    stageZh: "证据分类",
    stageEn: "Evidence classification",
    outputZh: "单证 metadata、hash、状态、可用于预审的证据 ID。",
    outputEn: "Document metadata, hashes, status, and pre-review usable evidence IDs.",
    replacesZh: "人工打开 PDF / 图片并摘录字段。",
    replacesEn: "Human opening PDFs/images and copying fields.",
  },
  {
    id: "gates",
    nameZh: "Gate Agent API",
    nameEn: "Gate Agent API",
    path: "/api/agents/gates",
    method: "GET",
    stageZh: "融资 Gate 判断",
    stageEn: "Financing gate decision",
    outputZh: "12 个 gate 的 passed / pending / blocked 状态和放款阻断码。",
    outputEn: "Passed / pending / blocked status for 12 gates and disbursement blocker code.",
    replacesZh: "人工 Excel checklist 对账。",
    replacesEn: "Manual Excel checklist reconciliation.",
  },
  {
    id: "gaps",
    nameZh: "Evidence Gap API",
    nameEn: "Evidence Gap API",
    path: "/api/agents/gaps",
    method: "GET",
    stageZh: "缺口报告",
    stageEn: "Gap report",
    outputZh: "缺失材料、责任方、blocking/follow-up 严重程度和下一步动作。",
    outputEn: "Missing materials, responsible roles, blocking/follow-up severity, and next actions.",
    replacesZh: "运营人员逐个问货代、仓库、买家、质检方。",
    replacesEn: "Ops manually chasing forwarder, warehouse, buyer, and QC provider.",
  },
  {
    id: "risk_memo",
    nameZh: "Risk Memo API",
    nameEn: "Risk Memo API",
    path: "/api/agents/risk-memo",
    method: "GET",
    stageZh: "资金方 Memo",
    stageEn: "Financier memo",
    outputZh: "风控 memo、risk flags、approval conditions 和机器放款判断。",
    outputEn: "Risk memo, risk flags, approval conditions, and machine disbursement decision.",
    replacesZh: "风控经理或律师助理人工写预审 memo。",
    replacesEn: "Risk manager or legal assistant drafting pre-review memo manually.",
  },
  {
    id: "professional_review",
    nameZh: "Professional Review API",
    nameEn: "Professional Review API",
    path: "/api/professional-review",
    method: "GET",
    stageZh: "银行 / 律所例外审查",
    stageEn: "Bank / law-firm exception review",
    outputZh: "例外队列、职责边界、blocked / needs-review / auto-cleared 统计。",
    outputEn: "Exception queue, responsibility boundary, and blocked / needs-review / auto-cleared counts.",
    replacesZh: "专业机构从零翻材料。",
    replacesEn: "Professionals starting from raw materials.",
  },
];
