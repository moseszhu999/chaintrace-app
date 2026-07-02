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
import { getChainTraceMode, getConfiguredRegistryAddress, isLocalChainConfigured } from "@/lib/contracts/p1-local-chain-mode";
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
  const mockFallback = createMockRegistryAdapter();

  return {
    mode: "local-chain",
    async connectWallet(walletAddress = "0xEXporter001") {
      assertLocalChainConfigured();
      return mockFallback.connectWallet(walletAddress);
    },
    async getCurrentWallet() {
      assertLocalChainConfigured();
      return mockFallback.getCurrentWallet();
    },
    async getRole(walletAddress) {
      assertLocalChainConfigured();
      return mockFallback.getRole(walletAddress);
    },
    async registerRole(input) {
      assertLocalChainConfigured();
      return mockFallback.registerRole(input);
    },
    async createCase(walletAddress, input) {
      assertLocalChainConfigured();
      return mockFallback.createCase(walletAddress, input);
    },
    async addDocumentProof(walletAddress, caseId, input) {
      assertLocalChainConfigured();
      return mockFallback.addDocumentProof(walletAddress, caseId, input);
    },
    async getVisibleCases(walletAddress, role) {
      assertLocalChainConfigured();
      return mockFallback.getVisibleCases(walletAddress, role);
    },
    async getCaseDetail(caseId) {
      assertLocalChainConfigured();
      return mockFallback.getCaseDetail(caseId);
    }
  };
}

function assertLocalChainConfigured(): void {
  if (!isLocalChainConfigured() || !getConfiguredRegistryAddress()) {
    throw new Error("LOCAL_CHAIN_REGISTRY_NOT_CONFIGURED");
  }
}
