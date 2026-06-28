import { createWalletClient, custom, zeroHash } from "viem";
import { chaintraceChain } from "@/lib/chaintraceConfig";
import { proofRegistryAbi } from "@/lib/proofRegistryAbi";

export type EthereumProvider = {
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

export async function connectWallet(): Promise<`0x${string}`> {
  if (!window.ethereum) {
    throw new Error("No injected wallet found. Install MetaMask or another EVM wallet.");
  }

  const existingAccounts = (await window.ethereum.request({
    method: "eth_accounts",
  })) as `0x${string}`[];

  if (existingAccounts[0]) {
    return existingAccounts[0];
  }

  const accounts = (await withTimeout(
    window.ethereum.request({
      method: "eth_requestAccounts",
    }) as Promise<`0x${string}`[]>,
    20000,
    "MetaMask did not return an account. Open the MetaMask popup and approve the site connection, then try again."
  )) as `0x${string}`[];

  if (!accounts[0]) {
    throw new Error("No wallet account returned.");
  }

  return accounts[0];
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
