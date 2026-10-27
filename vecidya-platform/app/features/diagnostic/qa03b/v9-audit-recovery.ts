import {
  loadDiagnosticEventHistoryV9,
  loadLatestDiagnosticSnapshotV9,
  type V9AuditDb,
} from "./v9-audit-repository";

/**
 * Generic audited replay. Reducer and initial state are V9-owned and supplied
 * by the engine; this module never guesses how a diagnostic answer is applied.
 */
export async function recoverDiagnosticStateV9<T>(
  db: V9AuditDb,
  input: {
    workspaceId: string;
    runId: string;
    initialState: T;
    validateSnapshot: (value: unknown) => value is T;
    applyEvent: (state: T, event: {
      seq: number;
      eventId: string;
      kind: string;
      payload: unknown;
      schemaVersion: number;
    }) => T;
  },
): Promise<{ state: T; lastSeq: number }> {
  const [history, snapshot] = await Promise.all([
    loadDiagnosticEventHistoryV9(db, input.workspaceId, input.runId),
    loadLatestDiagnosticSnapshotV9(db, input.workspaceId, input.runId),
  ]);
  if (snapshot && (snapshot.lastSeq > history.length || !input.validateSnapshot(snapshot.state))) {
    throw new Error("v9_recovery_invalid_snapshot");
  }
  let state = snapshot ? snapshot.state as T : input.initialState;
  let lastSeq = snapshot?.lastSeq ?? 0;
  for (const event of history) {
    if (event.seq <= lastSeq) continue;
    let payload: unknown;
    try {
      payload = JSON.parse(event.payload_json);
    } catch {
      throw new Error("v9_recovery_invalid_event_json");
    }
    state = input.applyEvent(state, {
      seq: event.seq,
      eventId: event.event_id,
      kind: event.kind,
      payload,
      schemaVersion: event.schema_version,
    });
    lastSeq = event.seq;
  }
  return { state, lastSeq };
}
