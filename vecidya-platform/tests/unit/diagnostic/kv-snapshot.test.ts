import assert from "node:assert/strict";
import { test } from "node:test";

import { deleteDiagnosticSnapshotBestEffort, putDiagnosticSnapshot } from "../../../server/diagnostic/kv-snapshot.server.ts";
import { AUTOSAVE_SNAPSHOT_RETENTION_DAYS, CURRENT_PERSISTED_VERSIONS, ONE_DAY_MS } from "../../../app/features/diagnostic/index.ts";

/**
 * DIAG-V3-06 §29/§41: el borrado de KV es siempre best-effort y posterior a D1. Estas pruebas cubren
 * el caso "D1 success + KV delete failure" a nivel de unidad (forzar un fallo real de Miniflare en
 * local no es determinista); la garantía de ORDEN (nunca borrar antes de confirmar D1) la protege
 * `completion-order.test.ts`.
 */

function fakeKvThatFailsOnDelete(): KVNamespace {
  return {
    put: async () => undefined,
    get: async () => null,
    delete: async () => {
      throw new Error("simulated KV outage");
    },
  } as unknown as KVNamespace;
}

test("mutación H (parcial): un fallo de KV delete no lanza y se reporta como no confirmado", async () => {
  const kv = fakeKvThatFailsOnDelete();
  const ok = await deleteDiagnosticSnapshotBestEffort(kv, "11111111-1111-4111-8111-111111111111");
  assert.equal(ok, false, "un delete fallido debe reportarse, nunca lanzar");
});

test("putDiagnosticSnapshot serializa el snapshot completo con el TTL de retención de autosave (spec §5)", async () => {
  const store = new Map<string, string>();
  const capturedOptions: Array<{ expirationTtl?: number }> = [];
  const kv = {
    put: async (key: string, value: string, options?: { expirationTtl?: number }) => {
      store.set(key, value);
      if (options) capturedOptions.push(options);
    },
    get: async (key: string) => store.get(key) ?? null,
    delete: async (key: string) => void store.delete(key),
  } as unknown as KVNamespace;

  const snapshot = {
    sessionId: "11111111-1111-4111-8111-111111111111" as never,
    versions: CURRENT_PERSISTED_VERSIONS,
    status: "IN_PROGRESS" as const,
    startedAt: 1000,
    lastActivityAt: 2000,
    revision: 3,
    currentQuestionId: null,
    answers: { profile: "business" as const },
    questionsSeen: 5,
    questionsAnswered: 3,
  };
  await putDiagnosticSnapshot(kv, "11111111-1111-4111-8111-111111111111", snapshot);
  assert.equal(store.size, 1);
  const [[, raw]] = store;
  assert.deepEqual(JSON.parse(raw), snapshot);
  assert.equal(capturedOptions[0]?.expirationTtl, AUTOSAVE_SNAPSHOT_RETENTION_DAYS * (ONE_DAY_MS / 1000));
});
