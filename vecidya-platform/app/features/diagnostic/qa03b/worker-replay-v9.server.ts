import {
  QA03B_V9_ANSWER_SCHEMA_ID,
  QA03B_V9_ENGINE_ID,
  QA03B_V9_QUESTION_BANK_ID,
  QA03B_V9_REPLAY_LIMIT,
  QA03B_V9_REPLAY_VERSION,
  QA03B_V9_SESSION_KEY,
  QA03B_V9_SESSION_SCHEMA,
  createCandidateSessionV9Prototype,
  currentCandidateQuestionIdV9,
  editCandidateAnswerV9Prototype,
  editClassificationV9Prototype,
  parseCandidateSessionV9Prototype,
  submitCandidateAnswerV9Prototype,
  submitClassificationV9Prototype,
  submitExtensionConsentV9Prototype,
  type CandidateReplayEventV9,
  type CandidateSessionV9Prototype,
} from "./v9-session-prototype";
import { buildCandidateQuestionPlanV9Prototype } from "./v9-classification-bundle";
import { V9_ABSOLUTE_INTERACTION_LIMIT, v9ExtensionInteractionsUsed } from "../v9/route-budget";
import {
  resolveV9ScoringCalibration,
  V9_SCORING_CALIBRATION_REGISTRY_ID,
} from "../v9/scoring-calibration-registry";
import { V9_EVIDENCE_CORRELATION_REGISTRY_ID } from "../v9/evidence-correlation-registry";
import { V9_SCORING_EVIDENCE_REGISTRY_ID } from "../v9/scoring-evidence-registry";
import { scoreV9Dimensions, V9_SCORING_ENGINE_ID } from "../v9/scoring-engine";
import {
  computeV9OverallIndex,
  V9_HISTORICAL_OVERALL_COMPAT_ID,
  V9_OVERALL_INDEX_ID,
} from "../v9/overall-index";
import { computeHistoricalV9OverallCompat } from "./v9-historical-overall-compat";

export const QA03B_V9_WORKER_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export const QA03B_V9_CORE_RESULT_IDENTITY_BASE = Object.freeze({
  engine: QA03B_V9_ENGINE_ID,
  questionBank: QA03B_V9_QUESTION_BANK_ID,
  answerSchema: QA03B_V9_ANSWER_SCHEMA_ID,
  sessionSchema: QA03B_V9_SESSION_SCHEMA,
  replay: QA03B_V9_REPLAY_VERSION,
  plannerPolicy: "utility_first-v1",
  resultScope: "diagnostic-core-only-v1",
} as const);

export function buildQa03bV9CoreResultIdentity(scoringVersion: string) {
  const resolved = resolveV9ScoringCalibration(scoringVersion);
  return Object.freeze({
    ...QA03B_V9_CORE_RESULT_IDENTITY_BASE,
    scoringVersion: resolved.scoringVersion,
    scoringRegistry: V9_SCORING_CALIBRATION_REGISTRY_ID,
    calibration: resolved.calibration.identity,
    calibrationVersion: resolved.calibration.version,
    correlation: V9_EVIDENCE_CORRELATION_REGISTRY_ID,
    evidenceRegistry: V9_SCORING_EVIDENCE_REGISTRY_ID,
    scoringEngine: V9_SCORING_ENGINE_ID,
    overallIndex: resolved.calibration.overall.coverageBasis === "applicable_dimensions"
      ? V9_OVERALL_INDEX_ID
      : V9_HISTORICAL_OVERALL_COMPAT_ID,
  } as const);
}

export type Qa03bWorkerReplayRequestV9 = {
  readonly replayVersion: typeof QA03B_V9_REPLAY_VERSION;
  readonly engineIdentity: typeof QA03B_V9_ENGINE_ID;
  readonly answerSchema: typeof QA03B_V9_ANSWER_SCHEMA_ID;
  readonly questionBank: typeof QA03B_V9_QUESTION_BANK_ID;
  readonly sessionSchema: typeof QA03B_V9_SESSION_SCHEMA;
  readonly sessionKey: typeof QA03B_V9_SESSION_KEY;
  readonly scoringVersion: string;
  readonly session: unknown;
};

export type Qa03bWorkerReplayFailureV9 =
  | "request"
  | "identity"
  | "schema"
  | "bank"
  | "scoring_version"
  | "correlation"
  | "session"
  | "expired"
  | "incomplete"
  | "route";

