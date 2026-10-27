import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import {
  appendOwnedDiagnosticEventV9,
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

test("V9 database guard rejects anonymous ownership after identity has been claimed", () => {
  const sqlite = new DatabaseSync(":memory:");
  try {
    sqlite.exec("PRAGMA foreign_keys=ON");
    for (const migration of migrations) sqlite.exec(migration);
    sqlite.prepare("INSERT INTO diagnostic_v9_runs (workspace_id,run_id,started_at,bank_version,engine_version,scoring_version,recommendation_version,consent_version) VALUES (?,?,?,?,?,?,?,?)")
      .run("public", "race-run", "2026-10-27", "b1", "e1", "s1", "r1", "c1");
    sqlite.prepare("INSERT INTO diagnostic_v9_identities (identity_id,identity_type,credential_hash,created_at,claimed_by_user_id,claimed_at) VALUES (?,'anonymous',?,?,?,?)")
      .run("anon-claimed", "a".repeat(64), "2026-10-27", "user-1", "2026-10-27");
    assert.throws(() => sqlite.prepare("INSERT INTO diagnostic_v9_run_ownership (workspace_id,run_id,identity_id,assigned_at,assignment_source) VALUES (?,?,?,?,?)")
      .run("public", "race-run", "anon-claimed", "2026-10-27", "anonymous_session"), /v9_owner_identity_state_invalid/);
    assert.equal((sqlite.prepare("SELECT COUNT(*) AS n FROM diagnostic_v9_run_ownership WHERE run_id='race-run'").get() as {n:number}).n, 0);
  } finally {
    sqlite.close();
  }
});

test("V9 event append requires run ownership and preserves idempotent retries", async () => {
  const sqlite = new DatabaseSync(":memory:");
  try {
    sqlite.exec("PRAGMA foreign_keys=ON");
    for (const migration of migrations) sqlite.exec(migration);
    const db = adapter(sqlite);
    await createOwnedDiagnosticRunV9(db, {
      workspaceId: "public", runId: "run-user-events", identityId: "user-identity",
      userId: "user-1", startedAt: "2026-10-27T00:00:00Z", versions,
    });
    const anon = await createAnonymousIdentityCredentialV9(db, {
      identityId: "anon-events", createdAt: "2026-10-27T00:00:00Z",
    });
    await createOwnedDiagnosticRunV9(db, {
      workspaceId: "public", runId: "run-anon-events", identityId: anon.identityId,
      recoveryCredential: anon.recoveryCredential, startedAt: "2026-10-27T00:00:00Z", versions,
    });
    const event = {
      workspaceId: "public", runId: "run-user-events", userId: "user-1",
      eventId: "event-user-1", expectedSeq: 0, kind: "answer",
      payload: { questionId: "q1", value: "yes", mode: "answer" },
      occurredAt: "2026-10-27T00:00:01Z",
    };
    assert.deepEqual(await appendOwnedDiagnosticEventV9(db, event), { status: "created", seq: 1 });
    assert.deepEqual(await appendOwnedDiagnosticEventV9(db, event), { status: "duplicate", seq: 1 });
    await assert.rejects(() => appendOwnedDiagnosticEventV9(db, { ...event, userId: "user-2" }), /v9_run_not_owned/);
    const anonEvent = { ...event, runId: "run-anon-events", userId: undefined, identityId: anon.identityId,
      recoveryCredential: anon.recoveryCredential, eventId: "event-anon-1" };
    await assert.rejects(() => appendOwnedDiagnosticEventV9(db, { ...anonEvent, recoveryCredential: "0".repeat(64) }), /v9_identity_proof_invalid/);
    assert.deepEqual(await appendOwnedDiagnosticEventV9(db, anonEvent), { status: "created", seq: 1 });
  } finally {
    sqlite.close();
  }
});
