import { baseSepolia } from "viem/chains";

export const chaintraceChain = baseSepolia;

export const defaultProofRegistryAddress = "0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3" as const;

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
