export type ChainTracePersistenceMode = "mock" | "local-chain";

export function getChainTraceMode(): ChainTracePersistenceMode {
  return process.env.NEXT_PUBLIC_CHAINTRACE_MODE === "local-chain" ? "local-chain" : "mock";
}

export function getConfiguredChainId(): number {
  return Number(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");
}

export function getConfiguredRpcUrl(): string {
  return process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
}

export function getConfiguredRegistryAddress(): string | null {
  const address = process.env.NEXT_PUBLIC_CHAINTRACE_REGISTRY_ADDRESS;
  return address && address.startsWith("0x") ? address : null;
}

export function isLocalChainConfigured(): boolean {
  return Boolean(getConfiguredRegistryAddress() && getConfiguredRpcUrl());
}
