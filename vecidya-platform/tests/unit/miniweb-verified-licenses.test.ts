import assert from "node:assert/strict";
import { test } from "node:test";

import { getVerifiedMiniWebVisualLicenses } from "../../app/features/miniweb/verified-licenses.server";

type Row = { billingOwnerId: string; tier: "cuadra" | "barrio" | "ciudad"; status: "active" | "pending" | "suspended" | "cancelled" };

function fakeDatabase(rows: Row[]) {
  let requestedAccount: string | null = null;
  const db = {
    select: () => ({
      from: () => ({
        where: async (_condition: unknown) => {
          requestedAccount = "queried";
          return rows;
        },
      }),
    }),
  };
  return { db: db as Parameters<typeof getVerifiedMiniWebVisualLicenses>[0], wasQueried: () => requestedAccount !== null };
}

test("V2D: traduce exclusivamente status active en licencia activa", async () => {
  const { db } = fakeDatabase([
    { billingOwnerId: "owner-a", tier: "cuadra", status: "active" },
    { billingOwnerId: "owner-a", tier: "barrio", status: "pending" },
    { billingOwnerId: "owner-a", tier: "ciudad", status: "suspended" },
    { billingOwnerId: "owner-a", tier: "ciudad", status: "cancelled" },
  ]);
  const result = await getVerifiedMiniWebVisualLicenses(db, "owner-a");
  assert.deepEqual(result.map((row) => row.active), [true, false, false, false]);
});

test("V2D: no consulta D1 con billing account vacío", async () => {
  const { db, wasQueried } = fakeDatabase([]);
  assert.deepEqual(await getVerifiedMiniWebVisualLicenses(db, ""), []);
  assert.equal(wasQueried(), false);
});

test("V2D: conserva el tier y billing account de la fila D1", async () => {
  const { db } = fakeDatabase([{ billingOwnerId: "owner-a", tier: "ciudad", status: "active" }]);
  assert.deepEqual(await getVerifiedMiniWebVisualLicenses(db, "owner-a"), [
    { billingOwnerId: "owner-a", tier: "ciudad", active: true },
  ]);
});
