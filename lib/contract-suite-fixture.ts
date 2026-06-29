export type ContractLayerStatus = "implemented" | "tested" | "dev-deployed" | "testnet-pending";

export type ContractLayer = {
  id: string;
  nameZh: string;
  nameEn: string;
  filePath: string;
  status: ContractLayerStatus;
  roleZh: string;
  roleEn: string;
  unlocksZh: string;
  unlocksEn: string;
};

export type DeploymentMode = {
  id: string;
  nameZh: string;
  nameEn: string;
  command: string;
  requiresZh: string;
  requiresEn: string;
  output: string;
  noteZh: string;
  noteEn: string;
};

export const contractLayers: ContractLayer[] = [
  {
    id: "loan_request_registry",
    nameZh: "融资申请入口 Registry",
    nameEn: "Loan request registry",
    filePath: "contracts/LoanRequestRegistry.sol",
    status: "implemented",
    roleZh: "记录小企业应收账款融资申请、证据包 URI/hash、Readiness Score、阻断码和专业审查状态。",
    roleEn: "Records SME receivable-financing requests, evidence-pack URI/hash, Readiness Score, blocker code, and professional-review status.",
    unlocksZh: "把上传文件后的融资意图先固化为链上请求；只有审查批准后才转换成具体 ReceivableLoan。",
    unlocksEn: "Turns the post-upload financing intent into an on-chain request; it converts to a concrete ReceivableLoan only after review approval.",
  },
  {
    id: "trade_signing_registry",
    nameZh: "四流签章 Registry",
    nameEn: "Four-flow signing registry",
    filePath: "contracts/TradeSigningRegistry.sol",
    status: "tested",
    roleZh: "记录 PO、发票、质检、提单、入库、验收、多签等签章 gate。",
    roleEn: "Records signing gates for PO, invoice, quality, bill of lading, warehouse entry, acceptance, and multisig.",
    unlocksZh: "gate 全部 signed 后，贷款合约才可进入放款准备。",
    unlocksEn: "After all gates are signed, the loan contract can move toward disbursement readiness.",
  },
  {
    id: "bank_vault",
    nameZh: "银行资金池 BankVault",
    nameEn: "Bank vault",
    filePath: "contracts/BankVault.sol",
    status: "tested",
    roleZh: "作为银行合约管理稳定币流动性、授信、贷款合约白名单、放款、还款和损失准备。",
    roleEn: "Acts as the bank-like contract for stablecoin liquidity, credit lines, approved loan contracts, disbursement, repayment, and loss reserve events.",
    unlocksZh: "只有白名单贷款合约能调用放款和还款记录。",
    unlocksEn: "Only approved loan contracts can call loan disbursement and repayment recording.",
  },
  {
    id: "receivable_loan",
    nameZh: "应收账款贷款合约",
    nameEn: "Receivable loan contract",
    filePath: "contracts/ReceivableLoan.sol",
    status: "tested",
    roleZh: "读取签章 Registry，控制 USDC 放款、还款、逾期、取消和结清。",
    roleEn: "Reads the signing registry and controls USDC disbursement, repayment, overdue/default, cancellation, and closure.",
    unlocksZh: "签章 gate 全部通过后，调用 BankVault 向借款方放款。",
    unlocksEn: "After all signing gates pass, it calls BankVault to disburse to the borrower.",
  },
  {
    id: "restricted_token",
    nameZh: "受限 RWA Token",
    nameEn: "Restricted RWA token",
    filePath: "contracts/RestrictedReceivableToken.sol",
    status: "tested",
    roleZh: "表示应收账款受益权或融资凭证，白名单转让、冻结、赎回、到期销毁。",
    roleEn: "Represents receivable rights or financing certificates with whitelist transfer, freeze, redemption, and maturity burn controls.",
    unlocksZh: "只能在许可司法区、KYC、白名单和链下法律文件齐备后发行。",
    unlocksEn: "Issued only with permitted jurisdiction, KYC, whitelist controls, and off-chain legal wrapper.",
  },
];

export const deploymentModes: DeploymentMode[] = [
  {
    id: "compile",
    nameZh: "自动编译",
    nameEn: "Automatic compile",
    command: "npm run contracts:compile",
    requiresZh: "不需要私钥，不需要 RPC。",
    requiresEn: "No private key and no RPC required.",
    output: "artifacts/ cache/",
    noteZh: "每次 push / PR 自动执行。",
    noteEn: "Runs on every push / PR.",
  },
  {
    id: "test",
    nameZh: "合约测试",
    nameEn: "Contract tests",
    command: "npm run contracts:test",
    requiresZh: "不需要私钥，不需要 RPC，不需要测试币。",
    requiresEn: "No private key, no RPC, and no testnet ETH required.",
    output: "Hardhat in-memory test run",
    noteZh: "验证签章 gate、贷款放款、还款、RWA token 白名单转让。",
    noteEn: "Validates signing gates, loan disbursement, repayment, and RWA token whitelist transfer.",
  },
  {
    id: "dev_deploy",
    nameZh: "Dev 链部署",
    nameEn: "Dev-chain deploy",
    command: "npm run contracts:deploy:dev",
    requiresZh: "Hardhat 临时链自动给测试账户资金。",
    requiresEn: "Hardhat ephemeral chain automatically funds test accounts.",
    output: "deployments/hardhat-dev.json",
    noteZh: "地址不持久，只用于 CI 验证。",
    noteEn: "Addresses are not persistent and are used only for CI validation.",
  },
  {
    id: "base_sepolia",
    nameZh: "Base Sepolia 部署",
    nameEn: "Base Sepolia deploy",
    command: "npm run contracts:deploy:base-sepolia",
    requiresZh: "需要 BASE_SEPOLIA_RPC_URL、DEPLOYER_PRIVATE_KEY 和 Base Sepolia ETH。",
    requiresEn: "Requires BASE_SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY, and Base Sepolia ETH.",
    output: "deployments/base-sepolia.json",
    noteZh: "手动触发，不建议自动主网部署。",
    noteEn: "Manual trigger only; do not auto-deploy mainnet.",
  },
];
