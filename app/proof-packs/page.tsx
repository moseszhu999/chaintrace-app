import { cookies } from "next/headers";
import { ProofPacksView } from "@/components/workspace/ProofPacksView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { normalizeLocale } from "@/lib/i18n";

export default async function ProofPacksPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <WorkspaceShell zh={zh} active="proofPacks" actionSlot={<a className="primary-button" href="/evidence">{zh ? "补证据" : "Complete evidence"}</a>}>
      <ProofPacksView zh={zh} />
    </WorkspaceShell>
  );
}
