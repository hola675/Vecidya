import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

const migration = readFileSync(new URL("../../../db/migrations/0030_diagnostic_v9_audit.sql", import.meta.url), "utf8");

test("V9 D1 schema: atomic event sequence, isolation and append-only protection", () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec("PRAGMA foreign_keys = ON");
    db.exec(migration);
    const insertRun = db.prepare(
      "INSERT INTO diagnostic_v9_runs (workspace_id,run_id,status,started_at,bank_version,engine_version,scoring_version,recommendation_version,consent_version) VALUES (?,?,'active',?,?,?,?,?,?)",
    );
    for (const org of ["org-a", "org-b"]) {
      insertRun.run(org, "run-1", "2026-10-27", "b1", "e1", "s1", "r1", "c1");
    }
    const insertEvent = db.prepare(
      "INSERT INTO diagnostic_v9_events (workspace_id,run_id,seq,event_id,kind,payload_json,occurred_at,schema_version,actor_type) VALUES (?,?,?,?,?,?,?,1,'client')",
    );
    insertEvent.run("org-a", "run-1", 1, "evt-a", "answer", '{"q":"yes"}', "2026-10-27");
    assert.equal(
      (db.prepare("SELECT last_seq FROM diagnostic_v9_runs WHERE workspace_id='org-a' AND run_id='run-1'").get() as { last_seq: number }).last_seq,
      1,
    );
    assert.throws(() => insertEvent.run("org-a", "run-1", 3, "evt-gap", "answer", "{}", "2026-10-27"), /v9_sequence_conflict/);
    assert.throws(() => insertEvent.run("org-a", "run-1", 1, "evt-stale", "answer", "{}", "2026-10-27"), /v9_sequence_conflict/);
    assert.throws(() => insertEvent.run("org-a", "run-1", 2, "evt-a", "answer", "{}", "2026-10-27"), /UNIQUE constraint failed/);
    assert.throws(() => db.exec("UPDATE diagnostic_v9_events SET kind='other' WHERE workspace_id='org-a'"), /v9_audit_immutable/);
    assert.throws(() => db.exec("DELETE FROM diagnostic_v9_events WHERE workspace_id='org-a'"), /v9_audit_immutable/);
    insertEvent.run("org-b", "run-1", 1, "evt-b", "answer", "{}", "2026-10-27");
    assert.equal(
      (db.prepare("SELECT last_seq FROM diagnostic_v9_runs WHERE workspace_id='org-b' AND run_id='run-1'").get() as { last_seq: number }).last_seq,
      1,
    );
    assert.equal(
      (db.prepare("SELECT COUNT(*) AS n FROM diagnostic_v9_events WHERE workspace_id='org-a'").get() as { n: number }).n,
      1,
    );
    assert.throws(() => insertEvent.run("org-a", "missing", 1, "evt-missing", "answer", "{}", "2026-10-27"), /v9_sequence_conflict/);
  } finally {
    db.close();
  }
});
