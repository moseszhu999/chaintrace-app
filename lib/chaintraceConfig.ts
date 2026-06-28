import { sepolia } from "viem/chains";

export const chaintraceChain = sepolia;

export const defaultProofRegistryAddress = "0xB35feebF4238D807ad4c4755113BEE1dA46DA597" as const;

export const proofRegistryAddress =
  (process.env.NEXT_PUBLIC_PROOF_REGISTRY_ADDRESS as `0x${string}` | undefined) ??
  defaultProofRegistryAddress;

export function getChainExplorerTxUrl(txHash: string): string {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}

export function getChainExplorerAddressUrl(address: string): string {
  return `https://sepolia.etherscan.io/address/${address}`;
}

export function isProofRegistryConfigured(): boolean {
  return Boolean(proofRegistryAddress && proofRegistryAddress.startsWith("0x"));
}
