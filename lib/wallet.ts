import { createWalletClient, custom, zeroHash } from "viem";
import { chaintraceChain } from "@/lib/chaintraceConfig";
import { proofRegistryAbi } from "@/lib/proofRegistryAbi";

export type EthereumProvider = {
  selectedAddress?: `0x${string}` | null;
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), milliseconds);

    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

export function hasInjectedWallet(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export async function getConnectedAccount(): Promise<`0x${string}` | null> {
  if (!window.ethereum) return null;

  const accounts = (await window.ethereum.request({
    method: "eth_accounts",
  })) as `0x${string}`[];

  return accounts[0] ?? window.ethereum.selectedAddress ?? null;
}

export async function connectWallet(): Promise<`0x${string}`> {
  if (!window.ethereum) {
    throw new Error("No injected wallet found. Install MetaMask or another EVM wallet.");
  }

  const existingAccount = await getConnectedAccount();
  if (existingAccount) return existingAccount;

  try {
    await withTimeout(
      window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      }) as Promise<unknown>,
      20000,
      "MetaMask permission request timed out. Open the MetaMask popup and approve the site connection, then try again."
    );
  } catch (caught) {
    const error = caught as { code?: number; message?: string };

    if (error.code === 4001) {
      throw new Error("Wallet connection rejected in MetaMask.");
    }

    const message = error.message ?? "MetaMask permission request failed.";
    if (!message.toLowerCase().includes("already pending")) {
      // Continue to eth_requestAccounts as a fallback for wallets that do not support wallet_requestPermissions.
    }
  }

  const accounts = (await withTimeout(
    window.ethereum.request({
      method: "eth_requestAccounts",
    }) as Promise<`0x${string}`[]>,
    20000,
    "MetaMask did not return an account. Open the MetaMask popup and approve the site connection, then try again."
  )) as `0x${string}`[];

  const account = accounts[0] ?? window.ethereum.selectedAddress ?? null;

  if (!account) {
    throw new Error("No wallet account returned.");
  }

  return account;
}

export async function switchToBaseSepolia(): Promise<void> {
  if (!window.ethereum) {
    throw new Error("No injected wallet found.");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x14A34" }],
    });
  } catch (caught) {
    const error = caught as { code?: number };

    if (error.code !== 4902) {
      throw caught;
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x14A34",
          chainName: "Base Sepolia",
          nativeCurrency: {
            name: "Sepolia Ether",
            symbol: "ETH",
            decimals: 18,
          },
          rpcUrls: ["https://sepolia.base.org"],
          blockExplorerUrls: ["https://sepolia.basescan.org"],
        },
      ],
    });
  }
}

export async function registerProofOnChain(args: {
  account: `0x${string}`;
  contractAddress: `0x${string}`;
  fileHash: `0x${string}`;
  proofType: string;
  uri?: string;
}): Promise<`0x${string}`> {
  if (!window.ethereum) {
    throw new Error("No injected wallet found.");
  }

  const walletClient = createWalletClient({
    account: args.account,
    chain: chaintraceChain,
    transport: custom(window.ethereum),
  });

  return walletClient.writeContract({
    address: args.contractAddress,
    abi: proofRegistryAbi,
    functionName: "registerProof",
    args: [args.fileHash, args.proofType, args.uri ?? "", zeroHash],
  });
}
