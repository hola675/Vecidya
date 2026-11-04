import {
  DIAGNOSTIC_V9_ATTESTATION_TTL_MS,
  DIAGNOSTIC_V9_ATTESTATION_VERSION,
  DIAGNOSTIC_V9_RESULT_VERSION,
  type DiagnosticV9Attestation,
  type DiagnosticV9CanonicalResult,
} from "./attestation-contract";

export const DIAGNOSTIC_V9_FINAL_RESULT_STORAGE_VERSION = 1 as const;
export const DIAGNOSTIC_V9_FINAL_RESULT_STORAGE_KEY = "vecidya.diagnostic.v9.final-result.1";

export type DiagnosticV9FinalResultEnvelope = {
  readonly storageVersion: typeof DIAGNOSTIC_V9_FINAL_RESULT_STORAGE_VERSION;
  readonly result: DiagnosticV9CanonicalResult;
  readonly attestation: DiagnosticV9Attestation;
};

export type DiagnosticV9FinalResultReadResult =
  | { readonly status: "found"; readonly envelope: DiagnosticV9FinalResultEnvelope }
  | { readonly status: "empty" | "expired" | "invalid" | "unavailable" };

export function parseDiagnosticV9FinalResult(raw: string, now: number): DiagnosticV9FinalResultReadResult {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return { status: "invalid" }; }
  if (!Number.isSafeInteger(now) || !value || typeof value !== "object" || Array.isArray(value)) return { status: "invalid" };
  const record = value as Record<string, unknown>;
  if (record.storageVersion !== DIAGNOSTIC_V9_FINAL_RESULT_STORAGE_VERSION ||
    !record.result || typeof record.result !== "object" || Array.isArray(record.result) ||
    !record.attestation || typeof record.attestation !== "object" || Array.isArray(record.attestation)) return { status: "invalid" };
  const result = record.result as Record<string, unknown>;
  const attestation = record.attestation as Record<string, unknown>;
  if (result.resultVersion !== DIAGNOSTIC_V9_RESULT_VERSION || typeof result.completedAt !== "string" ||
    !result.core || typeof result.core !== "object" || attestation.attestationVersion !== DIAGNOSTIC_V9_ATTESTATION_VERSION ||
    typeof attestation.issuedAt !== "string" || typeof attestation.expiresAt !== "string") return { status: "invalid" };
  const issuedAt = Date.parse(attestation.issuedAt);
  const expiresAt = Date.parse(attestation.expiresAt);
  if (!Number.isSafeInteger(issuedAt) || !Number.isSafeInteger(expiresAt) ||
    new Date(issuedAt).toISOString() !== attestation.issuedAt || new Date(expiresAt).toISOString() !== attestation.expiresAt ||
    expiresAt !== issuedAt + DIAGNOSTIC_V9_ATTESTATION_TTL_MS) return { status: "invalid" };
  if (now >= expiresAt) return { status: "expired" };
  return {
    status: "found",
    envelope: {
      storageVersion: DIAGNOSTIC_V9_FINAL_RESULT_STORAGE_VERSION,
      result: record.result as DiagnosticV9CanonicalResult,
      attestation: record.attestation as DiagnosticV9Attestation,
    },
  };
}

export function buildDiagnosticV9FinalResultEnvelope(
  result: DiagnosticV9CanonicalResult,
  attestation: DiagnosticV9Attestation,
): DiagnosticV9FinalResultEnvelope {
  return { storageVersion: DIAGNOSTIC_V9_FINAL_RESULT_STORAGE_VERSION, result, attestation };
}
