import { createPublicClient, http, parseAbiItem } from "viem";
import { hardhat, mainnet, sepolia } from "viem/chains";

import chainTraceP1RegistryAbi from "@/lib/contracts/abi/ChainTraceP1Registry.json";

export const CHAINTRACE_P1_REGISTRY_ABI = chainTraceP1RegistryAbi;

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

export async function writeContract(): Promise<never> {
  throw new Error("BROWSER_WALLET_WRITE_NOT_CONFIGURED");
}

export async function waitForTransactionReceipt(): Promise<never> {
  throw new Error("BROWSER_WALLET_WRITE_NOT_CONFIGURED");
}
