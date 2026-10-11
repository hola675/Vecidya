// Orquestador aislado QA-03B; el original certificado permanece reproducible.
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "./bank";
import { CANDIDATE_RESULT_IDENTITY_V3, isCandidateResultIdentityV3, runCandidateDiagnosticPipelineV3 } from "./qbv2-candidate-pipeline";
import { buildCandidateQuestionPlanV3 } from "./qbv2-candidate-planner";
import type { QuestionDefinitionV2 } from "../qbv2-contract";
import type { AnswersV2 } from "../qbv2-rules";

export const CANDIDATE_SESSION_SCHEMA_V3 = 3 as const;
export const CANDIDATE_SESSION_STORAGE_KEY_V3 = "vecidya.diagnostic.v3.candidate.session.3";
export const CANDIDATE_SESSION_TTL_MS_V3 = 14 * 24 * 60 * 60 * 1000;
export const CANDIDATE_QUESTION_BANK_ID_V3 = "reviewed-evidence-v4" as const;

export type CandidateTerminalReasonV3 = "no_useful_questions" | "budget_blocked" | "hard_cap";
export type CandidateSessionV3 = {
  readonly schemaVersion: typeof CANDIDATE_SESSION_SCHEMA_V3;
  readonly engineIdentity: typeof CANDIDATE_RESULT_IDENTITY_V3;
  readonly questionBankIdentity: typeof CANDIDATE_QUESTION_BANK_ID_V3;
  readonly sessionId: string;
  readonly startedAt: number;
  readonly updatedAt: number;
  readonly completedAt: number | null;
  readonly revision: number;
  readonly writerId: string;
  readonly answers: AnswersV2;
  readonly answeredQuestionIds: readonly string[];
  readonly queue: readonly string[];
  readonly reviewIndex: number | null;
  readonly status: "in_progress" | "completing" | "completed";
  readonly terminalReason: CandidateTerminalReasonV3 | null;
};

export type CandidateCreateOptionsV3 = { readonly sessionId: string; readonly writerId: string; readonly now: number };
const bank = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as readonly QuestionDefinitionV2[];
const byId = new Map(bank.map((question) => [question.id, question]));
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const questionFor = (id: string) => byId.get(id);

export function validateCandidateAnswerV3(question: QuestionDefinitionV2, value: unknown): boolean {
  const values = new Set(question.options.map((option) => option.value));
  if (question.type === "single") return typeof value === "string" && values.has(value);
  if (!Array.isArray(value) || value.length === 0 || !value.every((item) => typeof item === "string" && values.has(item))) return false;
  if (new Set(value).size !== value.length) return false;
  const exclusive = new Set(question.options.filter((option) => option.exclusive).map((option) => option.value));
  return value.length <= 1 || !value.some((item) => exclusive.has(item));
}

export function toggleCandidateMultiAnswerV3(question: QuestionDefinitionV2, current: readonly string[], value: string): readonly string[] {
  if (!question.options.some((option) => option.value === value)) return current;
  if (current.includes(value)) return current.filter((item) => item !== value);
  const selected = question.options.find((option) => option.value === value);
  if (selected?.exclusive) return [value];
  return question.options.filter((option) => option.value !== value && !option.exclusive && current.includes(option.value)).map((option) => option.value).concat(value);
}

function touch(session: CandidateSessionV3, writerId: string, now: number, patch: Partial<CandidateSessionV3>): CandidateSessionV3 {
  return { ...session, ...patch, writerId, revision: session.revision + 1, updatedAt: now };
}

function replan(session: CandidateSessionV3, replaceQueue = false): CandidateSessionV3 {
  const plan = buildCandidateQuestionPlanV3({ answers: session.answers });
  const answers = plan.activeAnswers;
  const removed = new Set(Object.keys(session.answers).filter((id) => answers[id] === undefined));
  const answeredQuestionIds = session.answeredQuestionIds.filter((id) => !removed.has(id) && answers[id] !== undefined);
  const eligible = new Set(plan.eligibleQuestionIds);
  let queue: readonly string[] = replaceQueue ? [] : session.queue.filter((id) => eligible.has(id) && answers[id] === undefined);
  if (queue.length === 0 && Object.keys(answers).length < plan.budget.hardMax && plan.selectedQuestionIds.length > 0) {
    queue = plan.selectedQuestionIds;
  }
  const terminalReason: CandidateTerminalReasonV3 | null = plan.completion.hardCapReached
    && queue.length === 0 ? "hard_cap"
    : plan.evidenceSufficiency.terminalReason === "budget_blocked"
      && queue.length === 0 ? "budget_blocked"
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
    reviewIndex: session.reviewIndex === null ? null : Math.min(session.reviewIndex, Math.max(0, answeredQuestionIds.length - 1)),
  };
}

