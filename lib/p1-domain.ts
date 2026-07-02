export type Role =
  | "EXPORTER"
  | "BUYER"
  | "LOGISTICS"
  | "INSPECTOR"
  | "BANK"
  | "OPERATOR"
  | "AUDITOR";

export type Currency = "USDC" | "USD" | "SGD" | "EUR";

export type CaseStateValue =
  | "DRAFT_INTENT"
  | "EVIDENCE_PACKAGED"
  | "MULTI_PARTY_PROOFS_READY"
  | "REVIEW_ASSISTANT"
  | "FUNDING_EXECUTION_BLOCKED";

export type DocumentType =
  | "PO"
  | "INVOICE"
  | "PACKING_LIST"
  | "BILL_OF_LADING"
  | "INSPECTION_REPORT"
  | "OTHER";

export type ProofStatus = "PENDING" | "PASSED" | "CONDITIONAL" | "BLOCKED";

export type GateType =
  | "IDENTITY_GATE"
  | "TRADE_EVIDENCE_GATE"
  | "BUYER_OBLIGATION_GATE"
  | "GOODS_CHAIN_GATE"
  | "BANK_REVIEW_GATE"
  | "FUNDING_EXECUTION_GATE";

export interface User {
  id: string;
  email: string;
  walletAddress: string;
  role: Role;
  roleLocked: boolean;
  createdAt: string;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  role: Role;
  legalName: string;
  country: string;
  businessType: string;
  kybStatus: "MOCK_PENDING" | "MOCK_READY";
  createdAt: string;
}

export interface FinancingCase {
  id: string;
  caseNo: string;
  exporterId: string;
  buyerName: string;
  buyerId?: string;
  amount: number;
  currency: Currency;
  description: string;
  status: CaseStateValue;
  currentState: CaseStateValue;
  disbursementAllowed: false;
  createdAt: string;
  updatedAt: string;
}

export interface TradeDocument {
  id: string;
  caseId: string;
  type: DocumentType;
  fileName: string;
  fileUrl?: string;
  textSummary: string;
  hash: string;
  uploadedBy: string;
  createdAt: string;
}

export interface ProofNode {
  id: string;
  caseId: string;
  proofType: "TRADE_DOCUMENT" | "BUYER_ACK" | "PHYSICAL_FACT" | "BANK_REVIEW";
  ownerRole: Role;
  ownerUserId: string;
  sourceDocumentId?: string;
  hash: string;
  status: ProofStatus;
  summary: string;
  dependsOnProofIds: string[];
  createdAt: string;
}

export interface Gate {
  id: string;
  caseId: string;
  gateType: GateType;
  status: ProofStatus;
  reason: string;
  requiredAction: string;
  updatedAt: string;
}

export interface CaseState {
  id: string;
  caseId: string;
  state: CaseStateValue;
  explanation: string;
  canContinueReview: boolean;
  canExecuteFunding: false;
  disbursementAllowed: false;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  caseId: string;
  actorUserId: string;
  actorRole: Role;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  createdAt: string;
}

export interface BankReview {
  id: string;
  caseId: string;
  reviewerId: string;
  decision: "ALLOW_REVIEW" | "REQUEST_MORE_EVIDENCE" | "REDUCE_CAP" | "REJECT";
  suggestedCap?: number;
  reason: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  caseId: string;
  type: string;
  status: "OPEN" | "PAUSED" | "RESOLVED";
  summary: string;
  createdBy: string;
  createdAt: string;
}

export interface P1Store {
  users: User[];
  companyProfiles: CompanyProfile[];
  cases: FinancingCase[];
  tradeDocuments: TradeDocument[];
  proofNodes: ProofNode[];
  gates: Gate[];
  caseStates: CaseState[];
  auditLogs: AuditLog[];
  bankReviews: BankReview[];
  disputes: Dispute[];
}

export interface RegisterMockUserInput {
  email: string;
  walletAddress: string;
  role: Role;
}

export interface CreateExporterCaseInput {
  buyerName: string;
  amount: number;
  currency: Currency;
  description: string;
}

