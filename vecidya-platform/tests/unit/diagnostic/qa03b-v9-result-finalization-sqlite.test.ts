import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import {
  createDiagnosticRunV9,
  finalizeDiagnosticRunV9,
  type V9FinalizationDb,
  type V9RunVersions,
} from "../../../app/features/diagnostic/qa03b/v9-audit-repository";

const migrations = [
  readFileSync(new URL("../../../db/migrations/0030_diagnostic_v9_audit.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0031_diagnostic_v9_identity_ownership.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0032_diagnostic_v9_claim_guards.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0033_diagnostic_v9_owner_assignment_guards.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0034_diagnostic_v9_identity_claim_integrity.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0035_diagnostic_v9_result_finalization_guards.sql", import.meta.url), "utf8"),
];
const versions: V9RunVersions = {
  bank: "bank-certified-test",
  engine: "engine-certified-test",
  scoring: "scoring-certified-test",
  recommendations: "recommendations-certified-test",
  consent: "consent-certified-test",
};

function adapter(sqlite: DatabaseSync): V9FinalizationDb {
  return {
    async batch(statements: unknown[]) {
      sqlite.exec("BEGIN");
      try {
        const results = statements.map((raw) => {
          const statement = raw as { sql: string; values: unknown[] };
          const result = sqlite.prepare(statement.sql).run(...statement.values as []) as { changes?: number };
          return { success: true, meta: { changes: result.changes ?? 0 } };
        });
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
    prepare(sql: string) {
      return {
        bind(...values: unknown[]) {
          return {
            async run() {
              const result = sqlite.prepare(sql).run(...values as []) as { changes?: number };
              return { success: true, meta: { changes: result.changes ?? 0 } };
            },
            async first<T>() {
              return (sqlite.prepare(sql).get(...values as []) ?? null) as T | null;
            },
            async all<T>() {
              return { results: sqlite.prepare(sql).all(...values as []) as T[] };
            },
          };
        },
      };
    },
  };
}

function freshDb() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys=ON");
  for (const migration of migrations) sqlite.exec(migration);
  return sqlite;
}

test("V9 persists trusted results and completes the run atomically", async () => {
  const sqlite = freshDb();
  try {
    const db = adapter(sqlite);
    await createDiagnosticRunV9(db, {
      workspaceId: "public", runId: "result-run", versions, now: "2026-10-27T18:00:00.000Z",
    });
    const result = await finalizeDiagnosticRunV9(db, {
      workspaceId: "public", runId: "result-run", expectedSeq: 0,
      score: { overall: 72, confidence: "medium" },
      evidence: [{ dimension: "clarity_positioning", state: "supported" }],
      recommendations: [{ id: "next-step-1", priority: 1 }],
      finishedAt: "2026-10-27T18:10:00.000Z",
    });
    assert.deepEqual(result, { status: "completed", resultVersion: 1 });
    assert.deepEqual(
      sqlite.prepare("SELECT status,finished_at,last_seq FROM diagnostic_v9_runs WHERE run_id='result-run'").get(),
      { status: "completed", finished_at: "2026-10-27T18:10:00.000Z", last_seq: 0 },
    );
    assert.deepEqual(
      sqlite.prepare("SELECT result_version,score_json,evidence_json,recommendations_json FROM diagnostic_v9_results WHERE run_id='result-run'").get(),
      {
        result_version: 1,
        score_json: JSON.stringify({ overall: 72, confidence: "medium" }),
        evidence_json: JSON.stringify([{ dimension: "clarity_positioning", state: "supported" }]),
        recommendations_json: JSON.stringify([{ id: "next-step-1", priority: 1 }]),
      },
    );
    await assert.rejects(() => finalizeDiagnosticRunV9(db, {
      workspaceId: "public", runId: "result-run", expectedSeq: 0,
      score: {}, evidence: [], recommendations: [], finishedAt: "2026-10-27T18:11:00.000Z",
    }), /v9_run_not_active/);
    assert.throws(() => sqlite.prepare("UPDATE diagnostic_v9_results SET score_json='{}' WHERE run_id='result-run'").run(), /v9_result_immutable/);
    assert.throws(() => sqlite.prepare("DELETE FROM diagnostic_v9_results WHERE run_id='result-run'").run(), /v9_result_immutable/);
    assert.throws(() => sqlite.prepare("UPDATE diagnostic_v9_runs SET status='active',finished_at=NULL WHERE run_id='result-run'").run(), /v9_run_terminal_status_immutable/);
  } finally {
    sqlite.close();
  }
});

test("V9 refuses stale sequence and oversized or non-serializable results without partial writes", async () => {
  const sqlite = freshDb();
  try {
    const db = adapter(sqlite);
    await createDiagnosticRunV9(db, {
      workspaceId: "public", runId: "stale-run", versions, now: "2026-10-27T18:00:00.000Z",
    });
    await assert.rejects(() => finalizeDiagnosticRunV9(db, {
      workspaceId: "public", runId: "stale-run", expectedSeq: 1,
      score: {}, evidence: [], recommendations: [], finishedAt: "2026-10-27T18:10:00.000Z",
    }), /v9_sequence_conflict/);
    await assert.rejects(() => finalizeDiagnosticRunV9(db, {
      workspaceId: "public", runId: "stale-run", expectedSeq: 0,
      score: { oversized: "x".repeat(70000) }, evidence: [], recommendations: [],
      finishedAt: "2026-10-27T18:10:00.000Z",
    }), /v9_finalize_invalid_result/);
    await assert.rejects(() => finalizeDiagnosticRunV9(db, {
      workspaceId: "public", runId: "stale-run", expectedSeq: 0,
      score: { invalid: BigInt(1) }, evidence: [], recommendations: [],
      finishedAt: "2026-10-27T18:10:00.000Z",
    }), /v9_finalize_invalid_result/);
    assert.equal((sqlite.prepare("SELECT COUNT(*) AS n FROM diagnostic_v9_results WHERE run_id='stale-run'").get() as {n:number}).n, 0);
    assert.equal((sqlite.prepare("SELECT status FROM diagnostic_v9_runs WHERE run_id='stale-run'").get() as {status:string}).status, "active");
  } finally {
    sqlite.close();
  }
});

test("V9 database guard prevents marking a run completed without a result", () => {
  const sqlite = freshDb();
  try {
    sqlite.prepare("INSERT INTO diagnostic_v9_runs (workspace_id,run_id,started_at,bank_version,engine_version,scoring_version,recommendation_version,consent_version) VALUES (?,?,?,?,?,?,?,?)")
      .run("public", "unresulted-run", "2026-10-27", "b1", "e1", "s1", "r1", "c1");
    assert.throws(() => sqlite.prepare("UPDATE diagnostic_v9_runs SET status='completed',finished_at='2026-10-28' WHERE run_id='unresulted-run'").run(), /v9_run_completion_requires_result/);
    assert.equal((sqlite.prepare("SELECT status FROM diagnostic_v9_runs WHERE run_id='unresulted-run'").get() as {status:string}).status, "active");
  } finally {
    sqlite.close();
  }
});
