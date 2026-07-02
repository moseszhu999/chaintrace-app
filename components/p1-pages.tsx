"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  addContractDocumentProof,
  ContractBackedCase,
  ContractBackedDocumentDisplay,
  createContractBackedCase,
  getContractCaseDetail,
  getCurrentUser,
  getVisibleCases,
  loadP1RegistryCache,
  P1ContractRegistryCache,
  registerAndSignIn,
  roleDisplay,
  routeForRole,
  saveDraftCache,
  signInExistingWallet
} from "@/lib/p1-client-store";
import { ContractDocumentKind, ContractGate } from "@/lib/contracts/types";
import { Currency, P1_ROLES, Role, formatMoney, roleLabel } from "@/lib/p1-domain";

const CONTRACT_CASE_STATES = ["DRAFT_INTENT", "PRE_REVIEW", "PROOF_COLLECTED", "GATES_NOT_PASSED"] as const;

export function LoginPage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState("0xEXporter001");
  const [message, setMessage] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const wallet = signInExistingWallet(walletAddress);
    if (!wallet) {
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
          <span>ChainTrace P1.1</span>
        </div>
        <h1>Wallet transaction workspace</h1>
        <p>
          This P1.1 route uses a wallet-like contract adapter. Role, case,
          document proof, state, and audit records are derived from registry
          state and events; browser storage is only a local development cache.
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
                setMessage("Register the wallet role first if it is not already in the registry.");
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
      registerAndSignIn({ email, walletAddress, role });
      router.push(routeForRole(role));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "REGISTRATION_FAILED");
    }
  }

  return (
    <main className="entry">
      <section className="panel" style={{ width: "min(720px, 100%)" }}>
        <h1>Register role on P1 registry</h1>
        <p>
          One wallet can register one business role. In production this maps to a
          wallet transaction on `ChainTraceP1Registry.registerRole`.
        </p>
        <form className="form" onSubmit={onSubmit}>
          <div className="grid-2">
            <label className="field">
              <span>Email, local display only</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="field">
              <span>Wallet address</span>
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
            Register role transaction
          </button>
        </form>
      </section>
    </main>
  );
}

export function DashboardPage() {
  const [cache, setCache] = useState<P1ContractRegistryCache | null>(null);

  useEffect(() => {
    setCache(loadP1RegistryCache());
  }, []);

  const user = useMemo(() => (cache ? getCurrentUser(cache) : null), [cache]);
  const visibleCases = cache && user ? getVisibleCases(cache, user) : [];

  if (!cache || !user) {
    return null;
  }

  return (
    <>
      <section className="page-head">
        <div>
          <h1>{roleDisplay(user.role)} dashboard</h1>
          <p>
            Contract-backed workspace. Case state, proof graph, and audit log
            are generated from registry records/events, not a server database.
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
          <div className="label">Visible registry cases</div>
          <div className="value">{visibleCases.length}</div>
        </div>
        <div className="metric">
          <div className="label">Role</div>
          <div className="value">{roleDisplay(user.role)}</div>
        </div>
        <div className="metric">
          <div className="label">disbursementAllowed</div>
          <div className="value">false</div>
        </div>
      </section>
      <CaseList cases={visibleCases} />
    </>
  );
}

