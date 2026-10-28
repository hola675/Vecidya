import { loadDiagnosticEventHistoryV9, type V9RunVersions } from "./v9-audit-repository";
import { recoverDiagnosticAuditSessionV9 } from "./v9-audit-replay.server";
import {
  readOwnedDiagnosticRunV9,
  type V9IdentityDb,
} from "./v9-identity-repository";

export type V9RunStateOwner = {
  workspaceId: string;
  runId: string;
  userId?: string;
  identityId?: string;
  recoveryCredential?: string;
};

export type V9RecoveredRunState = {
  runId: string;
  status: string;
  startedAt: string;
  lastSeq: number;
  answers: Record<string, string | readonly string[]>;
  answeredQuestionIds: readonly string[];
  nextQuestionId: string | null;
  interactionCount: number;
  readyToFinalize: boolean;
  terminalReason: string | null;
};

/** The client receives only a projection rebuilt from the immutable server-side audit log. */
export async function readOwnedDiagnosticRunStateV9(
  db: V9IdentityDb,
  input: V9RunStateOwner & { expectedVersions: V9RunVersions; now?: number },
): Promise<V9RecoveredRunState> {
  const run = await readOwnedDiagnosticRunV9(db, input);
  const expected = input.expectedVersions;
  if (run.bank_version !== expected.bank ||
      run.engine_version !== expected.engine ||
      run.scoring_version !== expected.scoring ||
      run.recommendation_version !== expected.recommendations ||
      run.consent_version !== expected.consent) {
    throw new Error("v9_run_version_mismatch");
  }

  if (run.status === "failed" || run.status === "abandoned") {
    throw new Error("v9_run_not_resumable");
  }

  const events = await loadDiagnosticEventHistoryV9(db, input.workspaceId, input.runId);
  if (events.length !== run.last_seq) throw new Error("v9_history_incomplete");

  const startedAt = Date.parse(run.started_at);
  if (!Number.isFinite(startedAt)) throw new Error("v9_run_invalid_start_time");
  const reconstructed = recoverDiagnosticAuditSessionV9({
    runId: input.runId,
    startedAt,
    events,
    now: input.now,
  });
  if (!reconstructed.ok) throw new Error(`v9_recovery_failed:${reconstructed.reason}`);
  if (run.status === "completed" && reconstructed.session.status !== "completing") {
    throw new Error("v9_run_final_state_conflict");
  }

  return {
    runId: input.runId,
    status: run.status,
    startedAt: run.started_at,
    lastSeq: run.last_seq,
    answers: reconstructed.session.answers,
    answeredQuestionIds: reconstructed.session.answeredQuestionIds,
    nextQuestionId: run.status === "active" ? reconstructed.nextQuestionId : null,
    interactionCount: reconstructed.session.interactionCount,
    readyToFinalize: run.status === "active" && reconstructed.session.status === "completing",
    terminalReason: reconstructed.session.terminalReason,
  };
}
