import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import {
  createAnonymousIdentityCredentialV9,
  ensureUserIdentityV9,
  finalizeAnonymousIdentityClaimV9,
  prepareAnonymousIdentityClaimV9,
  type V9IdentityDb,
} from "../../../app/features/diagnostic/qa03b/v9-identity-repository";

const migrations = [
  readFileSync(new URL("../../../db/migrations/0030_diagnostic_v9_audit.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0031_diagnostic_v9_identity_ownership.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0032_diagnostic_v9_claim_guards.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0033_diagnostic_v9_owner_assignment_guards.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0032_diagnostic_v9_claim_guards.sql", import.meta.url), "utf8"),
];

function identityDb(sqlite: DatabaseSync): V9IdentityDb {
  type Bound = { sql: string; values: unknown[] };
  const execute = (sql: string, values: unknown[]) => sqlite.prepare(sql).run(...values as []);
  return {
    async batch(statements: unknown[]) {
      sqlite.exec("BEGIN");
      try {
        const results = statements.map((raw) => {
          const statement = raw as Bound;
          const result = execute(statement.sql, statement.values) as { changes?: number };
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
            sql, values,
            async run() {
              const result = execute(sql, values) as { changes?: number };
              return { success: true, meta: { changes: result.changes ?? 0 } };
            },
            async first<T>() {
              return (sqlite.prepare(sql).get(...values as []) ?? null) as T | null;
            },
          };
        },
      };
    },
  };
}

test("V9 claim finalization atomically transfers run ownership and rejects replay", async () => {
  const sqlite = new DatabaseSync(":memory:");
  try {
    sqlite.exec("PRAGMA foreign_keys=ON");
    for (const migration of migrations) sqlite.exec(migration);
    sqlite.prepare("INSERT INTO diagnostic_v9_runs (workspace_id,run_id,started_at,bank_version,engine_version,scoring_version,recommendation_version,consent_version) VALUES (?,?,?,?,?,?,?,?)")
      .run("public", "run-anon", "2026-10-27", "b1", "e1", "s1", "r1", "c1");
    const db = identityDb(sqlite);
    const anon = await createAnonymousIdentityCredentialV9(db, { identityId: "anon-1", createdAt: "2026-10-27" });
    const userIdentityId = await ensureUserIdentityV9(db, { identityId: "user-identity-1", userId: "user-1", createdAt: "2026-10-27" });
    sqlite.prepare("INSERT INTO diagnostic_v9_run_ownership (workspace_id,run_id,identity_id,assigned_at,assignment_source) VALUES (?,?,?,?,?)")
      .run("public", "run-anon", anon.identityId, "2026-10-27", "anonymous_session");
    await prepareAnonymousIdentityClaimV9(db, {
      claimId: "claim-1", identityId: anon.identityId, recoveryCredential: anon.recoveryCredential,
      targetUserId: "user-1", createdAt: "2026-10-27",
    });
    const attempts = await Promise.allSettled([
      finalizeAnonymousIdentityClaimV9(db, {
        claimId: "claim-1", identityId: anon.identityId, targetUserId: "user-1", completedAt: "2026-10-28",
      }),
      finalizeAnonymousIdentityClaimV9(db, {
        claimId: "claim-1", identityId: anon.identityId, targetUserId: "user-1", completedAt: "2026-10-28",
      }),
    ]);
    const successful = attempts.filter((attempt): attempt is PromiseFulfilledResult<{ transferredRuns: number }> => attempt.status === "fulfilled");
    assert.equal(successful.length, 1, "only one concurrent finalization may succeed");
    const result = successful[0]!.value;
    assert.deepEqual(result, { transferredRuns: 1 });
    assert.equal((sqlite.prepare("SELECT identity_id FROM diagnostic_v9_run_ownership WHERE run_id='run-anon'").get() as {identity_id:string}).identity_id, userIdentityId);
    assert.equal((sqlite.prepare("SELECT status FROM diagnostic_v9_identity_claims WHERE claim_id='claim-1'").get() as {status:string}).status, "completed");
    await assert.rejects(() => finalizeAnonymousIdentityClaimV9(db, {
      claimId: "claim-1", identityId: anon.identityId, targetUserId: "user-1", completedAt: "2026-10-29",
    }), /v9_claim_not_pending/);
  } finally {
    sqlite.close();
  }
});

test("V9 claim guard migration rejects a second pending claim for one anonymous identity", () => {
  const sqlite = new DatabaseSync(":memory:");
  try {
    sqlite.exec("PRAGMA foreign_keys=ON");
    for (const migration of migrations) sqlite.exec(migration);
    sqlite.prepare("INSERT INTO diagnostic_v9_identities (identity_id,identity_type,credential_hash,created_at) VALUES (?,'anonymous',?,?)")
      .run("anon-1", "a".repeat(64), "2026-10-27");
    const insert = sqlite.prepare("INSERT INTO diagnostic_v9_identity_claims (claim_id,identity_id,target_user_id,proof_type,status,created_at) VALUES (?,?,'user-1','anonymous_credential','pending',?)");
    insert.run("claim-1", "anon-1", "2026-10-27");
    assert.throws(() => insert.run("claim-2", "anon-1", "2026-10-27"), /UNIQUE constraint failed/);
  } finally {
    sqlite.close();
  }
});
