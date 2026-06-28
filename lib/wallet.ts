import { createWalletClient, custom, zeroHash } from "viem";
import { chaintraceChain } from "@/lib/chaintraceConfig";
import { proofRegistryAbi } from "@/lib/proofRegistryAbi";

export type EthereumProvider = {
  isMetaMask?: boolean;
  selectedAddress?: `0x${string}` | null;
  providers?: EthereumProvider[];
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

export function getWalletProvider(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;

  const injected = window.ethereum;
  if (!injected) return undefined;

  if (Array.isArray(injected.providers)) {
    const metamask = injected.providers.find((provider) => provider.isMetaMask);
    return metamask ?? injected.providers[0];
  }

  return injected;
}

export function hasInjectedWallet(): boolean {
  return Boolean(getWalletProvider());
}

export async function getConnectedAccount(): Promise<`0x${string}` | null> {
  const provider = getWalletProvider();
  if (!provider) return null;

  const accounts = (await provider.request({
    method: "eth_accounts",
  })) as `0x${string}`[];

  return accounts[0] ?? provider.selectedAddress ?? null;
}

export async function connectWallet(): Promise<`0x${string}`> {
  const provider = getWalletProvider();

  if (!provider) {
    throw new Error("No injected wallet found. Install MetaMask or another EVM wallet.");
  }

  const existingAccount = await getConnectedAccount();
  if (existingAccount) return existingAccount;

  try {
    await withTimeout(
      provider.request({
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
  }

  const accounts = (await withTimeout(
    provider.request({
      method: "eth_requestAccounts",
    }) as Promise<`0x${string}`[]>,
    20000,
    "MetaMask did not return an account. Open the MetaMask popup and approve the site connection, then try again."
  )) as `0x${string}`[];

  const account = accounts[0] ?? provider.selectedAddress ?? null;

  if (!account) {
    throw new Error("No wallet account returned.");
  }

  return account;
}

export async function switchToEthereumSepolia(): Promise<void> {
  const provider = getWalletProvider();

  if (!provider) {
    throw new Error("No injected wallet found.");
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });
  } catch (caught) {
    const error = caught as { code?: number };

    if (error.code !== 4902) {
      throw caught;
    }

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0xaa36a7",
          chainName: "Ethereum Sepolia",
          nativeCurrency: {
            name: "Sepolia Ether",
            symbol: "ETH",
            decimals: 18,
          },
          rpcUrls: ["https://rpc.sepolia.org"],
          blockExplorerUrls: ["https://sepolia.etherscan.io"],
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
  const provider = getWalletProvider();

  if (!provider) {
    throw new Error("No injected wallet found.");
  }

  const walletClient = createWalletClient({
    account: args.account,
    chain: chaintraceChain,
    transport: custom(provider),
  });

  return walletClient.writeContract({
    address: args.contractAddress,
    abi: proofRegistryAbi,
    functionName: "registerProof",
    args: [args.fileHash, args.proofType, args.uri ?? "", zeroHash],
  });
}
