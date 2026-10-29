import assert from "node:assert/strict";
import { test } from "node:test";

import { hasAnyLearnEntitlement, hasCurrentLearnEntitlement } from "../../../db/queries/learn-access.server";
import { canReadLearnGuideBody } from "../../../server/learn/entitlement.server";

const now = new Date("2026-10-29T12:00:00.000Z");
const current = {
  role: "admin",
  lifecycleStatus: "active",
  planCode: "cuadra",
  licenseStatus: "active",
  startedAt: new Date("2026-10-01T00:00:00.000Z"),
  endsAt: new Date("2026-11-01T00:00:00.000Z"),
  hasGrant: true,
};

test("el owner con membresía, lifecycle activo y licencia vigente tiene acceso sin grant propio", () => {
  assert.equal(hasCurrentLearnEntitlement({ ...current, role: "owner", hasGrant: false }, now), true);
});

test("admin o member necesitan grant explícito en esa misma membresía", () => {
  assert.equal(hasCurrentLearnEntitlement({ ...current, role: "admin", hasGrant: true }, now), true);
  assert.equal(hasCurrentLearnEntitlement({ ...current, role: "member", hasGrant: true }, now), true);
  assert.equal(hasCurrentLearnEntitlement({ ...current, role: "admin", hasGrant: false }, now), false);
});

test("la búsqueda de entitlement recorre todas las organizaciones sin confiar en la activa", () => {
  assert.equal(hasAnyLearnEntitlement([
    { ...current, role: "admin", hasGrant: false },
    { ...current, lifecycleStatus: "suspended", role: "owner", hasGrant: false },
    { ...current, role: "member", hasGrant: true },
  ], now), true);
  assert.equal(hasAnyLearnEntitlement([
    { ...current, role: "admin", hasGrant: false },
    { ...current, lifecycleStatus: "missing", role: "admin", hasGrant: true },
  ], now), false);
});

test("solo las guías always_free admiten visitantes sin sesión; las demás fallan cerradas", async () => {
  const noDatabase = null as never;
  assert.equal(await canReadLearnGuideBody(noDatabase, null, "como-probar-un-asistente-de-ia-con-supervision-humana", now), false);
  assert.equal(await canReadLearnGuideBody(noDatabase, null, "no-existe", now), false);
  assert.equal(await canReadLearnGuideBody(noDatabase, null, "dominio-hosting-sitio-web-como-funcionan", now), true);
});

test("licencia y lifecycle deniegan por defecto si faltan o no están activos", () => {
  for (const lifecycleStatus of ["pending_owner", "owner_invited", "suspended", "missing"]) {
    assert.equal(hasCurrentLearnEntitlement({ ...current, lifecycleStatus }, now), false, lifecycleStatus);
  }
  for (const licenseStatus of ["pending", "suspended", "cancelled", "missing"]) {
    assert.equal(hasCurrentLearnEntitlement({ ...current, licenseStatus }, now), false, licenseStatus);
  }
});

test("solo planes Cuadra, Barrio o Ciudad con fechas de vigencia válidas conceden entitlement", () => {
  for (const planCode of ["cuadra", "barrio", "ciudad"]) {
    assert.equal(hasCurrentLearnEntitlement({ ...current, planCode }, now), true, planCode);
  }
  assert.equal(hasCurrentLearnEntitlement({ ...current, planCode: "otro" }, now), false);
  assert.equal(hasCurrentLearnEntitlement({ ...current, startedAt: null }, now), false);
  assert.equal(hasCurrentLearnEntitlement({ ...current, startedAt: new Date(now.getTime() + 1) }, now), false);
  assert.equal(hasCurrentLearnEntitlement({ ...current, endsAt: new Date(now.getTime() - 1) }, now), false);
  assert.equal(hasCurrentLearnEntitlement({ ...current, endsAt: now }, now), false);
  assert.equal(hasCurrentLearnEntitlement({ ...current, endsAt: null }, now), true);
});
