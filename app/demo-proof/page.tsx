import { Suspense } from "react";
import { DemoProofClient } from "@/components/DemoProofClient";

function DemoProofFallback() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">ChainTrace Demo Proof</div>
        <h1>Loading demo proof</h1>
        <p>Preparing the gas-free proof page.</p>
      </section>
    </main>
  );
}

export default function DemoProofPage() {
  return (
    <Suspense fallback={<DemoProofFallback />}>
      <DemoProofClient />
    </Suspense>
  );
}
