import { baseSepolia } from "viem/chains";

export const chaintraceChain = baseSepolia;

export const defaultProofRegistryAddress = "0xE5D6F3F040CFCdb957F93dadA9C6e6aC94bbDC8A" as const;

export const proofRegistryAddress =
  (process.env.NEXT_PUBLIC_PROOF_REGISTRY_ADDRESS as `0x${string}` | undefined) ??
  defaultProofRegistryAddress;

export function getBaseSepoliaExplorerTxUrl(txHash: string): string {
  return `https://sepolia.basescan.org/tx/${txHash}`;
}

export function getBaseSepoliaExplorerAddressUrl(address: string): string {
  return `https://sepolia.basescan.org/address/${address}`;
}

export function isProofRegistryConfigured(): boolean {
  return Boolean(proofRegistryAddress && proofRegistryAddress.startsWith("0x"));
}
