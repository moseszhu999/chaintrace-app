import { createHash, randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { getOrCreateV2User } from "@/lib/repositories/v2-organization-repository";
import type { CreateEvidenceUploadInputV2, EvidenceFileRecordV2, EvidenceListItemV2, EvidenceRecordV2, EvidenceWorkspaceV2 } from "@/lib/v2/evidence-types";

type EvidencePersistenceModeV2 = "neon_v2_evidence_store" | "runtime_v2_evidence_store";

type EvidenceRepositoryV2 = {
  listEvidenceForCase(caseId: string): Promise<EvidenceListItemV2[]>;
  createEvidenceUpload(input: CreateEvidenceUploadInputV2): Promise<EvidenceWorkspaceV2>;
};

function nowIso() {
  return new Date().toISOString();
}

function hashText(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured for the v2 evidence store.");
  return url;
}

export function getEvidencePersistenceModeV2(): EvidencePersistenceModeV2 {
  return process.env.DATABASE_URL ? "neon_v2_evidence_store" : "runtime_v2_evidence_store";
}

const runtimeEvidences = new Map<string, EvidenceRecordV2>();
const runtimeEvidenceFiles = new Map<string, EvidenceFileRecordV2>();

function cloneEvidence(record: EvidenceRecordV2): EvidenceRecordV2 {
  return { ...record };
}

function cloneFile(record: EvidenceFileRecordV2): EvidenceFileRecordV2 {
  return { ...record };
}

function createRuntimeEvidenceRepository(): EvidenceRepositoryV2 {
  return {
    async listEvidenceForCase(caseId) {
      return Array.from(runtimeEvidences.values())
        .filter((record) => record.caseId === caseId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((record) => ({ ...cloneEvidence(record), file: Array.from(runtimeEvidenceFiles.values()).find((file) => file.evidenceId === record.id) ?? null }));
    },
    async createEvidenceUpload(input) {
      const user = await getOrCreateV2User(input.userEmail, input.userName);
      const createdAt = nowIso();
      const evidence: EvidenceRecordV2 = {
        id: randomUUID(),
        caseId: input.caseId,
        evidenceType: input.evidenceType,
        stageCode: input.stageCode,
        ownerOrgId: input.organizationId,
        issuerOrgId: input.organizationId,
        status: "HASHED",
        visibilityScope: "PRIVATE",
        createdBy: user.id,
        createdAt,
        updatedAt: createdAt,
        evidenceHash: input.sha256,
        evidenceRegistryEvent: null,
      };
      const file: EvidenceFileRecordV2 = {
        id: randomUUID(),
        evidenceId: evidence.id,
        filename: input.filename,
        mimeType: input.mimeType ?? null,
        fileSize: input.fileSize,
        storageUri: `metadata-only://${input.sha256}`,
        sha256: input.sha256,
        uploadedBy: user.id,
        uploadedAt: createdAt,
        fileHashCommitment: input.sha256,
        storagePointerHash: hashText(`metadata-only://${input.sha256}`),
      };
      runtimeEvidences.set(evidence.id, evidence);
      runtimeEvidenceFiles.set(file.id, file);
      return { evidence: cloneEvidence(evidence), file: cloneFile(file) };
    },
  };
}

type EvidenceRow = {
  id: string;
  case_id: string;
  evidence_type: EvidenceRecordV2["evidenceType"];
  stage_code: string;
  owner_org_id: string | null;
  issuer_org_id: string | null;
  status: EvidenceRecordV2["status"];
  visibility_scope: EvidenceRecordV2["visibilityScope"];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  evidence_hash: string | null;
  evidence_registry_event: string | null;
  file_id?: string | null;
  filename?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  storage_uri?: string | null;
  sha256?: string | null;
  uploaded_by?: string | null;
  uploaded_at?: string | null;
  file_hash_commitment?: string | null;
  storage_pointer_hash?: string | null;
};

function mapEvidence(row: EvidenceRow): EvidenceRecordV2 {
  return {
    id: row.id,
    caseId: row.case_id,
    evidenceType: row.evidence_type,
    stageCode: row.stage_code,
    ownerOrgId: row.owner_org_id,
    issuerOrgId: row.issuer_org_id,
    status: row.status,
    visibilityScope: row.visibility_scope,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    evidenceHash: row.evidence_hash,
    evidenceRegistryEvent: row.evidence_registry_event,
  };
}

function mapFile(row: EvidenceRow): EvidenceFileRecordV2 | null {
  if (!row.file_id || !row.filename || !row.storage_uri || !row.sha256) return null;
  return {
    id: row.file_id,
    evidenceId: row.id,
    filename: row.filename,
    mimeType: row.mime_type ?? null,
    fileSize: row.file_size ?? null,
    storageUri: row.storage_uri,
    sha256: row.sha256,
    uploadedBy: row.uploaded_by ?? null,
    uploadedAt: row.uploaded_at ?? row.created_at,
    fileHashCommitment: row.file_hash_commitment ?? null,
    storagePointerHash: row.storage_pointer_hash ?? null,
  };
}

function createNeonEvidenceRepository(): EvidenceRepositoryV2 {
  const sql = neon(getDatabaseUrl());
  return {
    async listEvidenceForCase(caseId) {
      const rows = await sql`
        select
          e.id, e.case_id, e.evidence_type, e.stage_code, e.owner_org_id, e.issuer_org_id, e.status, e.visibility_scope, e.created_by, e.created_at::text, e.updated_at::text, e.evidence_hash, e.evidence_registry_event,
          f.id as file_id, f.filename, f.mime_type, f.file_size, f.storage_uri, f.sha256, f.uploaded_by, f.uploaded_at::text, f.file_hash_commitment, f.storage_pointer_hash
        from evidences e
        left join evidence_files f on f.evidence_id = e.id
        where e.case_id = ${caseId}
        order by e.updated_at desc;
      ` as EvidenceRow[];
      return rows.map((row) => ({ ...mapEvidence(row), file: mapFile(row) }));
    },
    async createEvidenceUpload(input) {
      const user = await getOrCreateV2User(input.userEmail, input.userName);
      const storageUri = `metadata-only://${input.sha256}`;
      const evidenceRows = await sql`
        insert into evidences (case_id, evidence_type, stage_code, owner_org_id, issuer_org_id, status, visibility_scope, created_by, evidence_hash)
        values (${input.caseId}, ${input.evidenceType}::evidence_type, ${input.stageCode}::trade_stage, ${input.organizationId}, ${input.organizationId}, ${"HASHED"}::evidence_status, ${"PRIVATE"}::visibility_scope, ${user.id}, ${input.sha256})
        returning id, case_id, evidence_type, stage_code, owner_org_id, issuer_org_id, status, visibility_scope, created_by, created_at::text, updated_at::text, evidence_hash, evidence_registry_event;
      ` as EvidenceRow[];
      const evidence = mapEvidence(evidenceRows[0]);
      const fileRows = await sql`
        insert into evidence_files (evidence_id, filename, mime_type, file_size, storage_uri, sha256, uploaded_by, file_hash_commitment, storage_pointer_hash)
        values (${evidence.id}, ${input.filename}, ${input.mimeType ?? null}, ${input.fileSize}, ${storageUri}, ${input.sha256}, ${user.id}, ${input.sha256}, ${hashText(storageUri)})
        returning id as file_id, filename, mime_type, file_size, storage_uri, sha256, uploaded_by, uploaded_at::text, file_hash_commitment, storage_pointer_hash;
      ` as EvidenceRow[];
      const file = mapFile({ ...evidenceRows[0], ...fileRows[0], id: evidence.id });
      if (!file) throw new Error("EVIDENCE_FILE_CREATE_FAILED");
      await sql`
        insert into evidence_hashes (evidence_id, algorithm, hash_value, calculated_by)
        values (${evidence.id}, ${"SHA-256"}, ${input.sha256}, ${user.id});
      `;
      return { evidence, file };
    },
  };
}

const runtimeRepository = createRuntimeEvidenceRepository();

function createEvidenceRepository(): EvidenceRepositoryV2 {
  return getEvidencePersistenceModeV2() === "neon_v2_evidence_store"
    ? createNeonEvidenceRepository()
    : runtimeRepository;
}

async function withRuntimeFallback<T>(operation: (repository: EvidenceRepositoryV2) => Promise<T>): Promise<T> {
  const repository = createEvidenceRepository();
  try {
    return await operation(repository);
  } catch (error) {
    if (getEvidencePersistenceModeV2() === "runtime_v2_evidence_store") throw error;
    console.error("v2 evidence Neon store failed; using runtime fallback.", error);
    return operation(runtimeRepository);
  }
}

export async function listV2EvidenceForCase(caseId: string) {
  return withRuntimeFallback((repository) => repository.listEvidenceForCase(caseId));
}

export async function createV2EvidenceUpload(input: CreateEvidenceUploadInputV2) {
  return withRuntimeFallback((repository) => repository.createEvidenceUpload(input));
}
