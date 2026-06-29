import type { ReactNode } from "react";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import type { WorkspaceNavKey } from "@/lib/workspace-navigation";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";

type WorkspaceFrameProps = {
  zh: boolean;
  active: WorkspaceNavKey;
  workspace: WorkspaceSnapshot;
  children: ReactNode;
  actionSlot?: ReactNode;
};

export function WorkspaceFrame(props: WorkspaceFrameProps) {
  return (
    <WorkspaceShell zh={props.zh} active={props.active} workspace={props.workspace} actionSlot={props.actionSlot}>
      {props.children}
    </WorkspaceShell>
  );
}
