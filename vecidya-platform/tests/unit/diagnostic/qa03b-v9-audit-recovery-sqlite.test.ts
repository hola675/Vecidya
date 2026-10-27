import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { recoverDiagnosticStateV9 } from "../../../app/features/diagnostic/qa03b/v9-audit-recovery";
import { hashDiagnosticSnapshotV9, type V9AuditDb } from "../../../app/features/diagnostic/qa03b/v9-audit-repository";

const migration = readFileSync(new URL("../../../db/migrations/0030_diagnostic_v9_audit.sql", import.meta.url), "utf8");

function adapter(db: DatabaseSync): V9AuditDb {
  return {
    prepare(sql) {
      return {
        bind(...values: unknown[]) {
          const statement = db.prepare(sql);
          return {
            async first<T>() { return (statement.get(...values as []) ?? null) as T | null; },
            async all<T>() { return { results: statement.all(...values as []) as T[] }; },
            async run() { statement.run(...values as []); return { success: true }; },
          };
        },
      };
    },
  };
}

test("V9 recovery replays only events after a verified SQLite snapshot", async () => {
  const sqlite = new DatabaseSync(":memory:");
  try {
    sqlite.exec("PRAGMA foreign_keys = ON");
    sqlite.exec(migration);
    sqlite.prepare("INSERT INTO diagnostic_v9_runs (workspace_id,run_id,started_at,bank_version,engine_version,scoring_version,recommendation_version,consent_version) VALUES (?,?,?,?,?,?,?,?)")
      .run("org-a", "run-a", "2026-10-27", "b1", "e1", "s1", "r1", "c1");
    const eventSql = sqlite.prepare("INSERT INTO diagnostic_v9_events (workspace_id,run_id,seq,event_id,kind,payload_json,occurred_at,schema_version,actor_type) VALUES (?,?,?,?,?,?,?,1,'client')");
    eventSql.run("org-a", "run-a", 1, "evt-1", "increment", '{"value":2}', "2026-10-27");
    eventSql.run("org-a", "run-a", 2, "evt-2", "increment", '{"value":3}', "2026-10-27");
    const stateJson = '{"total":2}';
    sqlite.prepare("INSERT INTO diagnostic_v9_snapshots (workspace_id,run_id,last_seq,state_json,state_hash,created_at) VALUES (?,?,?,?,?,?)")
      .run("org-a", "run-a", 1, stateJson, await hashDiagnosticSnapshotV9(stateJson), "2026-10-27");
    const result = await recoverDiagnosticStateV9(adapter(sqlite), {
      workspaceId: "org-a", runId: "run-a", initialState: { total: 0 },
      validateSnapshot: (value): value is { total: number } =>
        typeof value === "object" && value !== null && "total" in value && typeof value.total === "number",
      applyEvent: (state, event) => {
        assert.equal(event.seq, 2);
        assert.equal(event.kind, "increment");
        return { total: state.total + (event.payload as { value: number }).value };
      },
    });
    assert.deepEqual(result, { state: { total: 5 }, lastSeq: 2 });
    sqlite.prepare("UPDATE diagnostic_v9_snapshots SET state_json='{\"total\":999}' WHERE workspace_id='org-a'").run();
    await assert.rejects(() => recoverDiagnosticStateV9(adapter(sqlite), {
      workspaceId: "org-a", runId: "run-a", initialState: { total: 0 },
      validateSnapshot: (value): value is { total: number } => typeof value === "object" && value !== null,
      applyEvent: (state) => state,
    }), /v9_snapshot_integrity_failure/);
  } finally {
    sqlite.close();
  }
});
