export type WorkspaceNavKey = "dashboard" | "business" | "proofPacks" | "evidence" | "tasks" | "assistant" | "approvals";

export const workspaceNavItems: { key: WorkspaceNavKey; href: string; zh: string; en: string }[] = [
  { key: "business", href: "/business-ops", zh: "交易 Sidecar", en: "Trade sidecar" },
  { key: "dashboard", href: "/dashboard", zh: "交易总览", en: "Trade overview" },
  { key: "evidence", href: "/evidence", zh: "文件", en: "Documents" },
  { key: "tasks", href: "/tasks", zh: "履约 / 验收", en: "Fulfillment" },
  { key: "approvals", href: "/assistant/approvals", zh: "收款 / 融资", en: "Collection" },
  { key: "proofPacks", href: "/proof-packs", zh: "证明 / 风控", en: "Proof & risk" },
  { key: "assistant", href: "/assistant", zh: "Sidecar 建议", en: "Sidecar advice" },
];