export function createCandidateSessionV3({ sessionId, writerId, now }: CandidateCreateOptionsV3): CandidateSessionV3 {
  const initial: CandidateSessionV3 = {
    schemaVersion: CANDIDATE_SESSION_SCHEMA_V3,
    engineIdentity: CANDIDATE_RESULT_IDENTITY_V3,
    questionBankIdentity: CANDIDATE_QUESTION_BANK_ID_V3,
    sessionId, startedAt: now, updatedAt: now, completedAt: null, revision: 0, writerId,
    answers: {}, answeredQuestionIds: [], queue: [], reviewIndex: null, status: "in_progress", terminalReason: null,
  };
  return replan(initial);
}

export function currentCandidateQuestionIdV3(session: CandidateSessionV3): string | null {
  if (session.reviewIndex !== null) return session.answeredQuestionIds[session.reviewIndex] ?? null;
  if (session.status !== "in_progress") return null;
  return session.queue[0] ?? null;
}

export type CandidateSubmitResultV3 = { readonly ok: true; readonly session: CandidateSessionV3 } | { readonly ok: false; readonly reason: "required" | "invalid" | "not_current" };

export function submitCandidateAnswerV3(session: CandidateSessionV3, questionId: string, value: unknown, writerId: string, now: number): CandidateSubmitResultV3 {
  if (currentCandidateQuestionIdV3(session) !== questionId) return { ok: false, reason: "not_current" };
  const question = questionFor(questionId);
  if (!question) return { ok: false, reason: "invalid" };
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) return { ok: false, reason: "required" };
  if (!validateCandidateAnswerV3(question, value)) return { ok: false, reason: "invalid" };
  const normalized = Array.isArray(value) ? question.options.filter((option) => value.includes(option.value)).map((option) => option.value) : value;
  const changed = JSON.stringify(session.answers[questionId]) !== JSON.stringify(normalized);
  const answers: AnswersV2 = { ...session.answers, [questionId]: normalized as string | readonly string[] };
  const answeredQuestionIds = session.reviewIndex === null
    ? [...session.answeredQuestionIds.filter((id) => id !== questionId), questionId]
    : session.answeredQuestionIds;
  const isReview = session.reviewIndex !== null;
  const next = touch(session, writerId, now, {
    answers,
    answeredQuestionIds,
    queue: isReview ? [] : session.queue.slice(1),
    reviewIndex: session.reviewIndex === null ? null : null,
    status: "in_progress",
    terminalReason: null,
  });
  // R5 is the authority for applicability and invalidation. Reconciliation drops stale answers before selecting again.
  const planned = replan(next, isReview && changed);
  if (!changed && session.reviewIndex !== null) {
    const reviewIndex = session.reviewIndex + 1;
    if (reviewIndex < planned.answeredQuestionIds.length) return { ok: true, session: { ...planned, reviewIndex } };
  }
  return { ok: true, session: { ...planned, reviewIndex: null } };
}

export function goBackCandidateV3(session: CandidateSessionV3, writerId: string, now: number): CandidateSessionV3 {
  if (session.answeredQuestionIds.length === 0) return session;
  const reviewIndex = session.reviewIndex === null ? session.answeredQuestionIds.length - 1 : Math.max(0, session.reviewIndex - 1);
  return touch(session, writerId, now, { reviewIndex, status: "in_progress", terminalReason: null, completedAt: null });
}

export function completeCandidateSessionV3(session: CandidateSessionV3, writerId: string, now: number) {
  if (session.status !== "completing" || session.reviewIndex !== null || session.queue.length !== 0 || !session.terminalReason) return null;
  const result = runCandidateDiagnosticPipelineV3(session.answers);
  if (result.engineIdentity !== CANDIDATE_RESULT_IDENTITY_V3) return null;
  return { session: touch(session, writerId, now, { status: "completed", completedAt: now }), result };
}

