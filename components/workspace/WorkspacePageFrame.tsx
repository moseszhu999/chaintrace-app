import type { ReactNode } from "react";
import { getIsZhRequest } from "@/lib/request-locale";
import { getWorkspaceSnapshot, type WorkspaceSnapshot } from "@/lib/workspace-repository";
import { WorkspaceShell, type WorkspaceNavKey } from "@/components/workspace/WorkspaceShell";

type WorkspacePageContext = {
  zh: boolean;
  workspace: WorkspaceSnapshot;
};

export async function WorkspacePageFrame({
  active,
  actionSlot,
  children,
}: {
  active: WorkspaceNavKey;
  actionSlot?: (zh: boolean) => ReactNode;
  children: (context: WorkspacePageContext) => ReactNode;
}) {
  const zh = await getIsZhRequest();
  const workspace = await getWorkspaceSnapshot();

  return (
    <WorkspaceShell zh={zh} active={active} workspace={workspace} actionSlot={actionSlot?.(zh)}>
      {children({ zh, workspace })}
    </WorkspaceShell>
  );
}
