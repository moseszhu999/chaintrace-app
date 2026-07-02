import { createPublicClient, createWalletClient, custom, http, parseAbiItem } from "viem";
import { hardhat, mainnet, sepolia } from "viem/chains";

import chainTraceP1RegistryAbi from "@/lib/contracts/abi/ChainTraceP1Registry.json";

export const CHAINTRACE_P1_REGISTRY_ABI = chainTraceP1RegistryAbi;

interface BrowserProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

export function getConfiguredRegistryAddress(): `0x${string}` | null {
  const address = process.env.NEXT_PUBLIC_CHAINTRACE_REGISTRY_ADDRESS;
  return address && address.startsWith("0x") ? (address as `0x${string}`) : null;
}

export function getConfiguredChainId(): number {
  return Number(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");
}

export function getConfiguredRpcUrl(): string {
  return process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
}

export function createChainTracePublicClient() {
  const chainId = getConfiguredChainId();
  const chain = chainId === 1 ? mainnet : chainId === 11155111 ? sepolia : hardhat;

  return createPublicClient({
    chain,
    transport: http(getConfiguredRpcUrl())
  });
}

export function getBrowserProvider(): BrowserProvider | null {
  if (typeof window === "undefined") {
    return null;
  }
  return (window as unknown as { ethereum?: BrowserProvider }).ethereum ?? null;
}

export async function connectWallet(): Promise<`0x${string}`> {
  const provider = getBrowserProvider();
  if (!provider) {
    throw new Error("BROWSER_WALLET_NOT_AVAILABLE");
  }
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const account = Array.isArray(accounts) ? accounts[0] : null;
  if (typeof account !== "string" || !account.startsWith("0x")) {
    throw new Error("BROWSER_WALLET_ACCOUNT_NOT_FOUND");
  }
  return account as `0x${string}`;
}

export async function readContract(functionName: string, args: unknown[] = []) {
  const address = getConfiguredRegistryAddress();
  if (!address) {
    throw new Error("CHAINTRACE_REGISTRY_ADDRESS_NOT_CONFIGURED");
  }
  const client = createChainTracePublicClient();
  return client.readContract({
    address,
    abi: CHAINTRACE_P1_REGISTRY_ABI,
    functionName,
    args
  });
}

export async function getContractEvents(fromBlock: bigint = 0n) {
  const address = getConfiguredRegistryAddress();
  if (!address) {
    return [];
  }
  const client = createChainTracePublicClient();
  return client.getLogs({
    address,
    event: parseAbiItem(
      "event DocumentProofAdded(bytes32 indexed caseId, bytes32 documentHash, bytes32 metadataHash, uint8 kind)"
    ),
    fromBlock,
    toBlock: "latest"
  });
}

export async function writeContract(functionName: string, args: unknown[] = []) {
  const address = getConfiguredRegistryAddress();
  const provider = getBrowserProvider();
  if (!address) {
    throw new Error("CHAINTRACE_REGISTRY_ADDRESS_NOT_CONFIGURED");
  }
  if (!provider) {
    throw new Error("BROWSER_WALLET_NOT_AVAILABLE");
  }
  const account = await connectWallet();
  const client = createWalletClient({
    chain: hardhat,
    transport: custom(provider)
  });
  return client.writeContract({
    address,
    abi: CHAINTRACE_P1_REGISTRY_ABI,
    functionName,
    args,
    account
  });
}

export async function waitForTransactionReceipt(hash: `0x${string}`) {
  return createChainTracePublicClient().waitForTransactionReceipt({ hash });
}
