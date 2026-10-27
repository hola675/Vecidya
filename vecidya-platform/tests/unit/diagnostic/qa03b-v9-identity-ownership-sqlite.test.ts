import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

const migrations = [
  readFileSync(new URL("../../../db/migrations/0030_diagnostic_v9_audit.sql", import.meta.url), "utf8"),
  readFileSync(new URL("../../../db/migrations/0031_diagnostic_v9_identity_ownership.sql", import.meta.url), "utf8"),
];

test("V9 identity ownership supports user and anonymous owners without conflating org links", () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec("PRAGMA foreign_keys = ON");
    for (const migration of migrations) db.exec(migration);
    db.prepare("INSERT INTO diagnostic_v9_runs (workspace_id,run_id,started_at,bank_version,engine_version,scoring_version,recommendation_version,consent_version) VALUES (?,?,?,?,?,?,?,?)")
      .run("public", "run-anon", "2026-10-27", "b1", "e1", "s1", "r1", "c1");
    db.prepare("INSERT INTO diagnostic_v9_runs (workspace_id,run_id,started_at,bank_version,engine_version,scoring_version,recommendation_version,consent_version) VALUES (?,?,?,?,?,?,?,?)")
      .run("public", "run-user", "2026-10-27", "b1", "e1", "s1", "r1", "c1");
    db.prepare("INSERT INTO diagnostic_v9_identities (identity_id,identity_type,credential_hash,created_at) VALUES (?,'anonymous',?,?)")
      .run("anon-1", "hash-only", "2026-10-27");
    db.prepare("INSERT INTO diagnostic_v9_identities (identity_id,identity_type,user_id,created_at) VALUES (?,'user',?,?)")
      .run("identity-user-1", "user-1", "2026-10-27");
    const ownership = db.prepare("INSERT INTO diagnostic_v9_run_ownership (workspace_id,run_id,identity_id,assigned_at,assignment_source) VALUES (?,?,?,?,?)");
    ownership.run("public", "run-anon", "anon-1", "2026-10-27", "anonymous_session");
    ownership.run("public", "run-user", "identity-user-1", "2026-10-27", "authenticated_session");
    db.prepare("INSERT INTO diagnostic_v9_run_organizations (workspace_id,run_id,organization_id,linked_by_user_id,linked_at,link_reason) VALUES (?,?,?,?,?,?)")
      .run("public", "run-user", "org-1", "user-1", "2026-10-27", "owner_requested");
    assert.equal((db.prepare("SELECT COUNT(*) AS n FROM diagnostic_v9_run_ownership WHERE identity_id='anon-1'").get() as {n:number}).n, 1);
    assert.equal((db.prepare("SELECT COUNT(*) AS n FROM diagnostic_v9_run_organizations WHERE run_id='run-user'").get() as {n:number}).n, 1);
    assert.throws(() => db.prepare("INSERT INTO diagnostic_v9_run_ownership (workspace_id,run_id,identity_id,assigned_at,assignment_source) VALUES (?,?,?,?,?)")
      .run("public", "missing-run", "anon-1", "2026-10-27", "anonymous_session"), /FOREIGN KEY constraint failed/);
    assert.throws(() => db.prepare("INSERT INTO diagnostic_v9_identities (identity_id,identity_type,credential_hash,created_at) VALUES (?,'anonymous',?,?)")
      .run("anon-bad", null, "2026-10-27"), /CHECK constraint failed/);
  } finally {
    db.close();
  }
});
