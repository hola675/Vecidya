import {
  hashDiagnosticSnapshotV9,
  saveDiagnosticSnapshotV9,
  type V9AuditDb,
} from "./v9-audit-repository";

/** Trusted entry point: caller never supplies a snapshot digest. */
export async function saveVerifiedDiagnosticSnapshotV9(
  db: V9AuditDb,
  input: {
    workspaceId: string;
    runId: string;
    lastSeq: number;
    state: unknown;
    createdAt: string;
  },
): Promise<"created" | "duplicate"> {
  let stateJson: string | undefined;
  try {
    stateJson = JSON.stringify(input.state);
  } catch {
    throw new Error("v9_snapshot_invalid_state");
  }
  if (stateJson === undefined) throw new Error("v9_snapshot_invalid_state");
  const stateHash = await hashDiagnosticSnapshotV9(stateJson);
  return saveDiagnosticSnapshotV9(db, {
    workspaceId: input.workspaceId,
    runId: input.runId,
    lastSeq: input.lastSeq,
    stateJson,
    stateHash,
    createdAt: input.createdAt,
  });
}
