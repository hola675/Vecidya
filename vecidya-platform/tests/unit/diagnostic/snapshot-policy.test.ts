import assert from "node:assert/strict";
import { test } from "node:test";

import { estimatedSnapshotWrites, shouldFlushSnapshot, SNAPSHOT_ANSWER_INTERVAL, SNAPSHOT_MIN_INTERVAL_MS } from "../../../app/features/diagnostic/index.ts";

/**
 * DIAG-V3-06 §16/§49: el coalescer nunca dispara una escritura por cada cambio inmediato, y una
 * sesión típica produce pocas escrituras de red antes de completar.
 */

const base = { answeredSinceLastSnapshot: 0, msSinceLastSnapshot: SNAPSHOT_MIN_INTERVAL_MS + 1, crossedSectionBoundary: false, isBeforeCompletion: false };

test("mutación J: una ráfaga de cambios inmediatos no produce una escritura por cambio", () => {
  const burst = { ...base, msSinceLastSnapshot: 10 };
  for (let i = 0; i < 20; i += 1) {
    assert.equal(shouldFlushSnapshot({ ...burst, answeredSinceLastSnapshot: i }), false, `cambio ${i} dentro del segundo no debe disparar flush`);
  }
});

test("no flush por debajo del umbral de respuestas ni de sección", () => {
  assert.equal(shouldFlushSnapshot({ ...base, answeredSinceLastSnapshot: SNAPSHOT_ANSWER_INTERVAL - 1 }), false);
});

test("flush al alcanzar el intervalo de respuestas (~cada 5)", () => {
  assert.equal(shouldFlushSnapshot({ ...base, answeredSinceLastSnapshot: SNAPSHOT_ANSWER_INTERVAL }), true);
});

test("flush al cruzar una sección aunque no se alcance el intervalo de respuestas", () => {
  assert.equal(shouldFlushSnapshot({ ...base, answeredSinceLastSnapshot: 1, crossedSectionBoundary: true }), true);
});

test("flush forzado antes de completar", () => {
  assert.equal(shouldFlushSnapshot({ ...base, answeredSinceLastSnapshot: 0, isBeforeCompletion: true }), true);
});

test("el límite de 1 escritura/segundo domina incluso sobre el flush de finalización", () => {
  assert.equal(shouldFlushSnapshot({ ...base, msSinceLastSnapshot: 10, isBeforeCompletion: true }), false);
});

test("estimatedSnapshotWrites documenta el presupuesto aproximado para 10/16/26 preguntas", () => {
  assert.equal(estimatedSnapshotWrites(10), 2);
  assert.equal(estimatedSnapshotWrites(16), 3);
  assert.equal(estimatedSnapshotWrites(26), 5);
});
