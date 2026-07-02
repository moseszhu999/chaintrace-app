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
import { buildDocumentProofPayload } from "@/lib/contracts/proof-payload";
import { DOCUMENT_KIND_TO_CONTRACT_VALUE, ROLE_TO_CONTRACT_VALUE } from "@/lib/contracts/p1-contract-values";
import { getChainTraceMode, getConfiguredRegistryAddress, isLocalChainConfigured } from "@/lib/contracts/p1-local-chain-mode";
import { waitForTransactionReceipt, writeContract } from "@/lib/contracts/chainTraceP1Registry";
import { Hex32 } from "@/lib/contracts/types";
import { Role } from "@/lib/p1-domain";

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
      return displayCache.getVisibleCases(walletAddress, role);
    },
    async getCaseDetail(caseId) {
      assertLocalChainConfigured();
      return displayCache.getCaseDetail(caseId);
    }
  };
}

function assertLocalChainConfigured(): void {
  if (!isLocalChainConfigured() || !getConfiguredRegistryAddress()) {
    throw new Error("LOCAL_CHAIN_REGISTRY_NOT_CONFIGURED");
  }
}
