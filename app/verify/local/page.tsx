import { LocalVerifyClient } from "@/components/v2/LocalVerifyClient";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export const dynamic = "force-dynamic";

export default async function LocalVerifyRoute() {
  const context = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame
      zh={context.zh}
      active="verify"
      workspace={context.workspace}
      role={context.role}
      header={{
        eyebrowZh: "proof-safe verify",
        eyebrowEn: "proof-safe verify",
        titleZh: "本地 Proof 验证",
        titleEn: "Local Proof Verify",
        subtitleZh: "粘贴 Recovery Kit / Case Kit，在浏览器本地重算 hash 和验证钱包签名。",
        subtitleEn: "Paste a Recovery Kit / Case Kit and verify hash/signature locally in the browser.",
      }}
    >
      <LocalVerifyClient zh={context.zh} />
    </WorkspaceFrame>
  );
}
