export type WorkspaceNavKey = "cases" | "flows" | "architecture" | "logistics" | "readiness" | "signing" | "loan" | "contracts" | "professionalReview" | "dashboard" | "business" | "funds" | "wallet" | "proofPacks" | "evidence" | "tasks" | "assistant" | "approvals";

export type WorkspaceNavItem = { key: WorkspaceNavKey; href: string; zh: string; en: string; tier?: "primary" | "reference" };

export type WorkspaceNavGroup = {
  id: string;
  zh: string;
  en: string;
  items: WorkspaceNavItem[];
};

export const workspaceNavGroups: WorkspaceNavGroup[] = [
  {
    id: "operating",
    zh: "工作台主路径",
    en: "Working path",
    items: [
      { key: "dashboard", href: "/dashboard", zh: "操作台", en: "Command center", tier: "primary" },
      { key: "cases", href: "/cases", zh: "Case", en: "Cases", tier: "primary" },
      { key: "evidence", href: "/evidence", zh: "证据", en: "Evidence", tier: "primary" },
      { key: "tasks", href: "/tasks", zh: "任务", en: "Tasks", tier: "primary" },
    ],
  },
  {
    id: "review",
    zh: "审查与交接",
    en: "Review & handoff",
    items: [
      { key: "professionalReview", href: "/business-professional-review", zh: "专业审查", en: "Professional review", tier: "primary" },
      { key: "proofPacks", href: "/proof-packs", zh: "Trust Pack", en: "Trust Pack", tier: "primary" },
      { key: "readiness", href: "/business-readiness", zh: "Readiness", en: "Readiness", tier: "primary" },
    ],
  },
  {
    id: "reference",
    zh: "参考 / Demo",
    en: "Reference / Demo",
    items: [
      { key: "business", href: "/business-ops", zh: "Agent 参考", en: "Agent reference", tier: "reference" },
      { key: "architecture", href: "/business-architecture", zh: "架构参考", en: "Architecture reference", tier: "reference" },
      { key: "flows", href: "/business-flows", zh: "四流参考", en: "Four-flow reference", tier: "reference" },
      { key: "contracts", href: "/business-contracts", zh: "合约参考", en: "Contract reference", tier: "reference" },
      { key: "wallet", href: "/business-wallet", zh: "钱包参考", en: "Wallet reference", tier: "reference" },
    ],
  },
];

export const workspaceNavItems: WorkspaceNavItem[] = workspaceNavGroups.flatMap((group) => group.items);
