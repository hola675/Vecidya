import type { QuestionDefinitionV2 } from "../qbv2-contract";
import type { AnswersV2 } from "../qbv2-rules";
import { CANDIDATE_ROUTE_HARD_CAP_V3 } from "./qbv2-candidate-planner";
import { validateCandidateAnswerV3 } from "./qbv2-candidate-session";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 } from "./specialty-branches-wave1";
import {
  applyClassificationInteractionV9,
  buildCandidateQuestionPlanV9Prototype,
  type ClassificationInteractionEventV9,
  type ClassificationSelectionV9,
} from "./v9-classification-bundle";

export const QA03B_V9_SESSION_SCHEMA = 9 as const;
export const QA03B_V9_ANSWER_SCHEMA_ID = "qbv2-answers-v7-specialty-interactions" as const;
export const QA03B_V9_SESSION_KEY = "vecidya.diagnostic.v3.candidate.session.9" as const;
export const QA03B_V9_QUESTION_BANK_ID = "qa03b-specialty-branches-v9-candidate-77" as const;
export const QA03B_V9_ENGINE_ID = "qa03b-v9-utility-first-interactions-v1" as const;
export const QA03B_V9_REPLAY_VERSION = "qa03b-worker-replay-v7-candidate" as const;
export const QA03B_V9_REPLAY_LIMIT = CANDIDATE_ROUTE_HARD_CAP_V3 * 16;

export type CandidateTerminalReasonV9 = "no_useful_questions" | "budget_blocked" | "hard_cap";

export type CandidateReplayEventV9 =
  | {
      readonly kind: "answer";
      readonly questionId: string;
      readonly value: string | readonly string[];
      readonly mode: "answer" | "edit";
    }
  | {
      readonly kind: "classification";
      readonly classification: ClassificationInteractionEventV9;
      readonly mode: "answer" | "edit";
    };

export type CandidateSessionV9Prototype = {
  readonly schemaVersion: typeof QA03B_V9_SESSION_SCHEMA;
  readonly engineIdentity: typeof QA03B_V9_ENGINE_ID;
  readonly questionBankIdentity: typeof QA03B_V9_QUESTION_BANK_ID;
  readonly replayVersion: typeof QA03B_V9_REPLAY_VERSION;
  readonly sessionId: string;
  readonly writerId: string;
  readonly startedAt: number;
  readonly updatedAt: number;
  readonly completedAt: number | null;
  readonly revision: number;
  readonly interactionCount: number;
  readonly answers: AnswersV2;
  readonly answeredQuestionIds: readonly string[];
  readonly queue: readonly string[];
  readonly status: "in_progress" | "completing" | "completed";
  readonly terminalReason: CandidateTerminalReasonV9 | null;
  readonly replayTranscript: readonly CandidateReplayEventV9[];
};

export type CandidateSubmitResultV9 =
  | { readonly ok: true; readonly session: CandidateSessionV9Prototype }
  | { readonly ok: false; readonly reason: "required" | "invalid" | "not_current" | "classification_required" | "history_limit" };

const bank = QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2;
const byId = new Map(bank.map((question) => [question.id, question] as const));
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const classificationEvents = (session: CandidateSessionV9Prototype): readonly ClassificationInteractionEventV9[] =>
  session.replayTranscript
    .filter((event): event is Extract<CandidateReplayEventV9, { kind: "classification" }> => event.kind === "classification")
    .map((event) => event.classification);

