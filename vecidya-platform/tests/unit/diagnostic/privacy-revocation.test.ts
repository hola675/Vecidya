import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { revokeDiagnosticOptionalIntents } from "../../../db/queries/diagnostic-identification.server";

type Statement = { sql: string; args: unknown[] };
function fakeD1(authorized: boolean, changes = 1) {
  const executed: Statement[] = [];
  const db = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            first: async () => authorized ? { authorized: 1 } : null,
            sql,
            args,
          };
        },
      };
    },
    async batch(statements: Statement[]) {
      executed.push(...statements);
      return statements.map(() => ({ meta: { changes } }));
    },
  };
  return { db: db as unknown as D1Database, executed };
}
const input = {
  requestId: "request-1",
  accessTokenDigest: "digest-1",
  now: new Date("2026-10-17T12:00:00Z"),
};
test("01D.2: rechaza grant inexistente sin ejecutar escrituras", async () => {
  const { db, executed } = fakeD1(false);
  const result = await revokeDiagnosticOptionalIntents(db, { ...input, revokeCommercial: true, revokeResearch: true });
  assert.deepEqual(result, { authorized: false, commercialRevoked: false, researchRevoked: false });
  assert.equal(executed.length, 0);
});
test("01D.2: solo revoca consentimiento comercial solicitado", async () => {
  const { db, executed } = fakeD1(true);
  const result = await revokeDiagnosticOptionalIntents(db, { ...input, revokeCommercial: true, revokeResearch: false });
  assert.deepEqual(result, { authorized: true, commercialRevoked: true, researchRevoked: false });
  assert.equal(executed.length, 1);
  assert.match(executed[0].sql, /UPDATE commercial_contact_intent/);
  assert.match(executed[0].sql, /revoked_at IS NULL/);
  assert.match(executed[0].sql, /a\.token_digest = \?/);
});
test("01D.2: solo revoca consentimiento de investigación solicitado", async () => {
  const { db, executed } = fakeD1(true);
  const result = await revokeDiagnosticOptionalIntents(db, { ...input, revokeCommercial: false, revokeResearch: true });
  assert.deepEqual(result, { authorized: true, commercialRevoked: false, researchRevoked: true });
  assert.equal(executed.length, 1);
  assert.match(executed[0].sql, /UPDATE diagnostic_research_intent/);
});
test("01D.2: revocación repetida es idempotente", async () => {
  const { db, executed } = fakeD1(true, 0);
  const result = await revokeDiagnosticOptionalIntents(db, { ...input, revokeCommercial: true, revokeResearch: true });
  assert.deepEqual(result, { authorized: true, commercialRevoked: false, researchRevoked: false });
  assert.equal(executed.length, 2);
});
test("01D.2: ninguna preferencia seleccionada no consulta ni escribe", async () => {
  const { db, executed } = fakeD1(true);
  const result = await revokeDiagnosticOptionalIntents(db, { ...input, revokeCommercial: false, revokeResearch: false });
  assert.equal(result.authorized, false);
  assert.equal(executed.length, 0);
});

test("01D.2: el núcleo de revocación no borra informes ni analítica", () => {
  const source = readFileSync(new URL("../../../db/queries/diagnostic-identification.server.ts", import.meta.url), "utf8");
  const start = source.indexOf("export async function revokeDiagnosticOptionalIntents(");
  assert.ok(start >= 0);
  const end = source.indexOf("\nexport async function ", start + 1);
  const revocation = source.slice(start, end < 0 ? undefined : end);
  assert.doesNotMatch(revocation, /DELETE\s+FROM/i);
  assert.doesNotMatch(revocation, /UPDATE\s+diagnostic_funnel_aggregate/i);
  assert.doesNotMatch(revocation, /UPDATE\s+diagnostic_report_access/i);
});
test("01D.2: la selección dual actualiza las dos preferencias y revalida el grant", async () => {
  const { db, executed } = fakeD1(true);
  const result = await revokeDiagnosticOptionalIntents(db, { ...input, revokeCommercial: true, revokeResearch: true });
  assert.deepEqual(result, { authorized: true, commercialRevoked: true, researchRevoked: true });
  assert.equal(executed.length, 2);
  for (const statement of executed) {
    assert.match(statement.sql, /a\.revoked_at IS NULL/);
    assert.match(statement.sql, /a\.expires_at > \?/);
    assert.equal(statement.args.length, 7);
  }
});