export type Qa03bWorkerCoreResultV9 = {
  readonly identity: ReturnType<typeof buildQa03bV9CoreResultIdentity>;
  readonly interactionCount: number;
  readonly context: ReturnType<typeof buildCandidateQuestionPlanV9Prototype>["plan"]["context"];
  readonly terminalReason: CandidateSessionV9Prototype["terminalReason"];
  readonly applicableDimensions: readonly string[];
  readonly insufficientContextDimensions: readonly string[];
  readonly unresolvedApplicableDimensions: readonly string[];
  readonly dimensions: ReturnType<typeof scoreV9Dimensions>["dimensions"];
  readonly overall: ReturnType<typeof computeV9OverallIndex>;
  readonly extensionConsent: CandidateSessionV9Prototype["extensionConsent"];
  readonly extensionInteractions: number;
};

export type Qa03bWorkerReplayV9 =
  | {
      readonly ok: true;
      readonly session: CandidateSessionV9Prototype;
      readonly core: Qa03bWorkerCoreResultV9;
      readonly completedAt: number;
    }
  | { readonly ok: false; readonly reason: Qa03bWorkerReplayFailureV9 };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasExactKeys = (record: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(record).length === keys.length && keys.every((key) => Object.hasOwn(record, key));

const sameJson = (left: unknown, right: unknown): boolean => JSON.stringify(left) === JSON.stringify(right);

const classificationEvents = (transcript: readonly CandidateReplayEventV9[]) =>
  transcript.flatMap((event) => event.kind === "classification" ? [event.classification] : []);

function replayEventsAuthoritatively(
  parsed: CandidateSessionV9Prototype,
): CandidateSessionV9Prototype | null {
  let replayed = createCandidateSessionV9Prototype({
    sessionId: "qa03b-v9-worker-replay",
    writerId: "qa03b-v9-worker",
    now: parsed.startedAt,
  });
  let clock = parsed.startedAt;

  if (parsed.replayTranscript.length > QA03B_V9_REPLAY_LIMIT) return null;

  for (const event of parsed.replayTranscript) {
    if (event.kind === "extension_consent") {
      if (event.atInteractionCount !== replayed.interactionCount) return null;
      const consent = submitExtensionConsentV9Prototype(replayed, event.decision, "qa03b-v9-worker", ++clock);
      if (!consent.ok) return null;
      replayed = consent.session;
      continue;
    }
    if (event.kind === "classification") {
      if (event.mode === "answer") {
        if (currentCandidateQuestionIdV9(replayed) !== "q2_sector") return null;
        const submitted = submitClassificationV9Prototype(
          replayed,
          {
            sector: event.classification.sector,
            ...(event.classification.niche === undefined ? {} : { niche: event.classification.niche }),
          },
          "qa03b-v9-worker",
          ++clock,
        );
        if (!submitted.ok) return null;
        replayed = submitted.session;
        const rebuilt = replayed.replayTranscript.at(-1);
        if (rebuilt?.kind !== "classification" || !sameJson(rebuilt.classification, event.classification)) return null;
      } else {
        const edited = editClassificationV9Prototype(
          replayed,
          {
            sector: event.classification.sector,
            ...(event.classification.niche === undefined ? {} : { niche: event.classification.niche }),
          },
          "qa03b-v9-worker",
          ++clock,
        );
        if (!edited.ok) return null;
        replayed = edited.session;
        const rebuilt = replayed.replayTranscript.at(-1);
        if (rebuilt?.kind !== "classification" || !sameJson(rebuilt.classification, event.classification)) return null;
      }
      continue;
    }

    if (event.mode === "answer") {
      if (currentCandidateQuestionIdV9(replayed) !== event.questionId) return null;
      const submitted = submitCandidateAnswerV9Prototype(
        replayed,
        event.questionId,
        event.value,
        "qa03b-v9-worker",
        ++clock,
      );
      if (!submitted.ok) return null;
      replayed = submitted.session;
    } else {
      const edited = editCandidateAnswerV9Prototype(
        replayed,
        event.questionId,
        event.value,
        "qa03b-v9-worker",
        ++clock,
      );
      if (!edited.ok) return null;
      replayed = edited.session;
    }
  }

  return replayed;
}

export function replayQa03bSessionV9Core(
  input: unknown,
  now = Date.now(),
): Qa03bWorkerReplayV9 {
  if (!isRecord(input) || !hasExactKeys(input, [
    "replayVersion",
    "engineIdentity",
    "answerSchema",
    "questionBank",
    "sessionSchema",
    "sessionKey",
    "scoringVersion",
    "session",
  ])) return { ok: false, reason: "request" };

  if (
    input.replayVersion !== QA03B_V9_REPLAY_VERSION ||
    input.engineIdentity !== QA03B_V9_ENGINE_ID
  ) return { ok: false, reason: "identity" };

  if (
    input.answerSchema !== QA03B_V9_ANSWER_SCHEMA_ID ||
    input.sessionSchema !== QA03B_V9_SESSION_SCHEMA ||
    input.sessionKey !== QA03B_V9_SESSION_KEY
  ) return { ok: false, reason: "schema" };

  if (input.questionBank !== QA03B_V9_QUESTION_BANK_ID) return { ok: false, reason: "bank" };
  if (typeof input.scoringVersion !== "string" || !input.scoringVersion) return { ok: false, reason: "scoring_version" };
  let scoringProfile;
  try {
    scoringProfile = resolveV9ScoringCalibration(input.scoringVersion);
  } catch {
    return { ok: false, reason: "scoring_version" };
  }
  if (!isRecord(input.session)) return { ok: false, reason: "session" };

  if (
    typeof input.session.updatedAt === "number" &&
    now - input.session.updatedAt > QA03B_V9_WORKER_TTL_MS
  ) return { ok: false, reason: "expired" };

  const parsed = parseCandidateSessionV9Prototype(JSON.stringify(input.session));
  if (!parsed) return { ok: false, reason: "session" };
  if (
    (parsed.status !== "completing" && parsed.status !== "completed") ||
    parsed.terminalReason === null ||
    parsed.queue.length !== 0
  ) return { ok: false, reason: "incomplete" };
  if (parsed.interactionCount > V9_ABSOLUTE_INTERACTION_LIMIT) return { ok: false, reason: "route" };

  const replayed = replayEventsAuthoritatively(parsed);
  if (!replayed) return { ok: false, reason: "route" };

  if (
    replayed.status !== "completing" ||
    replayed.terminalReason !== parsed.terminalReason ||
    replayed.interactionCount !== parsed.interactionCount ||
    replayed.queue.length !== 0
  ) return { ok: false, reason: "incomplete" };

  if (
    !sameJson(replayed.answers, parsed.answers) ||
    !sameJson(replayed.answeredQuestionIds, parsed.answeredQuestionIds) ||
    !sameJson(replayed.replayTranscript, parsed.replayTranscript)
  ) return { ok: false, reason: "route" };

  const planView = buildCandidateQuestionPlanV9Prototype(
    replayed.answers,
    classificationEvents(replayed.replayTranscript),
    replayed.interactionCount,
    replayed.extensionConsent,
  );
  if (planView.plan.nextQuestionId !== undefined || planView.plan.routeLength > V9_ABSOLUTE_INTERACTION_LIMIT) {
    return { ok: false, reason: "incomplete" };
  }

  let scoring: ReturnType<typeof scoreV9Dimensions>;
  try {
    scoring = scoreV9Dimensions({
      answers: planView.activeAnswers,
      context: planView.plan.context,
      calibration: scoringProfile.calibration,
    });
  } catch (error) {
    if (error instanceof Error && (
      error.message === "v9_correlation_not_score_safe" ||
      error.message.startsWith("v9_scoring_answer_unmapped:")
    )) {
      return { ok: false, reason: "correlation" };
    }
    throw error;
  }

  const prelaunch =
    planView.plan.context.activity.status === "resolved" &&
    planView.plan.context.activity.value === "prelaunch";
  const overall = scoringProfile.calibration.overall.coverageBasis === "applicable_dimensions"
    ? computeV9OverallIndex({
        dimensions: scoring.dimensions,
        calibration: scoringProfile.calibration,
        prelaunch,
      })
    : computeHistoricalV9OverallCompat({
        dimensions: scoring.dimensions,
        answers: planView.activeAnswers,
        calibration: scoringProfile.calibration,
        prelaunch,
      });

  return {
    ok: true,
    session: {
      ...replayed,
      status: "completed",
      completedAt: now,
      updatedAt: now,
      revision: replayed.revision + 1,
    },
    completedAt: now,
    core: {
      identity: buildQa03bV9CoreResultIdentity(scoringProfile.scoringVersion),
      interactionCount: replayed.interactionCount,
      context: planView.plan.context,
      terminalReason: replayed.terminalReason,
      applicableDimensions: planView.plan.evidenceSufficiency.applicableDimensions,
      insufficientContextDimensions: planView.plan.evidenceSufficiency.insufficientContextDimensions,
      unresolvedApplicableDimensions: planView.plan.evidenceSufficiency.unresolvedApplicableDimensions,
      dimensions: scoring.dimensions,
      overall,
      extensionConsent: replayed.extensionConsent,
      extensionInteractions: v9ExtensionInteractionsUsed(replayed.interactionCount),
    },
  };
}
