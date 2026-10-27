/**
 * V9 identity/ownership persistence primitives.
 * Server-only module: derive userId and organization permissions from the
 * authenticated server session; never pass browser-supplied identity claims here.
 */
export type V9IdentityDb = {
  batch<T = unknown>(statements: unknown[]): Promise<Array<{ success: boolean; meta?: { changes?: number }; results?: T[] }>>;
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
  await db.prepare(
    "INSERT INTO diagnostic_v9_identities (identity_id,identity_type,user_id,created_at) VALUES (?,'user',?,?) ON CONFLICT(user_id) WHERE identity_type='user' DO NOTHING",
  ).bind(input.identityId, input.userId, input.createdAt).run();
  const identity = await db.prepare(
    "SELECT identity_id FROM diagnostic_v9_identities WHERE identity_type='user' AND user_id=?",
  ).bind(input.userId).first<{ identity_id: string }>();
  if (!identity) throw new Error("v9_user_identity_create_failed");
  return identity.identity_id;
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

/** Creates a high-entropy anonymous recovery secret; return it only once to the caller. */
export async function createAnonymousIdentityCredentialV9(
  db: V9IdentityDb,
  input: { identityId: string; createdAt: string },
): Promise<{ identityId: string; recoveryCredential: string }> {
  if (!input.identityId || !input.createdAt) throw new Error("v9_identity_invalid_input");
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const recoveryCredential = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(recoveryCredential));
  const credentialHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  await createAnonymousIdentityV9(db, {
    identityId: input.identityId,
    credentialHash,
    createdAt: input.createdAt,
  });
  return { identityId: input.identityId, recoveryCredential };
}

/** Constant-time comparison of a presented credential against a stored digest. */
export async function verifyAnonymousIdentityCredentialV9(
  recoveryCredential: string,
  storedCredentialHash: string,
): Promise<boolean> {
  if (!/^[a-f0-9]{64}$/.test(recoveryCredential) || !/^[a-f0-9]{64}$/.test(storedCredentialHash)) return false;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(recoveryCredential));
  const actual = new Uint8Array(digest);
  const expected = new Uint8Array(storedCredentialHash.match(/../g)!.map((byte) => Number.parseInt(byte, 16)));
  let difference = 0;
  for (let index = 0; index < actual.length; index++) difference |= actual[index]! ^ expected[index]!;
  return difference === 0;
}

/**
 * Verifies possession and records a pending claim. This deliberately does not
 * transfer ownership: finalization must run in a transactional D1 batch.
 * targetUserId must come from the authenticated server session, never the body.
 */
export async function prepareAnonymousIdentityClaimV9(
  db: V9IdentityDb,
  input: {
    claimId: string;
    identityId: string;
    recoveryCredential: string;
    targetUserId: string;
    createdAt: string;
  },
): Promise<"pending"> {
  if (!input.claimId || !input.identityId || !input.targetUserId || !input.createdAt) {
    throw new Error("v9_claim_invalid_input");
  }
  const identity = await db.prepare(
    "SELECT identity_id,identity_type,credential_hash,claimed_by_user_id FROM diagnostic_v9_identities WHERE identity_id=?",
  ).bind(input.identityId).first<{
    identity_id: string; identity_type: string; credential_hash: string | null; claimed_by_user_id: string | null;
  }>();
  if (!identity || identity.identity_type !== "anonymous" || !identity.credential_hash) {
    throw new Error("v9_claim_identity_not_claimable");
  }
  if (identity.claimed_by_user_id) {
    throw new Error("v9_claim_already_claimed");
  }
  const valid = await verifyAnonymousIdentityCredentialV9(input.recoveryCredential, identity.credential_hash);
  if (!valid) throw new Error("v9_claim_proof_invalid");
  const target = await db.prepare(
    "SELECT identity_id FROM diagnostic_v9_identities WHERE identity_type='user' AND user_id=?",
  ).bind(input.targetUserId).first<{ identity_id: string }>();
  if (!target) throw new Error("v9_claim_user_identity_missing");
  await db.prepare(
    "INSERT INTO diagnostic_v9_identity_claims (claim_id,identity_id,target_user_id,proof_type,status,created_at) VALUES (?,?,?,'anonymous_credential','pending',?)",
  ).bind(input.claimId, input.identityId, input.targetUserId, input.createdAt).run();
  return "pending";
}

/**
 * Atomically claims an anonymous identity and transfers its runs to the
 * authenticated user's identity. Caller must have authenticated targetUserId.
 */
