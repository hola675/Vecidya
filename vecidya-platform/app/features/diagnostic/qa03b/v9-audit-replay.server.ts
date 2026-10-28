import {
  QA03B_V9_CLASSIFICATION_INTERACTION_ID,
  type ClassificationInteractionEventV9,
} from "./v9-classification-bundle";
import {
  QA03B_V9_ANSWER_SCHEMA_ID,
  QA03B_V9_ENGINE_ID,
  QA03B_V9_QUESTION_BANK_ID,
  QA03B_V9_REPLAY_VERSION,
  QA03B_V9_SESSION_KEY,
  QA03B_V9_SESSION_SCHEMA,
  QA03B_V9_REPLAY_LIMIT,
  createCandidateSessionV9Prototype,
  currentCandidateQuestionIdV9,
  type CandidateSessionV9Prototype,
  editCandidateAnswerV9Prototype,
  editClassificationV9Prototype,
  submitCandidateAnswerV9Prototype,
  submitClassificationV9Prototype,
} from "./v9-session-prototype";
import { replayQa03bSessionV9Core, type Qa03bWorkerReplayV9 } from "./worker-replay-v9.server";

export type V9StoredAuditEvent = {
  readonly seq: number;
  readonly event_id: string;
  readonly kind: string;
  readonly payload_json: string;
  readonly occurred_at: string;
  readonly schema_version: number;
  readonly actor_type: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasOnlyKeys = (record: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(record).every((key) => keys.includes(key));

function sameAnswerValue(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;
    const a = [...left].sort();
    const b = [...right].sort();
    return a.every((value, index) => value === b[index]);
  }
  return left === right;
}

function sameClassification(
  left: ClassificationInteractionEventV9,
  right: ClassificationInteractionEventV9,
): boolean {
  return left.kind === right.kind &&
    left.sector === right.sector &&
    left.niche === right.niche &&
    left.sectorQuestionId === right.sectorQuestionId &&
    left.nicheQuestionId === right.nicheQuestionId;
}

/**
 * Rebuild a V9 session exclusively from the append-only D1 audit stream,
 * then pass it through the authoritative worker replay and scoring contract.
 */
export type V9AuditReplayInput = {
  readonly runId: string;
  readonly startedAt: number;
  readonly events: readonly V9StoredAuditEvent[];
  readonly now?: number;
};

export type V9AuditSessionReconstruction =
  | { readonly ok: true; readonly session: CandidateSessionV9Prototype; readonly nextQuestionId: string | null }
  | Extract<Qa03bWorkerReplayV9, { readonly ok: false }>;

/** Validate and replay the entire committed stream, including incomplete runs. */
export function recoverDiagnosticAuditSessionV9(input: V9AuditReplayInput): V9AuditSessionReconstruction {
  const now = input.now ?? Date.now();
  if (!input.runId || !Number.isFinite(input.startedAt) || input.startedAt <= 0 ||
      !Number.isFinite(now) || now < input.startedAt) {
    return { ok: false, reason: "session" };
  }
  if (input.events.length > QA03B_V9_REPLAY_LIMIT) return { ok: false, reason: "route" };

  let session = createCandidateSessionV9Prototype({
    sessionId: input.runId,
    writerId: "v9-d1-authoritative-replay",
    now: input.startedAt,
  });
  let previousTimestamp = input.startedAt;
  let expectedSeq = 1;

  for (const event of input.events) {
    if (event.seq !== expectedSeq || event.schema_version !== 1 || event.actor_type !== "client") {
      return { ok: false, reason: "route" };
    }
    const eventTime = Date.parse(event.occurred_at);
    if (!Number.isFinite(eventTime) ||
        eventTime < input.startedAt - 5 * 60 * 1000 ||
        eventTime > now + 5 * 60 * 1000) {
      return { ok: false, reason: "route" };
    }
    previousTimestamp = Math.max(previousTimestamp + 1, eventTime);

    let payload: unknown;
    try { payload = JSON.parse(event.payload_json) as unknown; } catch { return { ok: false, reason: "session" }; }
    if (!isRecord(payload)) return { ok: false, reason: "route" };

    if (event.kind === "answer") {
      if (!hasOnlyKeys(payload, ["questionId", "value", "mode"]) ||
          typeof payload.questionId !== "string" || payload.questionId.length < 1 ||
          payload.questionId.length > 128 ||
          (payload.mode !== "answer" && payload.mode !== "edit")) {
        return { ok: false, reason: "route" };
      }
      const submitted = payload.mode === "answer"
        ? submitCandidateAnswerV9Prototype(session, payload.questionId, payload.value, "v9-d1-authoritative-replay", previousTimestamp)
        : editCandidateAnswerV9Prototype(session, payload.questionId, payload.value, "v9-d1-authoritative-replay", previousTimestamp);
      if (!submitted.ok) return { ok: false, reason: "route" };
      const canonical = submitted.session.replayTranscript.at(-1);
      if (!canonical || canonical.kind !== "answer" ||
          canonical.questionId !== payload.questionId ||
          canonical.mode !== payload.mode ||
          !sameAnswerValue(canonical.value, payload.value)) {
        return { ok: false, reason: "route" };
      }
      session = submitted.session;
    } else if (event.kind === QA03B_V9_CLASSIFICATION_INTERACTION_ID) {
      if (!hasOnlyKeys(payload, ["kind", "sector", "niche", "sectorQuestionId", "nicheQuestionId", "mode"]) ||
          payload.kind !== QA03B_V9_CLASSIFICATION_INTERACTION_ID ||
          typeof payload.sector !== "string" ||
          payload.sectorQuestionId !== "q2_sector" ||
          (payload.niche !== undefined && typeof payload.niche !== "string") ||
          (payload.nicheQuestionId !== undefined && typeof payload.nicheQuestionId !== "string") ||
          (payload.mode !== "answer" && payload.mode !== "edit")) {
        return { ok: false, reason: "route" };
      }
      const expected: ClassificationInteractionEventV9 = {
        kind: QA03B_V9_CLASSIFICATION_INTERACTION_ID,
        sector: payload.sector,
        ...(typeof payload.niche === "string" ? { niche: payload.niche } : {}),
        sectorQuestionId: "q2_sector",
        ...(typeof payload.nicheQuestionId === "string" ? { nicheQuestionId: payload.nicheQuestionId } : {}),
      };
      const submitted = payload.mode === "answer"
        ? submitClassificationV9Prototype(session, {
            sector: expected.sector,
            ...(expected.niche === undefined ? {} : { niche: expected.niche }),
          }, "v9-d1-authoritative-replay", previousTimestamp)
        : editClassificationV9Prototype(session, {
            sector: expected.sector,
            ...(expected.niche === undefined ? {} : { niche: expected.niche }),
          }, "v9-d1-authoritative-replay", previousTimestamp);
      if (!submitted.ok) return { ok: false, reason: "route" };
      const canonical = submitted.session.replayTranscript.at(-1);
      if (!canonical || canonical.kind !== "classification" ||
          canonical.mode !== payload.mode ||
          !sameClassification(canonical.classification, expected)) {
        return { ok: false, reason: "route" };
      }
      session = submitted.session;
    } else {
      return { ok: false, reason: "route" };
    }
    expectedSeq += 1;
  }

  session = { ...session, updatedAt: previousTimestamp };
  return { ok: true, session, nextQuestionId: currentCandidateQuestionIdV9(session) };
}

/** A finalized result still must pass authoritative Worker validation. */
export function replayDiagnosticAuditEventsV9(input: V9AuditReplayInput): Qa03bWorkerReplayV9 {
  const recovered = recoverDiagnosticAuditSessionV9(input);
  if (!recovered.ok) return recovered;
  return replayQa03bSessionV9Core({
    replayVersion: QA03B_V9_REPLAY_VERSION,
    engineIdentity: QA03B_V9_ENGINE_ID,
    answerSchema: QA03B_V9_ANSWER_SCHEMA_ID,
    questionBank: QA03B_V9_QUESTION_BANK_ID,
    sessionSchema: QA03B_V9_SESSION_SCHEMA,
    sessionKey: QA03B_V9_SESSION_KEY,
    session: recovered.session,
  }, input.now ?? Date.now());
}