function replanV9(session: CandidateSessionV9Prototype): CandidateSessionV9Prototype {
  const planned = buildCandidateQuestionPlanV9Prototype(
    session.answers,
    classificationEvents(session),
    session.interactionCount,
  );
  const answers = planned.activeAnswers;
  const eligible = new Set(planned.plan.eligibleQuestionIds);
  const answeredQuestionIds = session.answeredQuestionIds.filter((id) => answers[id] !== undefined);
  let queue = session.queue.filter((id) => eligible.has(id) && answers[id] === undefined);
  if (queue.length === 0 && session.interactionCount < CANDIDATE_ROUTE_HARD_CAP_V3) {
    queue = [...planned.plan.selectedQuestionIds];
  }
  const terminalReason: CandidateTerminalReasonV9 | null =
    planned.plan.completion.hardCapReached && queue.length === 0
      ? "hard_cap"
      : planned.plan.evidenceSufficiency.terminalReason === "budget_blocked" && queue.length === 0
        ? "budget_blocked"
        : queue.length === 0
          ? "no_useful_questions"
          : null;
  return {
    ...session,
    answers,
    answeredQuestionIds,
    queue,
    status: terminalReason ? "completing" : "in_progress",
    terminalReason,
  };
}

function touch(
  session: CandidateSessionV9Prototype,
  writerId: string,
  now: number,
  patch: Partial<CandidateSessionV9Prototype>,
): CandidateSessionV9Prototype {
  return { ...session, ...patch, writerId, updatedAt: now, revision: session.revision + 1 };
}

export function createCandidateSessionV9Prototype(input: {
  readonly sessionId: string;
  readonly writerId: string;
  readonly now: number;
}): CandidateSessionV9Prototype {
  return replanV9({
    schemaVersion: QA03B_V9_SESSION_SCHEMA,
    engineIdentity: QA03B_V9_ENGINE_ID,
    questionBankIdentity: QA03B_V9_QUESTION_BANK_ID,
    replayVersion: QA03B_V9_REPLAY_VERSION,
    sessionId: input.sessionId,
    writerId: input.writerId,
    startedAt: input.now,
    updatedAt: input.now,
    completedAt: null,
    revision: 0,
    interactionCount: 0,
    answers: {},
    answeredQuestionIds: [],
    queue: [],
    status: "in_progress",
    terminalReason: null,
    replayTranscript: [],
  });
}

export function currentCandidateQuestionIdV9(session: CandidateSessionV9Prototype): string | null {
  if (session.status !== "in_progress") return null;
  return session.queue[0] ?? null;
}

export function submitCandidateAnswerV9Prototype(
  session: CandidateSessionV9Prototype,
  questionId: string,
  value: unknown,
  writerId: string,
  now: number,
): CandidateSubmitResultV9 {
  if (currentCandidateQuestionIdV9(session) !== questionId) return { ok: false, reason: "not_current" };
  if (questionId === "q2_sector") return { ok: false, reason: "classification_required" };
  const question = byId.get(questionId);
  if (!question || !validateCandidateAnswerV3(question, value)) return { ok: false, reason: value === undefined ? "required" : "invalid" };
  if (session.replayTranscript.length >= QA03B_V9_REPLAY_LIMIT) return { ok: false, reason: "history_limit" };

  const normalized = Array.isArray(value)
    ? question.options.filter((option) => value.includes(option.value)).map((option) => option.value)
    : value as string;
  const next = touch(session, writerId, now, {
    answers: { ...session.answers, [questionId]: normalized },
    answeredQuestionIds: [...session.answeredQuestionIds.filter((id) => id !== questionId), questionId],
    queue: session.queue.filter((id) => id !== questionId),
    interactionCount: session.interactionCount + 1,
    replayTranscript: [...session.replayTranscript, { kind: "answer", questionId, value: normalized, mode: "answer" }],
  });
  return { ok: true, session: replanV9(next) };
}

