import { loadDiagnosticEventHistoryV9, type V9RunVersions } from "./v9-audit-repository";
import { recoverDiagnosticAuditSessionV9 } from "./v9-audit-replay.server";
import {
  appendOwnedDiagnosticEventV9,
  readOwnedDiagnosticRunV9,
  type V9IdentityDb,
} from "./v9-identity-repository";

export type V9IngestionInput = {
  readonly workspaceId: string;
  readonly runId: string;
  readonly userId?: string;
  readonly identityId?: string;
  readonly recoveryCredential?: string;
  readonly eventId: string;
  readonly expectedSeq: number;
  readonly kind: string;
  readonly payload: unknown;
  readonly occurredAt: string;
  readonly expectedVersions: V9RunVersions;
};

/**
 * Validate the proposed event against the complete, server-reconstructed route
 * BEFORE storing it in the immutable D1 audit ledger.
 *
 * A concurrent writer is still serialized by D1's expected-sequence trigger.
 * Retries of previously committed event IDs retain the repository's exact
 * idempotency and authorization checks.
 */
export async function ingestOwnedDiagnosticEventV9(
  db: V9IdentityDb,
  input: V9IngestionInput,
): Promise<{ status: "created" | "duplicate" | "conflict"; seq?: number }> {
  const owner = {
    workspaceId: input.workspaceId,
    runId: input.runId,
    ...(input.userId ? { userId: input.userId } : {
      identityId: input.identityId,
      recoveryCredential: input.recoveryCredential,
    }),
  };
  const run = await readOwnedDiagnosticRunV9(db, owner);
  if (run.bank_version !== input.expectedVersions.bank ||
      run.engine_version !== input.expectedVersions.engine ||
      run.scoring_version !== input.expectedVersions.scoring ||
      run.recommendation_version !== input.expectedVersions.recommendations ||
      run.consent_version !== input.expectedVersions.consent) {
    throw new Error("v9_run_version_mismatch");
  }

  // A network retry must remain idempotent even when the run is complete,
  // but its actor, original timestamp and payload still have to match.
  const existing = await db.prepare(
    "SELECT event_id FROM diagnostic_v9_events WHERE workspace_id=? AND event_id=?",
  ).bind(input.workspaceId, input.eventId).first<{ event_id: string }>();
  if (existing) {
    return appendOwnedDiagnosticEventV9(db, input);
  }

  if (run.status !== "active") throw new Error("v9_run_not_active");
  if (!Number.isSafeInteger(input.expectedSeq) || input.expectedSeq !== run.last_seq) {
    return { status: "conflict" };
  }

  const history = await loadDiagnosticEventHistoryV9(db, input.workspaceId, input.runId);
  if (history.length !== run.last_seq) throw new Error("v9_history_incomplete");
  const startedAt = Date.parse(run.started_at);
  if (!Number.isFinite(startedAt)) throw new Error("v9_run_invalid_start_time");

  let serialized: string | undefined;
  try { serialized = JSON.stringify(input.payload); } catch { throw new Error("v9_invalid_payload"); }
  if (serialized === undefined || serialized.length > 16384) throw new Error("v9_invalid_payload");

  const proposed = {
    seq: input.expectedSeq + 1,
    event_id: input.eventId,
    kind: input.kind,
    payload_json: serialized,
    occurred_at: input.occurredAt,
    schema_version: 1,
    actor_type: "client",
  };
  const reconstructed = recoverDiagnosticAuditSessionV9({
    runId: input.runId,
    startedAt,
    events: [...history, proposed],
  });
  if (!reconstructed.ok) throw new Error("v9_event_not_eligible");

  return appendOwnedDiagnosticEventV9(db, input);
}
