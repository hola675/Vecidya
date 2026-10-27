import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import {
  assignDiagnosticRunToAnonymousVisitorV9,
  assignDiagnosticRunToAuthenticatedUserV9,
  type V9IdentityDb,
} from "../../../app/features/diagnostic/qa03b/v9-identity-repository";

const migrations = [
  readFileSync(new URL("../../../db/migrations/0030_diagnostic_v9_audit.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0031_diagnostic_v9_identity_ownership.sql", import.meta.url), "utf8"),
];

function adapter(sqlite: DatabaseSync): V9IdentityDb {
  return {
    async batch() { return []; },
    prepare(sql: string) {
      return { bind(...values: unknown[]) {
        return {
          async first<T>() { return (sqlite.prepare(sql).get(...values as []) ?? null) as T | null; },
          async all<T>() { return { results: sqlite.prepare(sql).all(...values as []) as T[] }; },
          async run() {
            const result = sqlite.prepare(sql).run(...values as []) as { changes?: number };
            return { success: true, meta: { changes: result.changes ?? 0 } };
          },
        };
      } };
    },
  };
}

function insertRun(sqlite: DatabaseSync, runId: string) {
  sqlite.prepare("INSERT INTO diagnostic_v9_runs (workspace_id,run_id,started_at,bank_version,engine_version,scoring_version,recommendation_version,consent_version) VALUES (?,?,?,?,?,?,?,?)")
    .run("public", runId, "2026-10-27", "b1", "e1", "s1", "r1", "c1");
}

test("V9 owner assignment derives user ownership server-side and returns anonymous secret once", async () => {
  const sqlite = new DatabaseSync(":memory:");
  try {
    sqlite.exec("PRAGMA foreign_keys=ON");
    for (const migration of migrations) sqlite.exec(migration);
    insertRun(sqlite, "user-run");
    insertRun(sqlite, "anon-run");
    const db = adapter(sqlite);
    const user = await assignDiagnosticRunToAuthenticatedUserV9(db, {
      workspaceId: "public", runId: "user-run", identityId: "user-identity",
      userId: "authenticated-user-7", assignedAt: "2026-10-27T00:00:00Z",
    });
    const anonymous = await assignDiagnosticRunToAnonymousVisitorV9(db, {
      workspaceId: "public", runId: "anon-run", identityId: "anon-identity",
      assignedAt: "2026-10-27T00:00:01Z",
    });
    assert.notEqual(user.identityId, anonymous.identityId);
    assert.match(anonymous.recoveryCredential, /^[a-f0-9]{64}$/);
    assert.equal((sqlite.prepare("SELECT assignment_source FROM diagnostic_v9_run_ownership WHERE run_id='user-run'").get() as {assignment_source:string}).assignment_source, "authenticated_session");
    assert.equal((sqlite.prepare("SELECT assignment_source FROM diagnostic_v9_run_ownership WHERE run_id='anon-run'").get() as {assignment_source:string}).assignment_source, "anonymous_session");
    assert.equal((sqlite.prepare("SELECT user_id FROM diagnostic_v9_identities WHERE identity_id=?").get(user.identityId) as {user_id:string}).user_id, "authenticated-user-7");
    assert.notEqual((sqlite.prepare("SELECT credential_hash FROM diagnostic_v9_identities WHERE identity_id='anon-identity'").get() as {credential_hash:string}).credential_hash, anonymous.recoveryCredential);
  } finally {
    sqlite.close();
  }
});
