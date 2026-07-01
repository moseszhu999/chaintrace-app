import { redirect } from "next/navigation";
import { safeGetCurrentTradeCase } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

export default async function EvidencePage() {
  const trade = await safeGetCurrentTradeCase();
  redirect(`/cases/${trade.id}/evidence`);
}
