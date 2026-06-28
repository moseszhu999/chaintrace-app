export const proofRegistryAbi = [
  {
    type: "function",
    name: "registerProof",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fileHash", type: "bytes32" },
      { name: "proofType", type: "string" },
      { name: "uri", type: "string" },
      { name: "metadataHash", type: "bytes32" },
    ],
    outputs: [{ name: "proofId", type: "uint256" }],
  },
  {
    type: "event",
    name: "ProofRegistered",
    inputs: [
      { name: "proofId", type: "uint256", indexed: true },
      { name: "submitter", type: "address", indexed: true },
      { name: "fileHash", type: "bytes32", indexed: true },
      { name: "proofType", type: "string", indexed: false },
      { name: "uri", type: "string", indexed: false },
      { name: "metadataHash", type: "bytes32", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;
