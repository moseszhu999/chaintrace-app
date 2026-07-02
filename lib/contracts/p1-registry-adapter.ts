"use client";

import {
  addContractDocumentProof,
  AddContractDocumentProofInput,
  ContractBackedCase,
  ContractBackedDocumentDisplay,
  createContractBackedCase,
  CreateContractCaseInput,
  getContractCaseDetail,
  getCurrentUser,
  getVisibleCases,
  loadP1RegistryCache,
  registerAndSignIn,
  RegisterMockUserInput,
  signInExistingWallet
} from "@/lib/p1-client-store";
import { waitForTransactionReceipt, writeContract, getContractEvents } from "@/lib/contracts/chainTraceP1Registry";
import { DOCUMENT_KIND_TO_CONTRACT_VALUE, ROLE_TO_CONTRACT_VALUE } from "@/lib/contracts/p1-contract-values";
import { buildCaseSummariesFromEvents, buildOnChainCaseReadModel } from "@/lib/contracts/p1-event-read-model";
import { getChainTraceMode, getConfiguredRegistryAddress, isLocalChainConfigured } from "@/lib/contracts/p1-local-chain-mode";
import { buildDocumentProofPayload } from "@/lib/contracts/proof-payload";
import { Hex32 } from "@/lib/contracts/types";
import { Currency, Role } from "@/lib/p1-domain";

export type ContractCaseDetail = ReturnType<typeof getContractCaseDetail>;

export interface P1RegistryAdapter {
  mode: "mock" | "local-chain";
  connectWallet(walletAddress?: string): Promise<string>;
  getCurrentWallet(): Promise<string | null>;
  getRole(walletAddress: string): Promise<Role | null>;
  registerRole(input: RegisterMockUserInput): Promise<string>;
  createCase(walletAddress: string, input: CreateContractCaseInput): Promise<ContractBackedCase>;
  addDocumentProof(
    walletAddress: string,
    caseId: Hex32,
    input: AddContractDocumentProofInput
  ): Promise<ContractBackedDocumentDisplay>;
  getVisibleCases(walletAddress: string, role: Role): Promise<ContractBackedCase[]>;
  getCaseDetail(caseId: string): Promise<ContractCaseDetail>;
}

export function getP1RegistryAdapter(): P1RegistryAdapter {
  return getChainTraceMode() === "local-chain" ? createLocalChainAdapter() : createMockRegistryAdapter();
}

export function createMockRegistryAdapter(): P1RegistryAdapter {
  return {
    mode: "mock",
    async connectWallet(walletAddress = "0xEXporter001") {
      const existing = signInExistingWallet(walletAddress);
      return existing ?? walletAddress;
    },
    async getCurrentWallet() {
      return getCurrentUser(loadP1RegistryCache())?.walletAddress ?? null;
    },
    async getRole(walletAddress: string) {
      return loadP1RegistryCache().roles[walletAddress.trim().toLowerCase()] ?? null;
    },
    async registerRole(input) {
      return registerAndSignIn(input);
    },
    async createCase(walletAddress, input) {
      return createContractBackedCase(loadP1RegistryCache(), walletAddress, input);
    },
    async addDocumentProof(walletAddress, caseId, input) {
      return addContractDocumentProof(loadP1RegistryCache(), walletAddress, caseId, input);
    },
    async getVisibleCases(_walletAddress, _role) {
      const cache = loadP1RegistryCache();
      const user = getCurrentUser(cache);
      return user ? getVisibleCases(cache, user) : [];
    },
    async getCaseDetail(caseId) {
      return getContractCaseDetail(loadP1RegistryCache(), caseId);
    }
  };
}

export function createLocalChainAdapter(): P1RegistryAdapter {
  const displayCache = createMockRegistryAdapter();

  return {
    mode: "local-chain",
    async connectWallet(walletAddress = "0xEXporter001") {
      assertLocalChainConfigured();
      return displayCache.connectWallet(walletAddress);
    },
    async getCurrentWallet() {
      assertLocalChainConfigured();
      return displayCache.getCurrentWallet();
    },
    async getRole(walletAddress) {
      assertLocalChainConfigured();
      return displayCache.getRole(walletAddress);
    },
    async registerRole(input) {
      assertLocalChainConfigured();
      const hash = await writeContract("registerRole", [ROLE_TO_CONTRACT_VALUE[input.role]]);
      await waitForTransactionReceipt(hash);
      return displayCache.registerRole(input);
    },
    async createCase(walletAddress, input) {
      assertLocalChainConfigured();
      const financingCase = await displayCache.createCase(walletAddress, input);
      const hash = await writeContract("createCase", [financingCase.caseCommitment]);
      await waitForTransactionReceipt(hash);
      return financingCase;
    },
    async addDocumentProof(walletAddress, caseId, input) {
      assertLocalChainConfigured();
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
      const hash = await writeContract("addDocumentProof", [
        caseId,
        payload.documentHash,
        payload.metadataHash,
        DOCUMENT_KIND_TO_CONTRACT_VALUE[input.kind]
      ]);
      await waitForTransactionReceipt(hash);
      return displayCache.addDocumentProof(walletAddress, caseId, input);
    },
    async getVisibleCases(walletAddress, role) {
      assertLocalChainConfigured();
      const events = await getContractEvents();
      const summaries = buildCaseSummariesFromEvents(events);
      const wallet = walletAddress.trim().toLowerCase();
      const visible = role === "EXPORTER" ? summaries.filter((item) => item.creator === wallet) : summaries;
      return visible.map((summary, index) => onChainSummaryToDisplayCase(summary, index));
    },
    async getCaseDetail(caseId) {
      assertLocalChainConfigured();
      const normalizedCaseId = caseId as Hex32;
      const events = await getContractEvents();
      const readModel = buildOnChainCaseReadModel(normalizedCaseId, events);
      if (!readModel.summary) {
        return displayCache.getCaseDetail(caseId);
      }
      const financingCase = onChainSummaryToDisplayCase(readModel.summary, 0);
      return {
        financingCase,
        documents: readModel.graph.nodes.map((node) => ({
          id: node.id,
          caseId: node.caseId,
          kind: node.kind,
          fileName: "local-display-cache-required",
          fileType: "hash-only",
          fileSize: 0,
          documentHash: node.documentHash,
          metadataHash: node.metadataHash
        })),
        graph: readModel.graph,
        gates: readModel.gates,
        state: readModel.state,
        auditLog: readModel.auditLog
      };
    }
  };
}

function onChainSummaryToDisplayCase(
  summary: { id: Hex32; creator: string; caseCommitment: string },
  index: number
): ContractBackedCase {
  const cacheCase = loadP1RegistryCache().cases.find((item) => item.id === summary.id);
  if (cacheCase) {
    return cacheCase;
  }
  return {
    id: summary.id,
    caseNo: `CT-P1C-${String(index + 1).padStart(4, "0")}`,
    creator: summary.creator,
    buyerName: "Hash-only on-chain case",
    amount: 0,
    currency: "USDC" as Currency,
    description: "Recovered from ChainTraceP1Registry CaseCreated event. Plaintext commercial display fields are not on chain.",
    caseCommitment: summary.caseCommitment as Hex32
  };
}

function assertLocalChainConfigured(): void {
  if (!isLocalChainConfigured() || !getConfiguredRegistryAddress()) {
    throw new Error("LOCAL_CHAIN_REGISTRY_NOT_CONFIGURED");
  }
}
