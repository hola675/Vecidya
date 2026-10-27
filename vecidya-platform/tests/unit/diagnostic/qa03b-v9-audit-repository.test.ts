import assert from "node:assert/strict";
import test from "node:test";
import { appendDiagnosticEventV9, type V9AuditDb } from "../../../app/features/diagnostic/qa03b/v9-audit-repository";

type EventRow = { run_id: string; seq: number; kind: string; payload_json: string; occurred_at: string; actor_type: string; schema_version: number };
function fakeDb() {
  const events = new Map<string, EventRow>();
  let seq = 0;
  const db: V9AuditDb = {
    prepare(sql) {
      return {
        bind(...values: unknown[]) {
          return {
            async first<T>() {
              assert.match(sql, /SELECT run_id,seq/);
              return (events.get(String(values[1])) ?? null) as T | null;
            },
            async run() {
              assert.match(sql, /INSERT INTO diagnostic_v9_events/);
              const [, , nextSeq, id, kind, payload] = values;
              if (events.has(String(id))) throw new Error("UNIQUE constraint failed");
              if (nextSeq !== seq + 1) throw new Error("v9_sequence_conflict");
              seq = Number(nextSeq);
              events.set(String(id), { run_id: String(values[1]), seq, kind: String(kind), payload_json: String(payload), occurred_at: String(values[6]), actor_type: String(values[7]), schema_version: 1 });
              return { success: true, meta: { changes: 1 } };
            },
            async all<T>() { return { results: [] as T[] }; },
          };
        },
      };
    },
  };
  return { db, getSeq: () => seq };
}
const base = {
  workspaceId: "org-a", runId: "run-1", eventId: "event-1",
  expectedSeq: 0, kind: "answer", payload: { question: "q1", value: "yes" },
  occurredAt: "2026-10-27T00:00:00Z", actorType: "client" as const,
};

test("V9 append creates an event and accepts an identical retry", async () => {
  const { db, getSeq } = fakeDb();
  assert.deepEqual(await appendDiagnosticEventV9(db, base), { status: "created", seq: 1 });
  assert.deepEqual(await appendDiagnosticEventV9(db, base), { status: "duplicate", seq: 1 });
  assert.equal(getSeq(), 1);
});

test("V9 append rejects stale sequence and event-id payload reuse", async () => {
  const { db } = fakeDb();
  await appendDiagnosticEventV9(db, base);
  assert.deepEqual(await appendDiagnosticEventV9(db, { ...base, eventId: "event-2" }), { status: "conflict" });
  assert.deepEqual(await appendDiagnosticEventV9(db, { ...base, payload: { question: "q1", value: "no" } }), { status: "conflict" });
});

test("V9 append rejects invalid cursors and oversized payloads", async () => {
  const { db } = fakeDb();
  await assert.rejects(() => appendDiagnosticEventV9(db, { ...base, expectedSeq: -1 }), /v9_invalid_event/);
  await assert.rejects(() => appendDiagnosticEventV9(db, { ...base, payload: "x".repeat(16385) }), /v9_invalid_payload/);
});

test("V9 event retry rejects changed actor and timestamp", async () => {
  const { db } = fakeDb();
  await appendDiagnosticEventV9(db, base);
  assert.deepEqual(await appendDiagnosticEventV9(db, { ...base, actorType: "operator" }), { status: "conflict" });
  assert.deepEqual(await appendDiagnosticEventV9(db, { ...base, occurredAt: "2026-10-27T00:01:00Z" }), { status: "conflict" });
});
