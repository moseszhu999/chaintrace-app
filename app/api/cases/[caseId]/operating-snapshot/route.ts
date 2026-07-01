import { apiSuccess } from "@/lib/api-response";
import { getCaseOperatingSnapshot } from "@/lib/case-operating-snapshot";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const snapshot = await getCaseOperatingSnapshot(caseId);
  return apiSuccess({ snapshot });
}