export async function finalizeAnonymousIdentityClaimV9(
  db: V9IdentityDb,
  input: { claimId: string; identityId: string; targetUserId: string; completedAt: string },
): Promise<{ transferredRuns: number }> {
  if (!input.claimId || !input.identityId || !input.targetUserId || !input.completedAt) {
    throw new Error("v9_claim_invalid_input");
  }
  const claim = await db.prepare(
    "SELECT claim_id FROM diagnostic_v9_identity_claims WHERE claim_id=? AND identity_id=? AND target_user_id=? AND status='pending'",
  ).bind(input.claimId, input.identityId, input.targetUserId).first<{ claim_id: string }>();
  if (!claim) throw new Error("v9_claim_not_pending");
  const target = await db.prepare(
    "SELECT identity_id FROM diagnostic_v9_identities WHERE identity_type='user' AND user_id=?",
  ).bind(input.targetUserId).first<{ identity_id: string }>();
  if (!target) throw new Error("v9_claim_user_identity_missing");
  const batch = await db.batch([
    db.prepare(
      "UPDATE diagnostic_v9_identities SET claimed_by_user_id=?,claimed_at=? WHERE identity_id=? AND identity_type='anonymous' AND claimed_by_user_id IS NULL",
    ).bind(input.targetUserId, input.completedAt, input.identityId),
    db.prepare(
      "UPDATE diagnostic_v9_run_ownership SET identity_id=?,assignment_source='verified_claim',assigned_at=? WHERE identity_id=? AND EXISTS (SELECT 1 FROM diagnostic_v9_identity_claims WHERE claim_id=? AND status='pending' AND target_user_id=?) AND EXISTS (SELECT 1 FROM diagnostic_v9_identities WHERE identity_id=? AND claimed_by_user_id=? AND claimed_at=?)",
    ).bind(target.identity_id, input.completedAt, input.identityId, input.claimId, input.targetUserId, input.identityId, input.targetUserId, input.completedAt),
    db.prepare(
      "UPDATE diagnostic_v9_identity_claims SET status='completed',completed_at=? WHERE claim_id=? AND status='pending' AND target_user_id=? AND EXISTS (SELECT 1 FROM diagnostic_v9_identities WHERE identity_id=? AND claimed_by_user_id=? AND claimed_at=?)",
    ).bind(input.completedAt, input.claimId, input.targetUserId, input.identityId, input.targetUserId, input.completedAt),
  ]);
  if (batch.length !== 3 || batch.some((item) => !item.success)) throw new Error("v9_claim_finalize_failed");
  if ((batch[0]?.meta?.changes ?? 0) !== 1 || (batch[2]?.meta?.changes ?? 0) !== 1) {
    throw new Error("v9_claim_already_finalized");
  }
  return { transferredRuns: batch[1]?.meta?.changes ?? 0 };
}

/** Link a run to an organization only when the authenticated user owns it. */
export async function linkOwnedDiagnosticRunToOrganizationV9(
  db: V9IdentityDb,
  input: {
    workspaceId: string;
    runId: string;
    organizationId: string;
    linkedByUserId: string;
    linkedAt: string;
  },
): Promise<"created" | "duplicate"> {
  if (!input.workspaceId || !input.runId || !input.organizationId || !input.linkedByUserId || !input.linkedAt) {
    throw new Error("v9_organization_link_invalid_input");
  }
  const ownership = await db.prepare(
    "SELECT o.identity_id FROM diagnostic_v9_run_ownership o JOIN diagnostic_v9_identities i ON i.identity_id=o.identity_id WHERE o.workspace_id=? AND o.run_id=? AND i.identity_type='user' AND i.user_id=?",
  ).bind(input.workspaceId, input.runId, input.linkedByUserId).first<{ identity_id: string }>();
  if (!ownership) throw new Error("v9_run_not_owned");
  const existing = await db.prepare(
    "SELECT organization_id FROM diagnostic_v9_run_organizations WHERE workspace_id=? AND run_id=? AND organization_id=?",
  ).bind(input.workspaceId, input.runId, input.organizationId).first<{ organization_id: string }>();
  if (existing) return "duplicate";
  const result = await db.prepare(
    "INSERT INTO diagnostic_v9_run_organizations (workspace_id,run_id,organization_id,linked_by_user_id,linked_at,link_reason) SELECT ?,?,?,?,?,'owner_requested' WHERE EXISTS (SELECT 1 FROM diagnostic_v9_run_ownership o JOIN diagnostic_v9_identities i ON i.identity_id=o.identity_id WHERE o.workspace_id=? AND o.run_id=? AND i.identity_type='user' AND i.user_id=?)",
  ).bind(input.workspaceId, input.runId, input.organizationId, input.linkedByUserId, input.linkedAt, input.workspaceId, input.runId, input.linkedByUserId).run();
  if ((result.meta?.changes ?? 0) !== 1) throw new Error("v9_run_not_owned");
  return "created";
}

