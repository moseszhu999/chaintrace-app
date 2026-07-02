"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";

import { clearCurrentUserId, getCurrentUser, loadP1Store } from "@/lib/p1-client-store";
import { P1Store, Role, roleLabel } from "@/lib/p1-domain";

interface P1ShellProps {
  children: ReactNode;
  requiredRole?: Role;
}

export function P1Shell({ children, requiredRole }: P1ShellProps) {
  const router = useRouter();
  const [store, setStore] = useState<P1Store | null>(null);

  useEffect(() => {
    setStore(loadP1Store());
  }, []);

  const user = useMemo(() => (store ? getCurrentUser(store) : null), [store]);

  if (!store) {
    return <main className="entry">Loading P1 workspace...</main>;
  }

  if (!user) {
    return (
      <main className="entry">
        <section className="panel">
          <h1>Sign in required</h1>
          <p>A mock wallet session is required before opening a role workspace.</p>
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
          <span className="badge info">{user.walletAddress}</span>
          <span className="badge ok">Role locked</span>
          <button
            onClick={() => {
              clearCurrentUserId();
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
            No real wallet signature, chain write, USDC transfer, bank core API,
            KYB API, insurance API, or customs integration is enabled.
          </div>
        </aside>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
