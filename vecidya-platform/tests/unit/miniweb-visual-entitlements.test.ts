import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateMiniWebVisualAccess as access } from "../../app/features/miniweb/visual-entitlements";

const license = (tier: "cuadra" | "barrio" | "ciudad", billingOwnerId = "owner-a", active = true) =>
  ({ tier, billingOwnerId, active });

test("V2C: Cuadra permite Base, no Pro ni Premium", () => {
  assert.equal(access("owner-a", "base", [license("cuadra")]).allowed, true);
  assert.equal(access("owner-a", "pro", [license("cuadra")]).reason, "insufficient_tier");
  assert.equal(access("owner-a", "premium", [license("cuadra")]).allowed, false);
});

test("V2C: Barrio permite Pro y Ciudad permite Premium", () => {
  assert.equal(access("owner-a", "pro", [license("barrio")]).allowed, true);
  assert.equal(access("owner-a", "premium", [license("barrio")]).allowed, false);
  assert.equal(access("owner-a", "premium", [license("ciudad")]).allowed, true);
});

test("V2C: toma el máximo de licencias activas del mismo billing owner", () => {
  const result = access("owner-a", "premium", [license("cuadra"), license("ciudad"), license("barrio", "owner-b")]);
  assert.deepEqual(result, { allowed: true, effectiveTier: "ciudad", reason: "allowed" });
});

test("V2C: ignora licencias ajenas e inactivas y falla cerrado", () => {
  assert.equal(access("owner-a", "base", [license("ciudad", "owner-b")]).reason, "no_active_license");
  assert.equal(access("owner-a", "base", [license("ciudad", "owner-a", false)]).allowed, false);
  assert.equal(access("", "base", [license("ciudad")]).allowed, false);
  assert.equal(access("owner-a", "unknown" as "base", [license("ciudad")]).allowed, false);
});

test("V2C: no muta el conjunto de licencias", () => {
  const licenses = Object.freeze([Object.freeze(license("barrio")), Object.freeze(license("cuadra"))]);
  assert.equal(access("owner-a", "pro", licenses).effectiveTier, "barrio");
  assert.equal(licenses[0].tier, "barrio");
});

test("V2C: no concede Premium por licencia ajena aunque sea la más alta", () => {
  const result = access("owner-a", "premium", [license("barrio"), license("ciudad", "owner-b")]);
  assert.deepEqual(result, { allowed: false, effectiveTier: "barrio", reason: "insufficient_tier" });
});

test("V2C: no concede acceso por tier manipulado ni identificadores similares", () => {
  assert.equal(access("owner-a", "base", [{ ...license("ciudad"), tier: "superadmin" as "ciudad" }]).allowed, false);
  assert.equal(access("owner-a", "base", [license("ciudad", "owner-a-extra")]).allowed, false);
  assert.equal(access("owner-a", "base", [license("ciudad", "owner-a", false), license("cuadra", "owner-a", true)]).effectiveTier, "cuadra");
});
