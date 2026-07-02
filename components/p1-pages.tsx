"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  getCurrentUser,
  loadP1Store,
  registerAndSignIn,
  routeForRole,
  saveP1Store,
  signInExistingWallet
} from "@/lib/p1-client-store";
import {
  CASE_STATES,
  Currency,
  DocumentType,
  P1_ROLES,
  P1Store,
  Role,
  addTradeDocument,
  buildCaseState,
  buildGateChecklist,
  buildProofGraph,
  createExporterCase,
  formatMoney,
  roleLabel
} from "@/lib/p1-domain";

export function LoginPage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState("0xEXporter001");
  const [message, setMessage] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const userId = signInExistingWallet(walletAddress);
    if (!userId) {
      router.push(`/register-role?wallet=${encodeURIComponent(walletAddress)}`);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="entry">
      <section className="panel" style={{ width: "min(620px, 100%)" }}>
        <div className="brand-row">
          <span className="brand-mark">CT</span>
          <span>ChainTrace P1</span>
        </div>
        <h1>Mock wallet login</h1>
        <p>
          This login uses local mock wallet identity only. It does not request a
          signature and does not connect to a real wallet provider.
        </p>
        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span>Wallet address</span>
            <input value={walletAddress} onChange={(event) => setWalletAddress(event.target.value)} required />
          </label>
          {message ? <p className="badge warn">{message}</p> : null}
          <div className="actions">
            <button className="primary" type="submit">
              Continue
            </button>
            <button
              type="button"
              onClick={() => {
                setWalletAddress("0xEXporter001");
                setMessage("Use Register role first if this wallet is new.");
              }}
            >
              Demo exporter wallet
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export function RegisterRolePage({ initialWallet }: { initialWallet?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("exporter@demo.chaintrace");
  const [walletAddress, setWalletAddress] = useState(initialWallet || "0xEXporter001");
  const [role, setRole] = useState<Role>("EXPORTER");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const userId = registerAndSignIn({ email, walletAddress, role });
      const store = loadP1Store();
      const user = store.users.find((item) => item.id === userId);
      router.push(user ? routeForRole(user.role) : "/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "REGISTRATION_FAILED");
    }
  }

  return (
    <main className="entry">
      <section className="panel" style={{ width: "min(720px, 100%)" }}>
        <h1>Register one permanent business role</h1>
        <p>
          P1 keeps the core rule: one wallet equals one role and one workspace.
          Ordinary users cannot change a locked role after registration.
        </p>
        <form className="form" onSubmit={onSubmit}>
          <div className="grid-2">
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="field">
              <span>Mock wallet address</span>
              <input value={walletAddress} onChange={(event) => setWalletAddress(event.target.value)} required />
            </label>
          </div>
          <label className="field">
            <span>Business role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
              {P1_ROLES.map((item) => (
                <option key={item} value={item}>
                  {roleLabel(item)}
                </option>
              ))}
            </select>
          </label>
          {error ? <p className="badge bad">{error}</p> : null}
          <button className="primary" type="submit">
            Lock role and enter workspace
          </button>
        </form>
      </section>
    </main>
  );
}

export function DashboardPage() {
  const [store, setStore] = useState<P1Store | null>(null);

  useEffect(() => {
    setStore(loadP1Store());
  }, []);

  const user = useMemo(() => (store ? getCurrentUser(store) : null), [store]);
  const visibleCases = useMemo(() => {
    if (!store || !user) {
      return [];
    }
    if (user.role === "EXPORTER") {
      return store.cases.filter((item) => item.exporterId === user.id);
    }
    if (user.role === "AUDITOR" || user.role === "OPERATOR" || user.role === "BANK") {
      return store.cases;
    }
    return store.cases.filter((item) => item.buyerId === user.id);
  }, [store, user]);

  if (!store || !user) {
    return null;
  }

  return (
    <>
      <section className="page-head">
        <div>
          <h1>{roleLabel(user.role)} dashboard</h1>
          <p>
            Role-specific workspace with locked wallet identity and no real funds,
            chain write, or external integration.
          </p>
        </div>
        {user.role === "EXPORTER" ? (
          <Link className="button primary" href="/exporter/cases/new">
            New financing case
          </Link>
        ) : null}
      </section>
      <section className="grid-3">
        <div className="metric">
          <div className="label">Visible cases</div>
          <div className="value">{visibleCases.length}</div>
        </div>
        <div className="metric">
          <div className="label">Role</div>
          <div className="value">{roleLabel(user.role)}</div>
        </div>
        <div className="metric">
          <div className="label">Funding execution</div>
          <div className="value">Blocked</div>
        </div>
      </section>
      <CaseList cases={visibleCases} />
    </>
  );
}

export function ExporterDashboardPage() {
  const [store, setStore] = useState<P1Store | null>(null);

  useEffect(() => {
    setStore(loadP1Store());
  }, []);

  const user = useMemo(() => (store ? getCurrentUser(store) : null), [store]);
  const cases = store && user ? store.cases.filter((item) => item.exporterId === user.id) : [];

  return (
    <>
      <section className="page-head">
        <div>
          <h1>Exporter cases</h1>
          <p>Create financing candidates and package local proof records for review.</p>
        </div>
        <Link className="button primary" href="/exporter/cases/new">
          New case
        </Link>
      </section>
      <CaseList cases={cases} />
    </>
  );
}

export function NewExporterCasePage() {
  const router = useRouter();
  const [buyerName, setBuyerName] = useState("Harbor Coffee Buyers Ltd");
  const [amount, setAmount] = useState("128000");
  const [currency, setCurrency] = useState<Currency>("USDC");
  const [description, setDescription] = useState("Vietnam coffee shipment receivable");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const store = loadP1Store();
    const user = getCurrentUser(store);
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const financingCase = createExporterCase(store, user.id, {
        buyerName,
        amount: Number(amount),
        currency,
        description
      });
      saveP1Store(store);
      router.push(`/exporter/cases/${financingCase.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "CASE_CREATE_FAILED");
    }
  }

  return (
    <>
      <section className="page-head">
        <div>
          <h1>Create financing candidate</h1>
          <p>The initial case is saved as DRAFT_INTENT with disbursement blocked.</p>
        </div>
      </section>
      <section className="panel">
        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span>Buyer name</span>
            <input value={buyerName} onChange={(event) => setBuyerName(event.target.value)} required />
          </label>
          <div className="grid-2">
            <label className="field">
              <span>Amount</span>
              <input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} required />
            </label>
            <label className="field">
              <span>Currency</span>
              <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}>
                <option value="USDC">USDC</option>
                <option value="USD">USD</option>
                <option value="SGD">SGD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span>Description</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} required />
          </label>
          {error ? <p className="badge bad">{error}</p> : null}
          <button className="primary" type="submit">
            Save DRAFT_INTENT case
          </button>
        </form>
      </section>
    </>
  );
}

export function ExporterCaseDetailPage({ caseId }: { caseId: string }) {
  const [store, setStore] = useState<P1Store | null>(null);
  const [type, setType] = useState<DocumentType>("INVOICE");
  const [fileName, setFileName] = useState("invoice-ct-001.pdf");
  const [textSummary, setTextSummary] = useState("Invoice CT-001 for 128,000 USDC, due after port release.");
  const [error, setError] = useState("");

  useEffect(() => {
    setStore(loadP1Store());
  }, []);

  const user = store ? getCurrentUser(store) : null;
  const financingCase = store?.cases.find((item) => item.id === caseId);
  const documents = store?.tradeDocuments.filter((item) => item.caseId === caseId) ?? [];
  const state = store && financingCase ? buildCaseState(store, financingCase.id) : null;

  async function onAddDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!store || !user) {
      return;
    }
    try {
      await addTradeDocument(store, user.id, caseId, { type, fileName, textSummary });
      saveP1Store(store);
      setStore({ ...store });
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "DOCUMENT_ADD_FAILED");
    }
  }

  if (!financingCase) {
    return <MissingCase />;
  }

  return (
    <>
      <section className="page-head">
        <div>
          <h1>{financingCase.caseNo}</h1>
          <p>{financingCase.description}</p>
        </div>
        <div className="row-actions">
          <Link className="button" href={`/cases/${caseId}/proof-graph`}>
            Proof graph
          </Link>
          <Link className="button" href={`/cases/${caseId}/state-machine`}>
            State machine
          </Link>
          <Link className="button" href={`/cases/${caseId}/audit-log`}>
            Audit log
          </Link>
        </div>
      </section>
      <section className="grid-3">
        <div className="metric">
          <div className="label">Buyer</div>
          <div className="value">{financingCase.buyerName}</div>
        </div>
        <div className="metric">
          <div className="label">Amount</div>
          <div className="value">{formatMoney(financingCase.amount, financingCase.currency)}</div>
        </div>
        <div className="metric">
          <div className="label">Current state</div>
          <div className="value">{state?.state}</div>
        </div>
      </section>
      <section className="notice">
        <strong>Execution boundary:</strong> disbursementAllowed is always false in P1.
        This case can be reviewed and explained, but cannot execute funding.
      </section>
      <section className="grid-2">
        <div className="panel">
          <h2>Add trade material metadata</h2>
          <form className="form" onSubmit={onAddDocument}>
            <label className="field">
              <span>Document type</span>
              <select value={type} onChange={(event) => setType(event.target.value as DocumentType)}>
                <option value="PO">PO</option>
                <option value="INVOICE">Invoice</option>
                <option value="PACKING_LIST">Packing list</option>
                <option value="BILL_OF_LADING">Bill of lading</option>
                <option value="INSPECTION_REPORT">Inspection report</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <label className="field">
              <span>File name</span>
              <input value={fileName} onChange={(event) => setFileName(event.target.value)} required />
            </label>
            <label className="field">
              <span>Text summary</span>
              <textarea value={textSummary} onChange={(event) => setTextSummary(event.target.value)} required />
            </label>
            {error ? <p className="badge bad">{error}</p> : null}
            <button className="primary" type="submit">
              Hash and save proof
            </button>
          </form>
        </div>
        <DocumentTable documents={documents} />
      </section>
    </>
  );
}

export function ProofGraphPage({ caseId }: { caseId: string }) {
  const [store, setStore] = useState<P1Store | null>(null);

  useEffect(() => {
    setStore(loadP1Store());
  }, []);

  const financingCase = store?.cases.find((item) => item.id === caseId);
  if (!store || !financingCase) {
    return <MissingCase />;
  }
  const graph = buildProofGraph(store, caseId);
  const gates = buildGateChecklist(store, caseId);

  return (
    <>
      <section className="page-head">
        <div>
          <h1>Proof graph</h1>
          <p>{financingCase.caseNo} local evidence root: {graph.evidenceRoot}</p>
        </div>
        <Link className="button" href={`/exporter/cases/${caseId}`}>
          Case detail
        </Link>
      </section>
      <section className="grid-2">
        <div className="table-panel">
          <table>
            <thead>
              <tr>
                <th>Proof</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Hash</th>
              </tr>
            </thead>
            <tbody>
              {graph.nodes.map((node) => (
                <tr key={node.id}>
                  <td>{node.proofType}</td>
                  <td>{roleLabel(node.ownerRole)}</td>
                  <td><StatusBadge status={node.status} /></td>
                  <td className="hash">{node.hash}</td>
                </tr>
              ))}
              {graph.nodes.length === 0 ? <EmptyRow label="No proof nodes yet." /> : null}
            </tbody>
          </table>
        </div>
        <GateTable gates={gates} />
      </section>
    </>
  );
}

export function StateMachinePage({ caseId }: { caseId: string }) {
  const [store, setStore] = useState<P1Store | null>(null);

  useEffect(() => {
    setStore(loadP1Store());
  }, []);

  const financingCase = store?.cases.find((item) => item.id === caseId);
  if (!store || !financingCase) {
    return <MissingCase />;
  }
  const state = buildCaseState(store, caseId);
  const activeIndex = CASE_STATES.indexOf(state.state);

  return (
    <>
      <section className="page-head">
        <div>
          <h1>Case state machine</h1>
          <p>{state.explanation}</p>
        </div>
        <span className="badge bad">Funding execution blocked</span>
      </section>
      <section className="panel timeline">
        {CASE_STATES.map((item, index) => (
          <div className="timeline-item" key={item}>
            <span className={index <= activeIndex ? "dot active" : "dot"} />
            <div>
              <h3>{item}</h3>
              <p>
                {item === "FUNDING_EXECUTION_BLOCKED"
                  ? "Terminal P1 safety boundary: no real funds, chain write, or wallet signature."
                  : "Derived from the current proof and gate records."}
              </p>
            </div>
          </div>
        ))}
      </section>
      <section className="grid-3">
        <div className="metric">
          <div className="label">Can continue review</div>
          <div className="value">{state.canContinueReview ? "Yes" : "No"}</div>
        </div>
        <div className="metric">
          <div className="label">Can execute funding</div>
          <div className="value">No</div>
        </div>
        <div className="metric">
          <div className="label">disbursementAllowed</div>
          <div className="value">false</div>
        </div>
      </section>
    </>
  );
}

export function AuditLogPage({ caseId }: { caseId: string }) {
  const [store, setStore] = useState<P1Store | null>(null);

  useEffect(() => {
    setStore(loadP1Store());
  }, []);

  const financingCase = store?.cases.find((item) => item.id === caseId);
  if (!store || !financingCase) {
    return <MissingCase />;
  }
  const entries = store.auditLogs.filter((entry) => entry.caseId === caseId);

  return (
    <>
      <section className="page-head">
        <div>
          <h1>Audit log</h1>
          <p>Append-only operational history for {financingCase.caseNo}.</p>
        </div>
      </section>
      <section className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{new Date(entry.createdAt).toLocaleString()}</td>
                <td>{roleLabel(entry.actorRole)}</td>
                <td>{entry.action}</td>
                <td>{entry.summary}</td>
              </tr>
            ))}
            {entries.length === 0 ? <EmptyRow label="No audit entries yet." /> : null}
          </tbody>
        </table>
      </section>
    </>
  );
}

function CaseList({ cases }: { cases: Array<{ id: string; caseNo: string; buyerName: string; amount: number; currency: Currency; currentState: string }> }) {
  return (
    <section className="table-panel">
      <table>
        <thead>
          <tr>
            <th>Case</th>
            <th>Buyer</th>
            <th>Amount</th>
            <th>State</th>
            <th>Open</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((item) => (
            <tr key={item.id}>
              <td>{item.caseNo}</td>
              <td>{item.buyerName}</td>
              <td>{formatMoney(item.amount, item.currency)}</td>
              <td>{item.currentState}</td>
              <td>
                <Link className="button" href={`/exporter/cases/${item.id}`}>
                  Open
                </Link>
              </td>
            </tr>
          ))}
          {cases.length === 0 ? <EmptyRow label="No cases yet." /> : null}
        </tbody>
      </table>
    </section>
  );
}

function DocumentTable({ documents }: { documents: Array<{ id: string; type: DocumentType; fileName: string; hash: string; textSummary: string }> }) {
  return (
    <div className="table-panel">
      <table>
        <thead>
          <tr>
            <th>Document</th>
            <th>Summary</th>
            <th>Hash</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              <td>
                <strong>{document.type}</strong>
                <br />
                <span className="label">{document.fileName}</span>
              </td>
              <td>{document.textSummary}</td>
              <td className="hash">{document.hash}</td>
            </tr>
          ))}
          {documents.length === 0 ? <EmptyRow label="No documents yet." /> : null}
        </tbody>
      </table>
    </div>
  );
}

function GateTable({ gates }: { gates: ReturnType<typeof buildGateChecklist> }) {
  return (
    <div className="table-panel">
      <table>
        <thead>
          <tr>
            <th>Gate</th>
            <th>Status</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {gates.map((gate) => (
            <tr key={gate.id}>
              <td>{gate.gateType}</td>
              <td><StatusBadge status={gate.status} /></td>
              <td>{gate.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className = status === "PASSED" ? "badge ok" : status === "BLOCKED" ? "badge bad" : "badge warn";
  return <span className={className}>{status}</span>;
}

function EmptyRow({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={5}>{label}</td>
    </tr>
  );
}

function MissingCase() {
  return (
    <section className="panel">
      <h1>Case not found</h1>
      <p>Create a financing candidate first, then open proof graph, state machine, or audit log from the case detail page.</p>
      <Link className="button primary" href="/exporter/cases/new">
        New exporter case
      </Link>
    </section>
  );
}