export function ExporterDashboardPage() {
  const [cache, setCache] = useState<P1ContractRegistryCache | null>(null);

  useEffect(() => {
    setCache(loadP1RegistryCache());
  }, []);

  const user = useMemo(() => (cache ? getCurrentUser(cache) : null), [cache]);
  const cases = cache && user ? getVisibleCases(cache, user) : [];

  return (
    <>
      <section className="page-head">
        <div>
          <h1>Exporter registry cases</h1>
          <p>Create case commitments and document proof hashes through the P1 registry path.</p>
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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cache = loadP1RegistryCache();
    const user = getCurrentUser(cache);
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      saveDraftCache("lastCaseForm", { buyerName, amount, currency, description });
      const financingCase = await createContractBackedCase(cache, user.walletAddress, {
        buyerName,
        amount: Number(amount),
        currency,
        description
      });
      router.push(`/exporter/cases/${financingCase.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "CASE_CREATE_FAILED");
    }
  }

  return (
    <>
      <section className="page-head">
        <div>
          <h1>Create case commitment</h1>
          <p>
            The registry receives a `caseCommitment` hash. Buyer name, amount,
            and description stay in local display cache for this P1 demo.
          </p>
        </div>
      </section>
      <section className="panel">
        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span>Buyer name, local display cache</span>
            <input value={buyerName} onChange={(event) => setBuyerName(event.target.value)} required />
          </label>
          <div className="grid-2">
            <label className="field">
              <span>Amount, local display cache</span>
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
            <span>Description, local display cache</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} required />
          </label>
          {error ? <p className="badge bad">{error}</p> : null}
          <button className="primary" type="submit">
            Write case commitment
          </button>
        </form>
      </section>
    </>
  );
}

export function ExporterCaseDetailPage({ caseId }: { caseId: string }) {
  const [cache, setCache] = useState<P1ContractRegistryCache | null>(null);
  const [kind, setKind] = useState<ContractDocumentKind>("INVOICE");
  const [fileName, setFileName] = useState("invoice-ct-001.pdf");
  const [fileType, setFileType] = useState("application/pdf");
  const [fileSize, setFileSize] = useState("12345");
  const [textSummary, setTextSummary] = useState("Invoice CT-001 for 128,000 USDC, due after port release.");
  const [error, setError] = useState("");

  useEffect(() => {
    setCache(loadP1RegistryCache());
  }, []);

  const user = cache ? getCurrentUser(cache) : null;
  const detail = cache ? getContractCaseDetail(cache, caseId) : null;

  async function onAddDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cache || !user) {
      return;
    }
    try {
      await addContractDocumentProof(cache, user.walletAddress, caseId as `0x${string}`, {
        kind,
        fileName,
        fileType,
        fileSize: Number(fileSize),
        textSummary
      });
      setCache({ ...loadP1RegistryCache() });
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "DOCUMENT_PROOF_FAILED");
    }
  }

  if (!detail) {
    return <MissingCase />;
  }

  const { financingCase, documents, state } = detail;

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
          <div className="label">Buyer display</div>
          <div className="value">{financingCase.buyerName}</div>
        </div>
        <div className="metric">
          <div className="label">Amount display</div>
          <div className="value">{formatMoney(financingCase.amount, financingCase.currency)}</div>
        </div>
        <div className="metric">
          <div className="label">Contract state</div>
          <div className="value">{state.state}</div>
        </div>
      </section>
      <section className="notice">
        <strong>On-chain privacy boundary:</strong> raw files and plaintext
        commercial metadata never leave the browser. The registry stores only
        `caseCommitment`, `documentHash`, `metadataHash`, document kind, and events.
      </section>
      <section className="grid-2">
        <div className="panel">
          <h2>Add document proof</h2>
          <form className="form" onSubmit={onAddDocument}>
            <label className="field">
              <span>Document kind</span>
              <select value={kind} onChange={(event) => setKind(event.target.value as ContractDocumentKind)}>
                <option value="PO">PO</option>
                <option value="INVOICE">Invoice</option>
                <option value="PACKING_LIST">Packing list</option>
                <option value="BILL_OF_LADING">Bill of lading</option>
                <option value="INSPECTION_REPORT">Inspection report</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <div className="grid-2">
              <label className="field">
                <span>File name, local only</span>
                <input value={fileName} onChange={(event) => setFileName(event.target.value)} required />
              </label>
              <label className="field">
                <span>File type, local only</span>
                <input value={fileType} onChange={(event) => setFileType(event.target.value)} required />
              </label>
            </div>
            <label className="field">
              <span>File size, local only</span>
              <input type="number" min="1" value={fileSize} onChange={(event) => setFileSize(event.target.value)} required />
            </label>
            <label className="field">
              <span>Local proof input, hashed in browser</span>
              <textarea value={textSummary} onChange={(event) => setTextSummary(event.target.value)} required />
            </label>
            {error ? <p className="badge bad">{error}</p> : null}
            <button className="primary" type="submit">
              Write document proof
            </button>
          </form>
        </div>
        <DocumentTable documents={documents} />
      </section>
    </>
  );
}

export function ProofGraphPage({ caseId }: { caseId: string }) {
  const [cache, setCache] = useState<P1ContractRegistryCache | null>(null);

  useEffect(() => {
    setCache(loadP1RegistryCache());
  }, []);

  const detail = cache ? getContractCaseDetail(cache, caseId) : null;
  if (!detail) {
    return <MissingCase />;
  }
  const { financingCase, graph, gates } = detail;

  return (
    <>
      <section className="page-head">
        <div>
          <h1>Proof graph</h1>
          <p>{financingCase.caseNo} from registry document proof events.</p>
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
                <th>Kind</th>
                <th>Status</th>
                <th>Hash</th>
              </tr>
            </thead>
            <tbody>
              {graph.nodes.map((node) => (
                <tr key={node.id}>
                  <td>{node.proofType}</td>
                  <td>{node.kind}</td>
                  <td><StatusBadge status={node.status} /></td>
                  <td className="hash">{node.documentHash}</td>
                </tr>
              ))}
              {graph.nodes.length === 0 ? <EmptyRow label="No registry proof nodes yet." /> : null}
            </tbody>
          </table>
        </div>
        <GateTable gates={gates} />
      </section>
    </>
  );
}

export function StateMachinePage({ caseId }: { caseId: string }) {
  const [cache, setCache] = useState<P1ContractRegistryCache | null>(null);

  useEffect(() => {
    setCache(loadP1RegistryCache());
  }, []);

  const detail = cache ? getContractCaseDetail(cache, caseId) : null;
  if (!detail) {
    return <MissingCase />;
  }
  const { state } = detail;
  const activeIndex = CONTRACT_CASE_STATES.indexOf(state.state);

  return (
    <>
      <section className="page-head">
        <div>
          <h1>Contract state machine</h1>
          <p>{state.explanation}</p>
        </div>
        <span className="badge bad">Funding execution blocked</span>
      </section>
      <section className="panel timeline">
        {CONTRACT_CASE_STATES.map((item, index) => (
          <div className="timeline-item" key={item}>
            <span className={index <= activeIndex ? "dot active" : "dot"} />
            <div>
              <h3>{item}</h3>
              <p>Pre-funding registry state. No disbursed, financed, or settled state exists in P1.1.</p>
            </div>
          </div>
        ))}
      </section>
      <section className="grid-3">
        <div className="metric">
          <div className="label">Source</div>
          <div className="value">Contract events</div>
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
  const [cache, setCache] = useState<P1ContractRegistryCache | null>(null);

  useEffect(() => {
    setCache(loadP1RegistryCache());
  }, []);

  const detail = cache ? getContractCaseDetail(cache, caseId) : null;
  if (!detail) {
    return <MissingCase />;
  }
  const { financingCase, auditLog } = detail;

  return (
    <>
      <section className="page-head">
        <div>
          <h1>Contract event audit log</h1>
          <p>Registry event history for {financingCase.caseNo}.</p>
        </div>
      </section>
      <section className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Block</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Transaction</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {auditLog.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.blockNumber.toString()}</td>
                <td>{entry.actor}</td>
                <td>{entry.action}</td>
                <td className="hash">{entry.transactionHash}</td>
                <td>{entry.summary}</td>
              </tr>
            ))}
            {auditLog.length === 0 ? <EmptyRow label="No registry events yet." /> : null}
          </tbody>
        </table>
      </section>
    </>
  );
}

function CaseList({ cases }: { cases: ContractBackedCase[] }) {
  return (
    <section className="table-panel">
      <table>
        <thead>
          <tr>
            <th>Case</th>
            <th>Buyer display</th>
            <th>Amount display</th>
            <th>Commitment</th>
            <th>Open</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((item) => (
            <tr key={item.id}>
              <td>{item.caseNo}</td>
              <td>{item.buyerName}</td>
              <td>{formatMoney(item.amount, item.currency)}</td>
              <td className="hash">{item.caseCommitment}</td>
              <td>
                <Link className="button" href={`/exporter/cases/${item.id}`}>
                  Open
                </Link>
              </td>
            </tr>
          ))}
          {cases.length === 0 ? <EmptyRow label="No registry cases yet." /> : null}
        </tbody>
      </table>
    </section>
  );
}

function DocumentTable({ documents }: { documents: ContractBackedDocumentDisplay[] }) {
  return (
    <div className="table-panel">
      <table>
        <thead>
          <tr>
            <th>Document</th>
            <th>Metadata hash</th>
            <th>Document hash</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              <td>
                <strong>{document.kind}</strong>
                <br />
                <span className="label">{document.fileName} stays local</span>
              </td>
              <td className="hash">{document.metadataHash}</td>
              <td className="hash">{document.documentHash}</td>
            </tr>
          ))}
          {documents.length === 0 ? <EmptyRow label="No document proofs yet." /> : null}
        </tbody>
      </table>
    </div>
  );
}

function GateTable({ gates }: { gates: ContractGate[] }) {
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
      <p>Create a case commitment first, then open proof graph, state machine, or audit log from the case detail page.</p>
      <Link className="button primary" href="/exporter/cases/new">
        New exporter case
      </Link>
    </section>
  );
}
