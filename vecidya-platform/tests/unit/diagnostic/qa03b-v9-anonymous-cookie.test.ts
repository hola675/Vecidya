import assert from "node:assert/strict";
import test from "node:test";
import {
  buildV9AnonymousIdentityCookie,
  clearV9AnonymousIdentityCookie,
  readV9AnonymousIdentityCookie,
} from "../../../app/features/diagnostic/qa03b/anonymous-identity-cookie.server";

test("V9 anonymous cookie is HttpOnly, scoped to diagnostic APIs, and parsed safely", () => {
  const request = new Request("https://vecidya.com/api/diagnostic/anonymous-identity");
  const identity = { identityId: "identity-123", recoveryCredential: "a".repeat(64) };
  const cookie = buildV9AnonymousIdentityCookie(request, identity);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Path=\/api\/diagnostic/);
  const parsed = readV9AnonymousIdentityCookie(new Request(request.url, { headers: { cookie: cookie.split(";")[0] } }));
  assert.deepEqual(parsed, identity);
  assert.match(clearV9AnonymousIdentityCookie(request), /Max-Age=0/);
});

test("V9 anonymous cookie rejects malformed or truncated bearer credentials", () => {
  const url = "https://vecidya.com/api/diagnostic/claim-anonymous";
  assert.equal(readV9AnonymousIdentityCookie(new Request(url, { headers: { cookie: "vecidya_diagnostic_v9=bad" } })), null);
  assert.equal(readV9AnonymousIdentityCookie(new Request(url, { headers: { cookie: "vecidya_diagnostic_v9=id.not-a-secret" } })), null);
});
