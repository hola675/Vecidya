import assert from "node:assert/strict";
import test from "node:test";
import { createDatabase } from "../../db/client.server.ts";
import { publishMiniWebV2Draft } from "../../db/queries/miniweb-v2.server.ts";

function createD1Stub(changeBatches: number[][]) {
  const batches: { sql: string; params: unknown[] }[][] = [];
  const binding = {
    prepare(sql: string) {
      return { bind: (...params: unknown[]) => ({ sql, params, raw: async () => [["site-1"]], all: async () => ({ results: [{ site_id: "site-1" }] }) }) };
    },
    async batch(statements: { sql: string; params: unknown[] }[]) {
      batches.push(statements);
      return changeBatches.shift()!.map((changes) => ({ meta: { changes } }));
    },
  };
  return { database: createDatabase(binding as never), batches };
}

test("publication supplies every snapshot column and repeated revision returns a conflict", async () => {
  const { database, batches } = createD1Stub([[1, 1, 1], [0, 0, 0]]);
  const input = { siteId: "site-1", organizationId: "org-1", actorUserId: "user-1", expectedRevision: 1, publicationId: "publication-1", capacity: 3 };

  const first = await publishMiniWebV2Draft(database, input);
  assert.deepEqual(first, { ok: true, publicationId: input.publicationId, revision: input.expectedRevision });

  const snapshotSql = batches[0][1].sql;
  assert.match(snapshotSql, /insert into "miniweb_v2_publication"/i);
  assert.match(snapshotSql, /"created_at"/i);
  assert.match(snapshotSql, /on conflict do nothing/i);

  const repeated = await publishMiniWebV2Draft(database, { ...input, publicationId: "publication-retry" });
  assert.deepEqual(repeated, { ok: false, reason: "conflict" });
  assert.equal(batches.length, 2);
});
