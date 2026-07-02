"use client";

import {
  buildAuditLogFromContractEvents,
  buildCaseStateFromContractEvents,
  buildProofGraphFromContractEvents,
  evaluateP1ContractGates
} from "@/lib/contracts/contract-event-projections";
import { buildDocumentProofPayload } from "@/lib/contracts/proof-payload";
import {
  ChainTraceContractEvent,
  ContractDocumentKind,
  ContractRole,
  Hex32
} from "@/lib/contracts/types";
import { Currency, Role, roleLabel } from "@/lib/p1-domain";

const REGISTRY_CACHE_KEY = "chaintrace:p1-contract-registry-cache";
const CURRENT_WALLET_KEY = "chaintrace:p1-current-wallet";
const DRAFT_CACHE_KEY = "chaintrace:p1-draft-cache";

export interface ContractBackedUser {
  id: string;
  walletAddress: string;
  email: string;
  role: Role;
  roleLocked: true;
}

export interface ContractBackedCase {
  id: Hex32;
  caseNo: string;
  creator: string;
  buyerName: string;
  amount: number;
  currency: Currency;
  description: string;
  caseCommitment: Hex32;
}

export interface ContractBackedDocumentDisplay {
  id: string;
  caseId: Hex32;
  kind: ContractDocumentKind;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentHash: Hex32;
  metadataHash: Hex32;
}

export interface P1ContractRegistryCache {
  roles: Record<string, ContractRole>;
  users: Record<string, ContractBackedUser>;
  cases: ContractBackedCase[];
  documents: ContractBackedDocumentDisplay[];
  events: ChainTraceContractEvent[];
}

export interface RegisterMockUserInput {
  email: string;
  walletAddress: string;
  role: Role;
}

export interface CreateContractCaseInput {
  buyerName: string;
  amount: number;
  currency: Currency;
  description: string;
}

export interface AddContractDocumentProofInput {
  kind: ContractDocumentKind;
  fileName: string;
  fileType: string;
  fileSize: number;
  textSummary: string;
}

export function loadP1RegistryCache(): P1ContractRegistryCache {
  if (typeof window === "undefined") {
    return emptyRegistryCache();
  }
  const raw = window.localStorage.getItem(REGISTRY_CACHE_KEY);
  if (!raw) {
    const cache = emptyRegistryCache();
    saveP1RegistryCache(cache);
    return cache;
  }
  try {
    return { ...emptyRegistryCache(), ...JSON.parse(raw) } as P1ContractRegistryCache;
  } catch {
    const cache = emptyRegistryCache();
    saveP1RegistryCache(cache);
    return cache;
  }
}

export function saveP1RegistryCache(cache: P1ContractRegistryCache): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(REGISTRY_CACHE_KEY, JSON.stringify(cache));
}

export function signInExistingWallet(walletAddress: string): string | null {
  const cache = loadP1RegistryCache();
  const wallet = normalizeWallet(walletAddress);
  if (!cache.roles[wallet]) {
    return null;
  }
  setCurrentWallet(wallet);
  return wallet;
}

export function registerAndSignIn(input: RegisterMockUserInput): string {
  const cache = loadP1RegistryCache();
  const wallet = normalizeWallet(input.walletAddress);
  const existingRole = cache.roles[wallet];
  if (existingRole && existingRole !== input.role) {
    throw new Error("WALLET_ROLE_LOCKED");
  }

  if (!existingRole) {
    cache.roles[wallet] = input.role;
    cache.users[wallet] = {
      id: wallet,
      walletAddress: input.walletAddress.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      roleLocked: true
    };
    cache.events.push({
      type: "RoleRegistered",
      blockNumber: nextBlock(cache),
      transactionHash: mockTx("role", wallet),
      wallet,
      role: input.role
    });
    saveP1RegistryCache(cache);
  }

  setCurrentWallet(wallet);
  return wallet;
}

export function getCurrentWallet(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(CURRENT_WALLET_KEY);
}

export function setCurrentWallet(walletAddress: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(CURRENT_WALLET_KEY, normalizeWallet(walletAddress));
}

export function clearCurrentWallet(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(CURRENT_WALLET_KEY);
}

export function getCurrentUser(cache: P1ContractRegistryCache): ContractBackedUser | null {
  const wallet = getCurrentWallet();
  if (!wallet) {
    return null;
  }
  return cache.users[wallet] ?? null;
}

export function routeForRole(role: Role): string {
  switch (role) {
    case "EXPORTER":
      return "/exporter/dashboard";
    case "BUYER":
    case "LOGISTICS":
    case "INSPECTOR":
    case "BANK":
    case "OPERATOR":
    case "AUDITOR":
      return "/dashboard";
  }
}

