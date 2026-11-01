export const LEARN_OPERATION_RECEIPT_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
export const LEARN_OPERATION_RECEIPT_PURGE_BATCH_SIZE = 500;
export const LEARN_OPERATION_RECEIPT_PURGE_MAX_BATCHES = 10;

export type LearnOperationReceiptPurgeEnv = {
  readonly DB: D1Database;
  readonly LEARN_OPERATION_RECEIPT_PURGE_ENABLED?: string;
  readonly LEARN_OPERATION_RECEIPT_PURGE_APPROVED?: string;
};

export type LearnOperationReceiptPurgeResult =
  | { readonly status: "skipped" }
  | { readonly status: "completed"; readonly deleted: number; readonly hasMore: boolean };

export function isLearnOperationReceiptPurgeEnabled(env: Pick<LearnOperationReceiptPurgeEnv,
  "LEARN_OPERATION_RECEIPT_PURGE_ENABLED" | "LEARN_OPERATION_RECEIPT_PURGE_APPROVED">) {
  return env.LEARN_OPERATION_RECEIPT_PURGE_ENABLED === "true" &&
    env.LEARN_OPERATION_RECEIPT_PURGE_APPROVED === "true";
}

/** Deletes only expired idempotency receipts; personal learning state and device cursors remain intact. */
export async function runLearnOperationReceiptPurge(env: LearnOperationReceiptPurgeEnv, now = Date.now()): Promise<LearnOperationReceiptPurgeResult> {
  if (!isLearnOperationReceiptPurgeEnabled(env)) return { status: "skipped" };

  const cutoff = now - LEARN_OPERATION_RECEIPT_RETENTION_MS;
  let deleted = 0;
  for (let batch = 0; batch < LEARN_OPERATION_RECEIPT_PURGE_MAX_BATCHES; batch += 1) {
    const result = await env.DB.prepare(`DELETE FROM learn_operation_receipt
      WHERE rowid IN (
        SELECT rowid FROM learn_operation_receipt
        WHERE created_at <= ?
        ORDER BY created_at
        LIMIT ${LEARN_OPERATION_RECEIPT_PURGE_BATCH_SIZE}
      )`).bind(cutoff).run();
    const changes = result.meta.changes;
    deleted += changes;
    if (changes < LEARN_OPERATION_RECEIPT_PURGE_BATCH_SIZE) return { status: "completed", deleted, hasMore: false };
  }
  return { status: "completed", deleted, hasMore: true };
}
