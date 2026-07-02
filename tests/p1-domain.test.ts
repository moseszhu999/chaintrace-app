import { describe, expect, it } from "vitest";

import {
  addTradeDocument,
  buildCaseState,
  buildGateChecklist,
  buildProofGraph,
  createExporterCase,
  registerMockUser,
  seedP1Store
} from "@/lib/p1-domain";

describe("P1 role and case domain", () => {
  it("locks the first wallet role and refuses role changes", () => {
    const store = seedP1Store();
    const exporter = registerMockUser(store, {
      email: "exporter@demo.chaintrace",
      walletAddress: "0xEXporter001",
      role: "EXPORTER"
    });

    expect(exporter.role).toBe("EXPORTER");
    expect(exporter.roleLocked).toBe(true);

    expect(() =>
      registerMockUser(store, {
        email: "wrong@demo.chaintrace",
        walletAddress: "0xEXporter001",
        role: "BANK"
      })
    ).toThrow("WALLET_ROLE_LOCKED");
  });

  it("creates an exporter case in draft state with funding blocked and an audit entry", () => {
    const store = seedP1Store();
    const exporter = registerMockUser(store, {
      email: "exporter@demo.chaintrace",
      walletAddress: "0xEXporter001",
      role: "EXPORTER"
    });

    const financingCase = createExporterCase(store, exporter.id, {
      buyerName: "Harbor Coffee Buyers Ltd",
      amount: 128000,
      currency: "USDC",
      description: "Vietnam coffee shipment receivable"
    });

    expect(financingCase.currentState).toBe("DRAFT_INTENT");
    expect(financingCase.disbursementAllowed).toBe(false);
    expect(store.auditLogs).toHaveLength(1);
    expect(store.auditLogs[0]).toMatchObject({
      actorRole: "EXPORTER",
      action: "CASE_CREATED",
      targetType: "CASE",
      targetId: financingCase.id
    });
  });

  it("adds trade documents as proof nodes and derives graph, gates, state, and audit log", async () => {
    const store = seedP1Store();
    const exporter = registerMockUser(store, {
      email: "exporter@demo.chaintrace",
      walletAddress: "0xEXporter001",
      role: "EXPORTER"
    });
    const financingCase = createExporterCase(store, exporter.id, {
      buyerName: "Harbor Coffee Buyers Ltd",
      amount: 128000,
      currency: "USDC",
      description: "Vietnam coffee shipment receivable"
    });

    const invoice = await addTradeDocument(store, exporter.id, financingCase.id, {
      type: "INVOICE",
      fileName: "invoice-ct-001.pdf",
      textSummary: "Invoice CT-001 for 128,000 USDC, due after port release."
    });

    expect(invoice.hash).toMatch(/^sha256:/);
    expect(store.proofNodes).toHaveLength(1);
    expect(store.proofNodes[0]).toMatchObject({
      caseId: financingCase.id,
      ownerRole: "EXPORTER",
      proofType: "TRADE_DOCUMENT",
      status: "PASSED"
    });

    const graph = buildProofGraph(store, financingCase.id);
    expect(graph.nodes).toHaveLength(1);
    expect(graph.evidenceRoot).toMatch(/^sha256:/);

    const gates = buildGateChecklist(store, financingCase.id);
    expect(gates.map((gate) => gate.gateType)).toContain("TRADE_EVIDENCE_GATE");
    expect(gates.find((gate) => gate.gateType === "FUNDING_EXECUTION_GATE")).toMatchObject({
      status: "BLOCKED",
      reason: "P1 is review-assistant only. No chain write, wallet signature, or funds movement is enabled."
    });

    const state = buildCaseState(store, financingCase.id);
    expect(state.state).toBe("EVIDENCE_PACKAGED");
    expect(state.canContinueReview).toBe(true);
    expect(state.canExecuteFunding).toBe(false);
    expect(state.disbursementAllowed).toBe(false);
    expect(store.auditLogs.map((entry) => entry.action)).toEqual([
      "CASE_CREATED",
      "DOCUMENT_ADDED",
      "PROOF_NODE_CREATED"
    ]);
  });
});
