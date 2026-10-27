import assert from "node:assert/strict";
import test from "node:test";
import { hashDiagnosticSnapshotV9 } from "../../../app/features/diagnostic/qa03b/v9-audit-repository";
import { saveVerifiedDiagnosticSnapshotV9 } from "../../../app/features/diagnostic/qa03b/v9-audit-snapshot-integrity";

test("V9 snapshot hash is deterministic and content-sensitive", async () => {
  const a = await hashDiagnosticSnapshotV9('{"answer":"yes"}');
  const b = await hashDiagnosticSnapshotV9('{"answer":"no"}');
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.notEqual(a, b);
  assert.equal(a, await hashDiagnosticSnapshotV9('{"answer":"yes"}'));
});

test("V9 verified snapshot refuses undefined state before accessing DB", async () => {
  await assert.rejects(
    () => saveVerifiedDiagnosticSnapshotV9({} as never, {
      workspaceId: "org-a", runId: "run-a", lastSeq: 0,
      state: undefined, createdAt: "2026-10-27",
    }),
    /v9_snapshot_invalid_state/,
  );
});
