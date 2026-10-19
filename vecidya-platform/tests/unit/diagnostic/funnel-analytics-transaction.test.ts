import assert from "node:assert/strict";
import test from "node:test";

import { withBestEffortFunnelAnalytics } from "../../../db/queries/diagnostic-funnel-transaction.server.ts";

test("si falla el batch con analítica, reintenta solo el batch operacional", async () => {
  const calls: string[] = [];
  const result = await withBestEffortFunnelAnalytics(
    async () => { calls.push("analytics"); throw new Error("aggregate unavailable"); },
    async () => { calls.push("domain"); return "persisted"; },
  );

  assert.equal(result, "persisted");
  assert.deepEqual(calls, ["analytics", "domain"]);
});

test("un batch transaccional correcto no repite la operación", async () => {
  const calls: string[] = [];
  const result = await withBestEffortFunnelAnalytics(
    async () => { calls.push("analytics"); return "persisted-and-counted"; },
    async () => { calls.push("domain"); return "persisted"; },
  );

  assert.equal(result, "persisted-and-counted");
  assert.deepEqual(calls, ["analytics"]);
});

test("si también falla el batch operacional, el error de dominio se propaga", async () => {
  const domainError = new Error("domain unavailable");
  await assert.rejects(withBestEffortFunnelAnalytics(
    async () => { throw new Error("aggregate unavailable"); },
    async () => { throw domainError; },
  ), domainError);
});
