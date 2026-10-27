import assert from "node:assert/strict";
import test from "node:test";
import {
  recoverDiagnosticClassificationV9,
  isDiagnosticClassificationStateV9,
} from "../../../app/features/diagnostic/qa03b/v9-classification-audit-replay";
import { QA03B_V9_CLASSIFICATION_INTERACTION_ID } from "../../../app/features/diagnostic/qa03b/v9-classification-bundle";
import type { V9AuditDb } from "../../../app/features/diagnostic/qa03b/v9-audit-repository";

function fakeAuditDb(workspaceId: string, runId: string, events: readonly {
  seq: number; event_id: string; kind: string; payload_json: string; schema_version: number;
}[]): V9AuditDb {
  return {
    prepare(sql) {
      return {
        bind(...args: unknown[]) {
          assert.equal(args[0], workspaceId);
          assert.equal(args[1], runId);
          return {
            async first<T>() {
              if (sql.includes("FROM diagnostic_v9_runs")) return { last_seq: events.length } as T;
              if (sql.includes("FROM diagnostic_v9_snapshots")) return null;
              throw new Error("unexpected_sql");
            },
            async all<T>() {
              assert.match(sql, /FROM diagnostic_v9_events/);
              return { results: events.filter((event) => event.seq > Number(args[2])) as T[] };
            },
            async run() { throw new Error("read_only"); },
          };
        },
      };
    },
  };
}

test("V9 classification state replays from independent audit events", async () => {
  const workspaceId = "workspace-a";
  const runId = "run-a";
  const result = await recoverDiagnosticClassificationV9(
    fakeAuditDb(workspaceId, runId, [{
      seq: 1,
      event_id: "event-a",
      kind: QA03B_V9_CLASSIFICATION_INTERACTION_ID,
      payload_json: JSON.stringify({ sector: "other" }),
      schema_version: 1,
    }]),
    workspaceId,
    runId,
  );
  assert.equal(result.lastSeq, 1);
  assert.equal(result.state.version, 9);
  assert.equal(result.state.events.length, 1);
  assert.equal(result.state.historicalInteractionCount, 1);
  assert.equal(result.state.answers.q2_sector, "other");
});

test("V9 rejects malformed classification snapshots", () => {
  assert.equal(isDiagnosticClassificationStateV9({ version: 9, answers: {}, events: [], historicalInteractionCount: -1 }), false);
  assert.equal(isDiagnosticClassificationStateV9({ version: 9, answers: { q2_sector: 4 }, events: [], historicalInteractionCount: 0 }), false);
  assert.equal(isDiagnosticClassificationStateV9({ version: 8, answers: {}, events: [], historicalInteractionCount: 0 }), false);
});