export function rebuildCompletedCandidateResultV3(session: CandidateSessionV3) {
  if (session.status !== "completed" || session.completedAt === null || session.reviewIndex !== null || session.queue.length !== 0 || !session.terminalReason) return null;
  const result = runCandidateDiagnosticPipelineV3(session.answers);
  return result.engineIdentity === CANDIDATE_RESULT_IDENTITY_V3 ? result : null;
}

function parseSession(raw: string | null, now: number, schemaVersion: number): Record<string, unknown> | null {
  if (!raw) return null;
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return null; }
  if (!isRecord(parsed) || parsed.schemaVersion !== schemaVersion || parsed.questionBankIdentity !== CANDIDATE_QUESTION_BANK_ID_V3 || !isCandidateResultIdentityV3(parsed.engineIdentity)) return null;
  const { sessionId, startedAt, updatedAt, revision, writerId, answers, answeredQuestionIds, queue, reviewIndex, status, terminalReason } = parsed;
  if (typeof sessionId !== "string" || !sessionId.trim() || typeof writerId !== "string" || !writerId.trim() || !Number.isFinite(startedAt) || (startedAt as number) < 0 || !Number.isFinite(updatedAt) || (updatedAt as number) < (startedAt as number) || !Number.isInteger(revision) || (revision as number) < 0 || !isRecord(answers) || !Array.isArray(answeredQuestionIds) || !Array.isArray(queue)) return null;
  if ((startedAt as number) > now + 60_000 || now - (updatedAt as number) > CANDIDATE_SESSION_TTL_MS_V3 || (updatedAt as number) > now + 60_000) return null;
  if (!(reviewIndex === null || (Number.isInteger(reviewIndex) && (reviewIndex as number) >= 0 && (reviewIndex as number) < answeredQuestionIds.length))) return null;
  if (!(status === "in_progress" || status === "completing" || status === "completed")) return null;
  if (!(terminalReason === null || terminalReason === "no_useful_questions" || terminalReason === "budget_blocked" || terminalReason === "hard_cap")) return null;
  if (schemaVersion === CANDIDATE_SESSION_SCHEMA_V3 && !(parsed.completedAt === null || (Number.isFinite(parsed.completedAt) && (parsed.completedAt as number) >= (startedAt as number) && (parsed.completedAt as number) <= (updatedAt as number)))) return null;
  if (schemaVersion === CANDIDATE_SESSION_SCHEMA_V3 && (status === "completed") !== (parsed.completedAt !== null)) return null;
  if (schemaVersion === CANDIDATE_SESSION_SCHEMA_V3 && status !== "completed" && parsed.completedAt !== null) return null;
  for (const [id, value] of Object.entries(answers)) {
    const question = questionFor(id);
    if (!question || !validateCandidateAnswerV3(question, value)) return null;
  }
  if (!answeredQuestionIds.every((id) => typeof id === "string" && answers[id] !== undefined) || new Set(answeredQuestionIds).size !== answeredQuestionIds.length) return null;
  if (answeredQuestionIds.length !== Object.keys(answers).length || !Object.keys(answers).every((id) => answeredQuestionIds.includes(id))) return null;
  if (!queue.every((id) => typeof id === "string" && questionFor(id) && answers[id] === undefined) || new Set(queue).size !== queue.length) return null;
  const active = buildCandidateQuestionPlanV3({ answers: answers as AnswersV2 }).activeAnswers;
  // Corrupt or obsolete applicability state fails closed; do not silently reinterpret persisted answers.
  if (Object.keys(active).length !== Object.keys(answers).length || Object.entries(answers).some(([id, value]) => JSON.stringify(active[id]) !== JSON.stringify(value))) return null;
  const plan = buildCandidateQuestionPlanV3({ answers: active });
  const eligible = new Set(plan.eligibleQuestionIds);
  if (!queue.every((id) => eligible.has(id))) return null;
  if (schemaVersion === CANDIDATE_SESSION_SCHEMA_V3 && status === "in_progress" && (terminalReason !== null || (queue.length === 0 && reviewIndex === null))) return null;
  if (status !== "in_progress") {
    if (queue.length !== 0 || reviewIndex !== null || terminalReason === null) return null;
    const expectedReason = plan.completion.hardCapReached ? "hard_cap" : plan.evidenceSufficiency.terminalReason === "budget_blocked" ? "budget_blocked" : "no_useful_questions";
    if (terminalReason !== expectedReason) return null;
  }
  if (schemaVersion === CANDIDATE_SESSION_SCHEMA_V3) {
    const allowedFields = ["schemaVersion", "engineIdentity", "questionBankIdentity", "sessionId", "startedAt", "updatedAt", "completedAt", "revision", "writerId", "answers", "answeredQuestionIds", "queue", "reviewIndex", "status", "terminalReason"];
    if (Object.keys(parsed).length !== allowedFields.length || Object.keys(parsed).some((key) => !allowedFields.includes(key))) return null;
  }
  return parsed;
}

