export type WorkspaceNavKey = "dashboard" | "business" | "proofPacks" | "evidence" | "tasks" | "assistant" | "approvals";

export const workspaceNavItems: { key: WorkspaceNavKey; href: string; zh: string; en: string }[] = [
  { key: "dashboard", href: "/dashboard", zh: "首页", en: "Home" },
  { key: "business", href: "/business-ops", zh: "业务 Sidecar", en: "Business sidecar" },
  { key: "proofPacks", href: "/proof-packs", zh: "证明 / 风控", en: "Proof & risk" },
  { key: "evidence", href: "/evidence", zh: "文件", en: "Documents" },
  { key: "tasks", href: "/tasks", zh: "任务", en: "Tasks" },
  { key: "assistant", href: "/assistant", zh: "助手", en: "Assistant" },
  { key: "approvals", href: "/assistant/approvals", zh: "审批", en: "Approvals" },
];
