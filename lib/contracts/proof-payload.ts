import { ContractDocumentKind, Hex32 } from "@/lib/contracts/types";

export interface DocumentProofMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  documentKind: ContractDocumentKind;
}

export interface DocumentProofPayloadInput {
  rawBytes: Uint8Array;
  metadata: DocumentProofMetadata;
}

export interface DocumentProofPayload {
  documentHash: Hex32;
  metadataHash: Hex32;
  kind: ContractDocumentKind;
}

export async function hashDocumentMetadata(metadata: DocumentProofMetadata): Promise<Hex32> {
  return sha256Hex(stableMetadataJson(metadata));
}

export async function buildDocumentProofPayload(
  input: DocumentProofPayloadInput
): Promise<DocumentProofPayload> {
  return {
    documentHash: await sha256Bytes(input.rawBytes),
    metadataHash: await hashDocumentMetadata(input.metadata),
    kind: input.metadata.documentKind
  };
}

function stableMetadataJson(metadata: DocumentProofMetadata): string {
  return JSON.stringify({
    documentKind: metadata.documentKind,
    fileName: metadata.fileName,
    fileSize: metadata.fileSize,
    fileType: metadata.fileType
  });
}

async function sha256Bytes(bytes: Uint8Array): Promise<Hex32> {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return toHex32(new Uint8Array(digest));
}

async function sha256Hex(input: string): Promise<Hex32> {
  return sha256Bytes(new TextEncoder().encode(input));
}

function toHex32(bytes: Uint8Array): Hex32 {
  return `0x${Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}
