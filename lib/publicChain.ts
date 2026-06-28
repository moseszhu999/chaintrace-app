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

export async function getProofById(proofId: bigint): Promise<ChainTraceProof> {
  return publicClient.readContract({
    address: proofRegistryAddress,
    abi: proofRegistryAbi,
    functionName: "getProof",
    args: [proofId],
  }) as Promise<ChainTraceProof>;
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
