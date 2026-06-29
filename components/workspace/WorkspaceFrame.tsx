import Link from "next/link";
import type { ReactNode } from "react";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import type { WorkspaceNavKey } from "@/lib/workspace-navigation";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";

type WorkspaceFrameAction = {
  href: string;
  labelZh: string;
  labelEn: string;
  variant?: "primary" | "secondary";
};

type WorkspaceFrameProps = {
  zh: boolean;
  active: WorkspaceNavKey;
  workspace: WorkspaceSnapshot;
  children: ReactNode;
  action?: WorkspaceFrameAction;
  actionSlot?: ReactNode;
};

function renderAction(zh: boolean, action?: WorkspaceFrameAction, actionSlot?: ReactNode) {
  if (actionSlot) return actionSlot;
  if (!action) return undefined;

  return (
    <Link className={action.variant === "secondary" ? "secondary-button" : "primary-button"} href={action.href}>
      {zh ? action.labelZh : action.labelEn}
    </Link>
  );
}

export function WorkspaceFrame(props: WorkspaceFrameProps) {
  return (
    <WorkspaceShell zh={props.zh} active={props.active} workspace={props.workspace} actionSlot={renderAction(props.zh, props.action, props.actionSlot)}>
      {props.children}
    </WorkspaceShell>
  );
}
