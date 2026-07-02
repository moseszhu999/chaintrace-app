import { describe, expect, it } from "vitest";

import {
  parseP1RegistryCache,
  serializeP1RegistryCache
} from "@/lib/p1-client-store";
import { P1ContractRegistryCache } from "@/lib/p1-client-store";

describe("P1 registry cache serialization", () => {
  it("serializes and restores contract events with bigint block numbers", () => {
    const cache: P1ContractRegistryCache = {
      roles: {
        "0xexporter001": "BANK"
      },
      users: {},
      cases: [],
      documents: [],
      events: [
        {
          type: "RoleRegistered",
          blockNumber: 1n,
          transactionHash: "0xmock_role",
          wallet: "0xexporter001",
          role: "BANK"
        }
      ]
    };

    const serialized = serializeP1RegistryCache(cache);
    expect(serialized).toContain('"blockNumber":"1"');

    const restored = parseP1RegistryCache(serialized);
    expect(restored.events[0].blockNumber).toBe(1n);
    expect(typeof restored.events[0].blockNumber).toBe("bigint");
  });
});