export function submitClassificationV9Prototype(
  session: CandidateSessionV9Prototype,
  selection: ClassificationSelectionV9,
  writerId: string,
  now: number,
): CandidateSubmitResultV9 {
  if (currentCandidateQuestionIdV9(session) !== "q2_sector") return { ok: false, reason: "not_current" };
  if (session.replayTranscript.length >= QA03B_V9_REPLAY_LIMIT) return { ok: false, reason: "history_limit" };
  const applied = applyClassificationInteractionV9(session.answers, selection);
  if (!applied.ok) return { ok: false, reason: "invalid" };

  const ids = ["q2_sector", ...(applied.event.nicheQuestionId ? [applied.event.nicheQuestionId] : [])];
  const next = touch(session, writerId, now, {
    answers: applied.answers,
    answeredQuestionIds: [
      ...session.answeredQuestionIds.filter((id) => !id.startsWith("q2_niche_") && id !== "q2_sector"),
      ...ids,
    ],
    queue: session.queue.filter((id) => id !== "q2_sector" && !id.startsWith("q2_niche_")),
    interactionCount: session.interactionCount + 1,
    replayTranscript: [...session.replayTranscript, { kind: "classification", classification: applied.event, mode: "answer" }],
  });
  return { ok: true, session: replanV9(next) };
}

export function editCandidateAnswerV9Prototype(
  session: CandidateSessionV9Prototype,
  questionId: string,
  value: unknown,
  writerId: string,
  now: number,
): CandidateSubmitResultV9 {
  if (session.answers[questionId] === undefined || questionId === "q2_sector" || questionId.startsWith("q2_niche_")) {
    return { ok: false, reason: "invalid" };
  }
  const question = byId.get(questionId);
  if (!question || !validateCandidateAnswerV3(question, value)) return { ok: false, reason: "invalid" };
  if (session.replayTranscript.length >= QA03B_V9_REPLAY_LIMIT) return { ok: false, reason: "history_limit" };
  const normalized = Array.isArray(value)
    ? question.options.filter((option) => value.includes(option.value)).map((option) => option.value)
    : value as string;
  const next = touch(session, writerId, now, {
    answers: { ...session.answers, [questionId]: normalized },
    replayTranscript: [...session.replayTranscript, { kind: "answer", questionId, value: normalized, mode: "edit" }],
  });
  return { ok: true, session: replanV9(next) };
}

export function editClassificationV9Prototype(
  session: CandidateSessionV9Prototype,
  selection: ClassificationSelectionV9,
  writerId: string,
  now: number,
): CandidateSubmitResultV9 {
  if (session.answers.q2_sector === undefined) return { ok: false, reason: "invalid" };
  if (session.replayTranscript.length >= QA03B_V9_REPLAY_LIMIT) return { ok: false, reason: "history_limit" };
  const applied = applyClassificationInteractionV9(session.answers, selection);
  if (!applied.ok) return { ok: false, reason: "invalid" };
  const ids = ["q2_sector", ...(applied.event.nicheQuestionId ? [applied.event.nicheQuestionId] : [])];
  const next = touch(session, writerId, now, {
    answers: applied.answers,
    answeredQuestionIds: [
      ...session.answeredQuestionIds.filter((id) => id !== "q2_sector" && !id.startsWith("q2_niche_")),
      ...ids,
    ],
    replayTranscript: [...session.replayTranscript, { kind: "classification", classification: applied.event, mode: "edit" }],
    // Editing never refunds or consumes an additional visible interaction.
    interactionCount: session.interactionCount,
  });
  return { ok: true, session: replanV9(next) };
}

export function replayCandidateTranscriptV9(
  transcript: readonly CandidateReplayEventV9[],
): { readonly answers: AnswersV2; readonly interactionCount: number } | null {
  if (transcript.length > QA03B_V9_REPLAY_LIMIT) return null;
  let answers: AnswersV2 = {};
  let interactionCount = 0;

  for (const event of transcript) {
    if (event.kind === "classification") {
      const applied = applyClassificationInteractionV9(answers, {
        sector: event.classification.sector,
        ...(event.classification.niche === undefined ? {} : { niche: event.classification.niche }),
      });
      if (!applied.ok || applied.event.nicheQuestionId !== event.classification.nicheQuestionId) return null;
      if (event.mode === "edit" && answers.q2_sector === undefined) return null;
      answers = applied.answers;
      if (event.mode === "answer") interactionCount += 1;
      continue;
    }

    const question = byId.get(event.questionId);
    if (!question || event.questionId === "q2_sector" || event.questionId.startsWith("q2_niche_")) return null;
    if (!validateCandidateAnswerV3(question, event.value)) return null;
    if (event.mode === "edit" && answers[event.questionId] === undefined) return null;
    const eligible = new Set(buildCandidateQuestionPlanV9Prototype(answers, [], interactionCount).plan.eligibleQuestionIds);
    if (event.mode === "answer" && !eligible.has(event.questionId)) return null;
    answers = { ...answers, [event.questionId]: event.value };
    answers = buildCandidateQuestionPlanV9Prototype(answers, [], interactionCount).activeAnswers;
    if (event.mode === "answer") interactionCount += 1;
  }
  return { answers, interactionCount };
}

