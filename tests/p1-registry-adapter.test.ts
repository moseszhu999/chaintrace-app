import { afterEach, describe, expect, it } from "vitest";

import { createLocalChainAdapter, createMockRegistryAdapter, getP1RegistryAdapter } from "@/lib/contracts/p1-registry-adapter";

describe("P1 registry adapter", () => {
  const originalMode = process.env.NEXT_PUBLIC_CHAINTRACE_MODE;
  const originalAddress = process.env.NEXT_PUBLIC_CHAINTRACE_REGISTRY_ADDRESS;

  afterEach(() => {
    process.env.NEXT_PUBLIC_CHAINTRACE_MODE = originalMode;
    process.env.NEXT_PUBLIC_CHAINTRACE_REGISTRY_ADDRESS = originalAddress;
  });

  it("selects mock mode by default", () => {
    delete process.env.NEXT_PUBLIC_CHAINTRACE_MODE;
    expect(getP1RegistryAdapter().mode).toBe("mock");
  });

  it("selects local-chain mode when configured", () => {
    process.env.NEXT_PUBLIC_CHAINTRACE_MODE = "local-chain";
    expect(getP1RegistryAdapter().mode).toBe("local-chain");
  });

  it("requires registry address before local-chain operations", async () => {
    process.env.NEXT_PUBLIC_CHAINTRACE_REGISTRY_ADDRESS = "";
    await expect(createLocalChainAdapter().connectWallet()).rejects.toThrow("LOCAL_CHAIN_REGISTRY_NOT_CONFIGURED");
  });

  it("exposes a mock adapter for Vercel preview without RPC", async () => {
    const adapter = createMockRegistryAdapter();
    await expect(adapter.connectWallet("0xEXporter001")).resolves.toBe("0xEXporter001");
  });
});
