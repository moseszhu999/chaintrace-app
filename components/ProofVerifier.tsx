"use client";

import { ChangeEvent, useState } from "react";
import { sha256File, shortHash } from "@/lib/hash";

export function ProofVerifier({ expectedHash }: { expectedHash: `0x${string}` }) {
  const [fileName, setFileName] = useState("");
  const [calculatedHash, setCalculatedHash] = useState<`0x${string}` | "">("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");

  const isMatch = calculatedHash && calculatedHash.toLowerCase() === expectedHash.toLowerCase();
  const isMismatch = calculatedHash && calculatedHash.toLowerCase() !== expectedHash.toLowerCase();

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");
    setCalculatedHash("");

    if (!file) return;

    try {
      setIsChecking(true);
      setFileName(file.name);
      const hash = await sha256File(file);
      setCalculatedHash(hash as `0x${string}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to verify file.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <section className="verify-box">
      <div>
        <strong>Verify the original file</strong>
        <p>
          Select the original file. ChainTrace will calculate its SHA-256 hash in your browser and compare it with the on-chain hash.
        </p>
      </div>

      <label>
        File to verify
        <input type="file" onChange={handleFileChange} />
      </label>

      {isChecking && <div className="notice">Calculating file hash locally...</div>}
      {error && <div className="error">{error}</div>}

      {calculatedHash && (
        <div className={isMatch ? "verify-result match" : "verify-result mismatch"}>
          <strong>{isMatch ? "Hash match" : "Hash mismatch"}</strong>
          <span>{fileName}</span>
          <span title={calculatedHash}>{shortHash(calculatedHash)}</span>
        </div>
      )}

      {isMismatch && (
        <p className="verify-warning">
          This file does not match the on-chain hash. It may be a different file, modified file, or corrupted copy.
        </p>
      )}
    </section>
  );
}