export function parseCandidateSessionV3(raw: string | null, now: number): CandidateSessionV3 | null {
  const parsed = parseSession(raw, now, CANDIDATE_SESSION_SCHEMA_V3);
  return parsed as unknown as CandidateSessionV3 | null;
}

export type CandidateStorageLikeV3 = { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void };
export class CandidateSessionStoreV3 {
  private readonly storage?: CandidateStorageLikeV3;
  constructor(storage?: CandidateStorageLikeV3) { this.storage = storage; }
  private get target(): CandidateStorageLikeV3 | null {
    if (this.storage) return this.storage;
    try { return typeof window === "undefined" ? null : window.localStorage; } catch { return null; }
  }
  readResult(now: number): { readonly kind: "available"; readonly session: CandidateSessionV3 | null } | { readonly kind: "unavailable" } {
    const target = this.target;
    if (!target) return { kind: "unavailable" };
    let raw: string | null;
    try { raw = target.getItem(CANDIDATE_SESSION_STORAGE_KEY_V3); } catch { return { kind: "unavailable" }; }
    const parsed = parseCandidateSessionV3(raw, now);
    if (raw) {
      if (!parsed) {
        try { target.removeItem(CANDIDATE_SESSION_STORAGE_KEY_V3); } catch { return { kind: "unavailable" }; }
      }
      return { kind: "available", session: parsed };
    }
    // No se leen, migran ni eliminan claves de otro contrato.
    return { kind: "available", session: null };
  }
  read(now: number): CandidateSessionV3 | null {
    const result = this.readResult(now);
    return result.kind === "available" ? result.session : null;
  }
  async write(session: CandidateSessionV3): Promise<"written" | "conflict" | "unavailable"> {
    const target = this.target;
    if (!target) return "unavailable";
    const serialized = JSON.stringify(session);
    const commit = (): "written" | "conflict" | "unavailable" => {
      let raw: string | null;
      try { raw = target.getItem(CANDIDATE_SESSION_STORAGE_KEY_V3); } catch { return "unavailable"; }
      const current = parseCandidateSessionV3(raw, Date.now());
      if (!current && raw !== null) return "conflict";
      if (!current && (session.revision !== 0 || session.status !== "in_progress" || Object.keys(session.answers).length > 0 || session.completedAt !== null)) return "conflict";
      if (current && current.sessionId !== session.sessionId) return "conflict";
      if (current) {
        const expectedPriorRevision = session.revision - 1;
        const exactRepeat = current.revision === session.revision && current.writerId === session.writerId && raw === serialized;
        if (!exactRepeat && current.revision !== expectedPriorRevision) return "conflict";
      }
      try {
        target.setItem(CANDIDATE_SESSION_STORAGE_KEY_V3, serialized);
        return target.getItem(CANDIDATE_SESSION_STORAGE_KEY_V3) === serialized ? "written" : "conflict";
      } catch { return "unavailable"; }
    };
    if (typeof navigator !== "undefined" && navigator.locks) {
      try { return await navigator.locks.request(CANDIDATE_SESSION_STORAGE_KEY_V3, { mode: "exclusive" }, commit); }
      catch { return "unavailable"; }
    }
    // Without Web Locks this is optimistic, not atomic; revision checks and storage events make conflicts visible.
    return commit();
  }
  async clear(): Promise<boolean> {
    const target = this.target;
    if (!target) return false;
    const remove = () => {
      try { target.removeItem(CANDIDATE_SESSION_STORAGE_KEY_V3); return target.getItem(CANDIDATE_SESSION_STORAGE_KEY_V3) === null; }
      catch { return false; }
    };
    if (typeof navigator !== "undefined" && navigator.locks) {
      try { return await navigator.locks.request(CANDIDATE_SESSION_STORAGE_KEY_V3, { mode: "exclusive" }, remove); }
      catch { return false; }
    }
    return remove();
  }
}
