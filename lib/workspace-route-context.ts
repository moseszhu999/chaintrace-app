import { demoWorkspace } from "@/lib/demo-workspace-data";
import { getIsZhRequest } from "@/lib/request-locale";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

export async function getWorkspaceRouteContext() {
  let zh = false;
  let workspace = demoWorkspace;

  try {
    zh = await getIsZhRequest();
  } catch (error) {
    console.error("Falling back to English locale for workspace route", error);
  }

  try {
    workspace = await getWorkspaceSnapshot();
  } catch (error) {
    console.error("Falling back to demo workspace snapshot for workspace route", error);
  }

  return { zh, workspace };
}
