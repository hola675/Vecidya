import {
  finalizeDiagnosticRunV9,
  loadDiagnosticEventHistoryV9,
  type V9FinalizationDb,
  type V9RunVersions,
} from "./v9-audit-repository";
import {
  readOwnedDiagnosticRunV9,
  type V9IdentityDb,
} from "./v9-identity-repository";
import { replayDiagnosticAuditEventsV9 } from "./v9-audit-replay.server";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 } from "./specialty-branches-wave1";
import { buildCandidateRecommendationsAndSolutionsV3 } from "./qbv2-candidate-recommendations";

export type V9FinalizationOwner = {
  workspaceId: string;
  runId: string;
  userId?: string;
  identityId?: string;
  recoveryCredential?: string;
};

export type V9FinalizedResult = {
  status: "completed";
  resultVersion: number;
  score: unknown;
  evidence: unknown;
  recommendations: unknown;
};

function parseSavedResult(row: {
  result_version: number;
  score_json: string;
  evidence_json: string;
  recommendations_json: string;
}): V9FinalizedResult {
  try {
    return {
      status: "completed",
      resultVersion: row.result_version,
      score: JSON.parse(row.score_json) as unknown,
      evidence: JSON.parse(row.evidence_json) as unknown,
      recommendations: JSON.parse(row.recommendations_json) as unknown,
    };
  } catch {
    throw new Error("v9_result_integrity_failure");
  }
}

/** Canonicalize the exact JSON representation used by D1 so first-run and retry results agree. */
function canonicalizePersistedJson<T>(value: T): T {
  let serialized: string | undefined;
  try {
    serialized = JSON.stringify(value);
  } catch {
    throw new Error("v9_result_integrity_failure");
  }
  if (serialized === undefined) throw new Error("v9_result_integrity_failure");
  try {
    return JSON.parse(serialized) as T;
  } catch {
    throw new Error("v9_result_integrity_failure");
  }
}

/**
 * Completes an owned V9 run from the append-only D1 event stream.
 * No score, evidence, or recommendation is accepted from the browser.
 */
export async function finalizeOwnedDiagnosticRunV9(
  db: V9IdentityDb,
  input: V9FinalizationOwner & {
    expectedVersions: V9RunVersions;
    now?: number;
  },
): Promise<V9FinalizedResult> {
  const run = await readOwnedDiagnosticRunV9(db, input);
  if (run.bank_version !== input.expectedVersions.bank ||
      run.engine_version !== input.expectedVersions.engine ||
      run.scoring_version !== input.expectedVersions.scoring ||
      run.recommendation_version !== input.expectedVersions.recommendations ||
      run.consent_version !== input.expectedVersions.consent) {
    throw new Error("v9_run_version_mismatch");
  }

  if (run.status === "completed") {
    const saved = await db.prepare(
      "SELECT result_version,score_json,evidence_json,recommendations_json FROM diagnostic_v9_results WHERE workspace_id=? AND run_id=? ORDER BY result_version DESC LIMIT 1",
    ).bind(input.workspaceId, input.runId).first<{
      result_version: number;
      score_json: string;
      evidence_json: string;
      recommendations_json: string;
    }>();
    if (!saved) throw new Error("v9_result_integrity_failure");
    return parseSavedResult(saved);
  }
  if (run.status !== "active") throw new Error("v9_run_not_active");

  const history = await loadDiagnosticEventHistoryV9(db, input.workspaceId, input.runId);
  if (history.length !== run.last_seq) throw new Error("v9_history_incomplete");
  const now = input.now ?? Date.now();
  const startedAt = Date.parse(run.started_at);
  if (!Number.isFinite(startedAt)) throw new Error("v9_run_invalid_start_time");
  const replay = replayDiagnosticAuditEventsV9({
    runId: input.runId,
    startedAt,
    events: history,
    now,
  });
  if (!replay.ok) throw new Error(`v9_replay_failed:${replay.reason}`);

  // Both the worker replay and the result pipeline use the exact pinned V9 bank.
  // Refuse finalization if the independent orchestration produces a different score.
  const outcome = buildCandidateRecommendationsAndSolutionsV3({
    answers: replay.session.answers,
    bank: QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2,
  });
  if (JSON.stringify(outcome.scoring.dimensions) !== JSON.stringify(replay.core.dimensions)) {
    throw new Error("v9_finalize_scoring_parity_failure");
  }

  const score = canonicalizePersistedJson({
    identity: replay.core.identity,
    interactionCount: replay.core.interactionCount,
    terminalReason: replay.core.terminalReason,
    context: replay.core.context,
    applicableDimensions: replay.core.applicableDimensions,
    insufficientContextDimensions: replay.core.insufficientContextDimensions,
    unresolvedApplicableDimensions: replay.core.unresolvedApplicableDimensions,
    overall: outcome.overall,
  });
  const evidence = canonicalizePersistedJson(outcome.scoring.dimensions);
  const recommendations = canonicalizePersistedJson({
    version: outcome.recommendations.version,
    items: outcome.recommendations.items,
    solutions: outcome.solutions,
  });
  const finishedAt = new Date(now).toISOString();
  const finalized = await finalizeDiagnosticRunV9(db as V9FinalizationDb, {
    workspaceId: input.workspaceId,
    runId: input.runId,
    expectedSeq: run.last_seq,
    score,
    evidence,
    recommendations,
    finishedAt,
  });

  return {
    status: finalized.status,
    resultVersion: finalized.resultVersion,
    score,
    evidence,
    recommendations,
  };
}
