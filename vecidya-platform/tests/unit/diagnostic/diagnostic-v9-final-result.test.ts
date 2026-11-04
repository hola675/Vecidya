import assert from "node:assert/strict";
import test from "node:test";

import { parseDiagnosticV9FinalResult } from "../../../app/features/diagnostic/v9/final-result";
import { DIAGNOSTIC_V9_ATTESTATION_TTL_MS, DIAGNOSTIC_V9_ATTESTATION_VERSION, DIAGNOSTIC_V9_RESULT_VERSION } from "../../../app/features/diagnostic/v9/attestation-contract";

const issuedAt = "2030-03-17T17:46:40.000Z";
const envelope = {
  storageVersion: 1,
  result: { resultVersion: DIAGNOSTIC_V9_RESULT_VERSION, completedAt: issuedAt, core: {} },
  attestation: {
    attestationVersion: DIAGNOSTIC_V9_ATTESTATION_VERSION,
    attestationId: "00000000-0000-4000-8000-000000000001",
    resultDigest: "digest",
    digestAlgorithm: "SHA-256",
    signatureAlgorithm: "Ed25519",
    keyId: "key-1",
    issuedAt,
    expiresAt: new Date(Date.parse(issuedAt) + DIAGNOSTIC_V9_ATTESTATION_TTL_MS).toISOString(),
    signature: "signature",
  },
};

test("local result is available only through attestation expiry", () => {
  const parsed = parseDiagnosticV9FinalResult(JSON.stringify(envelope), Date.parse(issuedAt));
  assert.equal(parsed.status, "found");
  assert.equal(parseDiagnosticV9FinalResult(JSON.stringify(envelope), Date.parse(issuedAt) + DIAGNOSTIC_V9_ATTESTATION_TTL_MS).status, "expired");
});

test("local result rejects malformed envelope and inconsistent TTL", () => {
  assert.equal(parseDiagnosticV9FinalResult("{", Date.parse(issuedAt)).status, "invalid");
  const malformed = { ...envelope, attestation: { ...envelope.attestation, expiresAt: issuedAt } };
  assert.equal(parseDiagnosticV9FinalResult(JSON.stringify(malformed), Date.parse(issuedAt)).status, "invalid");
});
