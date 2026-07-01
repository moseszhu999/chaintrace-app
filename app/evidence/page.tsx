import { LocalEvidenceClient } from "@/components/v2/LocalEvidenceClient";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export const dynamic = "force-dynamic";

export default async function EvidencePage() {
  const context = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame
      zh={context.zh}
      active="evidence"
      workspace={context.workspace}
      role={context.role}
      header={{
        eyebrowZh: "local-first evidence",
        eyebrowEn: "local-first evidence",
        titleZh: "本地 Evidence Hash",
        titleEn: "Local Evidence Hash",
        subtitleZh: "文件不上传服务器；浏览器本地计算 SHA-256，并挂到 Case root。",
        subtitleEn: "Files are not uploaded; the browser computes SHA-256 locally and attaches it to the case root.",
      }}
    >
      <LocalEvidenceClient zh={context.zh} />
    </WorkspaceFrame>
  );
}
