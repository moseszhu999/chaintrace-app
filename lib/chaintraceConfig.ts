import { baseSepolia } from "viem/chains";

export const chaintraceChain = baseSepolia;

export const proofRegistryAddress = process.env.NEXT_PUBLIC_PROOF_REGISTRY_ADDRESS as
  | `0x${string}`
  | undefined;

export function getBaseSepoliaExplorerTxUrl(txHash: string): string {
  return `https://sepolia.basescan.org/tx/${txHash}`;
}

export function isProofRegistryConfigured(): boolean {
  return Boolean(proofRegistryAddress && proofRegistryAddress.startsWith("0x"));
}