export async function createContractBackedCase(
  cache: P1ContractRegistryCache,
  walletAddress: string,
  input: CreateContractCaseInput
): Promise<ContractBackedCase> {
  const wallet = normalizeWallet(walletAddress);
  if (cache.roles[wallet] !== "EXPORTER") {
    throw new Error("EXPORTER_ROLE_REQUIRED");
  }

  const caseCommitment = await hashText(
    JSON.stringify({
      buyerName: input.buyerName,
      amount: input.amount,
      currency: input.currency,
      description: input.description
    })
  );
  const caseId = await hashText(`${wallet}:${caseCommitment}:${cache.cases.length + 1}`);
  const financingCase: ContractBackedCase = {
    id: caseId,
    caseNo: `CT-P1C-${String(cache.cases.length + 1).padStart(4, "0")}`,
    creator: wallet,
    buyerName: input.buyerName.trim(),
    amount: input.amount,
    currency: input.currency,
    description: input.description.trim(),
    caseCommitment
  };

  cache.cases.push(financingCase);
  cache.events.push({
    type: "CaseCreated",
    blockNumber: nextBlock(cache),
    transactionHash: mockTx("case", caseId),
    caseId,
    creator: wallet,
    caseCommitment
  });
  saveP1RegistryCache(cache);
  return financingCase;
}

export async function addContractDocumentProof(
  cache: P1ContractRegistryCache,
  walletAddress: string,
  caseId: Hex32,
  input: AddContractDocumentProofInput
): Promise<ContractBackedDocumentDisplay> {
  const wallet = normalizeWallet(walletAddress);
  if (!cache.roles[wallet]) {
    throw new Error("ROLE_REQUIRED");
  }
  const financingCase = cache.cases.find((item) => item.id === caseId);
  if (!financingCase) {
    throw new Error("CASE_NOT_FOUND");
  }

  const rawBytes = new TextEncoder().encode(input.textSummary);
  const payload = await buildDocumentProofPayload({
    rawBytes,
    metadata: {
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      documentKind: input.kind
    }
  });
  const display: ContractBackedDocumentDisplay = {
    id: `${caseId}:${payload.documentHash}`,
    caseId,
    kind: input.kind,
    fileName: input.fileName,
    fileType: input.fileType,
    fileSize: input.fileSize,
    documentHash: payload.documentHash,
    metadataHash: payload.metadataHash
  };

  cache.documents.push(display);
  cache.events.push({
    type: "DocumentProofAdded",
    blockNumber: nextBlock(cache),
    transactionHash: mockTx("document", payload.documentHash),
    caseId,
    documentHash: payload.documentHash,
    metadataHash: payload.metadataHash,
    kind: input.kind
  });
  cache.events.push({
    type: "CaseStateTransitioned",
    blockNumber: nextBlock(cache),
    transactionHash: mockTx("state", caseId),
    caseId,
    fromState: "DRAFT_INTENT",
    toState: "PROOF_COLLECTED"
  });
  saveP1RegistryCache(cache);
  return display;
}

export function getVisibleCases(cache: P1ContractRegistryCache, user: ContractBackedUser): ContractBackedCase[] {
  if (user.role === "EXPORTER") {
    return cache.cases.filter((item) => normalizeWallet(item.creator) === normalizeWallet(user.walletAddress));
  }
  if (user.role === "AUDITOR" || user.role === "OPERATOR" || user.role === "BANK") {
    return cache.cases;
  }
  return [];
}

export function getContractCaseDetail(cache: P1ContractRegistryCache, caseId: string) {
  const normalizedCaseId = caseId as Hex32;
  const financingCase = cache.cases.find((item) => item.id === normalizedCaseId);
  if (!financingCase) {
    return null;
  }
  const events = cache.events.filter((event) => !("caseId" in event) || event.caseId === normalizedCaseId);
  return {
    financingCase,
    documents: cache.documents.filter((item) => item.caseId === normalizedCaseId),
    graph: buildProofGraphFromContractEvents(normalizedCaseId, events),
    gates: evaluateP1ContractGates(normalizedCaseId, events),
    state: buildCaseStateFromContractEvents(normalizedCaseId, events),
    auditLog: buildAuditLogFromContractEvents(normalizedCaseId, events)
  };
}

export function saveDraftCache(key: string, value: unknown): void {
  if (typeof window === "undefined") {
    return;
  }
  const raw = window.localStorage.getItem(DRAFT_CACHE_KEY);
  const drafts = raw ? JSON.parse(raw) as Record<string, unknown> : {};
  drafts[key] = value;
  window.localStorage.setItem(DRAFT_CACHE_KEY, JSON.stringify(drafts));
}

export function roleDisplay(role: Role): string {
  return roleLabel(role);
}

function emptyRegistryCache(): P1ContractRegistryCache {
  return {
    roles: {},
    users: {},
    cases: [],
    documents: [],
    events: []
  };
}

function normalizeWallet(walletAddress: string): string {
  return walletAddress.trim().toLowerCase();
}

function nextBlock(cache: P1ContractRegistryCache): bigint {
  return BigInt(cache.events.length + 1);
}

function mockTx(kind: string, seed: string): string {
  return `0xmock_${kind}_${seed.replace(/^0x/, "").slice(0, 18)}`;
}

async function hashText(input: string): Promise<Hex32> {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return `0x${Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}
