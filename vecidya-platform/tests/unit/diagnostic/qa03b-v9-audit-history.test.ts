import assert from "node:assert/strict";
import test from "node:test";
import { loadDiagnosticEventHistoryV9, type V9AuditDb } from "../../../app/features/diagnostic/qa03b/v9-audit-repository";

type Event = { seq: number; event_id: string; kind: string; payload_json: string; schema_version: number };

function dbWithHistory(events: Event[], lastSeq: number, exists = true): V9AuditDb {
  return {
    prepare(sql) {
      return {
        bind(...values: unknown[]) {
          return {
            async first<T>() {
              assert.match(sql, /SELECT last_seq/);
              return (exists ? { last_seq: lastSeq } : null) as T | null;
            },
            async all<T>() {
              assert.match(sql, /SELECT seq,event_id/);
              const cursor = Number(values[2]);
              return { results: events.filter((e) => e.seq > cursor).slice(0, 500) as T[] };
            },
            async run() { throw new Error("read_only"); },
          };
        },
      };
    },
  };
}
const event = (seq: number): Event => ({
  seq, event_id: "evt-" + seq, kind: "answer", payload_json: "{}", schema_version: 1,
});

test("V9 history loads all pages and preserves order", async () => {
  const events = Array.from({ length: 501 }, (_, i) => event(i + 1));
  const result = await loadDiagnosticEventHistoryV9(dbWithHistory(events, 501), "org-a", "run-a");
  assert.equal(result.length, 501);
  assert.equal(result[500]?.seq, 501);
});

test("V9 history rejects missing runs and gaps", async () => {
  await assert.rejects(() => loadDiagnosticEventHistoryV9(dbWithHistory([], 0, false), "org-a", "run-a"), /v9_run_not_found/);
  await assert.rejects(() => loadDiagnosticEventHistoryV9(dbWithHistory([event(1), event(3)], 3), "org-a", "run-a"), /v9_history_sequence_gap/);
  await assert.rejects(() => loadDiagnosticEventHistoryV9(dbWithHistory([event(1)], 2), "org-a", "run-a"), /v9_history_incomplete/);
});
