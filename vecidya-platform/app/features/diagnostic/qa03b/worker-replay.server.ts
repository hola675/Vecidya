import { buildCandidateDiagnosticReportV1 } from "../../../components/diagnostic-flow/qa03b-presentation";
import type { CandidateDiagnosticReportV1 } from "../../../components/diagnostic-report/report-model";
import { buildAnonymousDiagnosticSummaryV1, type AnonymousDiagnosticSummaryV1 } from "./qbv2-candidate-funnel";
import { CANDIDATE_RESULT_IDENTITY_V3, isCandidateResultIdentityV3, type CandidatePipelineResultV3 } from "./qbv2-candidate-pipeline";
import { CANDIDATE_ROUTE_HARD_CAP_V3 } from "./qbv2-candidate-planner";
import {
  CANDIDATE_REPLAY_TRANSCRIPT_LIMIT_V3,
  completeCandidateSessionV3,
  createCandidateSessionV3,
  currentCandidateQuestionIdV3,
  goBackCandidateV3,
  parseCandidateSessionV3,
  submitCandidateAnswerV3,
  type CandidateSessionV3,
} from "./qbv2-candidate-session";
import { ANSWER_SCHEMA_ID, QUESTION_BANK_ID, SESSION_KEY, SESSION_SCHEMA, WORKER_REPLAY_VERSION } from "./contract";

export const QA03B_WORKER_REPLAY_VERSION_V1 = WORKER_REPLAY_VERSION;

export type Qa03bWorkerReplayRequestV1 = {
  readonly replayVersion: typeof QA03B_WORKER_REPLAY_VERSION_V1;
  readonly engineIdentity: typeof CANDIDATE_RESULT_IDENTITY_V3;
  readonly answerSchema: typeof ANSWER_SCHEMA_ID;
  readonly questionBank: typeof QUESTION_BANK_ID;
  readonly sessionSchema: typeof SESSION_SCHEMA;
  readonly sessionKey: typeof SESSION_KEY;
  readonly session: unknown;
};

export type Qa03bWorkerReplayFailureV1 = "request" | "identity" | "schema" | "bank" | "session" | "expired" | "incomplete" | "route";

export type Qa03bWorkerReplayV1 =
  | { readonly ok: true; readonly session: CandidateSessionV3; readonly result: CandidatePipelineResultV3; readonly completedAt: number }
  | { readonly ok: false; readonly reason: Qa03bWorkerReplayFailureV1 };

export type Qa03bReplayProjectionsV1 = {
  readonly summary: AnonymousDiagnosticSummaryV1;
  readonly report: CandidateDiagnosticReportV1;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const hasExactKeys = (record: Record<string, unknown>, keys: readonly string[]) => Object.keys(record).length === keys.length && keys.every((key) => Object.hasOwn(record, key));
const sameJson = (left: unknown, right: unknown): boolean => JSON.stringify(left) === JSON.stringify(right);

function getReplayEvents(session: CandidateSessionV3) {
  if (session.replayTranscript) return session.replayTranscript;
  return session.answeredQuestionIds.map((questionId) => ({
    questionId,
    value: session.answers[questionId]!,
    mode: "answer" as const,
    reviewIndex: null,
  }));
}

export function replayQa03bSessionV1(input: unknown, now = Date.now()): Qa03bWorkerReplayV1 {
  if (!isRecord(input) || !hasExactKeys(input, ["replayVersion", "engineIdentity", "answerSchema", "questionBank", "sessionSchema", "sessionKey", "session"])) return { ok: false, reason: "request" };
  if (input.replayVersion !== QA03B_WORKER_REPLAY_VERSION_V1 || !isCandidateResultIdentityV3(input.engineIdentity)) return { ok: false, reason: "identity" };
  if (input.answerSchema !== ANSWER_SCHEMA_ID || input.sessionSchema !== SESSION_SCHEMA || input.sessionKey !== SESSION_KEY) return { ok: false, reason: "schema" };
  if (input.questionBank !== QUESTION_BANK_ID) return { ok: false, reason: "bank" };
  if (!isRecord(input.session)) return { ok: false, reason: "session" };

  const parsed = parseCandidateSessionV3(JSON.stringify(input.session), now);
  if (!parsed) return { ok: false, reason: Number.isFinite(input.session.updatedAt) && now - Number(input.session.updatedAt) > 14 * 24 * 60 * 60 * 1000 ? "expired" : "session" };
  if ((parsed.status !== "completing" && parsed.status !== "completed") || parsed.terminalReason === null || parsed.reviewIndex !== null || parsed.queue.length !== 0) return { ok: false, reason: "incomplete" };
  if (parsed.answeredQuestionIds.length > CANDIDATE_ROUTE_HARD_CAP_V3) return { ok: false, reason: "route" };

  const writerId = "qa03b-worker-replay";
  let replayed = createCandidateSessionV3({ sessionId: "qa03b-worker-replay", writerId, now: parsed.startedAt });
  let replayClock = parsed.startedAt;
  const events = getReplayEvents(parsed);
  if (events.length > CANDIDATE_REPLAY_TRANSCRIPT_LIMIT_V3) return { ok: false, reason: "route" };

  for (const event of events) {
    if (event.mode === "answer") {
      if (event.reviewIndex !== null || replayed.reviewIndex !== null || currentCandidateQuestionIdV3(replayed) !== event.questionId) return { ok: false, reason: "route" };
    } else {
      if (!Number.isInteger(event.reviewIndex) || event.reviewIndex === null || event.reviewIndex < 0 || replayed.answeredQuestionIds[event.reviewIndex] !== event.questionId) return { ok: false, reason: "route" };
      while (replayed.reviewIndex === null || replayed.reviewIndex > event.reviewIndex) {
        const previous = replayed;
        replayed = goBackCandidateV3(replayed, writerId, ++replayClock);
        if (replayed === previous || replayed.reviewIndex === null) return { ok: false, reason: "route" };
      }
      if (replayed.reviewIndex !== event.reviewIndex || currentCandidateQuestionIdV3(replayed) !== event.questionId) return { ok: false, reason: "route" };
    }

    const submitted = submitCandidateAnswerV3(replayed, event.questionId, event.value, writerId, ++replayClock);
    if (!submitted.ok) return { ok: false, reason: "route" };
    replayed = submitted.session;
  }

  if (replayed.status !== "completing" || replayed.terminalReason !== parsed.terminalReason || replayed.reviewIndex !== null || replayed.queue.length !== 0) return { ok: false, reason: "incomplete" };
  if (!sameJson(replayed.answers, parsed.answers) || !sameJson(replayed.answeredQuestionIds, parsed.answeredQuestionIds)) return { ok: false, reason: "route" };
  if (parsed.replayTranscript && !sameJson(replayed.replayTranscript, parsed.replayTranscript)) return { ok: false, reason: "route" };

  const completed = completeCandidateSessionV3(replayed, writerId, now);
  if (!completed || !isCandidateResultIdentityV3(completed.result.engineIdentity)) return { ok: false, reason: "incomplete" };
  return { ok: true, session: completed.session, result: completed.result, completedAt: now };
}

export function buildQa03bReplayProjectionsV1(
  replay: Extract<Qa03bWorkerReplayV1, { readonly ok: true }>,
  businessName: string | null,
  generatedAt: Date,
): Qa03bReplayProjectionsV1 {
  return {
    summary: buildAnonymousDiagnosticSummaryV1(replay.result),
    report: buildCandidateDiagnosticReportV1(replay.result, new Date(replay.completedAt), generatedAt, businessName),
  };
}