export interface AddTradeDocumentInput {
  type: DocumentType;
  fileName: string;
  textSummary: string;
  fileUrl?: string;
}

export const P1_ROLES: Role[] = [
  "EXPORTER",
  "BUYER",
  "LOGISTICS",
  "INSPECTOR",
  "BANK",
  "OPERATOR",
  "AUDITOR"
];

export const CASE_STATES: CaseStateValue[] = [
  "DRAFT_INTENT",
  "EVIDENCE_PACKAGED",
  "MULTI_PARTY_PROOFS_READY",
  "REVIEW_ASSISTANT",
  "FUNDING_EXECUTION_BLOCKED"
];

export function seedP1Store(): P1Store {
  return {
    users: [],
    companyProfiles: [],
    cases: [],
    tradeDocuments: [],
    proofNodes: [],
    gates: [],
    caseStates: [],
    auditLogs: [],
    bankReviews: [],
    disputes: []
  };
}

export function registerMockUser(store: P1Store, input: RegisterMockUserInput): User {
  const walletAddress = normalizeWallet(input.walletAddress);
  const existing = store.users.find((user) => normalizeWallet(user.walletAddress) === walletAddress);

  if (existing) {
    if (existing.roleLocked && existing.role !== input.role) {
      throw new Error("WALLET_ROLE_LOCKED");
    }
    return existing;
  }

  const now = timestamp();
  const user: User = {
    id: makeId("usr", store.users.length + 1),
    email: input.email.trim().toLowerCase(),
    walletAddress: input.walletAddress.trim(),
    role: input.role,
    roleLocked: true,
    createdAt: now
  };

  store.users.push(user);
  store.companyProfiles.push({
    id: makeId("cmp", store.companyProfiles.length + 1),
    userId: user.id,
    role: user.role,
    legalName: `${roleLabel(user.role)} Demo Company`,
    country: "SG",
    businessType: "P1 mock workspace",
    kybStatus: "MOCK_PENDING",
    createdAt: now
  });

  return user;
}

export function createExporterCase(
  store: P1Store,
  exporterId: string,
  input: CreateExporterCaseInput
): FinancingCase {
  const exporter = getUser(store, exporterId);
  if (exporter.role !== "EXPORTER") {
    throw new Error("ROLE_NOT_ALLOWED");
  }
  if (!input.buyerName.trim() || input.amount <= 0 || !input.description.trim()) {
    throw new Error("INVALID_CASE_INPUT");
  }

  const now = timestamp();
  const sequence = store.cases.length + 1;
  const financingCase: FinancingCase = {
    id: makeId("case", sequence),
    caseNo: `CT-P1-${String(sequence).padStart(4, "0")}`,
    exporterId,
    buyerName: input.buyerName.trim(),
    amount: input.amount,
    currency: input.currency,
    description: input.description.trim(),
    status: "DRAFT_INTENT",
    currentState: "DRAFT_INTENT",
    disbursementAllowed: false,
    createdAt: now,
    updatedAt: now
  };

  store.cases.push(financingCase);
  writeAudit(store, {
    caseId: financingCase.id,
    actorUserId: exporter.id,
    actorRole: exporter.role,
    action: "CASE_CREATED",
    targetType: "CASE",
    targetId: financingCase.id,
    summary: `Exporter created financing candidate ${financingCase.caseNo}.`
  });
  upsertCaseState(store, buildCaseState(store, financingCase.id));

  return financingCase;
}

