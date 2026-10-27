import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import {
  createAnonymousIdentityCredentialV9,
  createOwnedDiagnosticRunV9,
  type V9IdentityDb,
} from "../../../app/features/diagnostic/qa03b/v9-identity-repository";

const migrations = [
  readFileSync(new URL("../../../db/migrations/0030_diagnostic_v9_audit.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0031_diagnostic_v9_identity_ownership.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0032_diagnostic_v9_claim_guards.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0033_diagnostic_v9_owner_assignment_guards.sql", import.meta.url), "utf8"),
];
const versions = {
  bank: "bank-v9-test", engine: "engine-v9-test", scoring: "scoring-v9-test",
  recommendations: "recommendations-v9-test", consent: "consent-v1-test",
};

function adapter(sqlite: DatabaseSync): V9IdentityDb {
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
      return { bind(...values: unknown[]) {
        return {
          sql, values,
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

test("V9 creates runs and owner rows atomically for authenticated and anonymous identities", async () => {
  const sqlite = new DatabaseSync(":memory:");
  try {
    sqlite.exec("PRAGMA foreign_keys=ON");
    for (const migration of migrations) sqlite.exec(migration);
    const db = adapter(sqlite);
    const userRun = await createOwnedDiagnosticRunV9(db, {
      workspaceId: "public", runId: "run-user", identityId: "user-identity",
      userId: "user-1", startedAt: "2026-10-27T00:00:00Z", versions,
    });
    const anon = await createAnonymousIdentityCredentialV9(db, {
      identityId: "anon-identity", createdAt: "2026-10-27T00:00:01Z",
    });
    const anonRun = await createOwnedDiagnosticRunV9(db, {
      workspaceId: "public", runId: "run-anon", identityId: anon.identityId,
      recoveryCredential: anon.recoveryCredential, startedAt: "2026-10-27T00:00:02Z", versions,
    });
    assert.equal(userRun.ownerType, "user");
    assert.equal(anonRun.ownerType, "anonymous");
    assert.equal((sqlite.prepare("SELECT COUNT(*) AS n FROM diagnostic_v9_runs").get() as {n:number}).n, 2);
    assert.equal((sqlite.prepare("SELECT COUNT(*) AS n FROM diagnostic_v9_run_ownership").get() as {n:number}).n, 2);
    await assert.rejects(() => createOwnedDiagnosticRunV9(db, {
      workspaceId: "public", runId: "run-bad", identityId: anon.identityId,
      recoveryCredential: "0".repeat(64), startedAt: "2026-10-27T00:00:03Z", versions,
    }), /v9_identity_proof_invalid/);
    assert.equal((sqlite.prepare("SELECT COUNT(*) AS n FROM diagnostic_v9_runs WHERE run_id='run-bad'").get() as {n:number}).n, 0);
  } finally {
    sqlite.close();
  }
});

test("V9 run creation rolls back the owner row if the run insert fails", async () => {
  const sqlite = new DatabaseSync(":memory:");
  try {
    sqlite.exec("PRAGMA foreign_keys=ON");
    for (const migration of migrations) sqlite.exec(migration);
    const db = adapter(sqlite);
    await createOwnedDiagnosticRunV9(db, {
      workspaceId: "public", runId: "same-run", identityId: "user-identity",
      userId: "user-1", startedAt: "2026-10-27T00:00:00Z", versions,
    });
    await assert.rejects(() => createOwnedDiagnosticRunV9(db, {
      workspaceId: "public", runId: "same-run", identityId: "user-identity-2",
      userId: "user-2", startedAt: "2026-10-27T00:00:01Z", versions,
    }));
    assert.equal((sqlite.prepare("SELECT COUNT(*) AS n FROM diagnostic_v9_run_ownership WHERE workspace_id='public' AND run_id='same-run'").get() as {n:number}).n, 1);
  } finally {
    sqlite.close();
  }
});
