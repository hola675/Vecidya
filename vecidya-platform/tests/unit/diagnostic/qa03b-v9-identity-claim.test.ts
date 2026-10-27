import assert from "node:assert/strict";
import test from "node:test";
import {
  createAnonymousIdentityCredentialV9,
  ensureUserIdentityV9,
  prepareAnonymousIdentityClaimV9,
  type V9IdentityDb,
} from "../../../app/features/diagnostic/qa03b/v9-identity-repository";

test("V9 claim preparation requires credential proof and existing authenticated user identity", async () => {
  const identities = new Map<string, { identity_id: string; identity_type: string; credential_hash: string | null; claimed_by_user_id: string | null; user_id?: string }>();
  const claims: unknown[][] = [];
  const db: V9IdentityDb = {
    async batch() { return []; },
    prepare(sql) {
      return { bind(...values: unknown[]) {
        return {
          async first<T>() {
            if (sql.includes("WHERE identity_id=?")) return (identities.get(String(values[0])) ?? null) as T | null;
            if (sql.includes("WHERE identity_type='user' AND user_id=?")) {
              return ([...identities.values()].find((x) => x.identity_type === "user" && x.user_id === values[0]) ?? null) as T | null;
            }
            return null;
          },
          async run() {
            if (sql.includes("INSERT INTO diagnostic_v9_identities") && sql.includes("'anonymous'")) {
              identities.set(String(values[0]), { identity_id: String(values[0]), identity_type: "anonymous", credential_hash: String(values[1]), claimed_by_user_id: null });
            } else if (sql.includes("INSERT INTO diagnostic_v9_identities") && sql.includes("'user'")) {
              identities.set(String(values[0]), { identity_id: String(values[0]), identity_type: "user", credential_hash: null, claimed_by_user_id: null, user_id: String(values[1]) });
            } else if (sql.includes("INSERT INTO diagnostic_v9_identity_claims")) claims.push(values);
            return { success: true };
          },
          async all<T>() { return { results: [] as T[] }; },
        };
      } };
    },
  };
  const anon = await createAnonymousIdentityCredentialV9(db, { identityId: "anon-1", createdAt: "2026-10-27" });
  await ensureUserIdentityV9(db, { identityId: "identity-user-1", userId: "user-1", createdAt: "2026-10-27" });
  await assert.rejects(() => prepareAnonymousIdentityClaimV9(db, {
    claimId: "claim-bad", identityId: anon.identityId, recoveryCredential: "0".repeat(64),
    targetUserId: "user-1", createdAt: "2026-10-27",
  }), /v9_claim_proof_invalid/);
  assert.equal(await prepareAnonymousIdentityClaimV9(db, {
    claimId: "claim-ok", identityId: anon.identityId, recoveryCredential: anon.recoveryCredential,
    targetUserId: "user-1", createdAt: "2026-10-27",
  }), "pending");
  assert.equal(claims.length, 1);
});