/** Assigns a newly created run to the server-authenticated account. */
export async function assignDiagnosticRunToAuthenticatedUserV9(
  db: V9IdentityDb,
  input: { workspaceId: string; runId: string; identityId: string; userId: string; assignedAt: string },
): Promise<{ identityId: string }> {
  if (!input.userId) throw new Error("v9_authenticated_user_required");
  const identityId = await ensureUserIdentityV9(db, {
    identityId: input.identityId,
    userId: input.userId,
    createdAt: input.assignedAt,
  });
  await assignDiagnosticOwnerV9(db, {
    workspaceId: input.workspaceId,
    runId: input.runId,
    identityId,
    assignedAt: input.assignedAt,
    source: "authenticated_session",
  });
  return { identityId };
}

/** Creates an anonymous identity, assigns a run, and returns the secret once. */
export async function assignDiagnosticRunToAnonymousVisitorV9(
  db: V9IdentityDb,
  input: { workspaceId: string; runId: string; identityId: string; assignedAt: string },
): Promise<{ identityId: string; recoveryCredential: string }> {
  if (!input.workspaceId || !input.runId || !input.identityId || !input.assignedAt) {
    throw new Error("v9_owner_invalid_input");
  }
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const recoveryCredential = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(recoveryCredential));
  const credentialHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const result = await db.batch([
    db.prepare(
      "INSERT INTO diagnostic_v9_identities (identity_id,identity_type,credential_hash,created_at) VALUES (?,'anonymous',?,?)",
    ).bind(input.identityId, credentialHash, input.assignedAt),
    db.prepare(
      "INSERT INTO diagnostic_v9_run_ownership (workspace_id,run_id,identity_id,assigned_at,assignment_source) VALUES (?,?,?,?,'anonymous_session')",
    ).bind(input.workspaceId, input.runId, input.identityId, input.assignedAt),
  ]);
  if (result.length !== 2 || result.some((item) => !item.success) ||
      (result[0]?.meta?.changes ?? 0) !== 1 || (result[1]?.meta?.changes ?? 0) !== 1) {
    throw new Error("v9_anonymous_assignment_failed");
  }
  return { identityId: input.identityId, recoveryCredential };
}

/** Releases a pending claim after a failed finalization attempt; completed claims are immutable here. */
export async function expirePendingDiagnosticIdentityClaimV9(
  db: V9IdentityDb,
  input: { claimId: string; expiredAt: string },
): Promise<boolean> {
  if (!input.claimId || !input.expiredAt) throw new Error("v9_claim_invalid_input");
  const result = await db.prepare(
    "UPDATE diagnostic_v9_identity_claims SET status='expired' WHERE claim_id=? AND status='pending' AND completed_at IS NULL",
  ).bind(input.claimId).run();
  return (result.meta?.changes ?? 0) === 1;
}

/** Reuses a visitor identity across multiple runs only with proof of its secret. */
export async function assignDiagnosticRunToExistingAnonymousIdentityV9(
  db: V9IdentityDb,
  input: {
    workspaceId: string;
    runId: string;
    identityId: string;
    recoveryCredential: string;
    assignedAt: string;
  },
): Promise<{ identityId: string }> {
  if (!input.workspaceId || !input.runId || !input.identityId || !input.assignedAt) {
    throw new Error("v9_owner_invalid_input");
  }
  const identity = await db.prepare(
    "SELECT identity_id,identity_type,credential_hash,claimed_by_user_id FROM diagnostic_v9_identities WHERE identity_id=?",
  ).bind(input.identityId).first<{
    identity_id: string; identity_type: string; credential_hash: string | null; claimed_by_user_id: string | null;
  }>();
  if (!identity || identity.identity_type !== "anonymous" || !identity.credential_hash) {
    throw new Error("v9_identity_not_claimable");
  }
  if (identity.claimed_by_user_id) throw new Error("v9_identity_already_claimed");
  if (!await verifyAnonymousIdentityCredentialV9(input.recoveryCredential, identity.credential_hash)) {
    throw new Error("v9_identity_proof_invalid");
  }
  await assignDiagnosticOwnerV9(db, {
    workspaceId: input.workspaceId,
    runId: input.runId,
    identityId: input.identityId,
    assignedAt: input.assignedAt,
    source: "anonymous_session",
  });
  return { identityId: input.identityId };
}
