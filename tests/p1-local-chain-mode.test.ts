import { afterEach, describe, expect, it } from "vitest";

import {
  getChainTraceMode,
  getConfiguredChainId,
  getConfiguredRegistryAddress,
  getConfiguredRpcUrl,
  isLocalChainConfigured
} from "@/lib/contracts/p1-local-chain-mode";

describe("P1 local-chain mode helper", () => {
  const originalMode = process.env.NEXT_PUBLIC_CHAINTRACE_MODE;
  const originalAddress = process.env.NEXT_PUBLIC_CHAINTRACE_REGISTRY_ADDRESS;
  const originalChainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  const originalRpc = process.env.NEXT_PUBLIC_RPC_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_CHAINTRACE_MODE = originalMode;
    process.env.NEXT_PUBLIC_CHAINTRACE_REGISTRY_ADDRESS = originalAddress;
    process.env.NEXT_PUBLIC_CHAIN_ID = originalChainId;
    process.env.NEXT_PUBLIC_RPC_URL = originalRpc;
  });

  it("defaults to mock mode unless local-chain is explicit", () => {
    delete process.env.NEXT_PUBLIC_CHAINTRACE_MODE;
    expect(getChainTraceMode()).toBe("mock");

    process.env.NEXT_PUBLIC_CHAINTRACE_MODE = "local-chain";
    expect(getChainTraceMode()).toBe("local-chain");
  });

  it("reads local chain frontend configuration", () => {
    process.env.NEXT_PUBLIC_CHAIN_ID = "31337";
    process.env.NEXT_PUBLIC_RPC_URL = "http://127.0.0.1:8545";
    process.env.NEXT_PUBLIC_CHAINTRACE_REGISTRY_ADDRESS = "0x0000000000000000000000000000000000000001";

    expect(getConfiguredChainId()).toBe(31337);
    expect(getConfiguredRpcUrl()).toBe("http://127.0.0.1:8545");
    expect(getConfiguredRegistryAddress()).toBe("0x0000000000000000000000000000000000000001");
    expect(isLocalChainConfigured()).toBe(true);
  });
});
