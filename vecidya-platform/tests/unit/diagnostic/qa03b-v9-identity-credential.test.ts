import assert from "node:assert/strict";
import test from "node:test";
import {
  createAnonymousIdentityCredentialV9,
  verifyAnonymousIdentityCredentialV9,
  type V9IdentityDb,
} from "../../../app/features/diagnostic/qa03b/v9-identity-repository";

test("V9 anonymous recovery secret is random, returned once, and only its digest is stored", async () => {
  let stored: unknown[] = [];
  const db: V9IdentityDb = {
    prepare(sql) {
      assert.match(sql, /INSERT INTO diagnostic_v9_identities/);
      return { bind(...values: unknown[]) {
        stored = values;
        return { async run() { return { success: true }; }, async first<T>() { return null as T | null; } };
      } };
    },
  };
  const result = await createAnonymousIdentityCredentialV9(db, {
    identityId: "anon-1", createdAt: "2026-10-27T00:00:00Z",
  });
  assert.match(result.recoveryCredential, /^[a-f0-9]{64}$/);
  assert.equal(stored[1], await (async () => {
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(result.recoveryCredential));
    return Array.from(new Uint8Array(bytes), (v) => v.toString(16).padStart(2, "0")).join("");
  })());
  assert.notEqual(stored[1], result.recoveryCredential);
  assert.equal(await verifyAnonymousIdentityCredentialV9(result.recoveryCredential, String(stored[1])), true);
  assert.equal(await verifyAnonymousIdentityCredentialV9("bad", String(stored[1])), false);
  const second = await createAnonymousIdentityCredentialV9(db, {
    identityId: "anon-2", createdAt: "2026-10-27T00:00:01Z",
  });
  assert.notEqual(result.recoveryCredential, second.recoveryCredential);
});
