import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildCanonicalCompletionPayload,
  computeCompletionHash,
  CURRENT_PERSISTED_VERSIONS,
  hasSnapshotShape,
  isCurrentPersistedVersions,
  validateAnswersPayload,
} from "../../../app/features/diagnostic/index.ts";

/**
 * DIAG-V3-06: el servidor nunca confía ciegamente en un objeto de respuestas del cliente (spec §14).
 * Estas pruebas cubren la puerta de validación y el hash canónico de finalización.
 */

test("valida y acepta un payload de respuestas real (single y multi)", () => {
  const result = validateAnswersPayload({ profile: "business", stage: "growing", team: "only_me" });
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.answers, { profile: "business", stage: "growing", team: "only_me" });
});

test("mutación A: QuestionId inexistente → reject", () => {
  const result = validateAnswersPayload({ not_a_real_question: "yes" });
  assert.equal(result.ok, false);
});

test("mutación B: OptionId inválido para una pregunta real → reject", () => {
  const result = validateAnswersPayload({ profile: "not_a_real_profile" });
  assert.equal(result.ok, false);
});

test("rechaza un valor multi enviado como string simple", () => {
  const result = validateAnswersPayload({ assets: "domain" });
  assert.equal(result.ok, false);
});

test("rechaza un valor single enviado como arreglo", () => {
  const result = validateAnswersPayload({ profile: ["business"] });
  assert.equal(result.ok, false);
});

test("rechaza un tipo de respuesta desconocido (objeto anidado, número, booleano)", () => {
  assert.equal(validateAnswersPayload({ profile: { value: "business" } }).ok, false);
  assert.equal(validateAnswersPayload({ profile: 1 }).ok, false);
  assert.equal(validateAnswersPayload({ profile: true }).ok, false);
});

test("rechaza un payload que no es un objeto plano", () => {
  assert.equal(validateAnswersPayload(null).ok, false);
  assert.equal(validateAnswersPayload([1, 2]).ok, false);
  assert.equal(validateAnswersPayload("profile").ok, false);
});

test("rechaza un multi vacío en vez de aceptarlo como respuesta válida", () => {
  assert.equal(validateAnswersPayload({ assets: [] }).ok, false);
});

test("deduplica valores repetidos en un multi válido", () => {
  const result = validateAnswersPayload({ assets: ["domain", "domain", "social"] });
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.answers.assets, ["domain", "social"]);
});

test("isCurrentPersistedVersions exige coincidencia exacta de las cinco versiones", () => {
  assert.equal(isCurrentPersistedVersions(CURRENT_PERSISTED_VERSIONS), true);
  assert.equal(isCurrentPersistedVersions({ ...CURRENT_PERSISTED_VERSIONS, scoringVersion: 2 }), false);
  assert.equal(isCurrentPersistedVersions(null), false);
  assert.equal(isCurrentPersistedVersions("2.0"), false);
});

test("hasSnapshotShape acepta un snapshot bien formado y rechaza uno corrupto", () => {
  const valid = {
    sessionId: "11111111-1111-4111-8111-111111111111",
    versions: CURRENT_PERSISTED_VERSIONS,
    status: "IN_PROGRESS",
    startedAt: Date.now(),
    lastActivityAt: Date.now(),
    revision: 1,
    currentQuestionId: null,
    answers: { profile: "business" },
    questionsSeen: 2,
    questionsAnswered: 1,
  };
  assert.equal(hasSnapshotShape(valid), true);
  assert.equal(hasSnapshotShape({ ...valid, sessionId: "not-a-uuid" }), false);
  assert.equal(hasSnapshotShape({ ...valid, revision: "1" }), false);
  assert.equal(hasSnapshotShape({ ...valid, status: "COMPLETED" }), false);
  assert.equal(hasSnapshotShape(null), false);
  assert.equal(hasSnapshotShape("snapshot"), false);
});

test("hasSnapshotShape acepta sessionId nulo (modo solo-navegador, spec §38)", () => {
  const valid = {
    sessionId: null,
    versions: CURRENT_PERSISTED_VERSIONS,
    status: "STARTED",
    startedAt: Date.now(),
    lastActivityAt: Date.now(),
    revision: 0,
    currentQuestionId: null,
    answers: {},
    questionsSeen: 0,
    questionsAnswered: 0,
  };
  assert.equal(hasSnapshotShape(valid), true);
});

test("mutación D (completion dos veces): el mismo conjunto de respuestas activas produce el mismo hash", async () => {
  const payloadA = buildCanonicalCompletionPayload("session-1", CURRENT_PERSISTED_VERSIONS, { profile: "business", assets: ["domain", "social"] });
  const payloadB = buildCanonicalCompletionPayload("session-1", CURRENT_PERSISTED_VERSIONS, { profile: "business", assets: ["social", "domain"] });
  const [hashA, hashB] = await Promise.all([computeCompletionHash(payloadA), computeCompletionHash(payloadB)]);
  assert.equal(hashA, hashB, "el orden de un multi-select no debe cambiar el hash de finalización");
  assert.match(hashA, /^[0-9a-f]{64}$/);
});

test("un payload canónico distinto produce un hash distinto (detecta conflicto §28)", async () => {
  const payloadA = buildCanonicalCompletionPayload("session-1", CURRENT_PERSISTED_VERSIONS, { profile: "business" });
  const payloadB = buildCanonicalCompletionPayload("session-1", CURRENT_PERSISTED_VERSIONS, { profile: "professional" });
  const [hashA, hashB] = await Promise.all([computeCompletionHash(payloadA), computeCompletionHash(payloadB)]);
  assert.notEqual(hashA, hashB);
});

test("un sessionId distinto produce un hash distinto aunque las respuestas coincidan", async () => {
  const payloadA = buildCanonicalCompletionPayload("session-1", CURRENT_PERSISTED_VERSIONS, { profile: "business" });
  const payloadB = buildCanonicalCompletionPayload("session-2", CURRENT_PERSISTED_VERSIONS, { profile: "business" });
  const [hashA, hashB] = await Promise.all([computeCompletionHash(payloadA), computeCompletionHash(payloadB)]);
  assert.notEqual(hashA, hashB);
});
