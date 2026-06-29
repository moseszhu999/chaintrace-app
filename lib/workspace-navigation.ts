export type WorkspaceNavKey = "flows" | "dashboard" | "business" | "funds" | "wallet" | "proofPacks" | "evidence" | "tasks" | "assistant" | "approvals";

export const workspaceNavItems: { key: WorkspaceNavKey; href: string; zh: string; en: string }[] = [
  { key: "flows", href: "/business-flows", zh: "四流合一", en: "Four-flow view" },
  { key: "business", href: "/business-ops", zh: "业务 Agent", en: "Business agent" },
  { key: "dashboard", href: "/dashboard", zh: "业务总览", en: "Business overview" },
  { key: "evidence", href: "/evidence", zh: "业务文件", en: "Business documents" },
  { key: "tasks", href: "/tasks", zh: "业务履约 / 验收", en: "Business fulfillment" },
  { key: "funds", href: "/business-funds", zh: "业务资金", en: "Business funds" },
  { key: "wallet", href: "/business-wallet", zh: "业务钱包", en: "Business wallet" },
  { key: "approvals", href: "/business-financing", zh: "业务融资 / RWA", en: "Business financing / RWA" },
  { key: "proofPacks", href: "/proof-packs", zh: "业务证明 / 风控", en: "Business proof & risk" },
  { key: "assistant", href: "/assistant", zh: "业务建议", en: "Business advice" },
];