export async function addTradeDocument(
  store: P1Store,
  actorUserId: string,
  caseId: string,
  input: AddTradeDocumentInput
): Promise<TradeDocument> {
  const actor = getUser(store, actorUserId);
  const financingCase = getCase(store, caseId);
  if (actor.role !== "EXPORTER" || financingCase.exporterId !== actor.id) {
    throw new Error("ROLE_NOT_ALLOWED");
  }
  if (!input.fileName.trim() || !input.textSummary.trim()) {
    throw new Error("INVALID_DOCUMENT_INPUT");
  }

  const now = timestamp();
  const documentId = makeId("doc", store.tradeDocuments.length + 1);
  const hash = await sha256Hex(
    [caseId, input.type, input.fileName.trim(), input.textSummary.trim(), actor.id].join("|")
  );
  const tradeDocument: TradeDocument = {
    id: documentId,
    caseId,
    type: input.type,
    fileName: input.fileName.trim(),
    fileUrl: input.fileUrl,
    textSummary: input.textSummary.trim(),
    hash,
    uploadedBy: actor.id,
    createdAt: now
  };

  store.tradeDocuments.push(tradeDocument);
  writeAudit(store, {
    caseId,
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "DOCUMENT_ADDED",
    targetType: "TRADE_DOCUMENT",
    targetId: tradeDocument.id,
    summary: `${input.type} metadata added and hashed locally.`
  });

  const proofNode: ProofNode = {
    id: makeId("proof", store.proofNodes.length + 1),
    caseId,
    proofType: "TRADE_DOCUMENT",
    ownerRole: actor.role,
    ownerUserId: actor.id,
    sourceDocumentId: tradeDocument.id,
    hash,
    status: "PASSED",
    summary: tradeDocument.textSummary,
    dependsOnProofIds: [],
    createdAt: now
  };
  store.proofNodes.push(proofNode);
  writeAudit(store, {
    caseId,
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "PROOF_NODE_CREATED",
    targetType: "PROOF_NODE",
    targetId: proofNode.id,
    summary: "Local proof node created from trade document hash."
  });

  const state = buildCaseState(store, caseId);
  financingCase.currentState = state.state;
  financingCase.status = state.state;
  financingCase.updatedAt = now;
  upsertCaseState(store, state);

  return tradeDocument;
}

export function buildProofGraph(store: P1Store, caseId: string) {
  getCase(store, caseId);
  const documents = store.tradeDocuments.filter((document) => document.caseId === caseId);
  const nodes = store.proofNodes.filter((node) => node.caseId === caseId);
  const aggregate = nodes
    .map((node) => node.hash)
    .sort()
    .join("|");

  return {
    caseId,
    documents,
    nodes,
    evidenceRoot: aggregate ? syncSha256Label(aggregate) : "sha256:pending"
  };
}

export function buildGateChecklist(store: P1Store, caseId: string): Gate[] {
  const financingCase = getCase(store, caseId);
  const documents = store.tradeDocuments.filter((document) => document.caseId === caseId);
  const proofNodes = store.proofNodes.filter((node) => node.caseId === caseId);
  const buyerProofReady = proofNodes.some((node) => node.proofType === "BUYER_ACK");
  const physicalProofReady = proofNodes.some((node) => node.proofType === "PHYSICAL_FACT");
  const bankReviewReady = store.bankReviews.some((review) => review.caseId === caseId);
  const now = timestamp();

  return [
    gate(caseId, "IDENTITY_GATE", "PASSED", "Exporter wallet has a locked P1 role.", "No action.", now),
    gate(
      caseId,
      "TRADE_EVIDENCE_GATE",
      documents.length > 0 ? "PASSED" : "BLOCKED",
      documents.length > 0 ? "Exporter evidence package has local hashes." : "Exporter must add PO, invoice, or trade note metadata.",
      documents.length > 0 ? "Continue review." : "Add at least one trade document.",
      now
    ),
    gate(
      caseId,
      "BUYER_OBLIGATION_GATE",
      buyerProofReady ? "PASSED" : "BLOCKED",
      buyerProofReady ? "Buyer obligation proof is present." : `Buyer ${financingCase.buyerName} has not confirmed the obligation yet.`,
      buyerProofReady ? "Continue review." : "Invite buyer proof in the next P1 stage.",
      now
    ),
    gate(
      caseId,
      "GOODS_CHAIN_GATE",
      physicalProofReady ? "PASSED" : "BLOCKED",
      physicalProofReady ? "Physical fact proof is present." : "No logistics or inspection proof has been submitted.",
      physicalProofReady ? "Continue review." : "Collect logistics or inspection proof.",
      now
    ),
    gate(
      caseId,
      "BANK_REVIEW_GATE",
      bankReviewReady ? "CONDITIONAL" : "BLOCKED",
      bankReviewReady ? "Bank review exists but remains pre-funding." : "Bank has not entered a review decision.",
      bankReviewReady ? "Keep funding blocked." : "Bank reviewer must review the case.",
      now
    ),
    gate(
      caseId,
      "FUNDING_EXECUTION_GATE",
      "BLOCKED",
      "P1 is review-assistant only. No chain write, wallet signature, or funds movement is enabled.",
      "Keep disbursementAllowed=false.",
      now
    )
  ];
}

