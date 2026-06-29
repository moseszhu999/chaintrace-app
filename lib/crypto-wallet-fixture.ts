export type WalletType = "business" | "escrow" | "financier";
export type WalletNetwork = "Polygon" | "Ethereum" | "Base" | "Solana";
export type WalletAsset = "USDC" | "USDT" | "ETH" | "MATIC";
export type WalletTxStatus = "confirmed" | "pending" | "blocked" | "draft";
export type WalletPermission = "view" | "prepare" | "approve" | "sign";

export type BusinessWallet = {
  id: string;
  type: WalletType;
  nameZh: string;
  nameEn: string;
  network: WalletNetwork;
  address: string;
  custodyZh: string;
  custodyEn: string;
  policyZh: string;
  policyEn: string;
  balances: { asset: WalletAsset; amount: string; usdValue: string }[];
  permissions: { roleZh: string; roleEn: string; permission: WalletPermission; noteZh: string; noteEn: string }[];
};

export type WalletTransaction = {
  id: string;
  walletId: string;
  titleZh: string;
  titleEn: string;
  asset: WalletAsset;
  amount: string;
  usdValue: string;
  direction: "in" | "out" | "anchor";
  status: WalletTxStatus;
  counterpartyZh: string;
  counterpartyEn: string;
  txHash?: string;
  relatedTradeId: string;
  relatedDocumentId?: string;
  noteZh: string;
  noteEn: string;
};

export const businessWallets: BusinessWallet[] = [
  {
    id: "wallet_ops_usdc_polygon",
    type: "business",
    nameZh: "业务 USDC 收款钱包",
    nameEn: "Business USDC collection wallet",
    network: "Polygon",
    address: "0x8b21...c4F9",
    custodyZh: "非托管：企业自己签名，ChainTrace 只读余额和生成草稿。",
    custodyEn: "Non-custodial: the business signs; ChainTrace only reads balances and prepares drafts.",
    policyZh: "单笔超过 USD 5,000 需要老板 + 财务双确认。",
    policyEn: "Transfers above USD 5,000 require owner + finance dual approval.",
    balances: [
      { asset: "USDC", amount: "8,200", usdValue: "USD 8,200" },
      { asset: "MATIC", amount: "42", usdValue: "USD 31" }
    ],
    permissions: [
      { roleZh: "运营", roleEn: "Operations", permission: "prepare", noteZh: "可生成收款请求和付款草稿。", noteEn: "Can prepare collection requests and payment drafts." },
      { roleZh: "财务", roleEn: "Finance", permission: "approve", noteZh: "可审批普通付款。", noteEn: "Can approve normal payments." },
      { roleZh: "老板", roleEn: "Owner", permission: "sign", noteZh: "最终签名人。", noteEn: "Final signer." }
    ],
  },
  {
    id: "wallet_rwa_escrow_base",
    type: "escrow",
    nameZh: "RWA 融资托管钱包",
    nameEn: "RWA financing escrow wallet",
    network: "Base",
    address: "0xF13a...91D2",
    custodyZh: "托管/多签：资金方、企业、平台见证方共同控制。",
    custodyEn: "Escrow/multisig: financier, business, and platform witness jointly control it.",
    policyZh: "仅用于融资放款、还款、保证金和链上审计记录。",
    policyEn: "Only for financing disbursement, repayment, margin, and on-chain audit records.",
    balances: [
      { asset: "USDC", amount: "0", usdValue: "USD 0" },
      { asset: "ETH", amount: "0.015", usdValue: "USD 45" }
    ],
    permissions: [
      { roleZh: "资金方", roleEn: "Financier", permission: "approve", noteZh: "可审批放款或冻结。", noteEn: "Can approve disbursement or freeze." },
      { roleZh: "企业", roleEn: "Business", permission: "approve", noteZh: "可确认收款和还款。", noteEn: "Can confirm receipt and repayment." },
      { roleZh: "ChainTrace", roleEn: "ChainTrace", permission: "view", noteZh: "只读审计，不代签。", noteEn: "Read-only audit; no signing." }
    ],
  }
];

export const walletTransactions: WalletTransaction[] = [
  {
    id: "tx_opening_usdc",
    walletId: "wallet_ops_usdc_polygon",
    titleZh: "期初 USDC 余额",
    titleEn: "Opening USDC balance",
    asset: "USDC",
    amount: "8,200",
    usdValue: "USD 8,200",
    direction: "in",
    status: "confirmed",
    counterpartyZh: "企业自有资金",
    counterpartyEn: "Business treasury",
    txHash: "0x91c4...7ab2",
    relatedTradeId: "trade_vn_coffee_sg_2026_0007",
    noteZh: "用于展示业务钱包可用余额，不代表投资资金池。",
    noteEn: "Shows available business wallet balance; not an investment pool.",
  },
  {
    id: "tx_anchor_invoice_pack",
    walletId: "wallet_ops_usdc_polygon",
    titleZh: "发票与质检包 hash 锚定",
    titleEn: "Invoice and quality pack hash anchor",
    asset: "MATIC",
    amount: "0.3",
    usdValue: "USD 0.22",
    direction: "anchor",
    status: "confirmed",
    counterpartyZh: "Polygon proof anchor",
    counterpartyEn: "Polygon proof anchor",
    txHash: "0x7ff0...2dc9",
    relatedTradeId: "trade_vn_coffee_sg_2026_0007",
    relatedDocumentId: "doc_invoice",
    noteZh: "只锚定 hash，不公开原始发票。",
    noteEn: "Only anchors the hash; the raw invoice is not disclosed.",
  },
  {
    id: "tx_rwa_disbursement_draft",
    walletId: "wallet_rwa_escrow_base",
    titleZh: "应收账款融资放款草稿",
    titleEn: "Receivable financing disbursement draft",
    asset: "USDC",
    amount: "29,500",
    usdValue: "USD 29,500",
    direction: "in",
    status: "blocked",
    counterpartyZh: "Harbor Receivables Finance",
    counterpartyEn: "Harbor Receivables Finance",
    relatedTradeId: "trade_vn_coffee_sg_2026_0007",
    relatedDocumentId: "doc_acceptance",
    noteZh: "入库确认和买家验收未补齐，不能发起真实放款。",
    noteEn: "Warehouse entry and buyer acceptance are missing, so real disbursement cannot start.",
  }
];
