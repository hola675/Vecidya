import assert from "node:assert/strict";
import test from "node:test";
import { resolveCrmPortalState, officialHighLevelLogin } from "../../app/lib/crm-portal-state.ts";

const active = [{ code: "crm", status: "active" }];
const verified = [{ provider: "ghl", status: "active", externalId: "loc-1", metadata: '{"portalAccessVerified":true}' }];

test("CRM never appears without assignment", () => {
  assert.equal(resolveCrmPortalState([], verified), "not_included");
});
test("service pending and missing connection remain pending", () => {
  assert.equal(resolveCrmPortalState([{ code: "crm", status: "pending" }], []), "pending_setup");
  assert.equal(resolveCrmPortalState(active, []), "pending_setup");
});
test("suspended or terminated service cannot open GHL", () => {
  assert.equal(resolveCrmPortalState([{ code: "crm", status: "suspended" }], verified), "suspended");
  assert.equal(resolveCrmPortalState([{ code: "crm", status: "ended" }], verified), "suspended");
});
test("inactive or errored provider is not treated as ready", () => {
  assert.equal(resolveCrmPortalState(active, [{ ...verified[0], status: "inactive" }]), "suspended");
  assert.equal(resolveCrmPortalState(active, [{ ...verified[0], status: "error" }]), "unavailable");
});
test("unverified active provider is still pending", () => {
  assert.equal(resolveCrmPortalState(active, [{ ...verified[0], metadata: null }]), "pending_setup");
  assert.equal(resolveCrmPortalState(active, [{ ...verified[0], metadata: "{" }]), "pending_setup");
  assert.equal(resolveCrmPortalState(active, [{ ...verified[0], externalId: "" }]), "pending_setup");
});
test("even an externally verified location cannot auto-enable portal before entitlement audit", () => {
  assert.equal(resolveCrmPortalState(active, verified), "pending_setup");
});
test("handoff uses only the documented HighLevel origin", () => {
  assert.equal(officialHighLevelLogin, "https://app.gohighlevel.com/");
});
