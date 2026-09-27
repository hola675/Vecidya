import assert from "node:assert/strict";
import { test } from "node:test";

import { CURRENT_PERSISTED_VERSIONS, DiagnosticBrowserStore, type StorageLike } from "../../../app/features/diagnostic/index.ts";

/**
 * DIAG-V3-06 §10/§11/§12: capa de almacenamiento versionada, restauración same-browser y rechazo
 * explícito de un snapshot de otra versión (sin casts, sin carga silenciosa).
 */

function memoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  };
}

test("write + read hace round-trip exacto de un registro válido", () => {
  const store = new DiagnosticBrowserStore(memoryStorage());
  const record = DiagnosticBrowserStore.createLocalOnly(1000);
  const withAnswers = { ...record, answers: { profile: "business" as const }, questionsAnswered: 1, questionsSeen: 1 };
  store.write(withAnswers);
  assert.deepEqual(store.read(), withAnswers);
});

test("read devuelve null cuando no hay nada guardado", () => {
  const store = new DiagnosticBrowserStore(memoryStorage());
  assert.equal(store.read(), null);
});

test("read devuelve null ante JSON corrupto en vez de lanzar", () => {
  const storage = memoryStorage();
  storage.setItem("vecidya.diagnostic.session.v1", "{not-json");
  const store = new DiagnosticBrowserStore(storage);
  assert.equal(store.read(), null);
});

test("version mismatch local: un snapshot de otra versión se invalida, nunca se carga silenciosamente (spec §12)", () => {
  const storage = memoryStorage();
  const store = new DiagnosticBrowserStore(storage);
  const record = { ...DiagnosticBrowserStore.createLocalOnly(1000), versions: { ...CURRENT_PERSISTED_VERSIONS, scoringVersion: 2 } };
  store.write(record as never);
  assert.equal(store.read(), null, "una versión distinta no se interpreta ni se castea");
});

test("read revalida las respuestas contra el registro de preguntas vigente", () => {
  const storage = memoryStorage();
  const store = new DiagnosticBrowserStore(storage);
  const record = { ...DiagnosticBrowserStore.createLocalOnly(1000), answers: { profile: "not_a_real_profile" } };
  store.write(record as never);
  assert.equal(store.read(), null, "un registro con una respuesta inválida no debe llegar al motor");
});

test("clear borra el snapshot", () => {
  const store = new DiagnosticBrowserStore(memoryStorage());
  store.write(DiagnosticBrowserStore.createLocalOnly());
  store.clear();
  assert.equal(store.read(), null);
});

test("canAutoResume es falso cuando el servidor ya confirmó la finalización", () => {
  const store = new DiagnosticBrowserStore(memoryStorage());
  store.write({ ...DiagnosticBrowserStore.createLocalOnly(), serverCompleted: true });
  assert.equal(store.canAutoResume(), false);
});

test("canAutoResume es verdadero para una sesión en progreso con snapshot válido", () => {
  const store = new DiagnosticBrowserStore(memoryStorage());
  store.write({ ...DiagnosticBrowserStore.createLocalOnly(), status: "IN_PROGRESS", answers: { profile: "business" } });
  assert.equal(store.canAutoResume(), true);
});

test("sin `window` (SSR) el store no lanza y se comporta como vacío", () => {
  const store = new DiagnosticBrowserStore(null);
  assert.equal(store.read(), null);
  store.write(DiagnosticBrowserStore.createLocalOnly());
  store.clear();
});

test("createLocalOnly nunca inventa un sessionId de servidor", () => {
  assert.equal(DiagnosticBrowserStore.createLocalOnly().sessionId, null);
});

test("writeToken nunca aparece en la forma serializada más de una vez ni se deriva de otro campo", () => {
  const store = new DiagnosticBrowserStore(memoryStorage());
  const record = { ...DiagnosticBrowserStore.createLocalOnly(), sessionId: "11111111-1111-4111-8111-111111111111" as const, writeToken: "raw-token-value" };
  store.write(record as never);
  const restored = store.read();
  assert.equal(restored?.writeToken, "raw-token-value");
});
