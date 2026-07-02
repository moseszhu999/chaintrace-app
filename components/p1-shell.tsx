"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";

import { getChainTraceMode, getConfiguredChainId, getConfiguredRegistryAddress } from "@/lib/contracts/p1-local-chain-mode";
import {
  clearCurrentWallet,
  getCurrentUser,
  loadP1RegistryCache,
  P1ContractRegistryCache
} from "@/lib/p1-client-store";
import { Role, roleLabel } from "@/lib/p1-domain";

interface P1ShellProps {
  children: ReactNode;
  requiredRole?: Role;
}

export function P1Shell({ children, requiredRole }: P1ShellProps) {
  const router = useRouter();
  const [cache, setCache] = useState<P1ContractRegistryCache | null>(null);

  useEffect(() => {
    setCache(loadP1RegistryCache());
  }, []);

  const user = useMemo(() => (cache ? getCurrentUser(cache) : null), [cache]);
  const mode = getChainTraceMode();
  const registryAddress = getConfiguredRegistryAddress();

  if (!cache) {
    return <main className="entry">Loading P1 workspace...</main>;
  }

  if (!user) {
    return (
      <main className="entry">
        <section className="panel">
          <h1>Sign in required</h1>
          <p>A wallet session is required before opening a role workspace.</p>
          <Link className="button primary" href="/login">
            Go to login
          </Link>
        </section>
      </main>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <main className="entry">
        <section className="panel">
          <h1>Role boundary enforced</h1>
          <p>
            This wallet is locked to {roleLabel(user.role)}. It cannot open the{" "}
            {roleLabel(requiredRole)} workspace or mutate another role's records.
          </p>
          <Link className="button primary" href="/dashboard">
            Return to own dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="topbar-brand" href="/dashboard">
          <span className="brand-mark">CT</span>
          <span>
            ChainTrace P1
            <span className="label" style={{ display: "block" }}>
              {roleLabel(user.role)} workspace
            </span>
          </span>
        </Link>
        <div className="toolbar">
          <span className="badge info">Mode: {mode}</span>
          {mode === "local-chain" ? <span className="badge info">Chain: {getConfiguredChainId()}</span> : null}
          {mode === "local-chain" && registryAddress ? (
            <span className="badge info">Registry: {registryAddress.slice(0, 8)}...{registryAddress.slice(-6)}</span>
          ) : null}
          <span className="badge info">{user.walletAddress}</span>
          <span className="badge ok">Role locked</span>
          <button
            onClick={() => {
              clearCurrentWallet();
              router.push("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      <div className="main-grid">
        <aside className="sidebar">
          <div className="nav-label">Workspace</div>
          <Link className="nav-link" href="/dashboard">
            My dashboard
          </Link>
          <Link className="nav-link" href="/exporter/dashboard">
            Exporter cases
          </Link>
          <div className="nav-label">Boundaries</div>
          <div className="notice">
            P1 is frontend plus smart-contract registry. Browser storage is only
            draft/display cache. No server database, raw document upload, real
            financing, or disbursement is enabled.
          </div>
        </aside>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
