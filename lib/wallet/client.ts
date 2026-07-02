"use client";

export interface ChainTraceWalletClient {
  connectWallet(): Promise<string>;
  getWalletAddress(): Promise<string | null>;
}

const LAST_WALLET_KEY = "chaintrace:p1-last-selected-wallet";

export function createMockWalletClient(defaultWallet = "0xEXporter001"): ChainTraceWalletClient {
  return {
    async connectWallet() {
      const wallet = getStoredWallet() ?? defaultWallet;
      setStoredWallet(wallet);
      return wallet;
    },
    async getWalletAddress() {
      return getStoredWallet();
    }
  };
}

export async function connectWallet(): Promise<string> {
  return createMockWalletClient().connectWallet();
}

export async function getWalletAddress(): Promise<string | null> {
  return createMockWalletClient().getWalletAddress();
}

function getStoredWallet(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(LAST_WALLET_KEY);
}

function setStoredWallet(walletAddress: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LAST_WALLET_KEY, walletAddress);
}
