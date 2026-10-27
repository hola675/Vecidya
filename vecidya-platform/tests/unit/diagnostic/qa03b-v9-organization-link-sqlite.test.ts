import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { linkOwnedDiagnosticRunToOrganizationV9, type V9IdentityDb } from "../../../app/features/diagnostic/qa03b/v9-identity-repository";

const migrations = [
  readFileSync(new URL("../../../db/migrations/0030_diagnostic_v9_audit.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0031_diagnostic_v9_identity_ownership.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0032_diagnostic_v9_claim_guards.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0033_diagnostic_v9_owner_assignment_guards.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0034_diagnostic_v9_identity_claim_integrity.sql", import.meta.url), "utf8"),
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

test("V9 organization link requires personal ownership and is idempotent", async () => {
  const sqlite = new DatabaseSync(":memory:");
  try {
    sqlite.exec("PRAGMA foreign_keys=ON");
    for (const migration of migrations) sqlite.exec(migration);
    const run = sqlite.prepare("INSERT INTO diagnostic_v9_runs (workspace_id,run_id,started_at,bank_version,engine_version,scoring_version,recommendation_version,consent_version) VALUES (?,?,?,?,?,?,?,?)");
    run.run("public", "owned-run", "2026-10-27", "b1", "e1", "s1", "r1", "c1");
    run.run("public", "other-run", "2026-10-27", "b1", "e1", "s1", "r1", "c1");
    sqlite.prepare("INSERT INTO diagnostic_v9_identities (identity_id,identity_type,user_id,created_at) VALUES (?,'user',?,?)")
      .run("identity-user", "user-1", "2026-10-27");
    sqlite.prepare("INSERT INTO diagnostic_v9_run_ownership (workspace_id,run_id,identity_id,assigned_at,assignment_source) VALUES (?,?,?,?,?)")
      .run("public", "owned-run", "identity-user", "2026-10-27", "authenticated_session");
    const db = adapter(sqlite);
    const input = { workspaceId: "public", runId: "owned-run", organizationId: "org-1", linkedByUserId: "user-1", linkedAt: "2026-10-27" };
    assert.equal(await linkOwnedDiagnosticRunToOrganizationV9(db, input), "created");
    assert.equal(await linkOwnedDiagnosticRunToOrganizationV9(db, input), "duplicate");
    await assert.rejects(() => linkOwnedDiagnosticRunToOrganizationV9(db, { ...input, runId: "other-run" }), /v9_run_not_owned/);
    assert.equal((sqlite.prepare("SELECT COUNT(*) AS n FROM diagnostic_v9_run_organizations").get() as {n:number}).n, 1);
  } finally {
    sqlite.close();
  }
});
