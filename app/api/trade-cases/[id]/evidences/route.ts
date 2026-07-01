import { createHash } from "node:crypto";
import { apiError, apiSuccess, apiUnknownError } from "@/lib/api-response";
import { createV2EvidenceUpload, listV2EvidenceForCase } from "@/lib/repositories/v2-evidence-repository";
import { getV2TradeCaseWorkspace } from "@/lib/repositories/v2-trade-case-repository";
import { isEvidenceType } from "@/lib/v2/evidence-types";
import { resolveRequestIdentity } from "@/lib/v2/request-identity";
import { isTradeStage } from "@/lib/v2/trade-case-types";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function sha256(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const identity = resolveRequestIdentity(request);
    const workspaceResult = await getV2TradeCaseWorkspace(id, identity.email, identity.name);
    if (!workspaceResult.workspace || !workspaceResult.context.organization) {
      return apiError("TRADE_CASE_NOT_FOUND", "Trade case not found or not accessible.", { status: 404 });
    }
    const evidence = await listV2EvidenceForCase(id);
    return apiSuccess({ mode: "v2_evidence_registry", context: workspaceResult.context, evidence });
  } catch (error) {
    return apiUnknownError(error, "Failed to list v2 evidence.");
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const payload = Object.fromEntries(formData.entries());
    const identity = resolveRequestIdentity(request, payload);
    const workspaceResult = await getV2TradeCaseWorkspace(id, identity.email, identity.name);

    if (!workspaceResult.workspace || !workspaceResult.context.organization) {
      return apiError("TRADE_CASE_NOT_FOUND", "Trade case not found or not accessible.", { status: 404 });
    }

    const evidenceType = clean(formData.get("evidenceType"));
    const stageCode = clean(formData.get("stageCode"));
    const fileValue = formData.get("file");

    if (!isEvidenceType(evidenceType)) return apiError("INVALID_EVIDENCE_TYPE", "A valid evidenceType is required.", { status: 400 });
    if (!isTradeStage(stageCode)) return apiError("INVALID_STAGE_CODE", "A valid stageCode is required.", { status: 400 });
    if (!(fileValue instanceof File)) return apiError("INVALID_FILE", "A file is required.", { status: 400 });

    const bytes = Buffer.from(await fileValue.arrayBuffer());
    const fileHash = sha256(bytes);

    const result = await createV2EvidenceUpload({
      userEmail: identity.email,
      userName: identity.name,
      caseId: id,
      organizationId: workspaceResult.context.organization.id,
      evidenceType,
      stageCode,
      filename: fileValue.name || `${evidenceType}.bin`,
      mimeType: fileValue.type || "application/octet-stream",
      fileSize: fileValue.size,
      sha256: fileHash,
    });

    return apiSuccess({
      mode: "v2_evidence_registry",
      evidence: result.evidence,
      file: result.file,
      storageBoundary: "raw file bytes were read for SHA-256; v2.1 stores metadata/hash only unless external storage is configured",
      rawFilePublic: false,
    }, { status: 201 });
  } catch (error) {
    return apiUnknownError(error, "Failed to upload v2 evidence.");
  }
}
