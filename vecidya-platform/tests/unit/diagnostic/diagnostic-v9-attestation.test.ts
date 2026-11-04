import assert from "node:assert/strict";
import test from "node:test";

import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import {
  createCandidateSessionV9Prototype,
  currentCandidateQuestionIdV9,
  submitCandidateAnswerV9Prototype,
  submitClassificationV9Prototype,
  type CandidateSessionV9Prototype,
} from "../../../app/features/diagnostic/qa03b/v9-session-prototype";
import { finalizeAndAttestDiagnosticV9, canonicalizeDiagnosticJson } from "../../../app/features/diagnostic/v9/attestation.server";
import { verifyDiagnosticV9Attestation } from "../../../app/features/diagnostic/v9/attestation-verify";
import { V9_CURRENT_SCORING_VERSION } from "../../../app/features/diagnostic/v9/scoring-calibration-registry";
import { DIAGNOSTIC_V9_ATTESTATION_TTL_MS } from "../../../app/features/diagnostic/v9/attestation-contract";

const NOW = 1_900_000_000_000;
const bank = new Map(QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2.map((item) => [item.id, item]));

function finalizableSession(now = NOW): CandidateSessionV9Prototype {
  const explicit: Record<string, string | readonly string[]> = {
    q2_entity: "business", q2_other_staff: "yes", q2_has_customers: "yes",
    q2_operational_status: "operating", q2_monetization: "goods", q2_delivery: ["onsite"],
    q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "explain", q2_friction: "conversion",
    q2_presence_digital_base: "reliable_presence", q2_hospitality_flow_type: "reservation",
  };
  let session = createCandidateSessionV9Prototype({ sessionId: "attestation-test", writerId: "test", now });
  for (let turn = 0; turn < 29 && session.status === "in_progress"; turn++) {
    const id = currentCandidateQuestionIdV9(session);
    assert.ok(id);
    if (id === "q2_sector") {
      const result = submitClassificationV9Prototype(session, { sector: "food_hospitality", niche: "restaurant" }, "test", now + turn + 1);
      assert.equal(result.ok, true);
      if (result.ok) session = result.session;
      continue;
    }
    const question = bank.get(id);
    assert.ok(question);
    const neutral = question.options.find((option) => option.kind === "unknown") ?? question.options.find((option) => option.kind === "not_applicable");
    assert.ok(explicit[id] !== undefined || neutral);
    const result = submitCandidateAnswerV9Prototype(session, id,
      explicit[id] ?? (question.type === "multi" ? [neutral!.value] : neutral!.value), "test", now + turn + 1);
    assert.equal(result.ok, true);
    if (result.ok) session = result.session;
  }
  assert.equal(session.status, "completing");
  return session;
}

function base64(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

test("canonical JSON uses sorted keys and rejects values that are not valid JSON", () => {
  assert.equal(canonicalizeDiagnosticJson({ z: 1, a: [true, "x"] }), '{"a":[true,"x"],"z":1}');
  assert.throws(() => canonicalizeDiagnosticJson({ bad: Number.NaN }));
  assert.throws(() => canonicalizeDiagnosticJson({ bad: undefined }));
  assert.throws(() => canonicalizeDiagnosticJson("\ud800"));
});

test("signs the authoritative result and verifies digest, expiry, and revocation", async () => {
  const pair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  const privateKeyPkcs8 = base64(await crypto.subtle.exportKey("pkcs8", pair.privateKey));
  const publicKeySpki = base64(await crypto.subtle.exportKey("spki", pair.publicKey));
  const session = finalizableSession();
  const signed = await finalizeAndAttestDiagnosticV9({
    scoringVersion: V9_CURRENT_SCORING_VERSION,
    session,
    keyId: "test-key-1",
    privateKeyPkcs8,
    publicKeySpki,
    now: NOW + 1_000,
  });
  assert.equal(signed.ok, true, signed.ok ? undefined : signed.reason);
  if (!signed.ok) return;
  assert.equal(Date.parse(signed.attestation.expiresAt) - Date.parse(signed.attestation.issuedAt), DIAGNOSTIC_V9_ATTESTATION_TTL_MS);
  assert.equal("answers" in signed.result, false);
  assert.equal("replayTranscript" in signed.result, false);
  const verify = (result: unknown, now = NOW + 2_000, revokedKeyIds?: ReadonlySet<string>) =>
    verifyDiagnosticV9Attestation({ result, attestation: signed.attestation, publicKeys: { "test-key-1": publicKeySpki }, now, revokedKeyIds });
  assert.equal(await verify(signed.result), true);
  assert.equal(await verify({ ...signed.result, completedAt: new Date(NOW).toISOString() }), false);
  assert.equal(await verify(signed.result, Date.parse(signed.attestation.expiresAt)), false);
  assert.equal(await verify(signed.result, NOW + 2_000, new Set(["test-key-1"])), false);
  const otherPair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  const mismatched = await finalizeAndAttestDiagnosticV9({
    scoringVersion: V9_CURRENT_SCORING_VERSION,
    session,
    keyId: "test-key-1",
    privateKeyPkcs8,
    publicKeySpki: base64(await crypto.subtle.exportKey("spki", otherPair.publicKey)),
    now: NOW + 1_000,
  });
  assert.deepEqual(mismatched, { ok: false, reason: "key" });
});
