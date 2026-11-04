import {
  QA03B_V9_ANSWER_SCHEMA_ID,
  QA03B_V9_ENGINE_ID,
  QA03B_V9_QUESTION_BANK_ID,
  QA03B_V9_REPLAY_VERSION,
  QA03B_V9_SESSION_KEY,
  QA03B_V9_SESSION_SCHEMA,
  parseCandidateSessionV9Prototype,
} from "../qa03b/v9-session-prototype";
import {
  replayQa03bSessionV9Core,
  type Qa03bWorkerCoreResultV9,
} from "../qa03b/worker-replay-v9.server";
import { isV9CurrentPublicScoringVersion } from "./scoring-calibration-registry";

export const DIAGNOSTIC_V9_TRANSIENT_REPLAY_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type TransientReplayRequestV9 = {
  readonly scoringVersion: string;
  readonly session: unknown;
};

export type TransientReplayResultV9 =
  | { readonly ok: true; readonly completedAt: number; readonly core: Qa03bWorkerCoreResultV9 }
  | { readonly ok: false; readonly reason: "request" | "session" | "expired" | "incomplete" | "scoring_version" | "replay" };

/** Rebuild the V9 result in memory only; this adapter has no D1 or logging dependency. */
export function replayDiagnosticV9Transiently(
  input: TransientReplayRequestV9,
  now = Date.now(),
): TransientReplayResultV9 {
  if (!input || typeof input !== "object" || typeof input.scoringVersion !== "string" || !input.scoringVersion) {
    return { ok: false, reason: "request" };
  }
  if (!isV9CurrentPublicScoringVersion(input.scoringVersion)) {
    return { ok: false, reason: "scoring_version" };
  }
  if (!Number.isSafeInteger(now)) return { ok: false, reason: "request" };
  if (!input.session || typeof input.session !== "object" || Array.isArray(input.session)) {
    return { ok: false, reason: "session" };
  }

  let session: ReturnType<typeof parseCandidateSessionV9Prototype>;
  try {
    session = parseCandidateSessionV9Prototype(JSON.stringify(input.session));
  } catch {
    return { ok: false, reason: "session" };
  }
  if (!session) return { ok: false, reason: "session" };
  if (!Number.isSafeInteger(session.updatedAt) || now - session.updatedAt > DIAGNOSTIC_V9_TRANSIENT_REPLAY_TTL_MS) {
    return { ok: false, reason: "expired" };
  }
  if (session.status !== "completing" || session.terminalReason === null || session.queue.length !== 0) {
    return { ok: false, reason: "incomplete" };
  }

  try {
    const replayed = replayQa03bSessionV9Core({
      replayVersion: QA03B_V9_REPLAY_VERSION,
      engineIdentity: QA03B_V9_ENGINE_ID,
      answerSchema: QA03B_V9_ANSWER_SCHEMA_ID,
      questionBank: QA03B_V9_QUESTION_BANK_ID,
      sessionSchema: QA03B_V9_SESSION_SCHEMA,
      sessionKey: QA03B_V9_SESSION_KEY,
      scoringVersion: input.scoringVersion,
      session,
    }, now);
    if (!replayed.ok) {
      return {
        ok: false,
        reason: replayed.reason === "expired" ? "expired"
          : replayed.reason === "incomplete" ? "incomplete"
            : replayed.reason === "scoring_version" ? "scoring_version"
              : replayed.reason === "session" ? "session" : "replay",
      };
    }
    return { ok: true, completedAt: replayed.completedAt, core: replayed.core };
  } catch {
    // Do not return exception text: scorer errors can contain answer-derived details.
    return { ok: false, reason: "replay" };
  }
}