export function parseCandidateSessionV9Prototype(raw: string): CandidateSessionV9Prototype | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    if (
      parsed.schemaVersion !== QA03B_V9_SESSION_SCHEMA ||
      parsed.engineIdentity !== QA03B_V9_ENGINE_ID ||
      parsed.questionBankIdentity !== QA03B_V9_QUESTION_BANK_ID ||
      parsed.replayVersion !== QA03B_V9_REPLAY_VERSION
    ) return null;
    if (
      typeof parsed.sessionId !== "string" || !parsed.sessionId ||
      typeof parsed.writerId !== "string" || !parsed.writerId ||
      typeof parsed.startedAt !== "number" || typeof parsed.updatedAt !== "number" ||
      typeof parsed.revision !== "number" || typeof parsed.interactionCount !== "number" ||
      !Number.isInteger(parsed.interactionCount) || parsed.interactionCount < 0 ||
      parsed.interactionCount > CANDIDATE_ROUTE_HARD_CAP_V3 ||
      !isRecord(parsed.answers) || !Array.isArray(parsed.answeredQuestionIds) ||
      !Array.isArray(parsed.queue) || !Array.isArray(parsed.replayTranscript)
    ) return null;
    if (!["in_progress", "completing", "completed"].includes(String(parsed.status))) return null;
    if (!(parsed.terminalReason === null || ["no_useful_questions", "budget_blocked", "hard_cap"].includes(String(parsed.terminalReason)))) return null;
    if (!(parsed.completedAt === null || typeof parsed.completedAt === "number")) return null;

    const parsedAnswers = parsed.answers as Record<string, unknown>;
    const parsedAnsweredQuestionIds = parsed.answeredQuestionIds as unknown[];
    const parsedQueue = parsed.queue as unknown[];
    const parsedTranscript = parsed.replayTranscript as unknown[];

    if (!parsedAnsweredQuestionIds.every((id) => typeof id === "string") || new Set(parsedAnsweredQuestionIds).size !== parsedAnsweredQuestionIds.length) return null;
    const answeredQuestionIds = parsedAnsweredQuestionIds as string[];
    const answerIds = Object.keys(parsedAnswers);
    if (answerIds.length !== answeredQuestionIds.length || !answerIds.every((id) => answeredQuestionIds.includes(id))) return null;
    if (!parsedQueue.every((id) => typeof id === "string" && byId.has(id) && parsedAnswers[id] === undefined) || new Set(parsedQueue).size !== parsedQueue.length) return null;

    const replayed = replayCandidateTranscriptV9(parsedTranscript as CandidateReplayEventV9[]);
    if (!replayed || replayed.interactionCount !== parsed.interactionCount) return null;
    if (JSON.stringify(replayed.answers) !== JSON.stringify(parsed.answers)) return null;

    const session = parsed as unknown as CandidateSessionV9Prototype;
    const replanned = replanV9(session);
    if (JSON.stringify(replanned.answers) !== JSON.stringify(session.answers)) return null;
    if (JSON.stringify(replanned.queue) !== JSON.stringify(session.queue)) return null;
    if (replanned.status !== session.status || replanned.terminalReason !== session.terminalReason) return null;
    return session;
  } catch {
    return null;
  }
}
