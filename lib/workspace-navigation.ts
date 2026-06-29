export type WorkspaceNavKey = "dashboard" | "business" | "proofPacks" | "evidence" | "tasks" | "assistant" | "approvals";

export const workspaceNavItems: { key: WorkspaceNavKey; href: string; zh: string; en: string }[] = [
  { key: "business", href: "/business-ops", zh: "业务 Agent", en: "Business agent" },
  { key: "dashboard", href: "/dashboard", zh: "业务总览", en: "Business overview" },
  { key: "evidence", href: "/evidence", zh: "业务文件", en: "Business documents" },
  { key: "tasks", href: "/tasks", zh: "业务履约 / 验收", en: "Business fulfillment" },
  { key: "approvals", href: "/assistant/approvals", zh: "业务收款 / 融资", en: "Business collection" },
  { key: "proofPacks", href: "/proof-packs", zh: "业务证明 / 风控", en: "Business proof & risk" },
  { key: "assistant", href: "/assistant", zh: "业务建议", en: "Business advice" },
];
