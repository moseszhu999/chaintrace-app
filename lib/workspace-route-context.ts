import { getIsZhRequest } from "@/lib/request-locale";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

export async function getWorkspaceRouteContext() {
  const [zh, workspace] = await Promise.all([getIsZhRequest(), getWorkspaceSnapshot()]);

  return { zh, workspace };
}
