import assert from "node:assert/strict";
import test from "node:test";

import { deleteAuthorizedIdentifiedReport } from "../../../db/queries/diagnostic-identification.server";

function fakeD1(changes: number) {
  const db = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            run: async () => ({ success: true, meta: { changes } }),
            sql,
            args,
          };
        },
      };
    },
  };
  return db as unknown as D1Database;
}

const input = {
  requestId: "request-1",
  accessTokenDigest: "digest-1",
  now: new Date("2026-10-18T12:00:00Z"),
};

test("01C.3: el borrado autorizado cuenta como éxito cuando D1 incluye cascadas", async () => {
  const db = fakeD1(7);

  assert.equal(await deleteAuthorizedIdentifiedReport(db, input), true);
});

test("01C.3: el borrado autorizado devuelve falso cuando no cambió ninguna fila", async () => {
  const db = fakeD1(0);

  assert.equal(await deleteAuthorizedIdentifiedReport(db, input), false);
});
