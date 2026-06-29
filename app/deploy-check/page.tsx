export default function DeployCheckPage() {
  return (
    <main style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}>
      <h1>ChainTrace Deploy Check</h1>
      <p>Current intended build: Business Sidecar workspace.</p>
      <ul>
        <li>Expected public nav item: Business sidecar / 业务 Sidecar</li>
        <li>Expected workspace route: /business-ops</li>
        <li>Expected legacy redirect: /business → /business-ops</li>
      </ul>
      <p>If this page is not visible in production, Vercel is serving an old deployment or a different project/source.</p>
    </main>
  );
}
