import { apiError, apiSuccess } from "@/lib/api-response";
import { getCaseReviewSummary } from "@/lib/case-review-handoff";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;

  try {
    const reviewSummary = await getCaseReviewSummary(caseId);
    return apiSuccess({ reviewSummary });
  } catch (error) {
    if (error instanceof Error && error.message === "CASE_NOT_FOUND") {
      return apiError("CASE_NOT_FOUND", `Case ${caseId} was not found.`, { status: 404 });
    }
    return apiError("CASE_REVIEW_SUMMARY_FAILED", error instanceof Error ? error.message : "Unknown case review summary error.", { status: 500 });
  }
}
