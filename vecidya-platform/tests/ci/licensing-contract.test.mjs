import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");
const auth = read("server/auth-plugins.server.ts");
const app = read("app/routes/app.tsx");
const profile = read("app/routes/business-profile.tsx");
const queries = read("db/queries/business-profile.server.ts");

test("first organization and additional organizations use server-side license gate", () => {
  assert.match(auth, /allowUserToCreateOrganization:\s*async/);
  assert.match(auth, /if \(!owned\) return true/);
  assert.match(auth, /billingAccount\.ownerUserId/);
  assert.match(auth, /organizationLicense\.status, "active"/);
  assert.match(auth, /organizationLicense\.endsAt/);
});

test("organization creation UI mirrors entitlement", () => {
  assert.match(app, /canCreateOrganizations/);
  assert.match(app, /activeLicense/);
});

test("publication checks organization owner entitlement in loader and action", () => {
  assert.equal((profile.match(/hasActiveLicenseForOrganizationOwner\(database, organization\.id\)/g) || []).length, 2);
  assert.match(profile, /if \(!activeLicense\)/);
  assert.match(profile, /canPublish/);
});

test("public listing, detail and filters require active owner license", () => {
  assert.ok((queries.match(/hasActiveOwnerLicense/g) || []).length >= 5);
  assert.match(queries, /organizationLicense\.endsAt/);
});

test("CRM licensing stays distinct from Vecindario publication", () => {
  const licensing = read("db/schema/licensing.ts");
  assert.match(licensing, /"cuadra", "barrio", "ciudad"/);
  assert.match(licensing, /organizationId: text\("organization_id"\)/);
});
