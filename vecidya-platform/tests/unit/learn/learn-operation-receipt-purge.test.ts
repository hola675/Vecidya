import assert from "node:assert/strict";
import test from "node:test";

import { isLearnOperationReceiptPurgeEnabled, runLearnOperationReceiptPurge } from "../../../server/learn-operation-receipt-purge.server.ts";

test("receipt purge requires both operational and legal approval switches", async () => {
  let databaseTouched = false;
  const env = {
    DB: { prepare() { databaseTouched = true; throw new Error("disabled purge must not query D1"); } } as unknown as D1Database,
    LEARN_OPERATION_RECEIPT_PURGE_ENABLED: "true",
    LEARN_OPERATION_RECEIPT_PURGE_APPROVED: "false",
  };

  assert.equal(isLearnOperationReceiptPurgeEnabled(env), false);
  assert.deepEqual(await runLearnOperationReceiptPurge(env), { status: "skipped" });
  assert.equal(databaseTouched, false);
  assert.equal(isLearnOperationReceiptPurgeEnabled({ ...env, LEARN_OPERATION_RECEIPT_PURGE_APPROVED: "true" }), true);
});
