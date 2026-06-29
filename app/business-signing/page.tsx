import { SigningContractView } from "@/components/workspace/SigningContractView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessSigningPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="signing" workspace={workspace} action={{ href: "/business-flows", labelZh: "四流合一", labelEn: "Four flows" }}>
      <SigningContractView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
