/**
 * V9 identity/ownership persistence primitives.
 * Server-only module: derive userId and organization permissions from the
 * authenticated server session; never pass browser-supplied identity claims here.
 */
export type V9IdentityDb = {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
};

export type V9IdentityType = "user" | "anonymous";
export type V9AssignmentSource =
  | "authenticated_session"
  | "anonymous_session"
  | "verified_claim"
  | "operator_migration";

export async function createAnonymousIdentityV9(
  db: V9IdentityDb,
  input: { identityId: string; credentialHash: string; createdAt: string },
): Promise<void> {
  if (!input.identityId || !input.credentialHash || !input.createdAt) {
    throw new Error("v9_identity_invalid_input");
  }
  await db.prepare(
    "INSERT INTO diagnostic_v9_identities (identity_id,identity_type,credential_hash,created_at) VALUES (?,'anonymous',?,?)",
  ).bind(input.identityId, input.credentialHash, input.createdAt).run();
}

export async function ensureUserIdentityV9(
  db: V9IdentityDb,
  input: { identityId: string; userId: string; createdAt: string },
): Promise<string> {
  if (!input.identityId || !input.userId || !input.createdAt) throw new Error("v9_identity_invalid_input");
  const existing = await db.prepare(
    "SELECT identity_id FROM diagnostic_v9_identities WHERE identity_type='user' AND user_id=?",
  ).bind(input.userId).first<{ identity_id: string }>();
  if (existing) return existing.identity_id;
  await db.prepare(
    "INSERT INTO diagnostic_v9_identities (identity_id,identity_type,user_id,created_at) VALUES (?,'user',?,?)",
  ).bind(input.identityId, input.userId, input.createdAt).run();
  return input.identityId;
}

export async function assignDiagnosticOwnerV9(
  db: V9IdentityDb,
  input: {
    workspaceId: string;
    runId: string;
    identityId: string;
    assignedAt: string;
    source: V9AssignmentSource;
  },
): Promise<void> {
  if (!input.workspaceId || !input.runId || !input.identityId || !input.assignedAt) {
    throw new Error("v9_owner_invalid_input");
  }
  const identity = await db.prepare(
    "SELECT identity_id FROM diagnostic_v9_identities WHERE identity_id=?",
  ).bind(input.identityId).first<{ identity_id: string }>();
  if (!identity) throw new Error("v9_identity_not_found");
  await db.prepare(
    "INSERT INTO diagnostic_v9_run_ownership (workspace_id,run_id,identity_id,assigned_at,assignment_source) VALUES (?,?,?,?,?)",
  ).bind(input.workspaceId, input.runId, input.identityId, input.assignedAt, input.source).run();
}

export async function listOwnedDiagnosticRunsV9(
  db: V9IdentityDb,
  input: { identityId: string; limit?: number },
): Promise<readonly { workspace_id: string; run_id: string; assigned_at: string; assignment_source: string }[]> {
  if (!input.identityId) throw new Error("v9_identity_invalid_input");
  const limit = Number.isFinite(input.limit) ? Math.max(1, Math.min(100, Math.trunc(input.limit ?? 20))) : 20;
  const result = await db.prepare(
    "SELECT o.workspace_id,o.run_id,o.assigned_at,o.assignment_source FROM diagnostic_v9_run_ownership o JOIN diagnostic_v9_identities i ON i.identity_id=o.identity_id WHERE o.identity_id=? ORDER BY o.assigned_at DESC,o.run_id DESC LIMIT ?",
  ).bind(input.identityId, limit).all<{
    workspace_id: string; run_id: string; assigned_at: string; assignment_source: string;
  }>();
  return result.results;
}
