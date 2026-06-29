export type WorkspaceNavKey = "dashboard" | "proofPacks" | "evidence" | "tasks" | "assistant" | "approvals";

export const workspaceNavItems: { key: WorkspaceNavKey; href: string; zh: string; en: string }[] = [
  { key: "dashboard", href: "/dashboard", zh: "首页", en: "Home" },
  { key: "proofPacks", href: "/proof-packs", zh: "证明包", en: "Proof packs" },
  { key: "evidence", href: "/evidence", zh: "证据", en: "Evidence" },
  { key: "tasks", href: "/tasks", zh: "任务", en: "Tasks" },
  { key: "assistant", href: "/assistant", zh: "助手", en: "Assistant" },
  { key: "approvals", href: "/assistant/approvals", zh: "审批", en: "Approvals" },
];
