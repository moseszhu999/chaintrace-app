import { createPublicClient, http, parseEventLogs } from "viem";
import { chaintraceChain, proofRegistryAddress } from "@/lib/chaintraceConfig";
import { proofRegistryAbi } from "@/lib/proofRegistryAbi";

export const publicClient = createPublicClient({
  chain: chaintraceChain,
  transport: http(chaintraceChain.rpcUrls.default.http[0]),
});

export type ChainTraceProof = {
  submitter: `0x${string}`;
  fileHash: `0x${string}`;
  proofType: string;
  uri: string;
  metadataHash: `0x${string}`;
  timestamp: bigint;
};

type RawProofObject = Partial<ChainTraceProof> & {
  0?: `0x${string}`;
  1?: `0x${string}`;
  2?: string;
  3?: string;
  4?: `0x${string}`;
  5?: bigint;
};

function normalizeProof(rawProof: unknown): ChainTraceProof {
  const proof = rawProof as RawProofObject;

  const submitter = proof.submitter ?? proof[0];
  const fileHash = proof.fileHash ?? proof[1];
  const proofType = proof.proofType ?? proof[2];
  const uri = proof.uri ?? proof[3] ?? "";
  const metadataHash = proof.metadataHash ?? proof[4];
  const timestamp = proof.timestamp ?? proof[5];

  if (!submitter || !fileHash || !proofType || !metadataHash || timestamp === undefined) {
    throw new Error("ProofRegistry returned an unexpected proof shape.");
  }

  return {
    submitter,
    fileHash,
    proofType,
    uri,
    metadataHash,
    timestamp,
  };
}

export async function getProofById(proofId: bigint): Promise<ChainTraceProof> {
  const rawProof = await publicClient.readContract({
    address: proofRegistryAddress,
    abi: proofRegistryAbi,
    functionName: "getProof",
    args: [proofId],
  });

  return normalizeProof(rawProof);
}

export async function waitForProofRegistered(txHash: `0x${string}`): Promise<{
  proofId: bigint;
  submitter: `0x${string}`;
  fileHash: `0x${string}`;
}> {
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  const logs = parseEventLogs({
    abi: proofRegistryAbi,
    eventName: "ProofRegistered",
    logs: receipt.logs,
  });

  const event = logs[0];

  if (!event) {
    throw new Error("ProofRegistered event was not found in the transaction receipt.");
  }

  return {
    proofId: event.args.proofId,
    submitter: event.args.submitter,
    fileHash: event.args.fileHash,
  };
}
