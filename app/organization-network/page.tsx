import { OrganizationNetworkClient } from "@/components/v2/OrganizationNetworkClient";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export const dynamic = "force-dynamic";

export default async function OrganizationNetworkRoute() {
  const context = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame
      zh={context.zh}
      active="organization"
      workspace={context.workspace}
      role={context.role}
      header={{
        eyebrowZh: "v2 真实底座",
        eyebrowEn: "v2 real foundation",
        titleZh: "组织网络",
        titleEn: "Organization Network",
        subtitleZh: "真实组织、成员、角色是 Case / Evidence / Passport 的前置条件。",
        subtitleEn: "Real organizations, members, and roles are prerequisites for Case / Evidence / Passport.",
      }}
    >
      <OrganizationNetworkClient zh={context.zh} initialContext={context.organizationContext} />
    </WorkspaceFrame>
  );
}
