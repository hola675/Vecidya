import type { Qa03bWorkerCoreResultV9 } from "../qa03b/worker-replay-v9.server";

export const DIAGNOSTIC_V9_ATTESTATION_VERSION = "diagnostic-attestation-v1" as const;
export const DIAGNOSTIC_V9_RESULT_VERSION = "diagnostic-result-v1" as const;
export const DIAGNOSTIC_V9_ATTESTATION_TTL_MS = 24 * 60 * 60 * 1000;

export type DiagnosticV9CanonicalResult = {
  readonly resultVersion: typeof DIAGNOSTIC_V9_RESULT_VERSION;
  readonly completedAt: string;
  readonly core: Qa03bWorkerCoreResultV9;
};

export type DiagnosticV9AttestationClaims = {
  readonly attestationVersion: typeof DIAGNOSTIC_V9_ATTESTATION_VERSION;
  readonly attestationId: string;
  readonly resultDigest: string;
  readonly digestAlgorithm: "SHA-256";
  readonly signatureAlgorithm: "Ed25519";
  readonly keyId: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
};

export type DiagnosticV9Attestation = DiagnosticV9AttestationClaims & { readonly signature: string };