export function buildCaseState(store: P1Store, caseId: string): CaseState {
  const gates = buildGateChecklist(store, caseId);
  const tradeReady = gatePassed(gates, "TRADE_EVIDENCE_GATE");
  const buyerReady = gatePassed(gates, "BUYER_OBLIGATION_GATE");
  const goodsReady = gatePassed(gates, "GOODS_CHAIN_GATE");
  const bankStarted = store.bankReviews.some((review) => review.caseId === caseId);
  let state: CaseStateValue = "DRAFT_INTENT";
  let explanation = "Exporter has created a financing candidate. Trade evidence is still missing.";
  let canContinueReview = false;

  if (tradeReady) {
    state = "EVIDENCE_PACKAGED";
    explanation = "Exporter evidence is packaged with local hashes. Buyer, logistics or inspector, and bank proofs are still blocking funding execution.";
    canContinueReview = true;
  }
  if (tradeReady && buyerReady && goodsReady) {
    state = "MULTI_PARTY_PROOFS_READY";
    explanation = "Multi-party proofs are ready for bank review. Funding execution is still disabled in P1.";
    canContinueReview = true;
  }
  if (tradeReady && buyerReady && goodsReady && bankStarted) {
    state = "REVIEW_ASSISTANT";
    explanation = "Bank review exists. ChainTrace can explain the review state but cannot execute funding.";
    canContinueReview = true;
  }

  return {
    id: `state-${caseId}`,
    caseId,
    state,
    explanation,
    canContinueReview,
    canExecuteFunding: false,
    disbursementAllowed: false,
    updatedAt: timestamp()
  };
}

export function formatMoney(amount: number, currency: Currency): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)} ${currency}`;
}

export function roleLabel(role: Role): string {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function upsertCaseState(store: P1Store, state: CaseState): void {
  const existingIndex = store.caseStates.findIndex((item) => item.caseId === state.caseId);
  if (existingIndex >= 0) {
    store.caseStates[existingIndex] = state;
    return;
  }
  store.caseStates.push(state);
}

function gatePassed(gates: Gate[], type: GateType): boolean {
  return gates.find((gateItem) => gateItem.gateType === type)?.status === "PASSED";
}

function gate(
  caseId: string,
  gateType: GateType,
  status: ProofStatus,
  reason: string,
  requiredAction: string,
  updatedAt: string
): Gate {
  return {
    id: `${caseId}-${gateType.toLowerCase()}`,
    caseId,
    gateType,
    status,
    reason,
    requiredAction,
    updatedAt
  };
}

function writeAudit(
  store: P1Store,
  input: Omit<AuditLog, "id" | "createdAt">
): AuditLog {
  const entry: AuditLog = {
    id: makeId("audit", store.auditLogs.length + 1),
    createdAt: timestamp(),
    ...input
  };
  store.auditLogs.push(entry);
  return entry;
}

function getUser(store: P1Store, userId: string): User {
  const user = store.users.find((item) => item.id === userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  return user;
}

function getCase(store: P1Store, caseId: string): FinancingCase {
  const financingCase = store.cases.find((item) => item.id === caseId);
  if (!financingCase) {
    throw new Error("CASE_NOT_FOUND");
  }
  return financingCase;
}

function normalizeWallet(walletAddress: string): string {
  return walletAddress.trim().toLowerCase();
}

function makeId(prefix: string, sequence: number): string {
  return `${prefix}_${String(sequence).padStart(4, "0")}`;
}

function timestamp(): string {
  return new Date().toISOString();
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return `sha256:${Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

function syncSha256Label(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return `sha256:${Math.abs(hash).toString(16).padStart(8, "0")}`;
}
