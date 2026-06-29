export type WorkspaceNavKey = "flows" | "architecture" | "logistics" | "readiness" | "signing" | "loan" | "contracts" | "professionalReview" | "dashboard" | "business" | "funds" | "wallet" | "proofPacks" | "evidence" | "tasks" | "assistant" | "approvals";

export const workspaceNavItems: { key: WorkspaceNavKey; href: string; zh: string; en: string }[] = [
  { key: "flows", href: "/business-flows", zh: "四流合一", en: "Four-flow view" },
  { key: "architecture", href: "/business-architecture", zh: "业务架构", en: "Business architecture" },
  { key: "logistics", href: "/business-logistics", zh: "物流证据", en: "Logistics evidence" },
  { key: "readiness", href: "/business-readiness", zh: "融资评分", en: "Readiness score" },
  { key: "business", href: "/business-ops", zh: "业务 Agent", en: "Business agent" },
  { key: "professionalReview", href: "/business-professional-review", zh: "专业审查", en: "Professional review" },
  { key: "signing", href: "/business-signing", zh: "签章合约", en: "Signing contract" },
  { key: "loan", href: "/business-loan", zh: "贷款合约", en: "Loan contract" },
  { key: "contracts", href: "/business-contracts", zh: "合约控制台", en: "Contract console" },
  { key: "dashboard", href: "/dashboard", zh: "业务总览", en: "Business overview" },
  { key: "evidence", href: "/evidence", zh: "业务文件", en: "Business documents" },
  { key: "tasks", href: "/tasks", zh: "业务履约 / 验收", en: "Business fulfillment" },
  { key: "funds", href: "/business-funds", zh: "业务资金", en: "Business funds" },
  { key: "wallet", href: "/business-wallet", zh: "业务钱包", en: "Business wallet" },
  { key: "approvals", href: "/business-financing", zh: "RWA 代币化", en: "RWA tokenization" },
  { key: "proofPacks", href: "/proof-packs", zh: "业务证明 / 风控", en: "Business proof & risk" },
  { key: "assistant", href: "/assistant", zh: "业务建议", en: "Business advice" },
];
